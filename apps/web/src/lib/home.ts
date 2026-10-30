import 'server-only';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Locale } from '@tevoniq/types';
import { publicHomeSchema } from '@tevoniq/validation';
import { presentHomeContent } from '@/content/home-presentation';
import { selectHomeCollections } from '@/content/home-records';
import { getIndustries } from './industries';
import { getCompany } from './company';
import { getProjects } from './projects';
import { getInsights } from './insights';
import { articlePath } from './insight-format';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';

export const getHomeContent = cache(async (locale: Locale) => {
  const [home, industries, projects, insights, partnersPage] = await Promise.all([
    fetchPublicContent(`${env.API_URL}/home/${locale}`, { signal: AbortSignal.timeout(5000) }).then(
      async (response) => {
        if (!response.ok) throw new Error('Homepage unavailable');
        return publicHomeSchema.parse(await response.json());
      },
    ),
    getIndustries({ locale, page: 1, q: '' }).catch(() => null),
    getProjects({ locale, page: 1, q: '', limit: 3, featured: 'true' }).catch(() => null),
    getInsights({ locale, page: '1', limit: '3' }).catch(() => null),
    locale !== 'tr'
      ? getCompany(locale, 'partners').catch(() => undefined)
      : Promise.resolve(undefined),
  ]);
  // An explicitly unpublished homepage must never fall back to bootstrap copy.
  if (!home.content) notFound();
  const content = presentHomeContent(locale, home.content);
  return {
    partnersPageAvailable: locale === 'tr' || Boolean(partnersPage),
    copy: content.copy,
    hero: content.hero,
    collections: selectHomeCollections({
      industries: (industries?.items ?? []).map((item) => ({
        id: item.id,
        title: item.name,
        slug: item.slug,
        description: item.shortDescription,
        href: `/industries/${item.slug}`,
        published: true,
      })),
      projects: (projects?.items ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        image: item.heroImage?.url,
        imageAlt: item.heroImage?.alt,
        description: item.summary,
        href: `/projects/${item.slug}`,
        published: true,
        featured: item.featured,
      })),
      partners: (home?.partners ?? []).map((item) => ({
        ...item,
        href: '/company/partners',
        published: true,
        verified: true,
      })),
      insights: (insights?.items ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.excerpt,
        href: articlePath(item).replace(/^\/(en|ar|tr)/, ''),
        slug: item.slug,
        image: item.coverImage || undefined,
        imageAlt: item.coverImageAlt,
        kind: item.kind,
        readingTime: item.readingTime,
        published: true,
        publishedAt: item.publicationDate,
      })),
    }),
  };
});
