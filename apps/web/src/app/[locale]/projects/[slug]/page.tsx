import { Heading } from '@tevoniq/ui';
import { VisualDiscovery } from '@/components/visual-discovery';
import { headers } from 'next/headers';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeSchema, projectSlugSchema } from '@tevoniq/validation';
import { Container, Section } from '@tevoniq/ui';
import { getProject } from '@/lib/projects';
import { ProjectCaseStudy } from '@/components/project-case-study';
import { projectLabels } from '@/content/projects';
import { env } from '@/lib/env';
import '../projects.css';
type Props = { params: Promise<{ locale: string; slug: string }> };
async function resolve(params: Props['params']) {
  const raw = await params,
    locale = localeSchema.safeParse(raw.locale),
    slug = projectSlugSchema.safeParse(raw.slug);
  if (!locale.success || !slug.success) notFound();
  return { locale: locale.data, slug: slug.data };
}
async function baseMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await resolve(params),
    p = await getProject(locale, slug).catch(() => null);
  if (!p) return { robots: { index: false, follow: false } };
  return {
    title: p.seoTitle,
    description: p.seoDescription,
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: Object.fromEntries(p.availableLocales.map((l) => [l, `/${l}/projects/${slug}`])),
    },
    openGraph: {
      title: p.seoTitle,
      description: p.seoDescription,
      type: 'article',
      url: `/${locale}/projects/${slug}`,
      ...(p.heroImage ? { images: [{ url: p.heroImage.url, alt: p.heroImage.alt }] } : {}),
    },
  };
}
async function PublicPage({ params }: Props) {
  const { locale, slug } = await resolve(params),
    l = projectLabels[locale];
  let p;
  try {
    p = await getProject(locale, slug);
  } catch {
    return (
      <main id="main-content">
        <Section>
          <Container>
            <Heading as="h1">{l.title}</Heading>
            <p role="status">{l.error}</p>
          </Container>
        </Section>
      </main>
    );
  }
  if (!p) notFound();
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { name: l.home, path: `/${locale}` },
      { name: l.title, path: `/${locale}/projects` },
      { name: p.title, path: `/${locale}/projects/${slug}` },
    ].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: new URL(c.path, env.SITE_URL).href,
    })),
  };
  return (
    <main id="main-content">
      <ProjectCaseStudy project={p} />
      <VisualDiscovery locale={locale} services={p.services} />
      <script
        nonce={(await headers()).get('x-nonce') || undefined}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
      />
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/projects/[slug]', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/projects/[slug]'.replace(
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
