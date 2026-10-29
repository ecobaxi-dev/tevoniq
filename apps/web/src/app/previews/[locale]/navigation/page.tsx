import { headers } from 'next/headers';
import { SiteHeader } from '@/components/site-header';
import { NonceProvider } from '@/components/nonce-provider';
import '@/components/site-header.css';
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
  const content = await getNavigation(locale);
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <NonceProvider nonce={nonce}>
      <VerticalNavigationPreview
        locale={locale}
        content={content}
        header={<SiteHeader locale={locale} content={content} enabledLanguages={['ar', 'en']} />}
      />
    </NonceProvider>
  );
}
