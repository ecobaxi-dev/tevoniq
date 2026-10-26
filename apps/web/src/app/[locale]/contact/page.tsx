import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import { findWorkSystem } from '@/content/work-systems';
import { findWebsiteDesign } from '@/content/website-designs';
import { ContactPage } from '@/components/contact-page';
import { leadCopy } from '@/content/leads';
import { localeSchema } from '@tevoniq/validation';
async function baseMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeSchema.parse((await params).locale);
  return {
    title: 'Contact | TEVONIQ',
    description: leadCopy[locale].contactIntro,
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}/contact` },
  };
}
async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = searchParams ? await searchParams : {};
  const design = typeof query.design === 'string' ? findWebsiteDesign(query.design) : undefined;
  const system = typeof query.system === 'string' ? findWorkSystem(query.system) : undefined;
  const initialMessage =
    design && (locale === 'ar' || locale === 'en')
      ? locale === 'ar'
        ? `أرغب في مناقشة موقع لنشاطي بالاستناد إلى تصميم: ${design.ar.name}.\nتفاصيل نشاطي ومتطلباتي: `
        : `I would like to discuss a website based on: ${design.en.name}.\nMy business and requirements: `
      : system && (locale === 'ar' || locale === 'en')
        ? locale === 'ar'
          ? `أرغب في مناقشة نظام لإدارة العمل بالاستناد إلى نموذج: ${system.ar.name}.\nطريقة عملي ومتطلباتي: `
          : `I would like to discuss a work management system based on: ${system.en.name}.\nMy workflow and requirements: `
        : undefined;
  return <ContactPage locale={locale} type="contact" initialMessage={initialMessage} />;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/contact', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/contact'.replace('[slug]', Array.isArray(slug) ? slug.join('/') : String(slug));
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
