export function formatDate(date: Date, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }): string {
  return date.toLocaleDateString('en-IE', opts);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Reading time computed from the body, never hand-typed. */
export function readingTime(body: string | undefined): string {
  if (!body) return '1 min read';
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
