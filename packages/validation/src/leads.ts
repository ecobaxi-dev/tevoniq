import { z } from 'zod';
// Plain text only: strip markup and nonprinting characters before storage or email rendering.
export function cleanLeadText(value: string) {
  return value
    .normalize('NFKC')
    .replace(/<[^>]*>/g, '')
    .split('')
    .filter((c) => c === '\n' || c === '\t' || c.charCodeAt(0) >= 32)
    .join('')
    .trim();
}
const plain = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform(cleanLeadText)
    .pipe(z.string().max(max));
const required = (max: number) => plain(max).pipe(z.string().min(1));
const line = (max: number) => plain(max).refine((v) => !/[\r\n]/.test(v), 'Use a single line');
export const leadStatuses = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'WON',
  'LOST',
  'SPAM',
] as const;
export const leadStatusSchema = z.enum(leadStatuses);
export const leadSettingsSchema = z
  .object({
    notificationRecipients: z.array(z.email().max(254)).max(10),
    budgetRanges: z
      .array(
        z
          .object({
            value: z
              .string()
              .regex(/^[a-z0-9-]+$/)
              .max(60),
            label: required(120),
          })
          .strict(),
      )
      .max(20)
      .refine(
        (v) => new Set(v.map((r) => r.value)).size === v.length,
        'Budget values must be unique',
      ),
    attachmentsEnabled: z.boolean(),
    version: z.number().int().min(0),
  })
  .strict();
export const defaultLeadSettings = {
  notificationRecipients: [] as string[],
  budgetRanges: [] as Array<{ value: string; label: string }>,
  attachmentsEnabled: true,
  version: 0,
};
export const leadSubmissionSchema = z
  .object({
    submissionId: z.string().uuid(),
    type: z.enum(['contact', 'quote']),
    language: z.enum(['en', 'tr', 'ar']),
    name: required(120),
    company: line(160),
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    phone: line(50).refine(
      (v) => !v || /^[+\d\s().-]{5,50}$/.test(v),
      'Enter a valid phone number',
    ),
    country: required(100),
    subject: line(200).default(''),
    message: plain(10000).default(''),
    preferredContactMethod: z.enum(['email', 'phone']).default('email'),
    industry: line(160).default(''),
    servicesInterested: z
      .array(z.string().uuid())
      .max(20)
      .refine((v) => new Set(v).size === v.length, 'Duplicate services')
      .default([]),
    projectType: line(160).default(''),
    budgetRange: z.string().max(60).default(''),
    timeline: line(160).default(''),
    projectDescription: plain(15000).default(''),
    consent: z.boolean().default(false),
    sourcePage: z.string().regex(/^\/(en\/|tr\/|ar\/)?(contact|request-quote)$/),
    utm: z
      .object({
        source: line(200).optional(),
        medium: line(200).optional(),
        campaign: line(200).optional(),
        term: line(200).optional(),
        content: line(200).optional(),
      })
      .strict()
      .default({}),
    website: z.string().max(200).default(''),
    turnstileToken: z.string().max(2048).default(''),
  })
  .strict()
  .superRefine((v, ctx) => {
    const requiredFields =
      v.type === 'contact'
        ? (['subject', 'message'] as const)
        : (['industry', 'projectType', 'timeline', 'projectDescription'] as const);
    for (const key of requiredFields)
      if (!v[key]) ctx.addIssue({ code: 'custom', path: [key], message: 'Required field' });
    if ((v.preferredContactMethod === 'phone' || v.type === 'quote') && !v.phone)
      ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Phone number required' });
    if (v.type === 'quote' && !v.consent)
      ctx.addIssue({ code: 'custom', path: ['consent'], message: 'Consent is required' });
    if (
      (v.type === 'contact' && v.sourcePage.endsWith('request-quote')) ||
      (v.type === 'quote' && v.sourcePage.endsWith('contact'))
    )
      ctx.addIssue({ code: 'custom', path: ['sourcePage'], message: 'Source does not match form' });
  });
export const leadQuerySchema = z
  .object({
    q: z.string().trim().max(200).default(''),
    status: leadStatusSchema.optional(),
    type: z.enum(['contact', 'quote']).optional(),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['createdAt', 'updatedAt', 'name', 'status']).default('createdAt'),
    direction: z.enum(['asc', 'desc']).default('desc'),
    archived: z.enum(['true', 'false']).default('false'),
  })
  .strict();
export const leadUpdateSchema = z
  .object({
    status: leadStatusSchema,
    version: z.number().int().min(1),
    note: plain(10000).default(''),
  })
  .strict();
export const leadNoteSchema = z
  .object({ note: required(10000), version: z.number().int().min(1) })
  .strict();
export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;
export type LeadSettings = z.infer<typeof leadSettingsSchema>;
