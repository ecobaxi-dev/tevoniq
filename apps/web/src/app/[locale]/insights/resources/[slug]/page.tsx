import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import {
  renderInsightArticle,
  insightArticleMetadata,
  type InsightArticleProps,
} from '@/components/insight-article-page';
export async function generateMetadata(props: InsightArticleProps) {
  return routeMetadata(
    props,
    '/insights/resources/[slug]',
    await insightArticleMetadata(props, 'resource'),
  );
}
export default async function Page(props: InsightArticleProps) {
  const { locale, slug } = await props.params;
  return (
    <>
      <PageBreadcrumbs locale={locale} path={`/insights/resources/${slug}`} />
      {await renderInsightArticle(props, 'resource')}
    </>
  );
}
