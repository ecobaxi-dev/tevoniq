import { redirect, notFound } from 'next/navigation';
import { localeSchema } from '@tevoniq/validation';
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  redirect(`/${locale.data}/company/about`);
}
