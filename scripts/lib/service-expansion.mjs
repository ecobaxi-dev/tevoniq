import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { initialServiceNames, categorySlug } from '../../apps/api/prisma/service-catalog.ts';
import { serviceWriteSchema, serviceSlugSchema } from '../../packages/validation/dist/index.js';

const translation = z
  .object({ title: z.string().trim().min(1).max(160), summary: z.string().trim().min(20).max(320) })
  .strict();
const localized = (schema) => z.object({ en: schema, tr: schema, ar: schema }).strict();
export const expansionSchema = z
  .object({
    groups: z
      .array(
        z
          .object({
            id: serviceSlugSchema,
            labels: localized(z.string().min(1)),
            services: z
              .array(
                z
                  .object({ slug: serviceSlugSchema, translations: localized(translation) })
                  .strict(),
              )
              .min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
export async function loadExpansion() {
  const catalog = expansionSchema.parse(
    JSON.parse(
      await readFile(new URL('../../content/service-expansion.json', import.meta.url), 'utf8'),
    ),
  );
  const entries = catalog.groups.flatMap((group) => group.services);
  if (new Set(entries.map((entry) => entry.slug)).size !== entries.length)
    throw Error('Duplicate service slugs');
  if (new Set(catalog.groups.map((group) => group.id)).size !== catalog.groups.length)
    throw Error('Duplicate service groups');
  return catalog;
}
const copy = {
  en: {
    overview: 'How this service fits',
    capabilities: 'Explore connected services',
    cta: 'Plan your next step',
    body: 'Tell us about your goals, current systems and constraints so we can discuss an appropriate scope.',
    contact: 'Discuss this service',
  },
  tr: {
    overview: 'Bu hizmetin rolü',
    capabilities: 'Bağlantılı hizmetleri keşfedin',
    cta: 'Sonraki adımı planlayın',
    body: 'Uygun kapsamı görüşebilmemiz için hedeflerinizi, mevcut sistemlerinizi ve kısıtlarınızı paylaşın.',
    contact: 'Bu hizmeti görüşün',
  },
  ar: {
    overview: 'دور هذه الخدمة',
    capabilities: 'استكشف الخدمات المرتبطة',
    cta: 'خطّط لخطوتك التالية',
    body: 'شاركنا أهدافك وأنظمتك الحالية والقيود المهمة لنناقش النطاق المناسب لأعمالك.',
    contact: 'ناقش هذه الخدمة',
  },
};
const blockId = (slug, locale, type) => {
  const hex = createHash('sha256')
    .update(`service-expansion:${slug}:${locale}:${type}`)
    .digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
export function expansionPayload(entry, group, sortOrder, version = 0) {
  return serviceWriteSchema.parse({
    slug: entry.slug,
    active: true,
    sortOrder,
    version,
    translations: Object.entries(entry.translations).map(([locale, value]) => {
      const labels = copy[locale];
      const peers = group.services.filter((item) => item.slug !== entry.slug).slice(0, 8);
      return {
        locale,
        ...value,
        published: true,
        seoTitle: `${value.title} | TEVONIQ`,
        seoDescription: value.summary,
        blocks: [
          {
            id: blockId(entry.slug, locale, 'hero'),
            type: 'hero',
            title: value.title,
            description: value.summary,
            assetKey: 'none',
          },
          {
            id: blockId(entry.slug, locale, 'overview'),
            type: 'overview',
            title: labels.overview,
            body: value.summary,
          },
          ...(peers.length
            ? [
                {
                  id: blockId(entry.slug, locale, 'capabilities'),
                  type: 'capabilities',
                  title: labels.capabilities,
                  items: peers.map((item) => ({
                    title: item.translations[locale].title,
                    description: item.translations[locale].summary,
                  })),
                },
              ]
            : []),
          {
            id: blockId(entry.slug, locale, 'cta'),
            type: 'cta',
            title: labels.cta,
            body: labels.body,
            label: labels.contact,
            href: '/contact',
          },
        ],
      };
    }),
  });
}
/** Only enrich untouched seed records. Published, archived or edited entries remain authoritative. */
export function untouchedExpansionSeed(row) {
  return (
    !!row &&
    initialServiceNames.some(
      (name) => categorySlug(name) === row.slug && row.translations[0]?.title === name,
    ) &&
    !row.active &&
    !row.deletedAt &&
    row.version === 0 &&
    row.sortOrder === 0 &&
    !row.createdById &&
    !row.updatedById &&
    row.translations.length === 1 &&
    row.translations.every(
      (t) =>
        t.locale === 'en' &&
        !t.published &&
        !t.summary &&
        !t.seoTitle &&
        !t.seoDescription &&
        Array.isArray(t.blocks) &&
        t.blocks.length === 0,
    )
  );
}
