import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE, href, absolute } from '~/lib/site';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return rss({
    title: `${SITE.name} · Journal`,
    description: SITE.description,
    site: absolute('/', context.site),
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: href(`/blog/${post.id}`),
      categories: [post.data.category, ...(post.data.server ? [post.data.server] : [])],
    })),
    customData: `<language>en-ie</language>`,
  });
}
