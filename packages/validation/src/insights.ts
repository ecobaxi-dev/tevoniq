import { z } from 'zod';

export const insightSlugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const insightLanguageSchema = z.enum(['en', 'tr', 'ar']);
export const insightStatusSchema = z.enum(['draft', 'scheduled', 'published', 'archived']);
export const insightKindSchema = z.enum(['blog', 'resource', 'case-study']);
const text = z.string().trim().max(12000);
const url = z
  .string()
  .max(2048)
  .url()
  .refine(
    (v) => URL.canParse(v) && ['https:', 'http:'].includes(new URL(v).protocol),
    'Use an HTTP(S) URL',
  );
const optionalUrl = z.union([z.literal(''), url]);
export const articleBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text }).strict(),
  z
    .object({ type: z.literal('heading'), text, level: z.union([z.literal(2), z.literal(3)]) })
    .strict(),
  z
    .object({ type: z.literal('list'), items: z.array(text.min(1)).max(100), ordered: z.boolean() })
    .strict(),
  z.object({ type: z.literal('quote'), text, attribution: z.string().max(200) }).strict(),
  z.object({ type: z.literal('code'), code: text, language: z.string().max(40) }).strict(),
  z
    .object({
      type: z.literal('image'),
      url,
      alt: z.string().trim().min(1).max(300),
      caption: z.string().max(500),
    })
    .strict(),
  z.object({ type: z.literal('link'), text: text.min(1), url }).strict(),
]);
export const taxonomyWriteSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    slug: insightSlugSchema,
    language: insightLanguageSchema,
    type: z.enum(['category', 'tag']),
    version: z.number().int().min(0),
  })
  .strict();
export const taxonomySchema = taxonomyWriteSchema.extend({ id: z.string().uuid() });
export const articleWriteSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    slug: insightSlugSchema,
    excerpt: z.string().trim().max(1000),
    content: z.array(articleBlockSchema).max(150),
    coverImage: optionalUrl,
    coverImageAlt: z.string().trim().max(300),
    author: z.string().trim().max(160),
    categoryId: z.string().uuid().nullable(),
    tagIds: z
      .array(z.string().uuid())
      .max(30)
      .refine((v) => new Set(v).size === v.length, 'Duplicate tags'),
    publicationDate: z.iso.datetime({ offset: true }).nullable(),
    readingTime: z.number().int().min(1).max(1000),
    featured: z.boolean(),
    status: insightStatusSchema,
    language: insightLanguageSchema,
    kind: insightKindSchema,
    seoTitle: z.string().trim().max(200),
    seoDescription: z.string().trim().max(320),
    ogImage: optionalUrl,
    canonicalUrl: optionalUrl,
    version: z.number().int().min(0),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.coverImage && !value.coverImageAlt)
      ctx.addIssue({
        code: 'custom',
        path: ['coverImageAlt'],
        message: 'Describe the cover image',
      });
    if (['published', 'scheduled'].includes(value.status)) {
      for (const key of [
        'excerpt',
        'author',
        'seoTitle',
        'seoDescription',
        'publicationDate',
        'categoryId',
      ] as const) {
        if (!value[key])
          ctx.addIssue({ code: 'custom', path: [key], message: 'Required for publication' });
      }
      if (
        !value.content.length ||
        value.content.some((block) =>
          'text' in block
            ? !block.text
            : block.type === 'list'
              ? !block.items.length
              : block.type === 'code'
                ? !block.code
                : false,
        )
      )
        ctx.addIssue({
          code: 'custom',
          path: ['content'],
          message: 'Publication requires nonempty article blocks',
        });
    }
  });
export const publicArticleSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: insightSlugSchema,
  excerpt: z.string(),
  content: z.array(articleBlockSchema),
  coverImage: optionalUrl,
  coverImageAlt: z.string(),
  author: z.string(),
  category: taxonomySchema.nullable(),
  tags: z.array(taxonomySchema),
  publicationDate: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  readingTime: z.number(),
  featured: z.boolean(),
  language: insightLanguageSchema,
  kind: insightKindSchema,
  seoTitle: z.string(),
  seoDescription: z.string(),
  ogImage: optionalUrl,
  canonicalUrl: optionalUrl,
});
export const insightQuerySchema = z
  .object({
    locale: insightLanguageSchema.default('en'),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    q: z.string().trim().max(200).default(''),
    kind: insightKindSchema.optional(),
    category: insightSlugSchema.optional(),
    tag: insightSlugSchema.optional(),
    featured: z.enum(['true', 'false']).optional(),
  })
  .strict();
export const articleListSchema = z.object({
  items: z.array(publicArticleSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});
export type ArticleBlock = z.infer<typeof articleBlockSchema>;
export type ArticleWrite = z.infer<typeof articleWriteSchema>;
export type PublicArticle = z.infer<typeof publicArticleSchema>;
export type InsightTaxonomy = z.infer<typeof taxonomySchema>;
export function estimateReadingTime(content: ArticleBlock[]) {
  const words = content
    .map((b) =>
      'text' in b
        ? b.text
        : b.type === 'list'
          ? b.items.join(' ')
          : b.type === 'code'
            ? b.code
            : b.caption,
    )
    .join(' ')
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
