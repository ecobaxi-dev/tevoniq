import { getSiteSettings } from '@/lib/site-settings';
import type { MetadataRoute } from 'next';
import { getAllSeoRoutes } from '@/lib/seo';
import { absoluteUrl, localizedPath, indexableRoute, routeLanguages } from '@/lib/seo-core';
import { env } from '@/lib/env';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [routes, settings] = await Promise.all([getAllSeoRoutes(), getSiteSettings()]);
  const entries: MetadataRoute.Sitemap = routes
    .filter((route) => indexableRoute(route, env.SITE_URL))
    .map((route) => ({
      url: absoluteUrl(localizedPath(route.locale, route.route), env.SITE_URL),
      ...(route.updatedAt ? { lastModified: new Date(route.updatedAt) } : {}),
      alternates: {
        languages: routeLanguages(route, env.SITE_URL, settings.localization.defaultLanguage),
      },
    }));
  const languages = Object.fromEntries(
    ['en', 'ar']
      .filter((locale) => settings.localization.enabledLanguages.includes(locale as 'en' | 'ar'))
      .map((locale) => [locale, absoluteUrl(`/${locale}/advocas`, env.SITE_URL)]),
  );
  for (const url of Object.values(languages)) {
    if (!entries.some((entry) => entry.url === url))
      entries.push({ url, alternates: { languages } });
  }
  return entries;
}
