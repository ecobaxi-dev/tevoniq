import { z } from 'zod';
import { accountEmailSchema } from './rbac.js';
export const newsletterStatuses = ['PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'BOUNCED'] as const;
export const newsletterSubscribeSchema = z.object({
  email: accountEmailSchema, name: z.string().trim().max(180).default(''), language: z.enum(['en', 'tr', 'ar']).default('en'),
  source: z.string().trim().min(1).max(240).default('website'), consent: z.literal(true),
  website: z.literal('').default(''), turnstileToken: z.string().max(2048).default(''),
}).strict();
export const newsletterTokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const newsletterQuerySchema = z.object({ q: z.string().max(180).default(''), status: z.enum(newsletterStatuses).optional(), language: z.enum(['en', 'tr', 'ar']).optional(), page: z.coerce.number().int().min(1).max(10000).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }).strict();
export const newsletterUpdateSchema = z.object({ status: z.enum(['UNSUBSCRIBED', 'BOUNCED']), version: z.number().int().min(1) }).strict();
export type NewsletterStatus = (typeof newsletterStatuses)[number];
export type NewsletterSubscriber = { id: string; email: string; name: string; language: 'en' | 'tr' | 'ar'; source: string; status: NewsletterStatus; subscribedAt: string | null; unsubscribedAt: string | null; createdAt: string; version: number };
