import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  siteSettingsSchema,
  publicSiteSettings,
  migrateOrganization,
  settingsOrganization,
  siteSettingsWriteSchema,
} from '../packages/validation/dist/index.js';
import { SiteSettingsService } from '../apps/api/dist/site-settings/site-settings.service.js';
import {
  PublicSiteSettingsController,
  CmsSiteSettingsController,
} from '../apps/api/dist/site-settings/site-settings.controller.js';
import { enforceEndpoint, publicEndpoints } from '../apps/api/dist/cms/permissions.js';
import { ConfigService } from '@nestjs/config';

test('settings validate languages, coordinates, analytics IDs and reject credential fields', () => {
  for (const value of [
    { localization: { defaultLanguage: 'ar', enabledLanguages: ['en'] } },
    { contact: { latitude: 99, longitude: 0 } },
    { contact: { latitude: 10 } },
    { analytics: { googleTagManager: '<script>alert(1)</script>' } },
    { email: { smtpPassword: 'secret' } },
    { security: { apiKey: 'secret' } },
    { secret: 'secret' },
    { brand: { logo: 'javascript:alert(1)' } },
  ])
    assert.equal(siteSettingsSchema.safeParse(value).success, false);
  assert.equal(
    siteSettingsSchema.safeParse({
      brand: { logo: '/brand/Hlogo.png' },
      analytics: { googleAnalytics: 'G-TEST1234' },
    }).success,
    true,
  );
  assert.equal(
    siteSettingsWriteSchema.safeParse({ version: 0, settings: {}, token: 'secret' }).success,
    false,
  );
});
test('public projection never returns internal email, security, media or arbitrary secrets', async () => {
  const settings = siteSettingsSchema.parse({
    email: {
      senderEmail: 'private@example.com',
      notificationRecipients: ['private-route@example.com'],
    },
  });
  const service = {
    read: async () => ({
      settings: { ...settings, secret: 'SECRET', SMTP_PASSWORD: 'PASSWORD' },
      version: 9,
    }),
  };
  const response = await new PublicSiteSettingsController(service).get();
  for (const key of ['email', 'security', 'media', 'secret', 'SMTP_PASSWORD'])
    assert.equal(key in response, false);
  assert.doesNotMatch(JSON.stringify(response), /private-route|private@example|SECRET|PASSWORD/);
  const admin = await new CmsSiteSettingsController(
    { read: async () => ({ settings, version: 9 }) },
    new ConfigService({ SMTP_PASSWORD: 'NEVER_RETURN', MEDIA_STORAGE: 's3' }),
  ).get({ cmsUser: { role: 'ADMIN' } });
  assert.doesNotMatch(JSON.stringify(admin), /NEVER_RETURN/);
});
test('settings endpoints enforce permissions and newsletter public configuration is allowlisted', () => {
  for (const role of ['EDITOR', 'MARKETING', 'VIEWER', 'SALES', 'HR'])
    assert.throws(
      () =>
        enforceEndpoint('CmsSiteSettingsController', 'save', {
          cmsUser: { role },
          method: 'PUT',
          body: {},
        }),
      { status: 403 },
    );
  assert.doesNotThrow(() =>
    enforceEndpoint('CmsSiteSettingsController', 'save', {
      cmsUser: { role: 'ADMIN' },
      method: 'PUT',
      body: {},
    }),
  );
  assert.deepEqual(publicEndpoints.PublicSiteSettingsController, ['get']);
  assert.ok(publicEndpoints.NewsletterController.includes('publicConfig'));
});
test('legacy company settings migrate without invented contact information', () => {
  const migrated = migrateOrganization({
    companyName: 'Real company',
    legalName: 'Real legal name',
    email: 'hello@example.com',
    socialProfiles: 'https://linkedin.com/company/real',
    footerDescriptionAr: 'وصف الشركة',
    cookiePolicyUrl: '/cookies',
  });
  assert.equal(migrated.general.siteName, 'Real company');
  assert.equal(migrated.social.linkedin, 'https://linkedin.com/company/real');
  assert.equal(migrated.general.descriptionAr, 'وصف الشركة');
  assert.equal(migrated.contact.phone, '');
  assert.equal(settingsOrganization(publicSiteSettings(migrated)).legalName, 'Real legal name');
});
test('singleton saves audit atomically and reject stale versions', async () => {
  let row = null;
  const audits = [];
  const records = {
    create: async ({ data }) => {
      if (row) throw { code: 'P2002' };
      row = { ...data, version: 1, updatedAt: new Date() };
      return row;
    },
    updateMany: async ({ where, data }) => {
      if (row?.version !== where.version) return { count: 0 };
      row = { ...row, data: data.data, version: row.version + 1 };
      return { count: 1 };
    },
    findUniqueOrThrow: async () => row,
  };
  const service = new SiteSettingsService({
    $transaction: async (fn) =>
      fn({ adminRecord: records, cmsAudit: { create: async ({ data }) => audits.push(data) } }),
  });
  const input = siteSettingsSchema.parse({});
  const saved = await service.save(input, 0, 'admin');
  assert.equal(saved.version, 1);
  assert.equal(audits.length, 1);
  assert.equal('data' in audits[0], false);
  await assert.rejects(service.save(input, 0, 'admin'), { status: 409 });
  await assert.rejects(service.save(input, 9, 'admin'), { status: 409 });
  assert.equal(audits.length, 1);
  assert.equal((await service.save(input, 1, 'admin')).version, 2);
});
