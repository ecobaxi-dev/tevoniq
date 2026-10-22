import {
  pageDocumentSchema,
  builderLocales,
  gridKinds,
  type PageDocument,
  type BuilderLocale,
  type BuilderCard,
  type CatalogKind,
} from '@tevoniq/validation';
import type { Prisma } from '../generated/prisma/client.js';
import { projectCard } from '../projects/project-public.js';
export async function catalogCards(
  db: Prisma.TransactionClient,
  kind: CatalogKind,
  locale: BuilderLocale,
  ids?: string[],
  q = '',
): Promise<BuilderCard[]> {
  const where = {
    deletedAt: null,
    ...(ids ? { id: { in: ids } } : {}),
    ...(q ? { slug: { contains: q, mode: 'insensitive' as const } } : {}),
  };
  if (kind === 'service') {
    const rows = await db.service.findMany({
      where: { ...where, active: true, translations: { some: { locale, published: true } } },
      include: { translations: { where: { locale, published: true } } },
      take: 100,
      orderBy: { slug: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.translations[0]!.title,
      text: r.translations[0]!.summary,
      href: `/${locale}/services/${r.slug}`,
    }));
  }
  if (kind === 'solution') {
    const rows = await db.solution.findMany({
      where: {
        ...where,
        active: true,
        published: true,
        status: 'PUBLISHED',
        translations: { some: { locale, published: true } },
      },
      include: { translations: { where: { locale, published: true } } },
      take: 100,
      orderBy: { slug: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.translations[0]!.name,
      text: r.translations[0]!.shortDescription,
      href: `/${locale}/solutions/${r.slug}`,
    }));
  }
  if (kind === 'industry') {
    const rows = await db.industry.findMany({
      where: {
        ...where,
        active: true,
        published: true,
        status: 'PUBLISHED',
        translations: { some: { locale, published: true } },
      },
      include: { translations: { where: { locale, published: true } } },
      take: 100,
      orderBy: { slug: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.translations[0]!.name,
      text: r.translations[0]!.shortDescription,
      href: `/${locale}/industries/${r.slug}`,
    }));
  }
  const rows = await db.project.findMany({
    where: {
      ...where,
      published: true,
      verified: true,
      translations: { some: { locale, published: true } },
    },
    include: { translations: true },
    take: 100,
    orderBy: { slug: 'asc' },
  });
  return rows.flatMap((r) => {
    const p = projectCard(r, locale);
    return p
      ? [{ id: p.id, title: p.title, text: p.summary, href: `/${locale}/projects/${p.slug}` }]
      : [];
  });
}
export async function resolvePage(
  db: Prisma.TransactionClient,
  document: PageDocument,
  locale: BuilderLocale,
) {
  const sections = document.sections
    .filter((s) => s.visible && s.content[locale])
    .sort((a, b) => a.order - b.order)
    .map((s) => ({ ...s, content: { [locale]: s.content[locale] } }));
  const cards: Record<string, BuilderCard[]> = {};
  for (const s of sections) {
    if (!(s.type in gridKinds)) continue;
    const ids = (s.content[locale] as { ids: string[] }).ids;
    const found = await catalogCards(db, gridKinds[s.type as keyof typeof gridKinds], locale, ids);
    cards[s.id] = ids.flatMap((id) => found.filter((c) => c.id === id));
  }
  return {
    document: {
      ...document,
      translations: { [locale]: document.translations[locale] },
      sections,
    } as PageDocument,
    cards,
  };
}
export function publishedDocument(raw: unknown) {
  const parsed = pageDocumentSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
export function pageSummary(row: {
  id: string;
  path: string;
  draft: Prisma.JsonValue;
  published: Prisma.JsonValue | null;
  publishedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById: string;
  deletedAt: Date | null;
}) {
  const draft = publishedDocument(row.draft);
  return {
    id: row.id,
    path: row.path,
    title: draft
      ? builderLocales.map((l) => draft.translations[l]?.title).find(Boolean) || row.path
      : row.path,
    status: row.publishedAt ? 'published' : 'draft',
    hasChanges: JSON.stringify(row.draft) !== JSON.stringify(row.published),
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdById: row.createdById,
    updatedById: row.updatedById,
    deletedAt: row.deletedAt,
  };
}
