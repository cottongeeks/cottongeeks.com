import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

import mdx from '@astrojs/mdx'
import { unified } from '@astrojs/markdown-remark'
import remarkMath from 'remark-math'
import remarkEmbeds from './src/components/embeds/remark-plugin'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

// https://astro.build/config
export default defineConfig({
  // Disable Astro's dev toolbar to avoid its missing source map requests in dev.
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), mdx()],
  markdown: {
    // Astro 6.4+ pluggable Markdown pipeline: remark/rehype plugins are now
    // configured directly on the unified processor instead of top-level options.
    // `remarkEmbeds` replaces the astro-embed integration: it auto-converts bare
    // embed URLs into components and injects their imports.
    processor: unified({
      remarkPlugins: [remarkMath, remarkEmbeds],
      rehypePlugins: [
        rehypeKatex,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: { ariaHidden: true, tabIndex: -1, class: 'heading-anchor' },
            content: { type: 'text', value: '¶' },
          },
        ],
      ],
    }),
  },
  build: {
    format: 'file',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
