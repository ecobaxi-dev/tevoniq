import { getSiteSettings } from '@/lib/site-settings';
import type { MetadataRoute } from 'next';
import { getAllSeoRoutes } from '@/lib/seo';
import { absoluteUrl, localizedPath, indexableRoute, routeLanguages } from '@/lib/seo-core';
import { env } from '@/lib/env';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [routes, settings] = await Promise.all([getAllSeoRoutes(), getSiteSettings()]);
  const entries = routes
    .filter((route) => indexableRoute(route, env.SITE_URL))
    .map((route) => ({
      url: absoluteUrl(localizedPath(route.locale, route.route), env.SITE_URL),
      ...(route.updatedAt ? { lastModified: new Date(route.updatedAt) } : {}),
      alternates: {
        languages: routeLanguages(route, env.SITE_URL, settings.localization.defaultLanguage),
      },
    }));
  const existing = new Set(entries.map((entry) => entry.url));
  const languages: Record<string, string> = {};
  for (const locale of settings.localization.enabledLanguages)
    languages[locale] = absoluteUrl(`/${locale}/pesto`, env.SITE_URL);
  const defaultUrl = languages[settings.localization.defaultLanguage];
  if (defaultUrl) languages['x-default'] = defaultUrl;
  for (const locale of settings.localization.enabledLanguages) {
    const url = absoluteUrl(`/${locale}/pesto`, env.SITE_URL);
    // A CMS record, including its noindex/canonical policy, takes precedence.
    const managed = routes.some((route) => route.locale === locale && route.route === '/pesto');
    if (!existing.has(url) && !managed) entries.push({ url, alternates: { languages } });
  }
  return entries;
}
