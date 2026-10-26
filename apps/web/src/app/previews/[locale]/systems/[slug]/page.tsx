import { notFound } from 'next/navigation';
import { findWorkSystem } from '@/content/work-systems';
import { WorkSystemPreview } from '@/components/work-system-preview';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const system = findWorkSystem(slug);
  return {
    title:
      system && (locale === 'ar' || locale === 'en')
        ? `${system[locale].name} — TEVONIQ Demo`
        : 'System preview',
    robots: { index: false, follow: false },
  };
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const system = findWorkSystem(slug);
  if (!system || (locale !== 'ar' && locale !== 'en')) notFound();
  return <WorkSystemPreview key={`${locale}-${slug}`} system={system} locale={locale} />;
}
