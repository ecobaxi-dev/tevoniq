import { VisualDiscovery } from '@/components/visual-discovery';
import { headers } from 'next/headers';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeSchema, serviceSlugSchema } from '@tevoniq/validation';
import { Container, Section, ButtonLink } from '@tevoniq/ui';
import { getSolution } from '@/lib/solutions';
import { SolutionBlocks } from '@/components/solution-blocks';
import { solutionLabels } from '@/content/solutions';
import { env } from '@/lib/env';
import '../solutions.css';
type Props = { params: Promise<{ locale: string; slug: string }> };
async function resolve(params: Props['params']) {
  const raw = await params,
    locale = localeSchema.safeParse(raw.locale),
    slug = serviceSlugSchema.safeParse(raw.slug);
  if (!locale.success || !slug.success) notFound();
  return { locale: locale.data, slug: slug.data };
}
async function baseMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await resolve(params);
  const solution = await getSolution(locale, slug).catch(() => null);
  if (!solution) return { robots: { index: false, follow: false } };
  return {
    title: solution.seoTitle,
    description: solution.seoDescription,
    alternates: {
      canonical: `/${locale}/solutions/${slug}`,
      languages: Object.fromEntries(
        solution.availableLocales.map((l) => [l, `/${l}/solutions/${slug}`]),
      ),
    },
    openGraph: {
      title: solution.seoTitle,
      description: solution.seoDescription,
      type: 'website',
      url: `/${locale}/solutions/${slug}`,
      locale: { en: 'en_US', tr: 'tr_TR', ar: 'ar_AR' }[locale],
      alternateLocale: solution.availableLocales
        .filter((l) => l !== locale)
        .map((l) => ({ en: 'en_US', tr: 'tr_TR', ar: 'ar_AR' })[l]),
    },
  };
}
async function PublicPage({ params }: Props) {
  const { locale, slug } = await resolve(params),
    labels = solutionLabels[locale];
  let solution;
  try {
    solution = await getSolution(locale, slug);
  } catch {
    return (
      <main id="main-content">
        <Section>
          <Container>
            <h1 className="tv-h1">{labels.title}</h1>
            <p role="status">{labels.error}</p>
            <ButtonLink href={`/${locale}/solutions`}>{labels.all}</ButtonLink>
          </Container>
        </Section>
      </main>
    );
  }
  if (!solution) notFound();
  const crumbs = [
    { name: labels.home, path: `/${locale}` },
    { name: labels.title, path: `/${locale}/solutions` },
    { name: solution.name, path: `/${locale}/solutions/${slug}` },
  ];
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: new URL(c.path, env.SITE_URL).href,
    })),
  };
  return (
    <main id="main-content" className="solutions-page">
      <Container>
        <nav aria-label={labels.all}>
          <ol className="solution-breadcrumb">
            {crumbs.map((c, i) => (
              <li key={c.path}>
                {i === 2 ? (
                  <span aria-current="page">{c.name}</span>
                ) : (
                  <a href={c.path}>{c.name}</a>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </Container>
      <SolutionBlocks solution={solution} />
      <VisualDiscovery locale={locale} services={solution.services} />
      <script
        nonce={(await headers()).get('x-nonce') || undefined}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }}
      />
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/solutions/[slug]', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/solutions/[slug]'.replace(
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
