import type {APIContext} from 'astro';
import {absolute} from '~/lib/site';

/**
 * /sitemap.xml: a sitemap index pointing at the child sitemap @astrojs/sitemap emits.
 * The integration always writes sitemap-index.xml, but most third-party crawlers and
 * Bing Webmaster Tools probe /sitemap.xml by default, so serve the conventional path too.
 * A sitemap index may only reference sitemaps, never another index, so this points at the
 * child directly. scripts/check-output.mjs asserts the referenced child exists.
 */
export function GET({site}: APIContext) {
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    '<sitemap><loc>' + absolute('/sitemap-0.xml', site) + '</loc></sitemap>\n' +
    '</sitemapindex>\n';
  return new Response(body, {headers: {'Content-Type': 'application/xml; charset=utf-8'}});
}
