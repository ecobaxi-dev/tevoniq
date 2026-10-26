import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import '../../globals.css';
import '@/components/website-preview.css';
export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="website-preview-body">{children}</body>
    </html>
  );
}
