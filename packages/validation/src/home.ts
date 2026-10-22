import { z } from 'zod';
const text = z.string().trim().min(1).max(4000);
const items = z.array(text).min(1).max(30);
const pair = z.object({ title: text, description: text }).strict();
export const homeCopySchema = z
  .object({
    eyebrow: text,
    headline: text,
    accent: text,
    introduction: text,
    explore: text,
    contact: text,
    capabilityLabel: text,
    capabilityTitle: text,
    capabilityBody: text,
    pillars: items,
    solutionsLabel: text,
    solutionsTitle: text,
    solutions: z.array(pair).min(1).max(12),
    technologiesLabel: text,
    technologiesTitle: text,
    technologies: items,
    whyLabel: text,
    whyTitle: text,
    values: items,
    industries: text,
    projects: text,
    partners: text,
    insights: text,
    cta: text,
    ctaBody: text,
    footer: text,
    rights: text,
  })
  .strict();
export const homeHeroSchema = z
  .object({
    videoUrl: z
      .string()
      .trim()
      .max(2048)
      .refine((value) => {
        if (!value) return true;
        if (/^\/media\/[a-zA-Z0-9/_-]+(?:\.[a-zA-Z0-9]+)?$/.test(value)) return true;
        try {
          const url = new URL(value);
          return url.protocol === 'https:' && !url.username && !url.password;
        } catch {
          return false;
        }
      }, 'Use an HTTPS video URL or an uploaded /media/ path')
      .default(''),
    eyebrow: text,
    title: text,
    accent: text,
    body: text,
    start: text,
    watch: text,
    unavailable: text,
    close: text,
    contact: text,
    values: z.array(z.object({ title: text, body: text }).strict()).length(3),
  })
  .strict();
export const homeContentSchema = z.object({ copy: homeCopySchema, hero: homeHeroSchema }).strict();
export const homeWriteSchema = z
  .object({
    content: homeContentSchema,
    version: z.number().int().min(0),
    action: z.enum(['save', 'publish', 'unpublish']),
  })
  .strict();
export const publicHomeSchema = z.object({
  content: homeContentSchema.nullable(),
  partners: z.array(
    z.object({ id: z.string().uuid(), title: text, description: z.string().max(20000) }),
  ),
});
export type HomeContent = z.infer<typeof homeContentSchema>;
