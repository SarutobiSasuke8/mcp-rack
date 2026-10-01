import { z } from 'astro/zod';

export const maturityStatuses = ['experimental', 'alpha', 'preview', 'beta', 'stable'] as const;

export const reviewFields = {
  reviewedAt: z.iso.date().nullable().default(null),
  review: z.object({
    kind: z.enum(['metadata', 'runtime']),
    summary: z.string().trim().min(1),
    evidence: z.array(z.url()).min(1),
  }).nullable().default(null),
};

export const maturityFields = {
  ...reviewFields,
  status: z.enum(maturityStatuses),
  supportedScope: z.string().trim().min(1).nullable().default(null),
  maturityEvidence: z.url().nullable().default(null),
};

type Review = { reviewedAt: string | null; review: { kind: string } | null };

export function validateReview(value: Review, ctx: z.RefinementCtx) {
  if (Boolean(value.reviewedAt) !== Boolean(value.review)) {
    ctx.addIssue({ code: 'custom', path: ['review'], message: 'A review needs both a date and evidence; use null for an unreviewed listing.' });
  }
  if (value.reviewedAt && value.reviewedAt > new Date().toISOString().slice(0, 10)) {
    ctx.addIssue({ code: 'custom', path: ['reviewedAt'], message: 'A review date cannot be in the future.' });
  }
}

export function validateMaturity(value: Review & { status: string; supportedScope: string | null; maturityEvidence: string | null }, ctx: z.RefinementCtx) {
  validateReview(value, ctx);
  if (value.status === 'stable' && (!value.supportedScope || !value.maturityEvidence || value.review?.kind !== 'runtime')) {
    ctx.addIssue({ code: 'custom', path: ['status'], message: 'Stable requires a supported scope, a promotion receipt and a dated runtime review.' });
  }
}

export function reviewLines(value: Review & { review: { kind: string; summary: string; evidence: string[] } | null }): string[] {
  return value.review && value.reviewedAt
    ? [`Review: ${value.reviewedAt} (${value.review.kind})`, value.review.summary, ...value.review.evidence.map(url => 'Evidence: ' + url)]
    : ['Review: not yet recorded'];
}
