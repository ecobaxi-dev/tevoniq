import { z } from 'zod';
import type { PublicSiteSettings } from '@tevoniq/validation';
export const CONSENT_KEY = 'tevoniq-consent-v1';
export const CONSENT_COOKIE = 'tevoniq_consent';
export const consentCategoriesSchema = z
  .object({
    necessary: z.literal(true),
    analytics: z.boolean(),
    marketing: z.boolean(),
    preferences: z.boolean(),
  })
  .strict();
export type ConsentCategories = z.infer<typeof consentCategoriesSchema>;
export const necessaryOnly: ConsentCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};
export const allConsent: ConsentCategories = {
  necessary: true,
  analytics: true,
  marketing: true,
  preferences: true,
};
export const consentRecordSchema = z
  .object({
    version: z.literal(1),
    categories: consentCategoriesSchema,
    fingerprint: z.string().max(2000),
    updatedAt: z.number(),
    expiresAt: z.number(),
  })
  .strict();
export type ConsentRecord = z.infer<typeof consentRecordSchema>;
export function consentFingerprint(
  analytics: PublicSiteSettings['analytics'],
  legal: PublicSiteSettings['legal'],
) {
  return JSON.stringify([
    analytics.googleTagManager,
    analytics.googleAnalytics,
    analytics.microsoftClarity,
    analytics.metaPixel,
    legal.cookiePolicyVersion,
    legal.requireAnalyticsConsent,
    legal.requireMarketingConsent,
    legal.cookieConsentDays,
  ]);
}
export function readConsent(
  raw: string | null | undefined,
  fingerprint: string,
  now = Date.now(),
): ConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = consentRecordSchema.safeParse(JSON.parse(raw));
    return parsed.success &&
      parsed.data.fingerprint === fingerprint &&
      parsed.data.updatedAt <= now &&
      parsed.data.expiresAt > now
      ? parsed.data
      : null;
  } catch {
    return null;
  }
}
export function consentPermissions(
  record: ConsentRecord | null,
  legal: Pick<PublicSiteSettings['legal'], 'requireAnalyticsConsent' | 'requireMarketingConsent'>,
): ConsentCategories {
  return (
    record?.categories ?? {
      necessary: true,
      analytics: !legal.requireAnalyticsConsent,
      marketing: !legal.requireMarketingConsent,
      preferences: false,
    }
  );
}
export function permittedProviders(
  ids: PublicSiteSettings['analytics'],
  permissions: ConsentCategories,
) {
  return {
    googleAnalytics: !!ids.googleAnalytics && permissions.analytics,
    microsoftClarity: !!ids.microsoftClarity && permissions.analytics,
    metaPixel: !!ids.metaPixel && permissions.marketing,
    // A GTM container can deploy both analytics and advertising tags; require both categories.
    googleTagManager: !!ids.googleTagManager && permissions.analytics && permissions.marketing,
  };
}
