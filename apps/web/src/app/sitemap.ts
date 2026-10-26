import { getSiteSettings } from '@/lib/site-settings';
import type { MetadataRoute } from 'next';
import { getAllSeoRoutes } from '@/lib/seo';
import { absoluteUrl, localizedPath, indexableRoute, routeLanguages } from '@/lib/seo-core';
import { aiCaseStudies } from '@/content/ai-case-studies';
import { automationCases } from '@/content/automation-cases';
import { workSystems } from '@/content/work-systems';
import { websiteDesigns } from '@/content/website-designs';
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
  const existing = new Set(entries.map((entry) => entry.url));
  for (const path of [
    '/pesto',
    '/advocas',
    '/website-designs',
    '/work-systems',
    '/automation-demos',
    ...automationCases.map((item) => `/automation-demos/${item.slug}`),
    ...workSystems.map((system) => `/work-systems/${system.slug}`),
    ...websiteDesigns.map((design) => `/website-designs/${design.slug}`),
    ...aiCaseStudies.map((study) => `/insights/case-studies/${study.slug}`),
  ]) {
    const locales = settings.localization.enabledLanguages.filter(
      (locale) =>
        (path !== '/advocas' &&
          !path.startsWith('/website-designs') &&
          !path.startsWith('/work-systems') &&
          !path.startsWith('/automation-demos')) ||
        locale === 'en' ||
        locale === 'ar',
    );
    const languages: Record<string, string> = {};
    for (const locale of locales)
      languages[locale] = absoluteUrl(`/${locale}${path}`, env.SITE_URL);
    const defaultUrl = languages[settings.localization.defaultLanguage] ?? languages.en;
    if (defaultUrl) languages['x-default'] = defaultUrl;
    for (const locale of locales) {
      const url = languages[locale]!;
      // Preserve CMS noindex and canonical policies instead of re-adding excluded routes.
      const managed = routes.some((route) => route.locale === locale && route.route === path);
      if (!existing.has(url) && !managed) {
        entries.push({ url, alternates: { languages } });
        existing.add(url);
      }
    }
  }
  return entries;
}
