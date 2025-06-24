import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'
import { generateHtmlSlug } from '../utils/slug'

export async function GET(context: APIContext) {
  const articles = await getCollection('articles')

  return rss({
    title: 'Cottongeeks Blog',
    description: 'latest articles from cottongeeks',
    site: context.site ?? 'https://www.cottongeeks.com',
    trailingSlash: false,
    items: articles
      .filter(article => !article.data.draft)
      .map(article => {
        const fullUrl = `${context.site ?? 'https://www.cottongeeks.com'}/articles/${generateHtmlSlug(article)}`
        return {
          title: article.data.title,
          pubDate: article.data.date,
          link: `/articles/${generateHtmlSlug(article)}`,
          content: `${article.data.description} <a href="${fullUrl}" style="text-decoration:none">→</a>`,
        }
      }),
    customData: '<language>en-us</language>',
  })
}
