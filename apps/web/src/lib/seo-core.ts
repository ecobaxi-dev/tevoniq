import type { Metadata } from 'next';
import type {
  OrganizationSettings,
  SeoRoute,
  PublicJob,
  PublicSiteSettings,
} from '@tevoniq/validation';
export const localizedPath = (locale: string, path: string) =>
  '/' + locale + (path === '/' ? '' : path);
export const absoluteUrl = (path: string, site: string) => new URL(path, site).href;
export function indexableRoute(
  route: Pick<SeoRoute, 'route' | 'locale' | 'seo' | 'canonical'>,
  site: string,
) {
  const canonical = route.seo.canonical || route.canonical;
  return (
    !route.seo.robots.startsWith('noindex') &&
    (!canonical ||
      absoluteUrl(canonical, site) === absoluteUrl(localizedPath(route.locale, route.route), site))
  );
}
export function routeLanguages(route: SeoRoute, site: string, defaultLanguage = 'en') {
  const languages: Record<string, string> = {};
  for (const translation of route.translations) {
    if (indexableRoute({ ...translation, route: route.route }, site))
      languages[translation.locale] = absoluteUrl(
        localizedPath(translation.locale, route.route),
        site,
      );
  }
  if (languages[defaultLanguage]) languages['x-default'] = languages[defaultLanguage];
  return languages;
}
export function buildSeoMetadata(
  site: string,
  locale: string,
  path: string,
  base: Metadata,
  organization: OrganizationSettings,
  route?: SeoRoute,
  forceNoindex = false,
  defaults?: PublicSiteSettings,
): Metadata {
  const seo = route?.seo;
  let title =
    seo?.seoTitle ||
    (typeof base.title === 'string'
      ? base.title
      : base.title && 'absolute' in base.title
        ? base.title.absolute
        : '') ||
    route?.title ||
    organization.companyName ||
    'TEVONIQ';
  if (!seo?.seoTitle && path === '/' && defaults?.seo.defaultTitle)
    title = defaults.seo.defaultTitle;
  else if (!seo?.seoTitle && defaults?.seo.titleTemplate) {
    title = defaults.seo.titleTemplate.replace(
      '%s',
      title.replace(/\s*[|—–]\s*TEVONIQ(?: Careers)?$/, ''),
    );
  }
  const description =
    seo?.description ||
    base.description ||
    defaults?.seo.defaultDescription ||
    organization.defaultDescription ||
    undefined;
  const ownUrl = absoluteUrl(localizedPath(locale, path), site);
  const canonical = absoluteUrl(
    seo?.canonical || route?.canonical || String(base.alternates?.canonical || ownUrl),
    site,
  );
  const noindex =
    forceNoindex ||
    (typeof base.robots === 'object' && base.robots?.index === false) ||
    !!seo?.robots.startsWith('noindex');
  const follow = seo?.robots
    ? !seo.robots.endsWith('nofollow')
    : typeof base.robots === 'object'
      ? base.robots?.follow !== false
      : true;
  const image =
    seo?.ogImage ||
    (!base.openGraph?.images
      ? defaults?.seo.defaultOGImage || organization.defaultOgImage
      : undefined);
  const images = image ? [{ url: absoluteUrl(image, site) }] : base.openGraph?.images;
  const twitterImage =
    seo?.twitterImage ||
    seo?.ogImage ||
    (!base.openGraph?.images ? organization.defaultOgImage : undefined);
  const languages = route
    ? routeLanguages(
        {
          ...route,
          translations: route.translations.filter(
            (t) => !defaults || defaults.localization.enabledLanguages.includes(t.locale),
          ),
        },
        site,
        defaults?.localization.defaultLanguage,
      )
    : { [locale]: ownUrl };
  return {
    ...base,
    metadataBase: new URL(site),
    title,
    ...(description ? { description } : {}),
    robots: {
      index: !noindex,
      follow,
      googleBot: { index: !noindex, follow, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical,
      languages: noindex || canonical !== ownUrl ? {} : languages,
      types: { 'application/rss+xml': absoluteUrl('/rss.xml?locale=' + locale, site) },
    },
    openGraph: {
      ...base.openGraph,
      type: base.openGraph && 'type' in base.openGraph ? base.openGraph.type : 'website',
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description || '',
      url: canonical,
      siteName: organization.companyName || 'TEVONIQ',
      locale: { en: 'en_US', tr: 'tr_TR', ar: 'ar_AR' }[locale] || locale,
      alternateLocale: Object.keys(languages)
        .filter((l) => l !== locale && l !== 'x-default')
        .map((l) => ({ en: 'en_US', tr: 'tr_TR', ar: 'ar_AR' })[l] || l),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: seo?.twitterCard || (twitterImage || images ? 'summary_large_image' : 'summary'),
      title: seo?.twitterTitle || seo?.ogTitle || title,
      description: seo?.twitterDescription || seo?.ogDescription || description || '',
      ...(organization.twitterSite ? { site: organization.twitterSite } : {}),
      ...(twitterImage ? { images: [absoluteUrl(twitterImage, site)] } : images ? { images } : {}),
    },
  };
}
export function organizationData(settings: OrganizationSettings, site: string) {
  if (!settings.companyName) return null;
  const address = Object.fromEntries(
    ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry'].flatMap(
      (key) => {
        const value = settings[key as keyof OrganizationSettings];
        return value ? [[key, value]] : [];
      },
    ),
  );
  return {
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization', site),
    name: settings.companyName,
    url: absoluteUrl('/', site),
    ...(settings.legalName ? { legalName: settings.legalName } : {}),
    ...(settings.logo ? { logo: absoluteUrl(settings.logo, site) } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(Object.keys(address).length ? { address: { '@type': 'PostalAddress', ...address } } : {}),
    ...(settings.socialProfiles
      ? {
          sameAs: settings.socialProfiles
            .split(/\r?\n/)
            .map((v) => v.trim())
            .filter(Boolean),
        }
      : {}),
  };
}
export const jsonLd = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
export function breadcrumbData(items: { name: string; path: string }[], site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, site),
    })),
  };
}
export function faqData(items: { question: string; answer: string }[]) {
  const questions = items.filter((i) => i.question.trim() && i.answer.trim());
  return questions.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map((i) => ({
          '@type': 'Question',
          name: i.question,
          acceptedAnswer: { '@type': 'Answer', text: i.answer },
        })),
      }
    : null;
}

export function jobPostingData(
  job: PublicJob,
  organization: OrganizationSettings,
  site: string,
  locale: string,
  now = Date.now(),
) {
  if (
    !organization.companyName ||
    !job.publishedAt ||
    Date.parse(job.publishedAt) > now ||
    (job.closingDate && Date.parse(job.closingDate) <= now)
  )
    return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: [
      job.description,
      ...job.responsibilities,
      ...job.requirements,
      ...job.preferredQualifications,
    ].join('\n'),
    datePosted: job.publishedAt,
    ...(job.closingDate ? { validThrough: job.closingDate } : {}),
    employmentType: {
      FULL_TIME: 'FULL_TIME',
      PART_TIME: 'PART_TIME',
      CONTRACT: 'CONTRACTOR',
      INTERNSHIP: 'INTERN',
    }[job.employmentType],
    hiringOrganization: {
      '@id': absoluteUrl('/#organization', site),
      '@type': 'Organization',
      name: organization.companyName,
    },
    url: absoluteUrl('/' + locale + '/careers/' + job.slug, site),
    jobLocation: { '@type': 'Place', name: job.location },
    ...(job.workMode === 'REMOTE' ? { jobLocationType: 'TELECOMMUTE' } : {}),
  };
}
