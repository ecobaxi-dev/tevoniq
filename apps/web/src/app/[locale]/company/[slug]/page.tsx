import { Heading } from '@tevoniq/ui';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { companySlugSchema, localeSchema } from '@tevoniq/validation';
import { Container, Section } from '@tevoniq/ui';
import { getCompany, getPublishedPartners } from '@/lib/company';
import { CompanyContentView } from '@/components/company-content';
import '../company.css';
type Props = { params: Promise<{ locale: string; slug: string }> };
async function resolve(params: Props['params']) {
  const raw = await params,
    locale = localeSchema.safeParse(raw.locale),
    slug = companySlugSchema.safeParse(raw.slug);
  if (!locale.success || !slug.success) notFound();
  return { locale: locale.data, slug: slug.data };
}
async function baseMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await resolve(params),
    content = await getCompany(locale, slug);
  if (!content) return { robots: { index: false, follow: false } };
  return {
    title: content.title,
    description: content.seoDescription,
    alternates: { canonical: `/${locale}/company/${slug}` },
  };
}
async function PublicPage({ params }: Props) {
  const { locale, slug } = await resolve(params),
    content = await getCompany(locale, slug);
  if (content === null) notFound();
  const partners = slug === 'partners' ? await getPublishedPartners(locale).catch(() => []) : [];
  return (
    <main id="main-content" className="company-page">
      {content ? (
        <CompanyContentView content={content} locale={locale} partners={partners} />
      ) : (
        <Section>
          <Container>
            <Heading as="h1" className="tv-h1">
              TEVONIQ
            </Heading>
            <p role="status">
              {
                {
                  en: 'Company content is temporarily unavailable. Please try again shortly.',
                  tr: 'Kurumsal içerik geçici olarak kullanılamıyor. Lütfen tekrar deneyin.',
                  ar: 'محتوى الشركة غير متاح مؤقتًا. يرجى المحاولة مرة أخرى.',
                }[locale]
              }
            </p>
          </Container>
        </Section>
      )}
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/company/[slug]', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/company/[slug]'.replace(
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
