#!/usr/bin/env node
// Style gate. Fails the build on em dashes, bullet separators and marketing filler
// anywhere in src/. Same idea as the astraeus.ie gate; run with --report to list every hit.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src/', import.meta.url));
const EXTENSIONS = new Set(['.astro', '.ts', '.mjs', '.md', '.mdx', '.css', '.json']);
const FORBIDDEN = [
  'synergy', 'holistic', 'supercharge', 'next-gen', 'cutting-edge', 'world-class',
  'industry-leading', 'AI-powered', 'AI-driven', 'seamless', 'seamlessly', 'game-changing',
  'revolutionary', 'delighted to announce', 'excited to share', 'let that sink in',
  'in today\'s fast-paced', 'unlock', 'leverage', 'ecosystem',
];

const report = process.argv.includes('--report');
const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (EXTENSIONS.has(extname(name))) check(full);
  }
}

function check(file) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('—')) hits.push({ file, line: i + 1, rule: 'em dash (U+2014)', text: line.trim() });
    if (/\S\s+•\s+\S/.test(line)) hits.push({ file, line: i + 1, rule: 'bullet used as separator (use middle dot)', text: line.trim() });
    for (const word of FORBIDDEN) {
      const re = new RegExp(`(^|[^A-Za-z-])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z-]|$)`, 'i');
      if (re.test(line)) hits.push({ file, line: i + 1, rule: `forbidden word: ${word}`, text: line.trim() });
    }
  });
}

walk(ROOT);

if (hits.length === 0) {
  console.log('style: clean');
  process.exit(0);
}
console.error(`style: ${hits.length} problem${hits.length === 1 ? '' : 's'}`);
for (const h of report ? hits : hits.slice(0, 25)) {
  console.error(`  ${h.file}:${h.line}  ${h.rule}\n    ${h.text.slice(0, 140)}`);
}
if (!report && hits.length > 25) console.error(`  ... ${hits.length - 25} more (run with --report)`);
process.exit(1);
