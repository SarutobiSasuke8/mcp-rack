import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { hostedKinds, hostedLines, hostedSchema } from '../src/lib/hosted.ts';

const soon = { url: 'https://jobscout.mcprack.dev', label: 'JobScout hosted', kind: 'remote-mcp', live: false };
const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

test('hosted needs an https url, a label, a known kind and an explicit live flag', () => {
  assert(hostedSchema.safeParse(soon).success);
  assert(hostedSchema.safeParse({ ...soon, kind: 'demo', live: true }).success);
  for (const patch of [{ url: 'http://jobscout.mcprack.dev' }, { url: 'not a url' }, { label: '' }, { kind: 'paid' }, { live: undefined }, { live: 'false' }]) {
    assert.equal(hostedSchema.safeParse({ ...soon, ...patch }).success, false, JSON.stringify(patch));
  }
});

test('an endpoint that is not live is described as coming soon and never as a URL to connect to', () => {
  const [line] = hostedLines(soon);
  assert.match(line, /coming soon/);
  assert(!line.includes(soon.url));
  assert(hostedLines({ ...soon, live: true })[0].includes(soon.url));
  assert.deepEqual(hostedLines(undefined), []);
});

test('public schema, catalogue version and content records agree on hosted', () => {
  const schema = read('../public/catalog.schema.json');
  assert.equal(schema.properties.schemaVersion.const, '1.2.0');
  assert.deepEqual(schema.$defs.hosted.properties.kind.enum, [...hostedKinds]);
  assert.match(readFileSync(new URL('../src/lib/catalog.ts', import.meta.url), 'utf8'), /CATALOG_SCHEMA_VERSION='1\.2\.0'/);
  const servers = read('../src/content/servers.json');
  for (const s of servers.filter((entry) => entry.hosted)) assert(hostedSchema.safeParse(s.hosted).success, s.slug);
  const urlOf = (slug) => servers.find((s) => s.slug === slug)?.hosted?.url;
  assert.equal(urlOf('jobscout-mcp'), 'https://jobscout.mcprack.dev');
  assert.equal(urlOf('agent-handoff-mcp'), 'https://handoff.astraeus.ie');
});
