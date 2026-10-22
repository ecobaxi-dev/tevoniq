import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { localeSchema } from '@tevoniq/validation';
import { getBuiltPage } from '@/lib/page-builder';
import { PageRenderer } from '@/components/page-builder/page-renderer';
async function baseMetadata({ params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  const { locale, slug } = await params;
  const parsed = localeSchema.safeParse(locale);
  if (!parsed.success) return {};
  const page = await getBuiltPage('/' + slug.join('/'), locale);
  if (!page) return {};
  const copy = page.document.translations[parsed.data]!;
  return {
    title: copy.seoTitle || copy.title,
    description: copy.seoDescription,
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}${page.document.path}` },
    openGraph: {
      title: copy.seoTitle || copy.title,
      description: copy.seoDescription,
      ...(copy.ogImage ? { images: [copy.ogImage] } : {}),
    },
  };
}

/** Custom pages are public only through a published CMS snapshot. */
async function PublicPage({ params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  const { locale, slug } = await params;
  const parsed = localeSchema.safeParse(locale);
  if (!parsed.success) notFound();
  const built = await getBuiltPage('/' + slug.join('/'), parsed.data);
  if (built)
    return (
      <main id="main-content">
        <PageRenderer
          document={built.document}
          locale={parsed.data}
          cards={built.cards}
          pageId={built.id}
          siteKey={built.turnstileSiteKey}
        />
      </main>
    );
  notFound();
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/[slug]', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/[slug]'.replace('[slug]', Array.isArray(slug) ? slug.join('/') : String(slug));
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
