import { getSiteSettings } from '@/lib/site-settings';
import type { MetadataRoute } from 'next';
import { getAllSeoRoutes } from '@/lib/seo';
import { absoluteUrl, localizedPath, indexableRoute, routeLanguages } from '@/lib/seo-core';
import { env } from '@/lib/env';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [routes, settings] = await Promise.all([getAllSeoRoutes(), getSiteSettings()]);
  return routes
    .filter((route) => indexableRoute(route, env.SITE_URL))
    .map((route) => ({
      url: absoluteUrl(localizedPath(route.locale, route.route), env.SITE_URL),
      ...(route.updatedAt ? { lastModified: new Date(route.updatedAt) } : {}),
      alternates: {
        languages: routeLanguages(route, env.SITE_URL, settings.localization.defaultLanguage),
      },
    }));
}
