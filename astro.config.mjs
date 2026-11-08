// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Production defaults target mcprack.dev. Legacy Pages previews can override both variables.
const site = process.env.SITE_URL || 'https://mcprack.dev';
const base = process.env.SITE_BASE || '/';

const root = new URL('./', import.meta.url);

/**
 * Real modification dates for the sitemap, keyed by pathname.
 *
 * Only pages with a genuine recorded date get a <lastmod>. Stamping every URL with the
 * build time would tell crawlers the whole site changed on every deploy, which is worse
 * than saying nothing: Google discards lastmod it finds unreliable.
 */
function lastmodByPath() {
  const map = new Map();

  // Journal posts: updatedDate when the post was revised, else pubDate.
  const postsDir = new URL('src/content/posts/', root);
  for (const file of readdirSync(postsDir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = readFileSync(new URL(file, postsDir), 'utf8');
    const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;
    const read = (/** @type {string} */ key) => frontmatter[1].match(new RegExp(`^${key}:\\s*["']?([0-9]{4}-[0-9]{2}-[0-9]{2})`, 'm'))?.[1];
    const date = read('updatedDate') || read('pubDate');
    if (date) map.set(`/blog/${file.replace(/\.mdx?$/, '')}/`, date);
  }

  // Server pages: the date the listing was last reviewed against source and release records.
  const servers = JSON.parse(readFileSync(new URL('src/content/servers.json', root), 'utf8'));
  for (const server of servers) {
    if (server.reviewedAt) map.set(`/servers/${server.slug}/`, server.reviewedAt);
  }

  return map;
}

const lastmod = lastmodByPath();

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const path = new URL(item.url).pathname.slice(base.replace(/\/$/, '').length) || '/';
        const date = lastmod.get(path);
        if (date) item.lastmod = new Date(`${date}T00:00:00Z`).toISOString();
        return item;
      },
    }),
  ],
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  build: { format: 'directory' },
});
