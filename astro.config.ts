import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

import mdx from '@astrojs/mdx'
import embeds from './src/integrations/embed'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

// https://astro.build/config
export default defineConfig({
  // Disable Astro's dev toolbar to avoid its missing source map requests in dev.
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), embeds(), mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
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
  },
  build: {
    format: 'file',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
