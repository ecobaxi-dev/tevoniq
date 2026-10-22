import { containsClientIdentity, projectTranslationSchema } from '@tevoniq/validation';
import type { Prisma, Locale } from '../generated/prisma/client.js';

type Row = Prisma.ProjectGetPayload<{ include: { translations: true } }>;
export function projectContent(row: Row, locale: Locale, preview = false) {
  if (!preview && (!row.published || !row.verified)) return null;
  const t = row.translations.find((t) => t.locale === locale && (preview || t.published));
  if (!t) return null;
  const parsed = projectTranslationSchema.safeParse({
    locale: t.locale,
    title: t.title,
    summary: t.summary,
    published: t.published,
    anonymousClientName: t.anonymousClientName,
    heroImage: t.heroImage,
    gallery: t.gallery,
    challenge: t.challenge,
    approach: t.approach,
    solution: t.solution,
    implementation: t.implementation,
    technologies: t.technologies,
    results: t.results,
    testimonial: t.testimonial,
    testimonialAuthor: t.testimonialAuthor,
    seoTitle: t.seoTitle,
    seoDescription: t.seoDescription,
  });
  if (!parsed.success) return null;
  const copy = parsed.data;
  const clientLabel =
    row.clientVisibility === 'PUBLIC'
      ? row.clientName || null
      : row.clientVisibility === 'ANONYMOUS'
        ? copy.anonymousClientName || null
        : null;
  if (row.clientVisibility !== 'PRIVATE' && !clientLabel) return null;
  // This allowlist is the sole public projection. Never serialize a database row.
  const output = {
    id: row.id,
    slug: row.slug,
    title: copy.title,
    summary: copy.summary,
    clientLabel,
    country: row.country,
    city: row.city,
    projectDate: row.projectDate?.toISOString().slice(0, 10) ?? null,
    featured: row.featured,
    heroImage: copy.heroImage,
    gallery: copy.gallery,
    challenge: copy.challenge,
    approach: copy.approach,
    solution: copy.solution,
    implementation: copy.implementation,
    technologies: copy.technologies,
    results: copy.results,
    testimonial: copy.testimonial,
    testimonialAttribution:
      row.clientVisibility === 'PUBLIC' ? copy.testimonialAuthor || clientLabel : clientLabel,
    seoTitle: copy.seoTitle,
    seoDescription: copy.seoDescription,
  };
  // Fail closed for legacy records or direct database edits that bypass write validation.
  if (row.clientVisibility !== 'PUBLIC' && containsClientIdentity(output, row.clientName))
    return null;
  return output;
}
export function projectCard(row: Row, locale: Locale) {
  const p = projectContent(row, locale);
  if (!p) return null;
  const { id, slug, title, summary, clientLabel, country, city, projectDate, featured, heroImage } =
    p;
  return { id, slug, title, summary, clientLabel, country, city, projectDate, featured, heroImage };
}
export function safeProjectReferences(rows: Row[], locale: Locale) {
  return rows.flatMap((row) => {
    const p = projectCard(row, locale);
    return p ? [{ id: p.id, slug: p.slug, title: p.title, summary: p.summary }] : [];
  });
}
