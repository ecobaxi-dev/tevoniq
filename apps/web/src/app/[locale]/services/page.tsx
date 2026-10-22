import { CatalogVisual } from '@/components/concept-visual';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { localeSchema, serviceQuerySchema } from '@tevoniq/validation';
import { Container, Section, Card, ButtonLink } from '@tevoniq/ui';
import { getServices } from '@/lib/services';
import { serviceLabels } from '@/content/services';
import './services.css';
async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  const query = await searchParams;
  const parsed = serviceQuerySchema.safeParse({
    locale: locale.data,
    page: query.page ?? 1,
    q: query.q ?? '',
  });
  if (!parsed.success) notFound();
  const labels = serviceLabels[locale.data];
  let result;
  try {
    result = await getServices(locale.data, parsed.data.page, parsed.data.q);
  } catch {
    /* Show a localized unavailable state, never a mock catalog. */
  }
  const pageHref = (page: number) =>
    `/${locale.data}/services?${new URLSearchParams({ page: String(page), q: parsed.data.q })}`;
  return (
    <main id="main-content" className="services-page">
      <Section tone="navy" spacing="generous">
        <Container>
          <h1 className="tv-h1">{labels.title}</h1>
          <p className="tv-description">{labels.intro}</p>
        </Container>
      </Section>
      <Section spacing="generous">
        <Container>
          <form className="services-search" method="get">
            <label htmlFor="services-search">{labels.search}</label>
            <div>
              <input
                id="services-search"
                className="tv-input"
                name="q"
                maxLength={120}
                defaultValue={parsed.data.q}
              />
              <button className="tv-button" data-variant="primary" type="submit">
                {labels.search}
              </button>
            </div>
          </form>
          {!result ? (
            <p role="status">{labels.error}</p>
          ) : result.items.length === 0 ? (
            <p role="status">{labels.empty}</p>
          ) : (
            <div className="services-grid">
              {result.items.map((item) => (
                <Card key={item.id}>
                  <CatalogVisual slug={item.slug} locale={locale.data} />
                  <h2 className="tv-h3">
                    <a href={`/${locale.data}/services/${item.slug}`}>{item.title}</a>
                  </h2>
                  <p className="tv-description">{item.summary}</p>
                </Card>
              ))}
            </div>
          )}
          {result && result.total > result.limit && (
            <nav className="services-pagination" aria-label={labels.title}>
              {result.page > 1 && (
                <ButtonLink variant="outline" href={pageHref(result.page - 1)}>
                  {labels.previous}
                </ButtonLink>
              )}
              <span>
                {result.page} / {Math.ceil(result.total / result.limit)}
              </span>
              {result.page * result.limit < result.total && (
                <ButtonLink variant="outline" href={pageHref(result.page + 1)}>
                  {labels.next}
                </ButtonLink>
              )}
            </nav>
          )}
        </Container>
      </Section>
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/services', {});
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/services'.replace('[slug]', Array.isArray(slug) ? slug.join('/') : String(slug));
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
