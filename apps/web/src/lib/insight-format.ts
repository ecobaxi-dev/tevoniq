import type { OrganizationSettings, PublicArticle } from '@tevoniq/validation';
export function articlePath(
  article: Pick<PublicArticle, 'language' | 'slug'> & Partial<Pick<PublicArticle, 'kind'>>,
) {
  // CMS case studies keep their existing blog detail route; authored studies have a separate route.
  const section = article.language !== 'tr' && article.kind === 'resource' ? 'resources' : 'blog';
  return `/${article.language}/insights/${section}/${article.slug}`;
}
export function articleUrl(
  article: Pick<PublicArticle, 'language' | 'slug'> & Partial<Pick<PublicArticle, 'kind'>>,
  site: string,
) {
  return new URL(articlePath(article), site).href;
}
export function articleStructuredData(
  article: PublicArticle,
  site: string,
  organization?: OrganizationSettings,
) {
  const canonical = article.canonicalUrl || articleUrl(article, site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
    datePublished: article.publicationDate,
    dateModified: article.updatedAt,
    author: { '@type': 'Person', name: article.author },
    ...(organization?.companyName
      ? { publisher: { '@id': new URL('/#organization', site).href } }
      : {}),
    inLanguage: article.language,
    articleSection: article.category?.name,
    keywords: article.tags.map((t) => t.name).join(', '),
    ...(article.ogImage || article.coverImage
      ? { image: [article.ogImage || article.coverImage] }
      : {}),
  };
}
export const escapeXml = (value: string) =>
  value
    // XML 1.0 excludes these control characters from text content.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(
      /[<>&"']/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
    );
export function insightsRss(articles: PublicArticle[], site: string, locale: string) {
  const link = new URL(`/${locale}/insights`, site).href;
  const feed = new URL(`/rss.xml?locale=${locale}`, site).href;
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>TEVONIQ Insights</title><link>${escapeXml(link)}</link><description>TEVONIQ articles and resources</description><language>${locale}</language><atom:link href="${escapeXml(feed)}" rel="self" type="application/rss+xml"/>${articles.map((a) => `<item><title>${escapeXml(a.title)}</title><link>${escapeXml(articleUrl(a, site))}</link><guid isPermaLink="false">${escapeXml(a.id)}</guid><description>${escapeXml(a.excerpt)}</description><pubDate>${new Date(a.publicationDate).toUTCString()}</pubDate>${[...(a.category ? [a.category] : []), ...a.tags].map((t) => `<category>${escapeXml(t.name)}</category>`).join('')}</item>`).join('')}</channel></rss>`;
}
