import { notFound } from 'next/navigation';
import { getNavigation } from '@/lib/navigation';
import { VerticalNavigationPreview } from '@/components/vertical-navigation-preview';
import '@/components/vertical-navigation-preview.css';
export const metadata = {
  title: 'TEVONIQ — Navigation preview',
  robots: { index: false, follow: false },
};
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  return <VerticalNavigationPreview locale={locale} content={await getNavigation(locale)} />;
}
