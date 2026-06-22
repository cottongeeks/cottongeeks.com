// Remark plugin replicating astro-embed's integration: it turns a paragraph that
// holds nothing but a bare embed URL into the matching component, and injects the
// ESM imports those components need (the job astro-auto-import used to do).

import { parse as parseJs } from 'acorn'
import { fileURLToPath } from 'node:url'
import type { Program } from 'estree'
import type { Paragraph, Root, RootContent } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm'
import type { VFile } from 'vfile'
import { componentNames, matchers } from './matchers'

// Absolute path to the components barrel, used as the injected import specifier so
// it resolves no matter where in the tree the MDX file lives.
const EMBEDS_MODULE = fileURLToPath(new URL('./index.ts', import.meta.url))

// Namespace prefix for auto-injected bindings, kept deliberately unlikely so it
// never clashes with a component the author imports themselves.
const NS = '__AstroEmbed_'

// Build `import { Tweet as __AstroEmbed_Tweet, ... } from '<barrel>'`. MDX needs the
// parsed estree, not just source text, hence acorn.
function importsNode(): MdxjsEsm {
  const bindings = componentNames.map(name => `${name} as ${NS}${name}`).join(', ')
  const source = `import { ${bindings} } from ${JSON.stringify(EMBEDS_MODULE)};`
  return {
    type: 'mdxjsEsm',
    value: source,
    data: {
      // acorn emits an estree-compatible AST; the nominal types differ slightly.
      estree: parseJs(source, {
        ecmaVersion: 'latest',
        sourceType: 'module',
      }) as unknown as Program,
    },
  }
}

// An MDX element node for a matched embed, e.g. <__AstroEmbed_Tweet id="..." />.
function componentNode(name: string, id: string): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: `${NS}${name}`,
    attributes: [{ type: 'mdxJsxAttribute', name: 'id', value: id }],
    children: [],
  }
}

// If a paragraph is nothing but a single bare URL a service recognises, return the
// embed node to replace it with; otherwise undefined.
function embedForParagraph(paragraph: Paragraph): MdxJsxFlowElement | undefined {
  if (paragraph.children.length !== 1) return undefined
  const link = paragraph.children[0]
  if (link.type !== 'link' || !link.url.startsWith('http')) return undefined
  // Must be a bare URL: a single text child whose value equals the href (i.e. not a
  // labelled `[text](url)` link).
  if (link.children.length !== 1) return undefined
  const text = link.children[0]
  if (text.type !== 'text' || text.value !== link.url) return undefined
  for (const [match, name] of matchers) {
    const id = match(link.url)
    if (id) return componentNode(name, id)
  }
  return undefined
}

export default function remarkEmbeds(): (tree: Root, file: VFile) => void {
  return (tree, file) => {
    // Plain Markdown can't host JSX or ESM imports; only transform MDX.
    if (file.basename?.endsWith('.md')) return

    tree.children = tree.children.map(
      (child): RootContent =>
        child.type === 'paragraph' ? (embedForParagraph(child) ?? child) : child,
    )
    tree.children.unshift(importsNode())
  }
}
