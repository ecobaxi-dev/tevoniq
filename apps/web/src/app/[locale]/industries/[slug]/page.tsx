import { Heading } from '@tevoniq/ui';
import { headers } from 'next/headers';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeSchema, serviceSlugSchema } from '@tevoniq/validation';
import { Container, Section, ButtonLink } from '@tevoniq/ui';
import { getIndustry } from '@/lib/industries';
import { IndustryBlocks } from '@/components/industry-blocks';
import { industryLabels } from '@/content/industries';
import { env } from '@/lib/env';
import '../industries.css';
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
  const industry = await getIndustry(locale, slug).catch(() => null);
  if (!industry) return { robots: { index: false, follow: false } };
  return {
    title: industry.seoTitle,
    description: industry.seoDescription,
    alternates: {
      canonical: `/${locale}/industries/${slug}`,
      languages: Object.fromEntries(
        industry.availableLocales.map((l) => [l, `/${l}/industries/${slug}`]),
      ),
    },
    openGraph: {
      title: industry.seoTitle,
      description: industry.seoDescription,
      type: 'website',
      url: `/${locale}/industries/${slug}`,
      locale: { en: 'en_US', tr: 'tr_TR', ar: 'ar_AR' }[locale],
      alternateLocale: industry.availableLocales
        .filter((l) => l !== locale)
        .map((l) => ({ en: 'en_US', tr: 'tr_TR', ar: 'ar_AR' })[l]),
    },
  };
}
async function PublicPage({ params }: Props) {
  const { locale, slug } = await resolve(params),
    labels = industryLabels[locale];
  let industry;
  try {
    industry = await getIndustry(locale, slug);
  } catch {
    return (
      <main id="main-content">
        <Section>
          <Container>
            <Heading as="h1" className="tv-h1">
              {labels.title}
            </Heading>
            <p role="status">{labels.error}</p>
            <ButtonLink href={`/${locale}/industries`}>{labels.all}</ButtonLink>
          </Container>
        </Section>
      </main>
    );
  }
  if (!industry) notFound();
  const crumbs = [
    { name: labels.home, path: `/${locale}` },
    { name: labels.title, path: `/${locale}/industries` },
    { name: industry.name, path: `/${locale}/industries/${slug}` },
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
    <main id="main-content" className="industries-page">
      <Container>
        <nav aria-label={labels.all}>
          <ol className="industry-breadcrumb">
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
      <IndustryBlocks industry={industry} />
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
  return routeMetadata(props, '/industries/[slug]', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/industries/[slug]'.replace(
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
