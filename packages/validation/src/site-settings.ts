import { z } from 'zod';
import { organizationSettingsSchema, footerLinkSchema } from './seo.js';
const text = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (v) => ![...v].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127),
      'Use plain text without control characters',
    )
    .default('');
const paragraph = z.string().trim().max(5000).default('');
const email = z.union([z.literal(''), z.email().max(254)]).default('');
export const settingsAssetSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => {
    if (!v) return true;
    if (/^\/(?!\/)[a-zA-Z0-9/_.%-]+$/.test(v) && !v.includes('..')) return true;
    try {
      const u = new URL(v);
      return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password && !u.hash;
    } catch {
      return false;
    }
  }, 'Use a media path or HTTP(S) URL without credentials')
  .default('');
const social = (hosts: string[]) =>
  z
    .string()
    .trim()
    .max(2048)
    .refine((v) => {
      if (!v) return true;
      try {
        const u = new URL(v);
        return (
          u.protocol === 'https:' &&
          !u.username &&
          !u.password &&
          hosts.some((h) => u.hostname === h || u.hostname.endsWith('.' + h))
        );
      } catch {
        return false;
      }
    }, 'Use an HTTPS profile URL on the named platform')
    .default('');
const id = (pattern: RegExp, message: string) =>
  z
    .string()
    .trim()
    .max(64)
    .refine((v) => !v || pattern.test(v), message)
    .default('');
const locale = z.enum(['en', 'tr', 'ar']);
export const settingsGroups = [
  'general',
  'brand',
  'contact',
  'social',
  'localization',
  'seo',
  'email',
  'analytics',
  'security',
  'media',
  'legal',
] as const;
export const siteSettingsSchema = z
  .object({
    general: z
      .object({
        siteName: text(200).pipe(z.string().min(1)).default('TEVONIQ'),
        tagline: text(240),
        legalCompanyName: text(240),
        descriptionEn: paragraph,
        descriptionTr: paragraph,
        descriptionAr: paragraph,
      })
      .strict()
      .prefault({}),
    brand: z
      .object({
        logo: settingsAssetSchema,
        logoLight: settingsAssetSchema,
        logoDark: settingsAssetSchema,
        favicon: settingsAssetSchema,
        brandIcon: settingsAssetSchema,
      })
      .strict()
      .prefault({}),
    contact: z
      .object({
        email,
        salesEmail: email,
        supportEmail: email,
        phone: text(60),
        whatsApp: z
          .string()
          .trim()
          .regex(
            /^(?:\+[1-9]\d{6,14})?$/,
            'Use an international number, e.g. + followed by country code and number',
          )
          .default(''),
        streetAddress: text(240),
        city: text(120),
        region: text(120),
        postalCode: text(30),
        country: z.union([z.literal(''), z.string().regex(/^[A-Z]{2}$/)]).default(''),
        latitude: z.number().min(-90).max(90).nullable().default(null),
        longitude: z.number().min(-180).max(180).nullable().default(null),
      })
      .strict()
      .refine((v) => (v.latitude === null) === (v.longitude === null), {
        message: 'Supply both latitude and longitude',
        path: ['latitude'],
      })
      .prefault({}),
    social: z
      .object({
        linkedin: social(['linkedin.com']),
        instagram: social(['instagram.com']),
        facebook: social(['facebook.com']),
        youtube: social(['youtube.com', 'youtu.be']),
        x: social(['x.com', 'twitter.com']),
        github: social(['github.com']),
      })
      .strict()
      .prefault({}),
    localization: z
      .object({
        defaultLanguage: locale.default('en'),
        enabledLanguages: z
          .array(locale)
          .min(1)
          .max(3)
          .refine((v) => new Set(v).size === v.length, 'Choose each language once')
          .default(['en', 'tr', 'ar']),
      })
      .strict()
      .refine((v) => v.enabledLanguages.includes(v.defaultLanguage), {
        message: 'The default language must be enabled',
        path: ['defaultLanguage'],
      })
      .prefault({}),
    seo: z
      .object({
        defaultTitle: text(200),
        titleTemplate: text(240).refine(
          (v) => !v || (v.match(/%s/g) || []).length === 1,
          'Include exactly one %s placeholder',
        ),
        defaultDescription: text(500),
        defaultOGImage: settingsAssetSchema,
      })
      .strict()
      .prefault({}),
    email: z
      .object({
        senderName: text(200),
        senderEmail: email,
        notificationRecipients: z
          .array(z.email().max(254))
          .max(20)
          .refine(
            (v) => new Set(v.map((e) => e.toLowerCase())).size === v.length,
            'Remove duplicate recipients',
          )
          .default([]),
      })
      .strict()
      .prefault({}),
    analytics: z
      .object({
        googleTagManager: id(/^GTM-[A-Z0-9]{4,20}$/, 'Use a GTM- container ID'),
        googleAnalytics: id(/^G-[A-Z0-9]{4,20}$/, 'Use a GA4 G- measurement ID'),
        microsoftClarity: id(/^[a-z0-9]{5,24}$/, 'Use a Clarity project ID'),
        metaPixel: id(/^\d{5,25}$/, 'Use a numeric Meta Pixel ID'),
      })
      .strict()
      .prefault({}),
    security: z
      .object({ sessionIdleMinutes: z.number().int().min(5).max(30).default(30) })
      .strict()
      .prefault({}),
    media: z
      .object({
        maxUploadMB: z.number().int().min(1).max(50).default(10),
        allowSvg: z.boolean().default(true),
      })
      .strict()
      .prefault({}),
    legal: z
      .object({
        privacyPolicyUrl: footerLinkSchema,
        termsUrl: footerLinkSchema,
        cookiePolicyUrl: footerLinkSchema,
        privacyInformation: paragraph,
        cookiePolicyInformation: paragraph,
        cookiePolicyVersion: text(40).pipe(z.string().min(1)).default('1'),
        requireAnalyticsConsent: z.boolean().default(true),
        requireMarketingConsent: z.boolean().default(true),
        cookieConsentDays: z.number().int().min(1).max(365).default(180),
        cookieNoticeEn: paragraph,
        cookieNoticeTr: paragraph,
        cookieNoticeAr: paragraph,
      })
      .strict()
      .prefault({}),
  })
  .strict();
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type SettingsGroup = (typeof settingsGroups)[number];
export const siteSettingsWriteSchema = z
  .object({ version: z.number().int().min(0), settings: siteSettingsSchema })
  .strict();
export const publicSiteSettingsSchema = siteSettingsSchema.pick({
  general: true,
  brand: true,
  contact: true,
  social: true,
  localization: true,
  seo: true,
  analytics: true,
  legal: true,
});
export type PublicSiteSettings = z.infer<typeof publicSiteSettingsSchema>;
export function publicSiteSettings(settings: SiteSettings): PublicSiteSettings {
  return publicSiteSettingsSchema.parse(
    Object.fromEntries(
      ['general', 'brand', 'contact', 'social', 'localization', 'seo', 'analytics', 'legal'].map(
        (key) => [key, settings[key as keyof SiteSettings]],
      ),
    ),
  );
}
export function settingsOrganization(settings: PublicSiteSettings) {
  return {
    companyName: settings.general.siteName,
    legalName: settings.general.legalCompanyName,
    logo: settings.brand.logo,
    email: settings.contact.email,
    phone: settings.contact.phone,
    streetAddress: settings.contact.streetAddress,
    addressLocality: settings.contact.city,
    addressRegion: settings.contact.region,
    postalCode: settings.contact.postalCode,
    addressCountry: settings.contact.country,
    socialProfiles: Object.values(settings.social).filter(Boolean).join('\n'),
    defaultDescription: settings.seo.defaultDescription,
    defaultOgImage: settings.seo.defaultOGImage,
    twitterSite: '',
    footerDescriptionEn: settings.general.descriptionEn,
    footerDescriptionTr: settings.general.descriptionTr,
    footerDescriptionAr: settings.general.descriptionAr,
    privacyPolicyUrl: settings.legal.privacyPolicyUrl,
    termsUrl: settings.legal.termsUrl,
    cookiePolicyUrl: settings.legal.cookiePolicyUrl,
  };
}
export function migrateOrganization(raw: unknown): SiteSettings {
  const old = organizationSettingsSchema.parse(raw);
  const settings = siteSettingsSchema.parse({});
  settings.general = {
    ...settings.general,
    siteName: old.companyName || 'TEVONIQ',
    legalCompanyName: old.legalName,
    descriptionEn: old.footerDescriptionEn,
    descriptionTr: old.footerDescriptionTr,
    descriptionAr: old.footerDescriptionAr,
  };
  settings.brand.logo = old.logo;
  settings.contact = {
    ...settings.contact,
    email: old.email,
    phone: old.phone,
    streetAddress: old.streetAddress,
    city: old.addressLocality,
    region: old.addressRegion,
    postalCode: old.postalCode,
    country: old.addressCountry,
  };
  settings.seo = {
    ...settings.seo,
    defaultDescription: old.defaultDescription,
    defaultOGImage: old.defaultOgImage,
  };
  settings.legal = {
    ...settings.legal,
    privacyPolicyUrl: old.privacyPolicyUrl,
    termsUrl: old.termsUrl,
    cookiePolicyUrl: old.cookiePolicyUrl,
  };
  for (const url of old.socialProfiles.split(/\r?\n/).filter(Boolean))
    for (const key of Object.keys(settings.social) as (keyof SiteSettings['social'])[]) {
      if (
        !settings.social[key] &&
        siteSettingsSchema.shape.social.unwrap().shape[key].safeParse(url).success
      )
        settings.social[key] = url;
    }
  return settings;
}
