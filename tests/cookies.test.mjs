import { test } from 'node:test';
import assert from 'node:assert/strict';
import { siteSettingsSchema } from '../packages/validation/dist/index.js';
import {
  necessaryOnly,
  consentCategoriesSchema,
  consentFingerprint,
  consentPermissions,
  permittedProviders,
  readConsent,
} from '../apps/web/src/lib/cookie-consent.ts';
const settings = siteSettingsSchema.parse({
  analytics: {
    googleAnalytics: 'G-TEST1234',
    googleTagManager: 'GTM-TEST1234',
    microsoftClarity: 'test12345',
    metaPixel: '1234567890',
  },
});
const fingerprint = consentFingerprint(settings.analytics, settings.legal);
test('necessary consent cannot be disabled; optional categories default off', () => {
  assert.equal(
    consentCategoriesSchema.safeParse({ ...necessaryOnly, necessary: false }).success,
    false,
  );
  assert.deepEqual(consentPermissions(null, settings.legal), necessaryOnly);
  assert.deepEqual(Object.values(permittedProviders(settings.analytics, necessaryOnly)), [
    false,
    false,
    false,
    false,
  ]);
});
test('provider gates separate analytics from marketing and conservatively gate GTM', () => {
  const providers = permittedProviders(settings.analytics, { ...necessaryOnly, analytics: true });
  assert.equal(providers.googleAnalytics, true);
  assert.equal(providers.microsoftClarity, true);
  assert.equal(providers.metaPixel, false);
  assert.equal(providers.googleTagManager, false);
  assert.equal(
    permittedProviders(settings.analytics, { ...necessaryOnly, marketing: true }).metaPixel,
    true,
  );
  assert.equal(
    permittedProviders(settings.analytics, { ...necessaryOnly, analytics: true, marketing: true })
      .googleTagManager,
    true,
  );
  assert.equal(
    permittedProviders(
      { ...settings.analytics, googleAnalytics: '' },
      { ...necessaryOnly, analytics: true },
    ).googleAnalytics,
    false,
  );
});
test('consent expires, rejects malformed records, and is invalidated by policy/provider changes', () => {
  const record = {
    version: 1,
    categories: necessaryOnly,
    fingerprint,
    updatedAt: 100,
    expiresAt: 200,
  };
  assert.ok(readConsent(JSON.stringify(record), fingerprint, 150));
  assert.equal(readConsent(JSON.stringify(record), fingerprint, 200), null);
  assert.equal(readConsent(JSON.stringify(record), 'new-policy', 150), null);
  assert.equal(readConsent('{broken', fingerprint), null);
  assert.equal(
    readConsent(
      JSON.stringify({ ...record, categories: { ...necessaryOnly, necessary: false } }),
      fingerprint,
      150,
    ),
    null,
  );
  assert.equal(readConsent(JSON.stringify({ ...record, updatedAt: 1000 }), fingerprint, 150), null);
});
test('explicit no-consent configuration permits configured categories but never overrides a refusal', () => {
  const legal = { requireAnalyticsConsent: false, requireMarketingConsent: false };
  assert.equal(consentPermissions(null, legal).analytics, true);
  assert.equal(consentPermissions({ categories: necessaryOnly }, legal).analytics, false);
  assert.equal(consentPermissions({ categories: necessaryOnly }, legal).marketing, false);
});
