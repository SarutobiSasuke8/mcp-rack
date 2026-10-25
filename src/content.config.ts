import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';
import { reviewFields, validateReview } from './lib/maturity';
import { serverSchema } from './lib/servers';

const servers = defineCollection({
  loader: file('./src/content/servers.json'),
  schema: serverSchema,
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
    selectionBasis: z.string().trim().min(1),
    ...reviewFields,
  }).superRefine(validateReview),
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
