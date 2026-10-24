import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeSchema } from '@tevoniq/validation';
import { PestoPage } from '@/components/pesto-page';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { pestoCopy } from '@/content/pesto';
import { routeMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/site-settings';
import { absoluteUrl } from '@/lib/seo-core';
import { env } from '@/lib/env';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata(props: Props): Promise<Metadata> {
  const parsed = localeSchema.safeParse((await props.params).locale);
  if (!parsed.success) return {};
  const c = pestoCopy[parsed.data];
  const metadata = await routeMetadata(props, '/pesto', {
    title: c.title,
    description: c.description,
  });
  const settings = await getSiteSettings();
  const canonical = absoluteUrl(`/${parsed.data}/pesto`, env.SITE_URL);
  // The CMS wrapper has no translation records for this code-owned product route.
  // Preserve CMS noindex/canonical overrides; expose only enabled translations otherwise.
  const languages: Record<string, string> = {};
  if (
    !(typeof metadata.robots === 'object' && metadata.robots?.index === false) &&
    String(metadata.alternates?.canonical) === canonical
  ) {
    for (const locale of settings.localization.enabledLanguages)
      languages[locale] = absoluteUrl(`/${locale}/pesto`, env.SITE_URL);
    const defaultUrl = languages[settings.localization.defaultLanguage];
    if (defaultUrl) languages['x-default'] = defaultUrl;
  }
  return { ...metadata, alternates: { ...metadata.alternates, languages } };
}
export default async function Page({ params }: Props) {
  const parsed = localeSchema.safeParse((await params).locale);
  if (!parsed.success) notFound();
  return (
    <>
      <PageBreadcrumbs locale={parsed.data} path="/pesto" />
      <PestoPage locale={parsed.data} />
    </>
  );
}
