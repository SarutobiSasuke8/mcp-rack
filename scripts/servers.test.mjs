import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { BOARD_END, BOARD_START, boardMarkdown, boardRows, packageLabel, registryLabel, spliceBoard } from '../src/lib/board.ts';
import { allowedKeys, validateServerList } from '../src/lib/servers.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const servers = JSON.parse(read('../src/content/servers.json'));

// A minimal valid listing; each negative test breaks exactly one thing.
const valid = {
  id: 'example-mcp', slug: 'example-mcp', name: 'example-mcp',
  tagline: 'An example listing.', summary: 'Used by the validator tests.',
  lang: 'TypeScript', transport: 'stdio', package: null, registry: null,
  status: 'alpha', license: 'MIT', repo: 'https://github.com/example/example-mcp',
  install: null, order: 99,
};
const issuesFor = (patch, base = valid) => validateServerList([{ ...base, ...patch }]);

test('the committed data file is valid', () => {
  assert.deepEqual(validateServerList(servers), []);
});

test('a minimal listing is valid', () => {
  assert.deepEqual(validateServerList([valid]), []);
});

test('schema violations are reported with the field path', () => {
  const cases = [
    [{ name: undefined }, 'name'],
    [{ tagline: 'x'.repeat(181) }, 'tagline'],
    [{ lang: 'Rust' }, 'lang'],
    [{ repo: 'not a url' }, 'repo'],
    [{ package: { kind: 'cargo', name: 'x' } }, 'package.kind'],
    [{ status: 'gold' }, 'status'],
    [{ order: '1' }, 'order'],
    [{ hosted: { url: 'http://example.com', label: 'x', kind: 'demo', live: false } }, 'hosted.url'],
  ];
  for (const [patch, path] of cases) {
    const issues = issuesFor(patch);
    assert(issues.some((issue) => issue.path === path), `${JSON.stringify(patch)} should fail at ${path}: ${JSON.stringify(issues)}`);
  }
});

test('maturity rules from the content contract apply (stable needs evidence)', () => {
  const issues = issuesFor({ status: 'stable' });
  assert(issues.length > 0);
});

test('unknown or misspelt fields fail instead of being silently stripped', () => {
  const issues = issuesFor({ taglne: 'typo' });
  assert.equal(issues.length, 1);
  assert.equal(issues[0].path, 'taglne');
  assert.match(issues[0].message, /Unknown field/);
});

test('every key used in the committed data file is a known field', () => {
  for (const entry of servers) for (const key of Object.keys(entry)) assert(allowedKeys.has(key), key);
});

test('id must equal slug and slugs must be URL-safe', () => {
  assert(issuesFor({ id: 'other' }).some((issue) => issue.path === 'id'));
  assert(issuesFor({ id: 'Bad Slug', slug: 'Bad Slug' }).some((issue) => issue.path === 'slug'));
});

test('duplicate slugs and duplicate order values fail across entries', () => {
  const second = { ...valid, id: 'second-mcp', slug: 'second-mcp', order: 100 };
  assert.deepEqual(validateServerList([valid, second]), []);

  const dupSlug = validateServerList([valid, { ...second, id: valid.slug, slug: valid.slug }]);
  assert(dupSlug.some((issue) => issue.path === 'slug' && /Duplicate slug/.test(issue.message)));

  const dupOrder = validateServerList([valid, { ...second, order: valid.order }]);
  assert(dupOrder.some((issue) => issue.path === 'order' && /Duplicate order/.test(issue.message)));
});

test('a non-array file or a non-object entry fails', () => {
  assert.equal(validateServerList({}).length, 1);
  assert(validateServerList(['nope']).some((issue) => /must be an object/.test(issue.message)));
});

test('the validator CLI exits 1 on an invalid file and 0 on the real one', () => {
  const script = fileURLToPath(new URL('validate-servers.mjs', import.meta.url));
  const run = (...args) => spawnSync(process.execPath, ['--experimental-strip-types', script, ...args], { encoding: 'utf8' });

  const ok = run();
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, new RegExp(`${servers.length} listings valid`));

  const dir = mkdtempSync(join(tmpdir(), 'mcp-rack-'));
  try {
    const bad = join(dir, 'servers.json');
    writeFileSync(bad, JSON.stringify([{ ...valid, lang: 'Rust' }, { ...valid }]));
    const failed = run(bad);
    assert.equal(failed.status, 1);
    assert.match(failed.stderr, /lang/);
    assert.match(failed.stderr, /Duplicate slug/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('board rows follow order, not file position, and use the page labels', () => {
  const rows = boardRows([{ ...valid, order: 2, slug: 'b' }, { ...valid, order: 1, slug: 'a', registry: 'io.github.x/a', package: { kind: 'npm', name: 'a', version: '1.0.0' } }]);
  assert.deepEqual(rows.map((r) => [r.position, r.slug, r.registryLabel, r.packageLabel]), [
    ['01', 'a', 'In registry', 'npm a 1.0.0'],
    ['02', 'b', 'Not listed yet', 'source only'],
  ]);
  assert.equal(registryLabel(null), 'Not listed yet');
  assert.equal(packageLabel({ package: null, repo: null }), 'private preview');
  assert.equal(packageLabel({ package: { kind: 'pypi', name: 'x', version: null }, repo: null }), 'pypi x');
});

test('Markdown cells escape pipes so a tagline cannot break the table', () => {
  const table = boardMarkdown(boardRows([{ ...valid, tagline: 'a | b' }]), 'https://mcprack.dev/');
  assert(table.includes('a \\| b'));
  assert(table.includes('(https://mcprack.dev/servers/example-mcp/)'));
});

test('README.md carries the current generated board', () => {
  const readme = read('../README.md').replaceAll('\r\n', '\n');
  assert(readme.includes(BOARD_START) && readme.includes(BOARD_END));
  const expected = spliceBoard(readme, boardMarkdown(boardRows(servers), 'https://mcprack.dev'));
  assert.equal(readme, expected, 'README board is stale: run npm run board');
});

test('splicing without markers fails loudly', () => {
  assert.throws(() => spliceBoard('# no markers', 'table'), /missing the board markers/);
});
