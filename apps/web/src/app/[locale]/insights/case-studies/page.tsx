import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import { InsightsCatalog, type InsightCatalogProps } from '@/components/insights-catalog';
import { insightsMetadata } from '@/lib/insights-metadata';
async function baseMetadata({ params, searchParams }: InsightCatalogProps) {
  return insightsMetadata((await params).locale, '/case-studies', await searchParams);
}
function PublicPage(props: InsightCatalogProps) {
  return <InsightsCatalog {...props} kind="case-study" />;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/insights/case-studies', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/insights/case-studies'.replace(
    '[slug]',
    Array.isArray(slug) ? slug.join('/') : String(slug),
  );
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
