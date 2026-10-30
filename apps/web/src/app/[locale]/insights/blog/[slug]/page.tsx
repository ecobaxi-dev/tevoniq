import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import {
  renderInsightArticle,
  insightArticleMetadata,
  type InsightArticleProps,
} from '@/components/insight-article-page';
export async function generateMetadata(props: InsightArticleProps) {
  return routeMetadata(props, '/insights/blog/[slug]', await insightArticleMetadata(props));
}
export default async function Page(props: InsightArticleProps) {
  const { locale, slug } = await props.params;
  return (
    <>
      <PageBreadcrumbs locale={locale} path={`/insights/blog/${slug}`} />
      {await renderInsightArticle(props)}
    </>
  );
}
