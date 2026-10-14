#!/usr/bin/env node
// Validates the board's data file (src/content/servers.json by default, or the
// path given as the first argument) against the same schema the site builds
// with, plus cross-entry rules. Exits 1 and lists every problem when invalid.
// Run: npm run validate
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { formatIssues, validateServerList } from '../src/lib/servers.ts';

const path = process.argv[2] ?? fileURLToPath(new URL('../src/content/servers.json', import.meta.url));

let raw;
try {
  raw = JSON.parse(readFileSync(path, 'utf8'));
} catch (error) {
  console.error(`validate: could not read ${path} as JSON: ${error.message}`);
  process.exit(1);
}

const issues = validateServerList(raw);
if (issues.length > 0) {
  console.error(`validate: ${issues.length} problem(s) in ${path}\n${formatIssues(issues)}`);
  process.exit(1);
}
console.log(`validate: ${raw.length} listings valid`);
