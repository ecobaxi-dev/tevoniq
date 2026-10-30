import { ShowcaseHero } from '@/components/showcase-pages';
import { ProjectShowcaseCard } from '@/components/showcase-cards';
import { showcaseCopy } from '@/content/showcase';
import { Heading } from '@tevoniq/ui';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container, ButtonLink } from '@tevoniq/ui';
import { localeSchema, projectQuerySchema } from '@tevoniq/validation';
import { getProjects, getProjectFilters } from '@/lib/projects';
import { projectLabels } from '@/content/projects';
import '../projects.css';
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
async function baseMetadata({ params }: Props): Promise<Metadata> {
  const parsed = localeSchema.safeParse((await params).locale);
  if (!parsed.success) notFound();
  const locale = parsed.data,
    l = projectLabels[locale];
  return {
    title: `${l.title} | TEVONIQ`,
    description: l.intro,
    alternates: {
      canonical: `/${locale}/projects`,
      languages: { en: '/en/projects', tr: '/tr/projects', ar: '/ar/projects' },
    },
  };
}
async function PublicPage({ params, searchParams }: Props) {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  const raw = await searchParams;
  const parsed = projectQuerySchema.safeParse({
    locale: locale.data,
    ...Object.fromEntries(
      ['q', 'page', 'industry', 'service', 'solution', 'featured']
        .filter((k) => raw[k])
        .map((k) => [k, raw[k]]),
    ),
  });
  if (!parsed.success) notFound();
  const query = parsed.data,
    l = projectLabels[locale.data];
  const [result, filters] = await Promise.all([
    getProjects(query).catch(() => null),
    getProjectFilters(locale.data).catch(() => null),
  ]);
  const href = (page: number) =>
    `/${locale.data}/projects?${new URLSearchParams(
      Object.entries({ ...query, page })
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    )}`;
  return (
    <main
      id="main-content"
      className={`projects-page${locale.data !== 'tr' ? ' showcase-modern' : ''}`}
    >
      {locale.data !== 'tr' ? (
        <ShowcaseHero
          locale={locale.data}
          kind="project"
          title={showcaseCopy[locale.data].projects}
          intro={showcaseCopy[locale.data].projectIntro}
        />
      ) : (
        <>
          <header className="projects-intro">
            <Container>
              <p className="tv-eyebrow">{l.eyebrow}</p>
              <Heading as="h1">{l.title}</Heading>
              <p className="tv-description">{l.intro}</p>
            </Container>
          </header>
        </>
      )}
      <section className="projects-catalog" id="showcase-content">
        <Container>
          <form method="get" className="project-filters">
            <label>
              {l.search}
              <input name="q" className="tv-input" defaultValue={query.q} maxLength={120} />
            </label>
            {(['industry', 'service', 'solution'] as const).map((key) => (
              <label key={key}>
                {key === 'solution' ? l.solutionFilter : l[key]}
                <select name={key} className="tv-input" defaultValue={query[key] ?? ''}>
                  <option value="">{l.all}</option>
                  {(
                    filters?.[
                      key === 'industry'
                        ? 'industries'
                        : key === 'service'
                          ? 'services'
                          : 'solutions'
                    ] ?? []
                  ).map((r) => (
                    <option key={r.id} value={r.slug}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {query.featured && <input type="hidden" name="featured" value={query.featured} />}
            <div className="project-filter-actions">
              <button type="submit" className="tv-button" data-variant="primary">
                {l.apply}
              </button>
              <a href={`/${locale.data}/projects`}>{l.clear}</a>
            </div>
          </form>
          {locale.data !== 'tr' && <h2 className="showcase-sr-only">{l.title}</h2>}
          {!result || !result.items.length ? (
            <div className="project-empty">
              <p role="status">{result ? l.empty : l.error}</p>
            </div>
          ) : (
            <div className="project-grid">
              {result.items.map((p, i) =>
                locale.data !== 'tr' ? (
                  <ProjectShowcaseCard
                    key={p.id}
                    locale={locale.data}
                    index={i}
                    item={{
                      id: p.id,
                      title: p.title,
                      description: p.summary,
                      slug: p.slug,
                      href: `/projects/${p.slug}`,
                      published: true,
                      featured: p.featured,
                      image: p.heroImage?.url,
                      imageAlt: p.heroImage?.alt,
                    }}
                  />
                ) : (
                  <article className="project-card" key={p.id}>
                    <div className="project-card-media">
                      {p.heroImage ? (
                        <Image
                          src={p.heroImage.url}
                          alt={p.heroImage.alt}
                          fill
                          unoptimized
                          sizes="(max-width:600px) 100vw,50vw"
                        />
                      ) : (
                        <div className="project-card-placeholder" aria-hidden="true">
                          <span>
                            {String((result.page - 1) * result.limit + i + 1).padStart(2, '0')}
                          </span>
                        </div>
                      )}
                      {p.featured && <span className="project-featured">{l.featured}</span>}
                    </div>
                    <div className="project-card-copy">
                      <p className="tv-eyebrow">{p.clientLabel ?? l.caseStudy}</p>
                      <Heading as="h2">{p.title}</Heading>
                      <p className="project-card-summary">{p.summary}</p>
                      {(p.country || p.city) && (
                        <p className="project-card-location">
                          {[p.city, p.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <a
                        href={`/${locale.data}/projects/${p.slug}`}
                        aria-label={`${l.view}: ${p.title}`}
                      >
                        {l.view}
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
          {result && result.total > result.limit && (
            <nav className="project-pagination" aria-label={l.title}>
              {result.page > 1 && (
                <ButtonLink href={href(result.page - 1)} variant="outline">
                  {l.previous}
                </ButtonLink>
              )}
              <span>
                {result.page} / {Math.ceil(result.total / result.limit)}
              </span>
              {result.page * result.limit < result.total && (
                <ButtonLink href={href(result.page + 1)} variant="outline">
                  {l.next}
                </ButtonLink>
              )}
            </nav>
          )}
        </Container>
      </section>
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/projects', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/projects'.replace('[slug]', Array.isArray(slug) ? slug.join('/') : String(slug));
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
