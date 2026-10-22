import { notFound } from 'next/navigation';
import { localeSchema } from '@tevoniq/validation';
import { PolicyPage } from '@/components/policy-page';
import { cookieCopy } from '@/content/cookies';
import { pageMetadata } from '@/lib/seo';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const locale = localeSchema.parse((await params).locale);
  return pageMetadata(locale, '/privacy-policy', {
    title: cookieCopy[locale].privacy,
    description: cookieCopy[locale].privacyIntro,
  });
}
export default async function Page({ params }: Props) {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  return <PolicyPage locale={locale.data} kind="privacy" />;
}
