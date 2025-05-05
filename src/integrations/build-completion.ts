import type { AstroIntegration } from 'astro'

export default function buildCompletion(): AstroIntegration {
  return {
    name: 'build-completion',
    hooks: {
      'astro:build:done': ({ pages }) => {
        console.log('\n')
        pages.forEach(page => {
          if (page.pathname === '') {
            return
          }
          console.log(`${page.pathname}.html -> ${page.pathname}`)
        })
        console.log('\n')
      },
    },
  }
}
