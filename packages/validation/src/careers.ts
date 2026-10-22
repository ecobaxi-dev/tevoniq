import { z } from 'zod';
import { accountEmailSchema } from './rbac.js';
export const employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const;
export const workModes = ['ONSITE', 'REMOTE', 'HYBRID'] as const;
export const jobStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'] as const;
export const applicationStatuses = [
  'NEW',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
] as const;
export const MAX_CV_BYTES = 5 * 1024 * 1024;
const plain = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (v) =>
        ![...v].some(
          (c) => (c.charCodeAt(0) < 32 && !'\n\r\t'.includes(c)) || c.charCodeAt(0) === 127,
        ),
      'Control characters are not allowed',
    );
export const jobSlugSchema = z
  .string()
  .max(150)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z.iso.datetime({ offset: true }).nullable();
export const jobWriteSchema = z
  .object({
    title: plain(200).min(1),
    slug: jobSlugSchema,
    department: plain(150).min(1),
    location: plain(180).min(1),
    employmentType: z.enum(employmentTypes),
    workMode: z.enum(workModes),
    description: plain(15000),
    responsibilities: z.array(plain(2000).min(1)).max(40),
    requirements: z.array(plain(2000).min(1)).max(40),
    preferredQualifications: z.array(plain(2000).min(1)).max(40),
    status: z.enum(jobStatuses),
    publishedAt: date,
    closingDate: date,
    version: z.number().int().min(0),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.publishedAt && v.closingDate && new Date(v.closingDate) <= new Date(v.publishedAt))
      ctx.addIssue({
        code: 'custom',
        path: ['closingDate'],
        message: 'Closing date must be after publication',
      });
    if (v.status === 'PUBLISHED') {
      for (const key of ['description', 'responsibilities', 'requirements', 'publishedAt'] as const)
        if (!v[key] || (Array.isArray(v[key]) && !v[key].length))
          ctx.addIssue({ code: 'custom', path: [key], message: 'Required before publishing' });
    }
  });
export type JobWrite = z.infer<typeof jobWriteSchema>;
export type PublicJob = Omit<JobWrite, 'version' | 'status'> & { id: string; updatedAt: string };
export type CareerJob = JobWrite & { id: string; createdAt: string; updatedAt: string };
const pageQuery = {
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: plain(150).default(''),
};
export const jobQuerySchema = z
  .object({
    ...pageQuery,
    department: plain(150).optional(),
    employmentType: z.enum(employmentTypes).optional(),
    workMode: z.enum(workModes).optional(),
  })
  .strict();
export const adminJobQuerySchema = jobQuerySchema.extend({
  status: z.enum(jobStatuses).optional(),
});
export const applicationQuerySchema = z
  .object({
    ...pageQuery,
    jobId: z.string().uuid().optional(),
    status: z.enum(applicationStatuses).optional(),
  })
  .strict();
const link = z
  .string()
  .max(2048)
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return u.protocol === 'https:' && !u.username && !u.password;
    } catch {
      return false;
    }
  }, 'Use an HTTPS URL');
export const applicationSubmitSchema = z
  .object({
    submissionId: z.string().uuid(),
    jobSlug: jobSlugSchema,
    name: plain(180).min(1),
    email: accountEmailSchema,
    phone: plain(60)
      .refine((v) => !v || /^[+\d\s().-]+$/.test(v), 'Use a phone number')
      .default(''),
    location: plain(180).min(1),
    linkedIn: link.default(''),
    portfolio: link.default(''),
    coverLetter: plain(15000).default(''),
    consent: z.literal(true),
    website: z.literal('').default(''),
    turnstileToken: z.string().max(2048).default(''),
  })
  .strict();
export type ApplicationSubmit = z.infer<typeof applicationSubmitSchema>;
export const applicationUpdateSchema = z
  .object({ status: z.enum(applicationStatuses), version: z.number().int().min(1) })
  .strict();
export const applicationNoteSchema = z
  .object({ note: plain(5000).min(1), version: z.number().int().min(1) })
  .strict();
