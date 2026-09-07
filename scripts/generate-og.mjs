#!/usr/bin/env node
// Generates 1200x630 Open Graph images into public/og/: a default, one per server, one per post.
// Runs before every build. Output is not committed.
import { mkdirSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { RACK_MARK_PATH } from '../src/lib/brand.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = join(root, 'public', 'og');
mkdirSync(out, { recursive: true });

const PAPER = '#faf8f4';
const INK = '#0b1218';
const INK2 = '#4a5560';
const ACCENT = '#356958';
const LINE = '#e3ded4';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(text, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function svg({ kicker, title, subtitle, mono = false }) {
  const titleSize = title.length > 40 ? 56 : 68;
  const titleLines = wrap(title, title.length > 40 ? 32 : 26).slice(0, 3);
  const subLines = wrap(subtitle ?? '', 62).slice(0, 2);
  const titleFont = mono ? "'Geist Mono', 'Cascadia Code', Consolas, monospace" : "'Geist', 'Segoe UI', Arial, sans-serif";
  const y0 = 232;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <circle cx="1120" cy="80" r="260" fill="${ACCENT}" opacity="0.08"/>
  <g transform="translate(78 76) scale(1.1)"><path fill="${ACCENT}" fill-rule="evenodd" d="${RACK_MARK_PATH}"/></g>
  <text x="134" y="112" font-family="Geist, Arial, sans-serif" font-size="29" font-weight="600" letter-spacing="-1" fill="${INK}">MCP Rack</text>
  <text x="80" y="176" font-family="'Geist Mono', Consolas, monospace" font-size="20" letter-spacing="3" fill="${ACCENT}">${esc(kicker.toUpperCase())}</text>
  ${titleLines.map((l, i) => `<text x="80" y="${y0 + i * (titleSize + 10)}" font-family="${titleFont}" font-size="${titleSize}" font-weight="600" letter-spacing="-1.5" fill="${INK}">${esc(l)}</text>`).join('\n  ')}
  ${subLines.map((l, i) => `<text x="80" y="${y0 + titleLines.length * (titleSize + 10) + 30 + i * 36}" font-family="'Geist', 'Segoe UI', Arial, sans-serif" font-size="26" fill="${INK2}">${esc(l)}</text>`).join('\n  ')}
  <line x1="80" y1="548" x2="1120" y2="548" stroke="${LINE}" stroke-width="2"/>
  <text x="80" y="588" font-family="'Geist Mono', Consolas, monospace" font-size="20" fill="${INK2}">MCP servers by Alexei Udall</text>
  <text x="1120" y="588" text-anchor="end" font-family="'Geist Mono', Consolas, monospace" font-size="20" fill="${INK2}">mcprack.dev</text>
</svg>`;
}

async function render(name, spec) {
  const file = join(out, `${name}.png`);
  await sharp(Buffer.from(svg(spec))).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

const jobs = [render('default', { kicker: 'MCP servers by Alexei Udall', title: 'Good tools. Real work. A considered rack.', subtitle: 'Independent MCP tools, curated picks and practical notes.' })];

const servers = JSON.parse(readFileSync(join(root, 'src', 'content', 'servers.json'), 'utf8'));
for (const s of servers) jobs.push(render(`server-${s.slug}`, { kicker: `${s.lang} · ${s.transport} · ${s.license}`, title: s.name, subtitle: s.tagline, mono: true }));

const postsDir = join(root, 'src', 'content', 'posts');
if (existsSync(postsDir)) {
  for (const f of readdirSync(postsDir).filter((f) => /\.(md|mdx)$/.test(f))) {
    const text = readFileSync(join(postsDir, f), 'utf8').replaceAll('\r\n', '\n');
    const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    const get = (k) => fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1] ?? '';
    const slug = basename(f).replace(/\.(md|mdx)$/, '');
    jobs.push(render(`post-${slug}`, { kicker: [get('category'), get('server'), get('version')].filter(Boolean).join(' · ') || 'Post', title: get('title'), subtitle: get('description') }));
  }
}

const files = await Promise.all(jobs);
console.log(`og: ${files.length} images written to public/og/`);
