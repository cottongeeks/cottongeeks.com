import type { CollectionEntry } from 'astro:content'

export function generateHtmlSlug(article: CollectionEntry<'articles'>): string {
  const date = article.data.date
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return `${formattedDate}-${article.data.slug}`
}
