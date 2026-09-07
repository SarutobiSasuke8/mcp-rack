/** Site-wide constants. Everything that names the owner or the site lives here. */
export const SITE = {
  name: 'MCP Rack',
  tagline: 'A considered collection of MCP servers, practical field notes and useful connections.',
  description:
    'Discover MCP servers built by Alexei Udall, a curated selection from other makers, and practical guides. Clear setup details, honest project status and open data for agents.',
  owner: {
    name: 'Alexei Udall',
    handle: 'SarutobiSasuke8',
    url: 'https://alexeiudall.com',
    github: 'https://github.com/SarutobiSasuke8',
    x: 'https://x.com/Sarut0biSasuke',
    xHandle: '@Sarut0biSasuke',
    linkedin: 'https://www.linkedin.com/in/alexeiudall/',
    pypi: 'https://pypi.org/user/SarutobiSasuke8/',
    npm: 'https://www.npmjs.com/search?q=%40sarutobi-sasuke',
    registry: 'https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.SarutobiSasuke8',
  },
  repo: 'https://github.com/SarutobiSasuke8/mcp-rack',
  locale: 'en_IE',
  language: 'en-IE',
  defaultOgImage: '/og/default.png',
} as const;

const rawBase = import.meta.env.BASE_URL || '/';
/** Base path without a trailing slash ("" when served from the domain root). */
export const BASE = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');

/** Prefix an internal path with the deployment base. Accepts "/", "/servers", "/blog/x". */
export function href(path: string): string {
  if (!path.startsWith('/')) return path;
  if (path === '/') return BASE ? `${BASE}/` : '/';
  const normalized = /\.[a-z0-9]+$/i.test(path) || path.endsWith('/') ? path : path + '/';
  return BASE + normalized;
}

/** Absolute URL for canonical tags, feeds and structured data. */
export function absolute(path: string, siteUrl: URL | undefined): string {
  const origin = siteUrl ? siteUrl.origin : 'https://mcprack.dev';
  return `${origin}${href(path)}`;
}
