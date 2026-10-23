import { Heading } from '@tevoniq/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Section } from '@tevoniq/ui';
import { insightQuerySchema, localeSchema } from '@tevoniq/validation';
import { getInsights, getInsightTaxonomies } from '@/lib/insights';
import { insightLabels } from '@/content/insights';
import { InsightCards } from './insight-cards';
export type InsightCatalogProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function InsightsCatalog({
  params,
  searchParams,
  kind,
}: InsightCatalogProps & { kind?: 'blog' | 'resource' | 'case-study' }) {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  const labels = insightLabels[locale.data],
    raw = await searchParams;
  const parsed = insightQuerySchema.safeParse({
    locale: locale.data,
    ...(kind ? { kind } : {}),
    ...Object.fromEntries(
      ['q', 'page', 'category', 'tag', 'featured']
        .filter((k) => raw[k] !== undefined && raw[k] !== '')
        .map((k) => [k, raw[k]]),
    ),
  });
  if (!parsed.success) notFound();
  const query = Object.fromEntries(Object.entries(parsed.data).map(([k, v]) => [k, String(v)]));
  const title =
    kind === 'blog'
      ? labels.blog
      : kind === 'resource'
        ? labels.resources
        : kind === 'case-study'
          ? labels.cases
          : labels.title;
  let result;
  try {
    result = await Promise.all([getInsights(query), getInsightTaxonomies(locale.data)]);
  } catch {
    return (
      <main id="main-content">
        <Section>
          <Container>
            <Heading as="h1" className="tv-h1">
              {title}
            </Heading>
            <p role="status">{labels.error}</p>
          </Container>
        </Section>
      </main>
    );
  }
  const [catalog, taxonomy] = result;
  const pageLink = (page: number) => {
    const q = new URLSearchParams(query);
    q.delete('locale');
    q.delete('kind');
    q.delete('limit');
    q.set('page', String(page));
    return `?${q}`;
  };
  return (
    <main id="main-content" className="insights-page">
      <Section className="insights-hero">
        <Container>
          <p className="insight-kicker">TEVONIQ / {labels.title}</p>
          <Heading as="h1" className="tv-h1">
            {title}
          </Heading>
          <p className="insights-intro">{labels.intro}</p>
          <nav className="insight-nav" aria-label={labels.title}>
            {[
              ['', labels.all],
              ['/blog', labels.blog],
              ['/resources', labels.resources],
              ['/case-studies', labels.cases],
            ].map(([path, name]) => (
              <Link key={path} href={`/${locale.data}/insights${path}`}>
                {name}
              </Link>
            ))}
            <a href={`/insights/rss.xml?locale=${locale.data}`}>{labels.rss}</a>
          </nav>
        </Container>
      </Section>
      <Section>
        <Container>
          <form className="insight-filters" method="get">
            <label>
              {labels.search}
              <input name="q" type="search" defaultValue={parsed.data.q} maxLength={200} />
            </label>
            {(['category', 'tag'] as const).map((type) => (
              <label key={type}>
                {labels[type]}
                <select name={type} defaultValue={parsed.data[type] || ''}>
                  <option value="">{labels.any}</option>
                  {taxonomy
                    .filter((t) => t.type === type)
                    .map((t) => (
                      <option key={t.id} value={t.slug}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </label>
            ))}
            <label>
              {labels.featured}
              <select name="featured" defaultValue={parsed.data.featured || ''}>
                <option value="">{labels.any}</option>
                <option value="true">{labels.featured}</option>
              </select>
            </label>
            <button type="submit">{labels.apply}</button>
          </form>
          {catalog.items.length ? (
            <InsightCards articles={catalog.items} locale={locale.data} />
          ) : (
            <p role="status">{labels.empty}</p>
          )}
          <nav
            className="insight-pagination"
            aria-label={
              { en: 'Article pagination', tr: 'Yazı sayfaları', ar: 'صفحات المقالات' }[locale.data]
            }
          >
            {catalog.page > 1 && <Link href={pageLink(catalog.page - 1)}>{labels.previous}</Link>}
            <span>
              {catalog.page} / {Math.max(1, Math.ceil(catalog.total / catalog.limit))}
            </span>
            {catalog.page * catalog.limit < catalog.total && (
              <Link href={pageLink(catalog.page + 1)}>{labels.next}</Link>
            )}
          </nav>
        </Container>
      </Section>
    </main>
  );
}
