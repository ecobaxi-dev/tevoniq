import { notFound } from 'next/navigation';
import { localeSchema } from '@tevoniq/validation';
import { NewsletterTokenAction } from '@/components/newsletter/token-action';
export const metadata = {
  title: 'Newsletter | TEVONIQ',
  robots: { index: false, follow: false },
  referrer: 'no-referrer' as const,
};
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; action: string }>;
}) {
  const raw = await params,
    locale = localeSchema.safeParse(raw.locale);
  if (!locale.success || (raw.action !== 'confirm' && raw.action !== 'unsubscribe')) notFound();
  return <NewsletterTokenAction locale={locale.data} action={raw.action} />;
}
