import { Heading } from '@tevoniq/ui';
import { CatalogVisual } from '@/components/concept-visual';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeSchema, solutionQuerySchema } from '@tevoniq/validation';
import { Container, Section, Card, ButtonLink } from '@tevoniq/ui';
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Check,
  Layers3,
  Workflow,
  ShieldCheck,
  PanelsTopLeft,
} from 'lucide-react';
import { SolutionFinder } from '@/components/solution-finder';
import { conceptArt } from '@/config/concept-art';
import { solutionExperience, solutionTrack, catalogHref } from '@/content/solution-experience';
import { getSolutions } from '@/lib/solutions';
import { solutionLabels } from '@/content/solutions';
import '../solutions.css';
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
async function baseMetadata({ params }: Props): Promise<Metadata> {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  const labels = solutionLabels[locale.data];
  return {
    title: `${labels.title} | TEVONIQ`,
    description: solutionExperience[locale.data].intro,
    alternates: {
      canonical: `/${locale.data}/solutions`,
      languages: {
        en: '/en/solutions',
        tr: '/tr/solutions',
        ar: '/ar/solutions',
        'x-default': '/en/solutions',
      },
    },
    openGraph: {
      title: `${labels.title} | TEVONIQ`,
      description: solutionExperience[locale.data].intro,
      type: 'website',
      url: `/${locale.data}/solutions`,
      locale: { en: 'en_US', tr: 'tr_TR', ar: 'ar_AR' }[locale.data],
    },
  };
}
async function PublicPage({ params, searchParams }: Props) {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  const search = await searchParams;
  const query = solutionQuerySchema.safeParse({
    locale: locale.data,
    page: search.page ?? 1,
    q: search.q ?? '',
    ...(search.featured ? { featured: search.featured } : {}),
    ...(search.service ? { service: search.service } : {}),
  });
  if (!query.success) notFound();
  const labels = solutionLabels[locale.data];
  const copy = solutionExperience[locale.data];
  const filtered = Boolean(query.data.q || query.data.featured || query.data.service);
  const catalog = getSolutions(query.data);
  const [catalogResult, discoveryResult] = await Promise.allSettled([
    catalog,
    filtered || query.data.page !== 1
      ? getSolutions({ locale: locale.data, page: 1, q: '' })
      : catalog,
  ]);
  const result = catalogResult.status === 'fulfilled' ? catalogResult.value : undefined;
  const suggestions = discoveryResult.status === 'fulfilled' ? discoveryResult.value.items : [];
  const href = (page: number) => catalogHref(locale.data, query.data, query.data.featured, page);
  const icons = { workflow: Workflow, resilience: ShieldCheck, experience: PanelsTopLeft };
  return (
    <main id="main-content" className="solutions-page">
      <Section tone="navy" spacing="compact" className="solutions-hero solutions-catalog-hero">
        <Container>
          <div className="solutions-hero-layout">
            <div className="solutions-hero-copy">
              <p className="solutions-kicker">
                <span aria-hidden="true" />
                TEVONIQ / {labels.title}
              </p>
              <Heading as="h1" className="tv-h1">
                {copy.headline}
                <span>{copy.accent}</span>
              </Heading>
              <p className="solutions-hero-intro">{copy.intro}</p>
              <div className="solutions-hero-actions">
                <ButtonLink href="#solution-catalog">
                  {copy.browse}
                  <ArrowRight className="solutions-forward" size={18} aria-hidden="true" />
                </ButtonLink>
                <a href={`/${locale.data}/contact`}>
                  {copy.consult}
                  <ArrowUpRight className="solutions-arrow" size={18} aria-hidden="true" />
                </a>
              </div>
              <ul className="solutions-principles">
                {copy.principles.map((p) => (
                  <li key={p}>
                    <Check size={15} aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <SolutionFinder locale={locale.data} solutions={suggestions} />
          </div>
        </Container>
      </Section>
      <Section id="solution-catalog" spacing="compact" className="solutions-catalog">
        <Container>
          <div className="solutions-catalog-heading">
            <div>
              <p className="tv-eyebrow">{copy.catalogEyebrow}</p>
              <Heading as="h2" className="tv-h2">
                {copy.catalogTitle}
              </Heading>
            </div>
            <p>{copy.catalogBody}</p>
          </div>
          <div className="solutions-toolbar">
            <nav className="solutions-segments" aria-label={labels.filter}>
              <a
                href={catalogHref(locale.data, query.data, '', 1)}
                aria-current={!query.data.featured ? 'page' : undefined}
              >
                {copy.all}
              </a>
              <a
                href={catalogHref(locale.data, query.data, 'true', 1)}
                aria-current={query.data.featured === 'true' ? 'page' : undefined}
              >
                {copy.featured}
              </a>
            </nav>
            <form
              method="get"
              action={`/${locale.data}/solutions#solution-catalog`}
              className="solutions-search"
              role="search"
              aria-label={labels.search}
            >
              <Search size={18} aria-hidden="true" />
              <label htmlFor="solution-search" className="solutions-sr-only">
                {labels.search}
              </label>
              <input
                id="solution-search"
                name="q"
                type="search"
                maxLength={120}
                placeholder={copy.searchPlaceholder}
                defaultValue={query.data.q}
              />
              {query.data.featured && (
                <input type="hidden" name="featured" value={query.data.featured} />
              )}
              {query.data.service && (
                <input type="hidden" name="service" value={query.data.service} />
              )}
              <button type="submit" aria-label={labels.search}>
                <ArrowRight className="solutions-forward" size={19} aria-hidden="true" />
              </button>
            </form>
          </div>
          <div className="solutions-result-line">
            {result ? (
              <p role="status">
                {copy.results}
                <span>{new Intl.NumberFormat(locale.data).format(result.total)}</span>
              </p>
            ) : (
              <span />
            )}
            {filtered && <a href={`/${locale.data}/solutions#solution-catalog`}>{labels.clear}</a>}
          </div>
          {!result || !result.items.length ? (
            <div className="solution-empty">
              <Search size={32} aria-hidden="true" />
              <p role="status">
                {result ? (filtered ? copy.noMatches : labels.empty) : labels.error}
              </p>
              <ButtonLink href={`/${locale.data}/solutions#solution-catalog`} variant="outline">
                {result ? copy.all : copy.retry}
              </ButtonLink>
            </div>
          ) : (
            <div className="solutions-grid">
              {result.items.map((s, index) => {
                const track = solutionTrack(s.slug),
                  Icon = track ? icons[track] : Layers3;
                return (
                  <Card
                    key={s.id}
                    id={`solution-${s.slug}`}
                    className="solution-card"
                    data-featured={s.featured}
                  >
                    <div className="solution-card-media">
                      {conceptArt(s.slug) ? (
                        <CatalogVisual slug={s.slug} locale={locale.data} />
                      ) : (
                        <div className="solution-card-placeholder" aria-hidden="true">
                          <Icon size={54} strokeWidth={1.2} />
                        </div>
                      )}
                      {s.featured && (
                        <span className="solution-featured">{labels.featuredBadge}</span>
                      )}
                    </div>
                    <div className="solution-card-body">
                      <p className="solution-card-category">
                        <Icon size={17} aria-hidden="true" />
                        {track ? copy.tracks[track] : labels.title}
                        <span>
                          {String((result.page - 1) * result.limit + index + 1).padStart(2, '0')}
                        </span>
                      </p>
                      <Heading as="h3" className="tv-h3">
                        <a href={`/${locale.data}/solutions/${s.slug}`}>{s.name}</a>
                      </Heading>
                      <p className="solution-card-description">{s.shortDescription}</p>
                      <a
                        className="solution-card-action"
                        href={`/${locale.data}/solutions/${s.slug}`}
                        aria-label={`${labels.view}: ${s.name}`}
                      >
                        {labels.view}
                        <ArrowUpRight className="solutions-arrow" size={20} aria-hidden="true" />
                      </a>
                    </div>
                  </Card>
                );
              })}
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
      <Section className="solutions-approach" spacing="compact">
        <Container>
          <p className="tv-eyebrow">{copy.approachEyebrow}</p>
          <Heading as="h2" className="tv-h2">
            {copy.approachTitle}
          </Heading>
          <ol>
            {copy.steps.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true">0{index + 1}</span>
                <Heading as="h3">{step.title}</Heading>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      <Section className="solutions-consultation" spacing="compact">
        <Container>
          <div className="solutions-consultation-panel">
            <div>
              <p className="tv-eyebrow">TEVONIQ</p>
              <Heading as="h2" className="tv-h2">
                {copy.ctaTitle}
              </Heading>
              <p>{copy.ctaBody}</p>
            </div>
            <div className="solutions-consultation-actions">
              <ButtonLink href={`/${locale.data}/request-quote`}>
                {copy.ctaAction}
                <ArrowUpRight className="solutions-arrow" size={18} aria-hidden="true" />
              </ButtonLink>
              <a href={`/${locale.data}/services`}>
                {copy.services}
                <ArrowRight className="solutions-forward" size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/solutions', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/solutions'.replace('[slug]', Array.isArray(slug) ? slug.join('/') : String(slug));
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
