import { getSiteSettings } from './site-settings';
import 'server-only';
import { cache } from 'react';
import type { Metadata } from 'next';
import { organizationSettingsSchema, seoRoutesResponseSchema } from '@tevoniq/validation';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
import { buildSeoMetadata } from './seo-core';
import { isRetiredPublicPath } from '@tevoniq/types';
import { notFound } from 'next/navigation';
async function request(path: string) {
  const response = await fetchPublicContent(env.API_URL + '/seo/' + path, {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('SEO data unavailable');
  return response.json();
}
export const getOrganization = cache(async () =>
  organizationSettingsSchema.parse(await request('organization')),
);
export const getSeoRoutes = cache(async (path?: string, page = 0) =>
  seoRoutesResponseSchema.parse(
    await request('routes?' + new URLSearchParams(path ? { path } : { page: String(page) })),
  ),
);
export async function pageMetadata(
  locale: string,
  path: string,
  base: Metadata = {},
  forceNoindex = false,
): Promise<Metadata> {
  const [organization, routes, settings] = await Promise.all([
    getOrganization().catch(() => organizationSettingsSchema.parse({})),
    getSeoRoutes(path).catch(() => null),
    getSiteSettings(),
  ]);
  return buildSeoMetadata(
    env.SITE_URL,
    locale,
    path,
    base,
    organization,
    routes?.items.find((r) => r.locale === locale),
    forceNoindex,
    settings,
  );
}
export async function routeMetadata(
  props: {
    params: Promise<{ locale: string; slug?: string | string[] }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  },
  pattern: string,
  base: Metadata = {},
) {
  const { locale, slug } = await props.params;
  const path = pattern.replace('[slug]', Array.isArray(slug) ? slug.join('/') : slug || '');
  if (isRetiredPublicPath(path)) notFound();
  const query = props.searchParams ? await props.searchParams : {};
  const meaningfulQuery = Object.entries(query).some(
    ([key, value]) =>
      !key.startsWith('utm_') &&
      !['gclid', 'fbclid'].includes(key) &&
      value !== undefined &&
      value !== '' &&
      !(key === 'page' && value === '1'),
  );
  return pageMetadata(locale, path, base, meaningfulQuery || path === '/search');
}

export async function getAllSeoRoutes() {
  const first = await getSeoRoutes();
  const settings = await getSiteSettings();
  const items = [...first.items];
  for (let page = 1; page * 1000 < first.total; page++)
    items.push(...(await getSeoRoutes(undefined, page)).items);
  return [...new Map(items.map((item) => [item.locale + ':' + item.route, item])).values()]
    .filter((item) => settings.localization.enabledLanguages.includes(item.locale))
    .map((item) => ({
      ...item,
      translations: item.translations.filter((t) =>
        settings.localization.enabledLanguages.includes(t.locale),
      ),
    }));
}
