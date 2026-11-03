import type { Metadata } from 'next';
import { routeMetadata } from './seo';
import { getSiteSettings } from './site-settings';
import { env } from './env';
export async function growthMetadata(
  props: {
    params: Promise<{ locale: string; slug?: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  },
  path: string,
  title: string,
  description: string,
): Promise<Metadata> {
  const { locale } = await props.params;
  const metadata = await routeMetadata(props, path, {
    title,
    description,
    alternates: { canonical: `/${locale}${path}` },
    openGraph: { title, description, type: 'website', url: `/${locale}${path}` },
  });
  const settings = await getSiteSettings();
  const own = new URL(`/${locale}${path}`, env.SITE_URL).href;
  if (
    (metadata.robots && typeof metadata.robots === 'object' && metadata.robots.index === false) ||
    String(metadata.alternates?.canonical) !== own
  )
    return metadata;
  const languages = Object.fromEntries(
    settings.localization.enabledLanguages
      .filter((language) => language === 'ar' || language === 'en')
      .map((language) => [language, new URL(`/${language}${path}`, env.SITE_URL).href]),
  );
  const defaultUrl =
    languages[settings.localization.defaultLanguage] || languages.ar || languages.en;
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      languages: { ...languages, ...(defaultUrl ? { 'x-default': defaultUrl } : {}) },
    },
  };
}
