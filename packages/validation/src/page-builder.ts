import { z } from 'zod';
export const builderLocales = ['en', 'tr', 'ar'] as const;
export type BuilderLocale = (typeof builderLocales)[number];
export const sectionTypes = [
  'Hero',
  'RichText',
  'ImageText',
  'FeatureGrid',
  'ServiceGrid',
  'SolutionGrid',
  'IndustryGrid',
  'Stats',
  'LogoGrid',
  'ProjectGrid',
  'TeamGrid',
  'Testimonials',
  'FAQ',
  'CTA',
  'ImageGallery',
  'Video',
  'Timeline',
  'ContactBlock',
  'Newsletter',
  'CustomHeading',
] as const;
export type SectionType = (typeof sectionTypes)[number];
export const sectionThemes = ['LIGHT', 'DARK', 'BLUE', 'GRADIENT'] as const;
export const sectionBackgrounds = ['PLAIN', 'SOFT', 'GRID'] as const;
export const sectionSpacings = ['COMPACT', 'NORMAL', 'SPACIOUS'] as const;
const text = (max = 5000) => z.string().max(max);
export const builderHrefSchema = z
  .string()
  .max(2048)
  .refine(
    (v) =>
      !v ||
      (/^\/(?!\/)[a-zA-Z0-9_/?=&%#.-]*$/.test(v) && !/%(?:0[ad]|5c)/i.test(v)) ||
      (URL.canParse(v) &&
        new URL(v).protocol === 'https:' &&
        !new URL(v).username &&
        !new URL(v).password),
    'Use a local path or HTTPS URL',
  );
export const builderMediaSchema = z
  .object({
    src: builderHrefSchema.refine(
      (v) => !!v && !v.startsWith('/admin') && !v.startsWith('/api'),
      'Choose a public media URL',
    ),
    alt: text(300).trim().min(1),
    caption: text(500),
  })
  .strict();
export const builderActionSchema = z.object({ label: text(120), href: builderHrefSchema }).strict();
export const richNodeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: text() }).strict(),
  z.object({ type: z.literal('heading'), text: text(200), level: z.enum(['h3', 'h4']) }).strict(),
  z
    .object({ type: z.literal('list'), items: z.array(text(1000)).max(30), ordered: z.boolean() })
    .strict(),
  z.object({ type: z.literal('quote'), text: text(), attribution: text(200) }).strict(),
  z.object({ type: z.literal('link'), label: text(200), href: builderHrefSchema }).strict(),
]);
const baseCopy = { heading: text(200), text: text(), media: builderMediaSchema.nullable() };
const ids = z
  .array(z.string().uuid())
  .max(24)
  .refine((v) => new Set(v).size === v.length, 'Duplicate records');
const grid = z.object({ ...baseCopy, ids }).strict();
export const sectionContentSchemas = {
  Hero: z
    .object({ ...baseCopy, eyebrow: text(120), actions: z.array(builderActionSchema).max(2) })
    .strict(),
  RichText: z.object({ ...baseCopy, nodes: z.array(richNodeSchema).max(40) }).strict(),
  ImageText: z
    .object({ ...baseCopy, imageSide: z.enum(['START', 'END']), action: builderActionSchema })
    .strict(),
  FeatureGrid: z
    .object({
      ...baseCopy,
      items: z.array(z.object({ title: text(200), text: text(2000) }).strict()).max(24),
    })
    .strict(),
  ServiceGrid: grid,
  SolutionGrid: grid,
  IndustryGrid: grid,
  ProjectGrid: grid,
  Stats: z
    .object({
      ...baseCopy,
      items: z
        .array(z.object({ value: text(60), label: text(150), note: text(300) }).strict())
        .max(12),
    })
    .strict(),
  LogoGrid: z
    .object({
      ...baseCopy,
      items: z
        .array(
          z
            .object({
              name: text(150),
              media: builderMediaSchema.nullable(),
              href: builderHrefSchema,
            })
            .strict(),
        )
        .max(30),
    })
    .strict(),
  TeamGrid: z
    .object({
      ...baseCopy,
      items: z
        .array(
          z
            .object({
              name: text(150),
              role: text(150),
              bio: text(2000),
              media: builderMediaSchema.nullable(),
            })
            .strict(),
        )
        .max(24),
    })
    .strict(),
  Testimonials: z
    .object({
      ...baseCopy,
      items: z
        .array(z.object({ quote: text(3000), author: text(150), company: text(150) }).strict())
        .max(20),
    })
    .strict(),
  FAQ: z
    .object({
      ...baseCopy,
      items: z.array(z.object({ question: text(300), answer: text() }).strict()).max(30),
    })
    .strict(),
  CTA: z.object({ ...baseCopy, action: builderActionSchema }).strict(),
  ImageGallery: z.object({ ...baseCopy, images: z.array(builderMediaSchema).max(24) }).strict(),
  Video: z
    .object({
      ...baseCopy,
      provider: z.enum(['YOUTUBE', 'VIMEO']),
      videoId: z.string().max(30),
      transcript: text(10000),
    })
    .strict()
    .superRefine((v, c) => {
      if (
        v.videoId &&
        !(v.provider === 'YOUTUBE' ? /^[a-zA-Z0-9_-]{11}$/ : /^\d{1,12}$/).test(v.videoId)
      )
        c.addIssue({
          code: 'custom',
          path: ['videoId'],
          message: 'Enter a valid provider video ID',
        });
    }),
  Timeline: z
    .object({
      ...baseCopy,
      items: z
        .array(z.object({ label: text(120), title: text(200), text: text(2000) }).strict())
        .max(30),
    })
    .strict(),
  ContactBlock: z
    .object({
      ...baseCopy,
      email: z.union([z.literal(''), z.email().max(254)]),
      phone: text(50).refine((v) => !v || /^[+\d\s().-]+$/.test(v), 'Use a phone number'),
      address: text(500),
      action: builderActionSchema,
    })
    .strict(),
  Newsletter: z
    .object({
      ...baseCopy,
      buttonLabel: text(120),
      consentLabel: text(500),
      successMessage: text(500),
    })
    .strict(),
  CustomHeading: z
    .object({ ...baseCopy, level: z.enum(['h2', 'h3']), alignment: z.enum(['START', 'CENTER']) })
    .strict(),
};
const common = {
  id: z.string().uuid(),
  visible: z.boolean(),
  order: z.number().int().min(0).max(79),
  theme: z.enum(sectionThemes),
  background: z.enum(sectionBackgrounds),
  spacing: z.enum(sectionSpacings),
};
const localized = <T extends z.ZodType>(schema: T) =>
  z.object({ en: schema.optional(), tr: schema.optional(), ar: schema.optional() }).strict();
const block = <T extends SectionType, S extends z.ZodType>(type: T, schema: S) =>
  z.object({ ...common, type: z.literal(type), content: localized(schema) }).strict();
export const builderSectionSchema = z.discriminatedUnion('type', [
  block('Hero', sectionContentSchemas.Hero),
  block('RichText', sectionContentSchemas.RichText),
  block('ImageText', sectionContentSchemas.ImageText),
  block('FeatureGrid', sectionContentSchemas.FeatureGrid),
  block('ServiceGrid', sectionContentSchemas.ServiceGrid),
  block('SolutionGrid', sectionContentSchemas.SolutionGrid),
  block('IndustryGrid', sectionContentSchemas.IndustryGrid),
  block('Stats', sectionContentSchemas.Stats),
  block('LogoGrid', sectionContentSchemas.LogoGrid),
  block('ProjectGrid', sectionContentSchemas.ProjectGrid),
  block('TeamGrid', sectionContentSchemas.TeamGrid),
  block('Testimonials', sectionContentSchemas.Testimonials),
  block('FAQ', sectionContentSchemas.FAQ),
  block('CTA', sectionContentSchemas.CTA),
  block('ImageGallery', sectionContentSchemas.ImageGallery),
  block('Video', sectionContentSchemas.Video),
  block('Timeline', sectionContentSchemas.Timeline),
  block('ContactBlock', sectionContentSchemas.ContactBlock),
  block('Newsletter', sectionContentSchemas.Newsletter),
  block('CustomHeading', sectionContentSchemas.CustomHeading),
]);
export type BuilderSection = z.infer<typeof builderSectionSchema>;
export type SectionCopy<T extends SectionType> = z.infer<(typeof sectionContentSchemas)[T]>;
export const builderPathSchema = z
  .string()
  .max(180)
  .regex(/^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/)
  .refine(
    (v) =>
      ![
        'admin',
        'api',
        'cms',
        'media',
        'company',
        'services',
        'search',
        'solutions',
        'industries',
        'projects',
        'insights',
        'contact',
        'careers',
        'newsletter',
        'request-quote',
        'design-system',
        'health',
        'en',
        'tr',
        'ar',
      ].includes(v.split('/')[1]!),
    'This path belongs to an existing application section',
  );
const meta = z
  .object({
    title: text(200).trim().min(1),
    seoTitle: text(200),
    seoDescription: text(320),
    ogImage: z.union([z.literal(''), builderMediaSchema.shape.src]),
  })
  .strict();
export const pageDocumentSchema = z
  .object({
    schemaVersion: z.literal(1),
    path: builderPathSchema,
    translations: localized(meta),
    sections: z.array(builderSectionSchema).max(80),
  })
  .strict()
  .superRefine((v, c) => {
    if (!builderLocales.some((l) => v.translations[l]))
      c.addIssue({
        code: 'custom',
        path: ['translations'],
        message: 'Enable at least one language',
      });
    if (new Set(v.sections.map((s) => s.id)).size !== v.sections.length)
      c.addIssue({ code: 'custom', path: ['sections'], message: 'Section IDs must be unique' });
    if (new Set(v.sections.map((s) => s.order)).size !== v.sections.length)
      c.addIssue({ code: 'custom', path: ['sections'], message: 'Section orders must be unique' });
    if (new TextEncoder().encode(JSON.stringify(v)).length > 90 * 1024)
      c.addIssue({
        code: 'custom',
        path: ['sections'],
        message: 'Page content exceeds 90 KB; split it into smaller pages',
      });
  });
export type PageDocument = z.infer<typeof pageDocumentSchema>;
/** Preserve display order while giving editor operations consecutive positions. */
export function normalizeSectionOrder(document: PageDocument): PageDocument {
  return {
    ...document,
    sections: [...document.sections]
      .sort((a, b) => a.order - b.order)
      .map((section, order) => ({ ...section, order })),
  };
}
export const pageWriteSchema = z
  .object({
    document: pageDocumentSchema,
    version: z.number().int().min(0),
    action: z.enum(['save', 'publish']),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.action !== 'publish') return;
    for (const locale of builderLocales) {
      const m = v.document.translations[locale];
      if (!m) continue;
      if (!m.seoDescription.trim())
        c.addIssue({
          code: 'custom',
          path: ['document', 'translations', locale, 'seoDescription'],
          message: 'Add a description before publishing',
        });
      const visible = v.document.sections.filter((s) => s.visible && s.content[locale]);
      if (!visible.length)
        c.addIssue({
          code: 'custom',
          path: ['document', 'sections'],
          message: `Add a visible section in ${locale}`,
        });
      for (const s of visible) {
        const copy = s.content[locale]! as Record<string, unknown>;
        if (!String(copy.heading).trim())
          c.addIssue({
            code: 'custom',
            path: ['document', 'sections', s.order, 'content', locale, 'heading'],
            message: 'Visible sections need a heading',
          });
        for (const key of ['items', 'ids', 'images', 'nodes'])
          if (key in copy && !(copy[key] as unknown[]).length)
            c.addIssue({
              code: 'custom',
              path: ['document', 'sections', s.order, 'content', locale, key],
              message: 'Add content before publishing',
            });
        const itemFields: Partial<Record<SectionType, string[]>> = {
          FeatureGrid: ['title', 'text'],
          Stats: ['value', 'label'],
          LogoGrid: ['name'],
          TeamGrid: ['name'],
          Testimonials: ['quote', 'author'],
          FAQ: ['question', 'answer'],
          Timeline: ['title', 'label'],
        };
        if (
          itemFields[s.type] &&
          (copy.items as Record<string, unknown>[]).some((item) =>
            itemFields[s.type]!.some((key) => !String(item[key] || '').trim()),
          )
        )
          c.addIssue({
            code: 'custom',
            path: ['document', 'sections', s.order],
            message: 'Complete the required item fields before publishing',
          });
        if (
          s.type === 'LogoGrid' &&
          (copy.items as { media: unknown }[]).some((item) => !item.media)
        )
          c.addIssue({
            code: 'custom',
            path: ['document', 'sections', s.order],
            message: 'Each logo needs an image',
          });
        if (
          s.type === 'RichText' &&
          (copy.nodes as z.infer<typeof richNodeSchema>[]).some((n) =>
            n.type === 'list'
              ? !n.items.length || n.items.some((item) => !item.trim())
              : n.type === 'link'
                ? !n.label.trim() || !n.href
                : !n.text.trim(),
          )
        )
          c.addIssue({
            code: 'custom',
            path: ['document', 'sections', s.order],
            message: 'Complete the rich text blocks before publishing',
          });
        if (s.type === 'Video' && !copy.videoId)
          c.addIssue({
            code: 'custom',
            path: ['document', 'sections', s.order],
            message: 'Video needs a provider ID',
          });
        if (s.type === 'ImageText' && !copy.media)
          c.addIssue({
            code: 'custom',
            path: ['document', 'sections', s.order],
            message: 'Image and text needs an image',
          });
        if (s.type === 'CTA') {
          const a = copy.action as { label: string; href: string };
          if (!a.label.trim() || !a.href)
            c.addIssue({
              code: 'custom',
              path: ['document', 'sections', s.order],
              message: 'CTA needs a label and destination',
            });
        }
        if (
          s.type === 'Newsletter' &&
          ['buttonLabel', 'consentLabel', 'successMessage'].some((k) => !String(copy[k]).trim())
        )
          c.addIssue({
            code: 'custom',
            path: ['document', 'sections', s.order],
            message: 'Newsletter needs a button, consent text, and success message',
          });
      }
    }
  });
export const pageStateSchema = z
  .object({
    version: z.number().int().min(1),
    action: z.enum(['unpublish', 'archive', 'restore']),
    confirmation: z.literal('CONFIRM'),
  })
  .strict();
export const pageQuerySchema = z
  .object({
    q: z.string().max(200).default(''),
    status: z.enum(['draft', 'published']).optional(),
    archived: z.enum(['true', 'false']).default('false'),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['path', 'updatedAt', 'createdAt']).default('updatedAt'),
    direction: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();
export function emptySectionCopy(type: SectionType): Record<string, unknown> {
  const base = { heading: '', text: '', media: null };
  switch (type) {
    case 'Hero':
      return { ...base, eyebrow: '', actions: [] };
    case 'RichText':
      return { ...base, nodes: [] };
    case 'ImageText':
      return { ...base, imageSide: 'START', action: { label: '', href: '' } };
    case 'ServiceGrid':
    case 'SolutionGrid':
    case 'IndustryGrid':
    case 'ProjectGrid':
      return { ...base, ids: [] };
    case 'FeatureGrid':
    case 'Stats':
    case 'LogoGrid':
    case 'TeamGrid':
    case 'Testimonials':
    case 'FAQ':
    case 'Timeline':
      return { ...base, items: [] };
    case 'CTA':
      return { ...base, action: { label: '', href: '' } };
    case 'ImageGallery':
      return { ...base, images: [] };
    case 'Video':
      return { ...base, provider: 'YOUTUBE', videoId: '', transcript: '' };
    case 'ContactBlock':
      return { ...base, email: '', phone: '', address: '', action: { label: '', href: '' } };
    case 'Newsletter':
      return { ...base, buttonLabel: '', consentLabel: '', successMessage: '' };
    case 'CustomHeading':
      return { ...base, level: 'h2', alignment: 'START' };
  }
}
export const gridKinds = {
  ServiceGrid: 'service',
  SolutionGrid: 'solution',
  IndustryGrid: 'industry',
  ProjectGrid: 'project',
} as const;
export type CatalogKind = (typeof gridKinds)[keyof typeof gridKinds];
export type BuilderCard = {
  id: string;
  title: string;
  text: string;
  href: string;
  image?: z.infer<typeof builderMediaSchema> | null;
};
export function pageCatalogReferences(document: PageDocument) {
  const refs = new Map<string, { kind: CatalogKind; id: string }>();
  for (const section of document.sections) {
    if (!(section.type in gridKinds)) continue;
    const kind = gridKinds[section.type as keyof typeof gridKinds];
    for (const locale of builderLocales) {
      const copy = section.content[locale] as { ids?: string[] } | undefined;
      for (const id of copy?.ids || []) refs.set(`${kind}:${id}`, { kind, id });
    }
  }
  return [...refs.values()];
}
