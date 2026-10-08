import { z } from 'astro/zod';

/**
 * Optional hosted endpoint for a listing: a remote MCP endpoint or a live demo.
 * While `live` is false the site says "coming soon" and never links the URL.
 * Flip `live` to true in servers.json once the endpoint answers.
 */
export const hostedKinds = ['remote-mcp', 'demo'] as const;

export const hostedSchema = z.object({
  url: z.url().refine((value) => value.startsWith('https://'), 'A hosted endpoint must use https.'),
  label: z.string().trim().min(1).max(80),
  kind: z.enum(hostedKinds),
  live: z.boolean(),
});

export type Hosted = z.infer<typeof hostedSchema>;

export const hostedKindLabel: Record<Hosted['kind'], string> = {
  'remote-mcp': 'Remote MCP endpoint',
  demo: 'Live demo',
};

/** Plain-text lines shared by the Markdown, llms.txt and llms-full.txt outputs. */
export function hostedLines(hosted: Hosted | null | undefined): string[] {
  if (!hosted) return [];
  return hosted.live
    ? [`Hosted: ${hosted.label} (${hostedKindLabel[hosted.kind]}), live at ${hosted.url}`]
    : [`Hosted: ${hosted.label} (${hostedKindLabel[hosted.kind]}), coming soon. Not live yet; do not connect.`];
}
