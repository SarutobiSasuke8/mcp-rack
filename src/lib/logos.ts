// Local logo files in public/rack-logos, keyed by rack or server slug.
// Marks identify the linked service or the application a server works with; see public/rack-logos/README.txt.
const FILES: Record<string, string> = {
  figma: 'svg', notion: 'svg', asana: 'svg', hubspot: 'svg',
  canva: 'png', fireflies: 'png', pixellab: 'png', tinyfish: 'png', trigr: 'png',
  'gimp-agent-mcp': 'gimp.svg', 'aseprite-agent-mcp': 'aseprite.svg', 'telegram-personal-proxy': 'telegram.svg',
  'astraeus-postgres-mcp': 'postgresql.svg', 'obsidian-github-mcp': 'obsidian.svg',
};

export function logoFor(slug: string): string | null {
  const f = FILES[slug];
  if (!f) return null;
  return `/rack-logos/${f.includes('.') ? f : `${slug}.${f}`}`;
}
