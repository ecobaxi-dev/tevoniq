import { notFound } from 'next/navigation';
import { findWebsiteDesign } from '@/content/website-designs';
import { WebsitePreview } from '@/components/website-preview';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const d = findWebsiteDesign(slug);
  return {
    title:
      d && (locale === 'ar' || locale === 'en')
        ? `${d[locale].brand} — TEVONIQ Preview`
        : 'Design preview',
    robots: { index: false, follow: false },
  };
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const design = findWebsiteDesign(slug);
  if (!design || (locale !== 'ar' && locale !== 'en')) notFound();
  return <WebsitePreview design={design} locale={locale} />;
}
