import { getSiteSettings } from '@/lib/site-settings';
import { organizationData } from '@/lib/seo-core';
import { getOrganization } from '@/lib/seo';
import { env } from '@/lib/env';
export { StructuredData } from './json-ld';
import { StructuredData } from './json-ld';
export async function SiteStructuredData() {
  const settings = await getOrganization().catch(() => null);
  const organization = settings ? organizationData(settings, env.SITE_URL) : null;
  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          ...(organization ? [organization] : []),
          {
            '@type': 'WebSite',
            '@id': new URL('/#website', env.SITE_URL).href,
            url: env.SITE_URL,
            name: settings?.companyName || 'TEVONIQ',
            inLanguage: (await getSiteSettings()).localization.enabledLanguages,
            ...(organization ? { publisher: { '@id': organization['@id'] } } : {}),
          },
        ],
      }}
    />
  );
}

export async function PageBreadcrumbs({ locale, path }: { locale: string; path: string }) {
  if (path === '/') return null;
  const { getSeoRoutes } = await import('@/lib/seo');
  const { breadcrumbData, localizedPath } = await import('@/lib/seo-core');
  const segments = path.split('/').filter(Boolean);
  const paths = ['/', ...segments.map((_, index) => '/' + segments.slice(0, index + 1).join('/'))];
  const items = (
    await Promise.all(
      paths.map(async (route) => {
        const result = await getSeoRoutes(route).catch(() => null);
        const record = result?.items.find((item) => item.locale === locale);
        return record ? { name: record.title, path: localizedPath(locale, route) } : null;
      }),
    )
  ).filter((item): item is { name: string; path: string } => item !== null);
  return items.length > 1 ? <StructuredData data={breadcrumbData(items, env.SITE_URL)} /> : null;
}
