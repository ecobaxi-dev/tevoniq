import { notFound } from 'next/navigation';
import { findDashboardModel } from '@/content/dashboard-models';
import { DashboardPreview } from '@/components/dashboard-preview';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const model = findDashboardModel(slug);
  return {
    title:
      model && (locale === 'ar' || locale === 'en')
        ? `${model[locale].name} — TEVONIQ Demo`
        : 'Dashboard preview',
    robots: { index: false, follow: false },
  };
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const model = findDashboardModel(slug);
  if (!model || (locale !== 'ar' && locale !== 'en')) notFound();
  return <DashboardPreview key={`${locale}-${slug}`} model={model} locale={locale} />;
}
