import { mlCopy } from '@/content/machine-learning';
import { qaCopy } from '@/content/qa-automation';
import { customCopy } from '@/content/custom-software';
import { iotCopy } from '@/content/iot-service';
import { engineeringCopy } from '@/content/software-engineering';
import { erpCopy } from '@/content/erp-service';
import { automationServiceCopy } from '@/content/intelligent-automation';
import { consultingCopy } from '@/content/technology-consulting';
import { Heading } from '@tevoniq/ui';
import { VisualDiscovery } from '@/components/visual-discovery';
import { StructuredData } from '@/components/seo/json-ld';
import { getOrganization } from '@/lib/seo';
import { env } from '@/lib/env';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { localeSchema, serviceSlugSchema } from '@tevoniq/validation';
import { Container, ButtonLink, Section } from '@tevoniq/ui';
import type { Metadata } from 'next';
import { getService } from '@/lib/services';
import { ServiceBlocks } from '@/components/service-blocks';
import { serviceLabels } from '@/content/services';
import '../services.css';
type Props = { params: Promise<{ locale: string; slug: string }> };
async function resolve(params: Props['params']) {
  const raw = await params;
  const locale = localeSchema.safeParse(raw.locale);
  const slug = serviceSlugSchema.safeParse(raw.slug);
  if (!locale.success || !slug.success) notFound();
  return { locale: locale.data, slug: slug.data };
}
async function baseMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await resolve(params);
  try {
    const service = await getService(locale, slug);
    if (!service) return { robots: { index: false, follow: false } };
    const presentation =
      slug === 'ai-machine-learning' && (locale === 'ar' || locale === 'en')
        ? mlCopy[locale]
        : slug === 'qa-automation' && (locale === 'ar' || locale === 'en')
          ? qaCopy[locale]
          : slug === 'custom-software-development' && (locale === 'ar' || locale === 'en')
            ? customCopy[locale]
            : slug === 'it-consulting' && (locale === 'ar' || locale === 'en')
              ? consultingCopy[locale]
              : slug === 'business-automation' && (locale === 'ar' || locale === 'en')
                ? automationServiceCopy[locale]
                : slug === 'erp-solutions' && (locale === 'ar' || locale === 'en')
                  ? erpCopy[locale]
                  : slug === 'software-product-engineering' && (locale === 'ar' || locale === 'en')
                    ? engineeringCopy[locale]
                    : slug === 'iot-solutions' && (locale === 'ar' || locale === 'en')
                      ? iotCopy[locale]
                      : null;
    return {
      title: presentation ? `${presentation.serviceTitle} | TEVONIQ` : service.seoTitle,
      description: presentation?.seoDescription ?? service.seoDescription,
      alternates: { canonical: `/${locale}/services/${slug}` },
      openGraph: {
        title: presentation ? `${presentation.serviceTitle} | TEVONIQ` : service.seoTitle,
        description: presentation?.seoDescription ?? service.seoDescription,
        type: 'website',
      },
    };
  } catch {
    return { robots: { index: false, follow: false } };
  }
}
async function PublicPage({ params }: Props) {
  const { locale, slug } = await resolve(params);
  let service;
  try {
    service = await getService(locale, slug);
  } catch {
    return (
      <main id="main-content">
        <Section>
          <Container>
            <Heading as="h1" className="tv-h1">
              {serviceLabels[locale].title}
            </Heading>
            <p role="status">{serviceLabels[locale].error}</p>
            <ButtonLink href={`/${locale}/services`}>{serviceLabels[locale].back}</ButtonLink>
          </Container>
        </Section>
      </main>
    );
  }
  if (!service) notFound();
  const organization = await getOrganization().catch(() => null);
  return (
    <main id="main-content" className="services-page">
      <Container className="service-breadcrumb">
        <a href={`/${locale}/services`}>{serviceLabels[locale].back}</a>
        <span aria-hidden="true"> / </span>
        <span>{service.title}</span>
      </Container>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.seoDescription,
          url: new URL('/' + locale + '/services/' + slug, env.SITE_URL).href,
          ...(organization?.companyName
            ? { provider: { '@id': new URL('/#organization', env.SITE_URL).href } }
            : {}),
        }}
      />
      <ServiceBlocks service={service} locale={locale} />
      {!(
        [
          'ai-machine-learning',
          'qa-automation',
          'custom-software-development',
          'it-consulting',
          'business-automation',
          'erp-solutions',
          'software-product-engineering',
          'iot-solutions',
        ].includes(slug) && locale !== 'tr'
      ) &&
        ![
          'ui-ux-design',
          'mobile-application-development',
          'ai-augmented-development',
          'digital-transformation',
        ].includes(slug) && <VisualDiscovery locale={locale} serviceSlug={slug} />}
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/services/[slug]', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/services/[slug]'.replace(
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
