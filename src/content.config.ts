import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const articles = defineCollection({
  loader: glob({ pattern: 'src/content/articles/*.mdx' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    slug: z.string(),
    draft: z.boolean(),
  }),
})

export const collections = {
  articles,
}
