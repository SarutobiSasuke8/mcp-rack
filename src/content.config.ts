import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';

const packageSchema = z
  .object({
    kind: z.enum(['pypi', 'npm']),
    name: z.string(),
    version: z.string().nullable().optional(),
  })
  .nullable();

const servers = defineCollection({
  loader: file('./src/content/servers.json'),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    tagline: z.string().max(180),
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
    lang: z.enum(['Python', 'TypeScript', 'Go']),
    transport: z.string(),
    package: packageSchema,
    registry: z.string().nullable(),
    status: z.enum(['beta', 'alpha', 'preview', 'experimental']),
    license: z.string(),
    repo: z.url(),
    docs: z.url().nullable().optional(),
    install: z.string().nullable(),
    tags: z.array(z.string()).default([]),
    order: z.number(),
  }),
});

const rack = defineCollection({
  loader: file('./src/content/rack.json'),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    by: z.string(),
    kind: z.enum(['official', 'community']),
    blurb: z.string(),
    url: z.url(),
    useCase: z.string(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['Release notes', 'Field notes', 'Build log', 'Guides', 'Perspective']),
    server: z.string().optional(),
    version: z.string().optional(),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
  }),
});

export const collections = { servers, rack, posts };
