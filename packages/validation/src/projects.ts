import { z } from 'zod';
import { serviceSlugSchema, serviceQuerySchema, serviceCardSchema } from './services.js';

export const projectSlugSchema = serviceSlugSchema.refine(
  (slug) => slug !== 'filters',
  'This slug is reserved',
);
const copy = (max: number) => z.string().trim().max(max);
const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (/^\/(?!\/)[a-z0-9/_\-.]+\.(?:png|jpe?g|webp|avif)$/i.test(value)) return true;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password;
    } catch {
      return false;
    }
  }, 'Use an HTTPS image URL or a local PNG, JPEG, WebP or AVIF path');
export const projectImageSchema = z
  .object({
    url: imageUrl,
    alt: copy(300).min(1),
    caption: copy(1000).default(''),
  })
  .strict();
export const projectResultSchema = z
  .object({ value: copy(100).min(1), label: copy(300).min(1) })
  .strict();
export const projectTranslationSchema = z
  .object({
    locale: z.enum(['en', 'tr', 'ar']),
    title: copy(500).min(1),
    summary: copy(1000),
    published: z.boolean(),
    anonymousClientName: copy(300).default(''),
    heroImage: projectImageSchema.nullable().default(null),
    gallery: z.array(projectImageSchema).max(24).default([]),
    challenge: copy(12000).default(''),
    approach: copy(12000).default(''),
    solution: copy(12000).default(''),
    implementation: copy(12000).default(''),
    technologies: z.array(copy(100).min(1)).max(40).default([]),
    results: z.array(projectResultSchema).max(20).default([]),
    testimonial: copy(4000).default(''),
    testimonialAuthor: copy(300).default(''),
    seoTitle: copy(160).default(''),
    seoDescription: copy(320).default(''),
  })
  .strict()
  .superRefine((t, ctx) => {
    if (
      t.published &&
      (!t.summary || !t.seoTitle || !t.seoDescription || !t.challenge || !t.solution)
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Publishing requires summary, challenge, solution and SEO metadata',
        path: ['published'],
      });
  });
const ids = z
  .array(z.string().uuid())
  .max(40)
  .refine((a) => new Set(a).size === a.length, 'Relationships must be unique');
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const d = new Date(value);
    return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === value;
  }, 'Use a valid calendar date');

// Detect the stored identity even when punctuation, casing or URL encoding differs.
const normalized = (s: string) => {
  let decoded = s;
  try {
    decoded = decodeURIComponent(s);
  } catch {
    /* Literal text is still checked. */
  }
  return decoded
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}]/gu, '');
};
export function containsClientIdentity(content: unknown, clientName: string): boolean {
  const needle = normalized(clientName);
  if (!needle) return false;
  if (typeof content === 'string') return normalized(content).includes(needle);
  if (Array.isArray(content)) return content.some((v) => containsClientIdentity(v, clientName));
  if (content && typeof content === 'object')
    return Object.values(content).some((v) => containsClientIdentity(v, clientName));
  return false;
}

export const projectWriteSchema = z
  .object({
    slug: projectSlugSchema,
    clientName: copy(300).default(''),
    clientVisibility: z.enum(['PUBLIC', 'ANONYMOUS', 'PRIVATE']).default('PRIVATE'),
    country: copy(160).default(''),
    city: copy(160).default(''),
    projectDate: date.nullable().default(null),
    featured: z.boolean().default(false),
    published: z.boolean(),
    verified: z.boolean().default(false),
    version: z.number().int().min(0),
    sortOrder: z.number().int().min(0).max(2147483647).default(0),
    industryIds: ids.default([]),
    serviceIds: ids.default([]),
    solutionIds: ids.default([]),
    translations: z.array(projectTranslationSchema).min(1).max(3),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (new Set(p.translations.map((t) => t.locale)).size !== p.translations.length)
      ctx.addIssue({ code: 'custom', message: 'Locales must be unique', path: ['translations'] });
    if (p.published && (!p.verified || !p.translations.some((t) => t.published)))
      ctx.addIssue({
        code: 'custom',
        message: 'Review content and publish a complete translation first',
        path: ['published'],
      });
    if (p.published && p.clientVisibility === 'PUBLIC' && !p.clientName)
      ctx.addIssue({
        code: 'custom',
        message: 'Public client visibility requires a client name',
        path: ['clientName'],
      });
    for (const [index, t] of p.translations.entries()) {
      if (!t.published) continue;
      if (p.clientVisibility === 'ANONYMOUS' && !t.anonymousClientName)
        ctx.addIssue({
          code: 'custom',
          message:
            'Anonymous projects require an approved client descriptor in each published language',
          path: ['translations', index, 'anonymousClientName'],
        });
      const publicCopy = {
        ...t,
        testimonialAuthor: '',
        anonymousClientName: p.clientVisibility === 'ANONYMOUS' ? t.anonymousClientName : '',
      };
      if (
        p.clientVisibility !== 'PUBLIC' &&
        containsClientIdentity(
          {
            slug: p.slug,
            country: p.country,
            city: p.city,
            ...publicCopy,
            ...(p.clientVisibility === 'ANONYMOUS' ? { client: t.anonymousClientName } : {}),
          },
          p.clientName,
        )
      )
        ctx.addIssue({
          code: 'custom',
          message:
            'Remove the confidential client name from public content, URLs, SEO and image metadata',
          path: ['translations', index],
        });
    }
  });
export type ProjectWrite = z.infer<typeof projectWriteSchema>;
export const projectQuerySchema = serviceQuerySchema.extend({
  industry: serviceSlugSchema.optional(),
  service: serviceSlugSchema.optional(),
  solution: serviceSlugSchema.optional(),
  featured: z.enum(['true', 'false']).optional(),
});
export const projectCardSchema = serviceCardSchema.extend({
  clientLabel: z.string().nullable(),
  heroImage: projectImageSchema.nullable(),
  featured: z.boolean(),
  country: z.string(),
  city: z.string(),
  projectDate: date.nullable(),
});
export const publicProjectSchema = projectCardSchema
  .extend({
    locale: z.enum(['en', 'tr', 'ar']),
    availableLocales: z.array(z.enum(['en', 'tr', 'ar'])),
    gallery: z.array(projectImageSchema),
    challenge: z.string(),
    approach: z.string(),
    solution: z.string(),
    implementation: z.string(),
    technologies: z.array(z.string()),
    results: z.array(projectResultSchema),
    testimonial: z.string(),
    testimonialAttribution: z.string().nullable(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    industries: z.array(serviceCardSchema),
    services: z.array(serviceCardSchema),
    solutions: z.array(serviceCardSchema),
  })
  .strict();
export const projectListSchema = z.object({
  items: z.array(projectCardSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});
export const projectFiltersSchema = z.object({
  industries: z.array(serviceCardSchema),
  services: z.array(serviceCardSchema),
  solutions: z.array(serviceCardSchema),
});
export type PublicProject = z.infer<typeof publicProjectSchema>;
