import { z } from 'zod';
import {
  serviceBlockSchema,
  serviceQuerySchema,
  serviceSlugSchema,
  serviceCardSchema,
} from './services.js';

// Business semantics belong to Industries; payloads remain the existing shared CMS blocks.
export const industryAreas = {
  hero: 'hero',
  challenges: 'overview',
  capabilities: 'capabilities',
  relevantSolutions: 'related-projects',
  relevantServices: 'related-services',
  useCases: 'benefits',
  projects: 'related-projects',
  cta: 'cta',
  faq: 'faq',
} as const;
export const industryAreaSchema = z.enum(
  Object.keys(industryAreas) as [keyof typeof industryAreas, ...Array<keyof typeof industryAreas>],
);
export const industryBlockSchema = z
  .object({
    area: industryAreaSchema,
    content: serviceBlockSchema,
  })
  .strict()
  .superRefine(({ area, content }, ctx) => {
    if (content.type !== industryAreas[area])
      ctx.addIssue({ code: 'custom', message: 'Block type does not match its industry section' });
    if ('ids' in content && content.ids.length)
      ctx.addIssue({
        code: 'custom',
        message: 'Use the industry relationships, not embedded record IDs',
      });
  });
export type IndustryBlock = z.infer<typeof industryBlockSchema>;
export const industryTranslationSchema = z
  .object({
    locale: z.enum(['en', 'tr', 'ar']),
    name: z.string().trim().min(1).max(500),
    shortDescription: z.string().trim().max(1000),
    published: z.boolean(),
    seoTitle: z.string().trim().max(160),
    seoDescription: z.string().trim().max(320),
    blocks: z.array(industryBlockSchema).max(9),
  })
  .strict()
  .superRefine((t, ctx) => {
    if (
      new Set(t.blocks.map((b) => b.area)).size !== t.blocks.length ||
      new Set(t.blocks.map((b) => b.content.id)).size !== t.blocks.length
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Sections and block IDs must be unique',
        path: ['blocks'],
      });
    const hero = t.blocks.find((b) => b.area === 'hero');
    if (hero && t.blocks[0] !== hero)
      ctx.addIssue({ code: 'custom', message: 'Hero must be the first section', path: ['blocks'] });
    if (t.published && (!hero || !t.shortDescription || !t.seoTitle || !t.seoDescription))
      ctx.addIssue({
        code: 'custom',
        message: 'Publishing requires a hero, short description and SEO metadata',
        path: ['published'],
      });
  });
const ids = z
  .array(z.string().uuid())
  .max(40)
  .refine((values) => new Set(values).size === values.length, 'Relationships must be unique');
export const industryWriteSchema = z
  .object({
    slug: serviceSlugSchema,
    status: z.enum(['DRAFT', 'PUBLISHED']),
    active: z.boolean(),
    published: z.boolean(),
    featured: z.boolean(),
    sortOrder: z.number().int().min(0).max(2147483647),
    version: z.number().int().min(0),
    serviceIds: ids,
    solutionIds: ids.default([]),
    projectIds: ids.default([]),
    translations: z.array(industryTranslationSchema).min(1).max(3),
  })
  .strict()
  .superRefine((value, ctx) => {
    if ((value.status === 'PUBLISHED') !== value.published)
      ctx.addIssue({
        code: 'custom',
        message: 'Status must match publication state',
        path: ['status'],
      });
    if (value.published && !value.translations.some((t) => t.published))
      ctx.addIssue({
        code: 'custom',
        message: 'Publish at least one complete translation',
        path: ['published'],
      });
    if (new Set(value.translations.map((t) => t.locale)).size !== value.translations.length)
      ctx.addIssue({ code: 'custom', message: 'Locales must be unique', path: ['translations'] });
  });
export type IndustryWrite = z.infer<typeof industryWriteSchema>;
export const industryQuerySchema = serviceQuerySchema.extend({
  featured: z.enum(['true', 'false']).optional(),
  service: serviceSlugSchema.optional(),
});
export const industryCardSchema = z.object({
  id: z.string().uuid(),
  slug: serviceSlugSchema,
  name: z.string(),
  shortDescription: z.string(),
  featured: z.boolean(),
});
export const industryListSchema = z.object({
  items: z.array(industryCardSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});
export const publicIndustrySchema = industryCardSchema.extend({
  locale: z.enum(['en', 'tr', 'ar']),
  availableLocales: z.array(z.enum(['en', 'tr', 'ar'])),
  seoTitle: z.string(),
  seoDescription: z.string(),
  blocks: z.array(industryBlockSchema),
  services: z.array(serviceCardSchema),
  projects: z.array(serviceCardSchema),
  solutions: z.array(serviceCardSchema),
});
export type PublicIndustry = z.infer<typeof publicIndustrySchema>;
