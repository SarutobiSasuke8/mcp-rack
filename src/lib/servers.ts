import { z } from 'astro/zod';
import { maturityFields, validateMaturity } from './maturity.ts';
import { hostedSchema } from './hosted.ts';

/**
 * The contract for one entry in src/content/servers.json (the board).
 * Astro's content collection uses this schema at build time, and
 * scripts/validate-servers.mjs uses the same schema in CI, so the two can
 * never disagree about what a valid listing is.
 */
export const languages = ['Python', 'TypeScript', 'Go'] as const;

export const packageSchema = z
  .object({
    kind: z.enum(['pypi', 'npm']),
    name: z.string(),
    version: z.string().nullable().optional(),
  })
  .nullable();

export const serverFields = z.object({
  slug: z.string(),
  name: z.string(),
  tagline: z.string().max(180),
  summary: z.string(),
  highlights: z.array(z.string()).default([]),
  lang: z.enum(languages),
  transport: z.string(),
  package: packageSchema,
  registry: z.string().nullable(),
  ...maturityFields,
  license: z.string(),
  repo: z.url().nullable(),
  docs: z.url().nullable().optional(),
  availability: z.string().optional(),
  limitations: z.array(z.string()).default([]),
  interestUrl: z.url().optional(),
  hosted: hostedSchema.optional(),
  install: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  order: z.number(),
});

export const serverSchema = serverFields.superRefine(validateMaturity);

export type ServerEntry = z.infer<typeof serverSchema>;

/** Keys a raw entry may carry: the schema fields plus the loader's `id`. */
export const allowedKeys: ReadonlySet<string> = new Set(['id', ...Object.keys(serverFields.shape)]);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ListingIssue {
  readonly index: number;
  readonly slug: string;
  readonly path: string;
  readonly message: string;
}

/**
 * Validate the raw contents of servers.json. Returns every problem found, so a
 * contributor sees all of them in one run; an empty array means the file is valid.
 *
 * Per entry: the content schema above, no unknown keys (Astro would silently
 * strip a misspelt field), `id` equal to `slug`, and a URL-safe slug.
 * Across entries: unique slugs and unique `order` values, so the board order is
 * never decided by file position.
 */
export function validateServerList(raw: unknown): ListingIssue[] {
  if (!Array.isArray(raw)) {
    return [{ index: -1, slug: '', path: '', message: 'servers.json must be a JSON array of server objects.' }];
  }
  const issues: ListingIssue[] = [];
  const slugs = new Map<string, number>();
  const orders = new Map<number, number>();

  raw.forEach((entry: unknown, index) => {
    const label = (typeof entry === 'object' && entry !== null && typeof (entry as { slug?: unknown }).slug === 'string')
      ? (entry as { slug: string }).slug
      : `#${index}`;
    const add = (path: string, message: string) => issues.push({ index, slug: label, path, message });

    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      add('', 'Each entry must be an object.');
      return;
    }
    const record = entry as Record<string, unknown>;

    for (const key of Object.keys(record)) {
      if (!allowedKeys.has(key)) add(key, `Unknown field "${key}". Check the spelling against src/lib/servers.ts.`);
    }

    const parsed = serverSchema.safeParse(record);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) add(issue.path.join('.'), issue.message);
    }

    if (typeof record.slug === 'string') {
      if (!SLUG.test(record.slug)) add('slug', 'Use lower-case letters, digits and single hyphens.');
      if (record.id !== record.slug) add('id', `id must equal slug ("${record.slug}").`);
      const first = slugs.get(record.slug);
      if (first !== undefined) add('slug', `Duplicate slug, first used by entry #${first}.`);
      else slugs.set(record.slug, index);
    }

    if (typeof record.order === 'number') {
      const first = orders.get(record.order);
      if (first !== undefined) add('order', `Duplicate order ${record.order}, first used by entry #${first}.`);
      else orders.set(record.order, index);
    }
  });

  return issues;
}

export function formatIssues(issues: readonly ListingIssue[]): string {
  return issues
    .map((issue) => `  - ${issue.slug}${issue.path ? ` (${issue.path})` : ''}: ${issue.message}`)
    .join('\n');
}
