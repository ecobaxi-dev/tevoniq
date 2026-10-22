import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { serviceWriteSchema } from '../packages/validation/dist/index.js';
import { CmsGuard, CmsAdminGuard } from '../apps/api/dist/cms/cms.guard.js';
import { hashPassword, verifyPassword, digest } from '../apps/api/dist/cms/password.js';
import {
  ServicesController,
  CmsServicesController,
} from '../apps/api/dist/services/services.controller.js';
import { initialServiceNames, categorySlug } from '../apps/api/prisma/service-catalog.ts';
const draft = () => ({
  slug: 'development-fixture',
  active: false,
  version: 0,
  translations: [
    {
      locale: 'en',
      title: 'Development fixture',
      summary: '',
      published: false,
      seoTitle: '',
      seoDescription: '',
      blocks: [],
    },
  ],
});
test('catalog seeds all 35 requested categories without slug collisions', () => {
  assert.equal(initialServiceNames.length, 35);
  assert.equal(new Set(initialServiceNames.map(categorySlug)).size, 35);
});
test('publication validates metadata, hero ordering, unique locales and safe block destinations', () => {
  const value = draft();
  assert.equal(serviceWriteSchema.safeParse(value).success, true);
  value.active = true;
  assert.equal(serviceWriteSchema.safeParse(value).success, true);
  value.translations[0].published = true;
  assert.equal(serviceWriteSchema.safeParse(value).success, false);
  Object.assign(value.translations[0], {
    summary: 'Development only',
    seoTitle: 'Development only',
    seoDescription: 'Development only',
    blocks: [
      {
        id: randomUUID(),
        type: 'hero',
        title: 'Development only',
        description: '',
        assetKey: 'none',
      },
    ],
  });
  assert.equal(serviceWriteSchema.safeParse(value).success, true);
  value.translations[0].blocks.push({
    id: randomUUID(),
    type: 'cta',
    title: 'Test',
    body: '',
    label: 'Test',
    href: 'javascript:alert(1)',
  });
  assert.equal(serviceWriteSchema.safeParse(value).success, false);
  value.translations[0].blocks.pop();
  value.translations.push({ ...value.translations[0] });
  assert.equal(serviceWriteSchema.safeParse(value).success, false);
});
test('password hashing uses unique salts and verifies without accepting an incorrect password', async () => {
  const one = await hashPassword('Development-only-long-password');
  const two = await hashPassword('Development-only-long-password');
  assert.notEqual(one, two);
  assert.equal(await verifyPassword('Development-only-long-password', one), true);
  assert.equal(await verifyPassword('wrong', one), false);
});
test('CMS rejects anonymous, expired and disabled sessions; editors cannot mutate', async () => {
  const request = { headers: {}, method: 'GET' };
  let handler = 'list';
  const context = {
    getClass: () => ({ name: 'CmsServicesController' }),
    getHandler: () => ({ name: handler }),
    switchToHttp: () => ({ getRequest: () => request }),
  };
  let session;
  const guard = new CmsGuard(
    {
      cmsSession: {
        findUnique: async ({ where }) => {
          assert.equal(where.tokenHash, digest('a'.repeat(64)));
          return session;
        },
        updateMany: async () => ({ count: 1 }),
      },
    },
    { read: async () => ({ settings: { security: { sessionIdleMinutes: 30 } } }) },
  );
  await assert.rejects(
    () => guard.canActivate(context),
    (error) => error.getStatus() === 401,
  );
  request.headers.authorization = 'Bearer ' + 'a'.repeat(64);
  session = { expiresAt: new Date(0), user: { id: 'test', role: 'ADMIN', disabled: false } };
  await assert.rejects(
    () => guard.canActivate(context),
    (error) => error.getStatus() === 401,
  );
  session = {
    expiresAt: new Date(Date.now() + 10000),
    user: { id: 'test', role: 'ADMIN', disabled: true },
  };
  await assert.rejects(
    () => guard.canActivate(context),
    (error) => error.getStatus() === 401,
  );
  session.user.disabled = false;
  session.user.role = 'EDITOR';
  session.lastSeenAt = new Date();
  session.authVersion = 0;
  session.user.authVersion = 0;
  assert.equal(await guard.canActivate(context), true);
  handler = 'update';
  request.method = 'PUT';
  assert.throws(
    () => new CmsAdminGuard().canActivate(context),
    (error) => error.getStatus() === 403,
  );
  request.cmsUser.role = 'ADMIN';
  assert.equal(new CmsAdminGuard().canActivate(context), true);
});
test('public list enforces activation, locale and publication in the database query', async () => {
  const db = {
    service: {
      findMany: async ({ where, skip, take }) => {
        assert.equal(where.active, true);
        assert.equal(where.translations.some.locale, 'ar');
        assert.equal(where.translations.some.published, true);
        assert.equal(skip, 12);
        assert.equal(take, 12);
        return [];
      },
      count: async () => 0,
    },
    $transaction: async (promises) => Promise.all(promises),
  };
  const result = await new ServicesController(db).list({ locale: 'ar', page: '2' });
  assert.deepEqual(result.items, []);
  await assert.rejects(
    () => new ServicesController(db).list({ limit: '1000' }),
    (error) => error.getStatus() === 400,
  );
});
test('inactive and untranslated service detail requests return 404', async () => {
  const controller = new ServicesController({
    service: {
      findFirst: async ({ where, include }) => {
        assert.equal(where.active, true);
        assert.equal(include.translations.where.published, true);
        return { id: randomUUID(), translations: [] };
      },
    },
  });
  await assert.rejects(
    () => controller.detail('development-fixture', { locale: 'tr' }),
    (error) => error.getStatus() === 404,
  );
});
test('stale CMS saves fail before changing translations or adding audit records', async () => {
  const db = {
    $transaction: async (fn) =>
      fn({ service: { findUnique: async () => null, updateMany: async () => ({ count: 0 }) } }),
  };
  await assert.rejects(
    () => new CmsServicesController(db).update(randomUUID(), draft(), { cmsUser: { id: 'test' } }),
    (error) => error.getStatus() === 409,
  );
});
