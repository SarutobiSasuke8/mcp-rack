import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { z } from 'astro/zod';
import { maturityFields, maturityStatuses, reviewLines, validateMaturity } from '../src/lib/maturity.ts';

const schema = z.object(maturityFields).superRefine(validateMaturity);
const runtime = {
  status: 'stable', reviewedAt: '2026-09-01',
  review: { kind: 'runtime', summary: 'Tested the installed package.', evidence: ['https://example.com/checks'] },
  supportedScope: 'Read-only public content over stdio.', maturityEvidence: 'https://example.com/receipt',
};

test('stable needs runtime evidence, a receipt and an explicit supported scope', () => {
  assert(schema.safeParse(runtime).success);
  for (const patch of [{review: null}, {reviewedAt: null}, {supportedScope: null}, {maturityEvidence: null}, {review: {...runtime.review, kind: 'metadata'}}]) {
    assert.equal(schema.safeParse({...runtime, ...patch}).success, false);
  }
});

test('review dates cannot masquerade as evidence', () => {
  for (const patch of [{reviewedAt: '2026-09-01'}, {review: runtime.review}, {reviewedAt: '2026-02-30', review: runtime.review}, {reviewedAt: '2999-01-01', review: runtime.review}, {reviewedAt: '2026-09-01', review: {...runtime.review, evidence: []}}]) {
    assert.equal(schema.safeParse({status: 'beta', ...patch}).success, false);
  }
});

test('unreviewed listings stay explicit and metadata reviews retain their limited scope', () => {
  const unreviewed = schema.parse({status: 'alpha'});
  assert.deepEqual(reviewLines(unreviewed), ['Review: not yet recorded']);
  const metadata = schema.parse({...runtime, status: 'beta', review: {...runtime.review, kind: 'metadata'}});
  assert.match(reviewLines(metadata)[0], /metadata/);
  assert(reviewLines(metadata).includes('Evidence: https://example.com/checks'));
});

test('public schema and content contract accept the same maturity labels', () => {
  const published = JSON.parse(readFileSync(new URL('../public/catalog.schema.json', import.meta.url), 'utf8'));
  assert.deepEqual(published.properties.servers.items.properties.status.enum.toSorted(), [...maturityStatuses].sort());
});
