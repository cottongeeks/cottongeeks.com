// Local fork of `astro-embed`'s integration. The upstream package gates on a
// fixed Astro peer-dep range, so we vendor just the wiring here and depend
// directly on the individual `@astro-community/astro-embed-*` packages, which
// have no peer-dep on Astro and upgrade cleanly.

import type { AstroIntegration } from 'astro'

import blueskyMatcher from '@astro-community/astro-embed-bluesky/matcher'
import gistMatcher from '@astro-community/astro-embed-gist/matcher'
import linkPreviewMatcher from '@astro-community/astro-embed-link-preview/matcher'
import mastodonMatcher from '@astro-community/astro-embed-mastodon/matcher'
import twitterMatcher from '@astro-community/astro-embed-twitter/matcher'
import vimeoMatcher from '@astro-community/astro-embed-vimeo/matcher'
import youtubeMatcher from '@astro-community/astro-embed-youtube/matcher'

// [matcher fn, exported component name (also the JSX tag we emit), package the
// component is a named export of].
// Order matters: the generic LinkPreview matcher must come last so service-
// specific matchers get a chance to run first.
type MatcherEntry = readonly [(url: string) => string | undefined, string, string]
const matchers: readonly MatcherEntry[] = [
  [blueskyMatcher, 'BlueskyPost', '@astro-community/astro-embed-bluesky'],
  [gistMatcher, 'Gist', '@astro-community/astro-embed-gist'],
  [twitterMatcher, 'Tweet', '@astro-community/astro-embed-twitter'],
  [vimeoMatcher, 'Vimeo', '@astro-community/astro-embed-vimeo'],
  [youtubeMatcher, 'YouTube', '@astro-community/astro-embed-youtube'],
  [mastodonMatcher, 'MastodonPost', '@astro-community/astro-embed-mastodon'],
  [linkPreviewMatcher, 'LinkPreview', '@astro-community/astro-embed-link-preview'],
]

// Prefix used to namespace auto-injected imports so they don't collide with
// any user import of the same component name (e.g. an MDX file that already
// does `import Tweet from '...'`). Mirrors upstream `astro-embed`'s approach.
const importPrefix = 'AutoImportedAstroEmbed_'

// Build a hand-rolled estree for `import { <exportName> as <localName> } from "<pkg>"`
// so we can inject it as an `mdxjsEsm` node at the top of an MDX document.
// Avoids pulling in acorn just to parse a single-line import.
function buildImportNode(exportName: string, localName: string, pkg: string) {
  return {
    type: 'mdxjsEsm',
    value: `import { ${exportName} as ${localName} } from ${JSON.stringify(pkg)}`,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [
              {
                type: 'ImportSpecifier',
                imported: { type: 'Identifier', name: exportName },
                local: { type: 'Identifier', name: localName },
              },
            ],
            source: {
              type: 'Literal',
              value: pkg,
              raw: JSON.stringify(pkg),
            },
          },
        ],
      },
    },
  }
}

// Recursively collect every `paragraph` node in the mdast tree (mirrors what
// upstream did via `unist-util-select`).
function collectParagraphs(node: unknown, out: Record<string, unknown>[] = []) {
  if (!node || typeof node !== 'object') return out
  const n = node as Record<string, unknown>
  if (n.type === 'paragraph') out.push(n)
  if (Array.isArray(n.children)) for (const c of n.children) collectParagraphs(c, out)
  return out
}

function remarkAstroEmbed() {
  return function transformer(tree: Record<string, unknown>) {
    // Imports we need to prepend to the document. Key uses ' | ' as a
    // separator (neither identifiers nor package names contain it).
    const usedImports = new Set<string>()

    for (const paragraph of collectParagraphs(tree)) {
      // Recognize an autolinked URL: a paragraph whose only child is a link
      // whose only child is a text node equal to the link's URL.
      const children = paragraph.children as Record<string, unknown>[] | undefined
      if (!Array.isArray(children) || children.length !== 1) continue
      const link = children[0]
      if (link?.type !== 'link') continue
      const url = link.url
      if (typeof url !== 'string' || !url.startsWith('http')) continue
      const linkChildren = link.children as Record<string, unknown>[] | undefined
      if (!Array.isArray(linkChildren) || linkChildren.length !== 1) continue
      const text = linkChildren[0]
      if (text?.type !== 'text' || text.value !== url) continue

      for (const [matcher, componentName, pkg] of matchers) {
        const id = matcher(url)
        if (!id) continue
        const localName = `${importPrefix}${componentName}`
        usedImports.add(`${componentName} | ${localName} | ${pkg}`)
        // Replace the paragraph in place with `<LocalName id="..." />`.
        paragraph.type = 'mdxJsxFlowElement'
        paragraph.name = localName
        paragraph.attributes = [{ type: 'mdxJsxAttribute', name: 'id', value: id }]
        paragraph.children = []
        break
      }
    }

    if (usedImports.size > 0) {
      const imports = Array.from(usedImports).map(entry => {
        const [exportName, localName, pkg] = entry.split(' | ')
        return buildImportNode(exportName, localName, pkg)
      })
      const rootChildren = tree.children as unknown[] | undefined
      if (Array.isArray(rootChildren)) rootChildren.unshift(...imports)
    }
  }
}

export default function astroEmbed(): AstroIntegration {
  return {
    name: 'astro-embed',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        // The remark plugin must run before `@astrojs/mdx` so it sees raw
        // markdown URLs rather than already-tokenized MDX.
        const indexOf = (name: string) => config.integrations.findIndex(i => i.name === name)
        const mdxIdx = indexOf('@astrojs/mdx')
        const selfIdx = indexOf('astro-embed')
        if (mdxIdx > -1 && mdxIdx < selfIdx) {
          throw new Error(
            'MDX integration configured before astro-embed. ' +
              'Move astroEmbed() before mdx() in `integrations` in astro.config.ts.',
          )
        }
        updateConfig({ markdown: { remarkPlugins: [remarkAstroEmbed] } })
      },
    },
  }
}
