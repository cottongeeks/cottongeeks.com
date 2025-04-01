import { defineCollection, z } from 'astro:content'
import type { CollectionEntry } from 'astro:content'

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    draft: z.boolean(),
  }),
  slugField: ({
    defaultSlug,
    data,
  }: {
    defaultSlug: string
    data: CollectionEntry<'articles'>['data']
  }) => {
    const date = data.date
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return `${formattedDate}-${defaultSlug}.html`
  },
})

export const collections = {
  articles,
}
