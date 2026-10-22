import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeSchema, industryQuerySchema } from '@tevoniq/validation';
import { Container, Section, Card, Badge, ButtonLink } from '@tevoniq/ui';
import { getIndustries } from '@/lib/industries';
import { industryLabels } from '@/content/industries';
import '../industries.css';
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
async function baseMetadata({ params }: Props): Promise<Metadata> {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  const labels = industryLabels[locale.data];
  return {
    title: `${labels.title} | TEVONIQ`,
    description: labels.intro,
    alternates: {
      canonical: `/${locale.data}/industries`,
      languages: {
        en: '/en/industries',
        tr: '/tr/industries',
        ar: '/ar/industries',
        'x-default': '/en/industries',
      },
    },
    openGraph: {
      title: `${labels.title} | TEVONIQ`,
      description: labels.intro,
      type: 'website',
      url: `/${locale.data}/industries`,
      locale: { en: 'en_US', tr: 'tr_TR', ar: 'ar_AR' }[locale.data],
    },
  };
}
async function PublicPage({ params, searchParams }: Props) {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  const search = await searchParams;
  const query = industryQuerySchema.safeParse({
    locale: locale.data,
    page: search.page ?? 1,
    q: search.q ?? '',
    ...(search.featured ? { featured: search.featured } : {}),
    ...(search.service ? { service: search.service } : {}),
  });
  if (!query.success) notFound();
  const labels = industryLabels[locale.data];
  let result;
  try {
    result = await getIndustries(query.data);
  } catch {
    /* Localized unavailable state. */
  }
  const href = (page: number) =>
    `/${locale.data}/industries?${new URLSearchParams({ q: query.data.q, page: String(page), ...(query.data.featured ? { featured: query.data.featured } : {}), ...(query.data.service ? { service: query.data.service } : {}) })}`;
  return (
    <main id="main-content" className="industries-page">
      <Section tone="navy" spacing="generous" className="industries-hero">
        <Container>
          <p className="tv-eyebrow">{labels.eyebrow}</p>
          <h1 className="tv-h1">{labels.title}</h1>
          <p className="tv-description">{labels.intro}</p>
        </Container>
      </Section>
      <Section spacing="generous">
        <Container>
          <form method="get" className="industries-filters">
            <label>
              {labels.search}
              <input className="tv-input" name="q" maxLength={120} defaultValue={query.data.q} />
            </label>
            <label>
              {labels.filter}
              <select className="tv-input" name="featured" defaultValue={query.data.featured ?? ''}>
                <option value="">{labels.all}</option>
                <option value="true">{labels.featured}</option>
              </select>
            </label>
            {query.data.service && (
              <input type="hidden" name="service" value={query.data.service} />
            )}
            <button className="tv-button" data-variant="primary" type="submit">
              {labels.search}
            </button>
            <a href={`/${locale.data}/industries`}>{labels.clear}</a>
          </form>
          {!result || !result.items.length ? (
            <div className="industry-empty">
              <p role="status">{result ? labels.empty : labels.error}</p>
            </div>
          ) : (
            <div className="industries-grid">
              {result.items.map((s) => (
                <Card key={s.id} className="industry-card" data-featured={s.featured}>
                  {s.featured && <Badge>{labels.featuredBadge}</Badge>}
                  <h2 className="tv-h3">{s.name}</h2>
                  <p className="tv-description">{s.shortDescription}</p>
                  <a
                    href={`/${locale.data}/industries/${s.slug}`}
                    aria-label={`${labels.view}: ${s.name}`}
                  >
                    {labels.view} <span aria-hidden="true">{locale.data === 'ar' ? '←' : '→'}</span>
                  </a>
                </Card>
              ))}
            </div>
          )}
          {result && result.total > result.limit && (
            <nav className="services-pagination" aria-label={labels.title}>
              {result.page > 1 && (
                <ButtonLink href={href(result.page - 1)} variant="outline">
                  {labels.previous}
                </ButtonLink>
              )}
              <span>
                {result.page} / {Math.ceil(result.total / result.limit)}
              </span>
              {result.page * result.limit < result.total && (
                <ButtonLink href={href(result.page + 1)} variant="outline">
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
  return routeMetadata(props, '/industries', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/industries'.replace('[slug]', Array.isArray(slug) ? slug.join('/') : String(slug));
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
