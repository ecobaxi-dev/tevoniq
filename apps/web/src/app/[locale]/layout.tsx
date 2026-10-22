import { NonceProvider } from '@/components/nonce-provider';
import { headers } from 'next/headers';
import { getSiteSettings } from '@/lib/site-settings';
import { SiteAnalytics } from '@/components/site-analytics';
import { SiteFooter } from '@/components/site-footer';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { localeSchema } from '@tevoniq/validation';
import { directionFor } from '@tevoniq/types';
import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { resolveFaviconAsset } from '@/config/assets';
import { getNavigation } from '@/lib/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteStructuredData } from '@/components/seo/structured-data';
import '../globals.css';
import '@/components/site-header.css';
const favicon = resolveFaviconAsset();
const baseMetadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: 'TEVONIQ',
  robots: { index: true, follow: true },
  icons: {
    icon: {
      url: favicon.src,
      type: `image/${favicon.format}`,
      sizes: `${favicon.width}x${favicon.height}`,
    },
  },
};
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    ...baseMetadata,
    applicationName: settings.general.siteName,
    icons: {
      icon: settings.brand.favicon || favicon.src,
      ...(settings.brand.brandIcon ? { apple: settings.brand.brandIcon } : {}),
    },
  };
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const parsed = localeSchema.safeParse((await params).locale);
  if (!parsed.success) notFound();
  const [navigation, settings] = await Promise.all([getNavigation(parsed.data), getSiteSettings()]);
  if (!settings.localization.enabledLanguages.includes(parsed.data)) notFound();
  return (
    <html lang={parsed.data} dir={directionFor(parsed.data)}>
      <body className="bg-mist font-sans text-navy antialiased">
        <NonceProvider nonce={nonce}>
          <SiteHeader
            content={navigation}
            locale={parsed.data}
            enabledLanguages={settings.localization.enabledLanguages}
            brand={settings.brand}
            siteName={settings.general.siteName}
          />
          <SiteStructuredData />
          {children}
          <SiteFooter locale={parsed.data} navigation={navigation} />
          <SiteAnalytics
            nonce={nonce}
            analytics={settings.analytics}
            legal={settings.legal}
            locale={parsed.data}
          />
        </NonceProvider>
      </body>
    </html>
  );
}
