import type { Metadata } from 'next';
import { localeSchema } from '@tevoniq/validation';
import { insightLabels } from '@/content/insights';
export function insightsMetadata(
  raw: string,
  path: string,
  query: Record<string, string | string[] | undefined>,
): Metadata {
  const locale = localeSchema.parse(raw),
    labels = insightLabels[locale];
  const title =
    path === '/blog'
      ? labels.blog
      : path === '/resources'
        ? labels.resources
        : path === '/case-studies'
          ? labels.cases
          : labels.title;
  return {
    title: `${title} | TEVONIQ`,
    description: labels.intro,
    robots: {
      index: !Object.entries(query).some(
        ([key, value]) =>
          !key.startsWith('utm_') &&
          !['gclid', 'fbclid'].includes(key) &&
          value !== undefined &&
          value !== '' &&
          !(key === 'page' && value === '1'),
      ),
      follow: true,
    },
    alternates: {
      canonical: `/${locale}/insights${path}`,
      types: { 'application/rss+xml': `/insights/rss.xml?locale=${locale}` },
    },
    openGraph: {
      title: `${title} | TEVONIQ`,
      description: labels.intro,
      type: 'website',
      url: `/${locale}/insights${path}`,
    },
    twitter: { card: 'summary', title: `${title} | TEVONIQ`, description: labels.intro },
  };
}
