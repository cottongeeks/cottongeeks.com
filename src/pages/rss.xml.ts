import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const articles = await getCollection('articles')

  return rss({
    title: 'Cottongeeks Blog',
    description: 'Latest articles from Cottongeeks',
    site: context.site ?? 'https://cottongeeks.com',
    items: articles
      .filter(article => !article.data.draft)
      .map(article => ({
        title: article.data.title,
        pubDate: article.data.date,
        link: `/articles/${article.data.slug}/`,
        description: article.data.title, // TODO You might want to add a description field to your schema
      })),
    customData: '<language>en-us</language>',
  })
}
