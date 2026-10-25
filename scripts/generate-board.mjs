#!/usr/bin/env node
// Generates the board's server list in README.md from src/content/servers.json.
//   npm run board         rewrite the block between the board markers
//   npm run board:check   fail if README.md is out of date (used in CI)
// The data file is validated first, so an invalid entry never reaches the README.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boardMarkdown, boardRows, spliceBoard } from '../src/lib/board.ts';
import { formatIssues, validateServerList } from '../src/lib/servers.ts';

const SITE_URL = 'https://mcprack.dev';
const dataPath = fileURLToPath(new URL('../src/content/servers.json', import.meta.url));
const readmePath = fileURLToPath(new URL('../README.md', import.meta.url));
const check = process.argv.includes('--check');

const raw = JSON.parse(readFileSync(dataPath, 'utf8'));
const issues = validateServerList(raw);
if (issues.length > 0) {
  console.error(`board: servers.json is invalid, fix it first\n${formatIssues(issues)}`);
  process.exit(1);
}

const readme = readFileSync(readmePath, 'utf8');
const eol = readme.includes('\r\n') ? '\r\n' : '\n';
const normalised = readme.replaceAll('\r\n', '\n');
const next = spliceBoard(normalised, boardMarkdown(boardRows(raw), SITE_URL));

if (check) {
  if (next !== normalised) {
    console.error('board: README.md board is out of date. Run `npm run board` and commit the result.');
    process.exit(1);
  }
  console.log(`board: README.md board matches ${raw.length} listings`);
} else {
  writeFileSync(readmePath, next.replaceAll('\n', eol));
  console.log(`board: wrote ${raw.length} listings to README.md`);
}
