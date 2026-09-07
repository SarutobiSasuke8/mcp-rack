import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE, absolute } from '~/lib/site';

/** Machine-readable board. Same facts as the pages, for agents and scripts. */
export async function GET(context: APIContext) {
  const servers = (await getCollection('servers')).sort((a, b) => a.data.order - b.data.order);
  const body = {
    name: SITE.name,
    owner: { name: SITE.owner.name, handle: SITE.owner.handle, github: SITE.owner.github },
    generated: new Date().toISOString(),
    source: absolute('/servers', context.site),
    servers: servers.map(({ data: s }) => ({
      name: s.name,
      slug: s.slug,
      url: absolute(`/servers/${s.slug}`, context.site),
      tagline: s.tagline,
      lang: s.lang,
      transport: s.transport,
      package: s.package,
      registry: s.registry,
      registryUrl: s.registry ? `https://registry.modelcontextprotocol.io/v0.1/servers/${encodeURIComponent(s.registry)}/versions/latest` : null,
      status: s.status,
      license: s.license,
      repo: s.repo,
      install: s.install,
      tags: s.tags,
    })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
