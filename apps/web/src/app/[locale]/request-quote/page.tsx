import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import { ContactPage } from '@/components/contact-page';
import { leadCopy } from '@/content/leads';
import { localeSchema } from '@tevoniq/validation';
async function baseMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeSchema.parse((await params).locale);
  return {
    title: 'Request a quote | TEVONIQ',
    description: leadCopy[locale].quoteIntro,
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}/request-quote` },
  };
}
async function PublicPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ContactPage locale={(await params).locale} type="quote" />;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/request-quote', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/request-quote'.replace(
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
