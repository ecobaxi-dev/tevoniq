import { z } from 'zod';
const text = (max: number) => z.string().trim().max(max).default('');
export const seoUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && !url.hash
      );
    } catch {
      return false;
    }
  }, 'Use an absolute HTTP(S) URL without credentials or a fragment')
  .default('');
export const seoPathSchema = z
  .string()
  .max(500)
  .regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/)
  .refine(
    (p) => !/^\/(en|tr|ar|admin|api|auth|search|design-system|health)(\/|$)/.test(p),
    'Use a public page path without its language prefix',
  );
export const seoFieldsSchema = z.object({
  seoTitle: text(200),
  description: text(500),
  canonical: seoUrlSchema,
  robots: z
    .enum(['', 'index,follow', 'noindex,follow', 'noindex,nofollow', 'index,nofollow'])
    .default(''),
  ogTitle: text(200),
  ogDescription: text(500),
  ogImage: seoUrlSchema,
  twitterTitle: text(200),
  twitterDescription: text(500),
  twitterImage: seoUrlSchema,
  twitterCard: z.enum(['', 'summary', 'summary_large_image']).default(''),
});
export const seoRecordDataSchema = seoFieldsSchema.extend({ path: seoPathSchema });
export type SeoFields = z.infer<typeof seoFieldsSchema>;
export const footerLinkSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    if (/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/.test(value)) return true;
    return seoUrlSchema.safeParse(value).success;
  }, 'Use a public page path or an absolute HTTP(S) URL')
  .default('');
const publicImageUrl = z
  .union([seoUrlSchema, z.string().regex(/^\/(?!\/)[a-zA-Z0-9/_.%-]+$/)])
  .default('');
export const organizationSettingsSchema = z.object({
  companyName: text(200),
  legalName: text(240),
  logo: publicImageUrl,
  email: z.union([z.literal(''), z.email()]).default(''),
  phone: text(60),
  streetAddress: text(240),
  addressLocality: text(120),
  addressRegion: text(120),
  postalCode: text(30),
  addressCountry: z.union([z.literal(''), z.string().regex(/^[A-Z]{2}$/)]).default(''),
  socialProfiles: text(10000).refine(
    (value) =>
      !value ||
      value
        .split(/\r?\n/)
        .filter(Boolean)
        .every((url) => seoUrlSchema.safeParse(url).success),
    'Enter one HTTP(S) profile URL per line',
  ),
  defaultDescription: text(500),
  defaultOgImage: publicImageUrl,
  twitterSite: text(30).refine((v) => !v || /^@[A-Za-z0-9_]{1,15}$/.test(v), 'Use an @username'),
  footerDescriptionEn: text(500),
  footerDescriptionTr: text(500),
  footerDescriptionAr: text(500),
  privacyPolicyUrl: footerLinkSchema,
  termsUrl: footerLinkSchema,
  cookiePolicyUrl: footerLinkSchema,
});
export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;
export const seoRouteSchema = z.object({
  route: z.string(),
  locale: z.enum(['en', 'tr', 'ar']),
  title: z.string(),
  canonical: z.string(),
  updatedAt: z.string().nullable(),
  seo: seoFieldsSchema,
  translations: z.array(
    z.object({ locale: z.enum(['en', 'tr', 'ar']), canonical: z.string(), seo: seoFieldsSchema }),
  ),
});
export type SeoRoute = z.infer<typeof seoRouteSchema>;
export const seoRoutesResponseSchema = z.object({
  items: z.array(seoRouteSchema),
  total: z.number(),
});
