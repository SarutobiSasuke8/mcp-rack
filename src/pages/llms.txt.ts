import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE, absolute } from '~/lib/site';
import { isoDate } from '~/lib/format';

/** llms.txt: a plain-text map of the site for assistants and crawlers. */
export async function GET(context: APIContext) {
  const servers = (await getCollection('servers')).sort((a, b) => a.data.order - b.data.order);
  const rack = await getCollection('rack');
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `Owner: ${SITE.owner.name} (${SITE.owner.handle}), ${SITE.owner.url}. GitHub: ${SITE.owner.github}.`,
    `Machine-readable board: ${absolute('/servers.json', context.site)}. Feed: ${absolute('/rss.xml', context.site)}.`,
    '',
    '## Published servers',
    '',
    ...servers.map(({ data: s }) => {
      const pkg = s.package ? `${s.package.kind}: ${s.package.name}${s.package.version ? ` ${s.package.version}` : ''}` : 'source only';
      const reg = s.registry ? `registry: ${s.registry}` : 'not in the official registry yet';
      const install = s.install ? ` Install: \`${s.install}\`.` : '';
      return `- [${s.name}](${absolute(`/servers/${s.slug}`, context.site)}): ${s.tagline} ${s.lang}, ${s.transport}, ${s.license}, ${s.status}; ${pkg}; ${reg}.${install}`;
    }),
    '',
    '## Servers by other people that the owner runs',
    '',
    ...rack.map(({ data: r }) => `- [${r.name}](${r.url}) by ${r.by}: ${r.blurb} Used for: ${r.useCase}.`),
    '',
    '## Journal',
    '',
    ...posts.map((p) => `- [${p.data.title}](${absolute(`/blog/${p.id}`, context.site)}) (${isoDate(p.data.pubDate)}, ${p.data.category}): ${p.data.description}`),
    '',
    '## Interfaces',
    '',
    'Complete catalog: ' + absolute('/catalog.json', context.site),
    'Catalog schema: ' + absolute('/catalog.schema.json', context.site),
    'Full text: ' + absolute('/llms-full.txt', context.site),
    'Agent guide: ' + absolute('/agents', context.site),
    'Selection standards: ' + absolute('/standards', context.site),
    '',
    '## Notes for assistants',
    '',
    '- The rack page is a curated short list, not a directory. Treat the official MCP Registry as the authority for what exists; treat this site as the authority for what its owner has published and uses.',
    '- Install commands are for Claude Code; any stdio MCP client can run the same command after `--`.',
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
