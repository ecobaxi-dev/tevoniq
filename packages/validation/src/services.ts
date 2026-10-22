import { z } from 'zod';
import { accountEmailSchema } from './rbac.js';
const text = z.string().trim().min(1).max(500);
export const serviceSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(120);
const path = z
  .string()
  .regex(/^\/(?!\/)[a-z0-9/-]*(?:#[a-z0-9-]+)?$/i)
  .max(240);
const base = { id: z.string().uuid(), title: text };
const item = z.object({ title: text, description: z.string().trim().max(2000) }).strict();
export const serviceBlockSchema = z.discriminatedUnion('type', [
  z
    .object({
      ...base,
      type: z.literal('hero'),
      description: z.string().max(2000),
      assetKey: z.enum(['none', 'brand-icon', 'home']).default('none'),
    })
    .strict(),
  z
    .object({ ...base, type: z.literal('overview'), body: z.string().trim().min(1).max(12000) })
    .strict(),
  z
    .object({
      ...base,
      type: z.enum([
        'benefits',
        'capabilities',
        'features',
        'use-cases',
        'industries',
        'technology-stack',
      ]),
      items: z.array(item).min(1).max(40),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal('faq'),
      items: z
        .array(z.object({ question: text, answer: z.string().trim().min(1).max(4000) }).strict())
        .min(1)
        .max(30),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.enum(['related-projects', 'related-services']),
      ids: z.array(z.string().uuid()).max(20),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal('cta'),
      body: z.string().max(2000),
      label: text,
      href: path,
    })
    .strict(),
]);
export type ServiceBlock = z.infer<typeof serviceBlockSchema>;
export const serviceTranslationSchema = z
  .object({
    locale: z.enum(['en', 'tr', 'ar']),
    title: text,
    summary: z.string().trim().max(1000),
    published: z.boolean(),
    seoTitle: z.string().trim().max(160),
    seoDescription: z.string().trim().max(320),
    blocks: z.array(serviceBlockSchema).max(60),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (new Set(value.blocks.map((block) => block.id)).size !== value.blocks.length)
      ctx.addIssue({ code: 'custom', message: 'Block IDs must be unique', path: ['blocks'] });
    const heroes = value.blocks.filter((block) => block.type === 'hero');
    if (heroes.length > 1 || (heroes.length === 1 && value.blocks[0]?.type !== 'hero'))
      ctx.addIssue({
        code: 'custom',
        message: 'A hero must be the first block and may appear only once',
        path: ['blocks'],
      });
    if (
      value.published &&
      (!value.summary || !value.seoTitle || !value.seoDescription || heroes.length !== 1)
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Publishing requires summary, SEO title, SEO description and a hero',
        path: ['published'],
      });
  });
export const serviceWriteSchema = z
  .object({
    slug: serviceSlugSchema,
    active: z.boolean(),
    sortOrder: z.number().int().min(0).max(2147483647).default(0),
    version: z.number().int().min(0),
    translations: z.array(serviceTranslationSchema).min(1).max(3),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (new Set(value.translations.map((t) => t.locale)).size !== value.translations.length)
      ctx.addIssue({ code: 'custom', message: 'Locale must be unique', path: ['translations'] });
  });
export type ServiceWrite = z.infer<typeof serviceWriteSchema>;
export const serviceQuerySchema = z
  .object({
    locale: z.enum(['en', 'tr', 'ar']).default('en'),
    page: z.coerce.number().int().min(1).max(1000000).default(1),
    limit: z.coerce.number().int().min(1).max(48).default(12),
    q: z.string().trim().max(120).default(''),
  })
  .strict();
export const serviceCardSchema = z.object({
  id: z.string().uuid(),
  slug: serviceSlugSchema,
  title: text,
  summary: z.string(),
});
export const publicServiceSchema = serviceCardSchema.extend({
  locale: z.enum(['en', 'tr', 'ar']),
  seoTitle: z.string(),
  seoDescription: z.string(),
  blocks: z.array(serviceBlockSchema),
  relatedServices: z.array(serviceCardSchema),
  relatedProjects: z.array(
    z.object({ id: z.string().uuid(), slug: serviceSlugSchema, title: text, summary: z.string() }),
  ),
});
export type PublicService = z.infer<typeof publicServiceSchema>;
export const serviceListSchema = z.object({
  items: z.array(serviceCardSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});
export const loginSchema = z
  .object({ email: accountEmailSchema, password: z.string().min(1).max(128) })
  .strict();
