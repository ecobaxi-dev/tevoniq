import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeRequestLog, safeErrorLog } from '../apps/api/dist/security/logging.js';
import { SafeExceptionFilter } from '../apps/api/dist/security/exception-filter.js';
import { scanAttachments, validateAttachments } from '../apps/api/dist/leads/attachments.js';
import { LocalStorageProvider } from '../apps/api/dist/media/storage.js';
import { enforceEndpoint } from '../apps/api/dist/cms/permissions.js';

test('Request logs exclude query PII, headers and error secrets', () => {
  const result = safeRequestLog({
    id: 1,
    method: 'GET',
    url: '/api/v1/search?q=private-email&token=secret',
    headers: { authorization: 'Bearer secret' },
    body: { password: 'secret' },
    remoteAddress: 'private',
  });
  assert.deepEqual(result, { id: 1, method: 'GET', url: '/api/v1/search' });
  assert.deepEqual(safeErrorLog(new Error('postgres://secret')), {
    type: 'Error',
    message: 'Request failed',
  });
});
test('Unexpected failures do not return ORM diagnostics or connection credentials', () => {
  let status, payload;
  const response = {
    status(value) {
      status = value;
      return this;
    },
    json(value) {
      payload = value;
    },
  };
  new SafeExceptionFilter().catch(new Error('postgres://password@host with private row values'), {
    switchToHttp: () => ({ getResponse: () => response }),
  });
  assert.equal(status, 500);
  assert.deepEqual(payload, { statusCode: 500, message: 'Service temporarily unavailable' });
});
test('Production lead attachments fail closed without a scanner or with an invalid scanner port', async () => {
  const files = [{ bytes: new Uint8Array([1, 2]) }];
  await assert.rejects(
    scanAttachments(files, { get: (key) => (key === 'NODE_ENV' ? 'production' : undefined) }),
    { status: 503 },
  );
  await assert.rejects(
    scanAttachments(files, {
      get: (key) =>
        key === 'CV_CLAMAV_HOST' ? 'scanner' : key === 'CV_CLAMAV_PORT' ? -1 : 'production',
    }),
    { status: 503 },
  );
  await scanAttachments([], { get: () => 'production' });
  await scanAttachments(files, { get: () => undefined });
  assert.throws(
    () =>
      validateAttachments([
        {
          size: 1,
          buffer: Buffer.from('%PDF-longer'),
          mimetype: 'application/pdf',
          originalname: 'a.pdf',
        },
      ]),
    { status: 400 },
  );
});
test('Storage rejects traversal and unknown endpoints remain denied even for super administrators', async () => {
  const storage = new LocalStorageProvider('.data/media');
  for (const key of ['../.env', '/etc/passwd', 'a/../../.env', 'a\\..\\.env'])
    await assert.rejects(async () => storage.get(key));
  assert.throws(
    () =>
      enforceEndpoint('UnknownController', 'read', {
        cmsUser: { role: 'SUPER_ADMIN' },
        method: 'GET',
      }),
    { status: 403 },
  );
});

test('Media usage summaries respect business-record permissions while archive checks retain all references', async () => {
  const { mediaUsage } = await import('../apps/api/dist/media/usage.js');
  const id = '11111111-1111-4111-8111-111111111111';
  const empty = { findMany: async () => [] };
  const db = Object.fromEntries(
    [
      'insightArticle',
      'companyPage',
      'cmsPage',
      'serviceTranslation',
      'solutionTranslation',
      'industryTranslation',
      'projectTranslation',
    ].map((key) => [key, empty]),
  );
  db.adminRecord = {
    findMany: async () => [
      {
        id: 'private',
        module: 'leads',
        title: 'Private customer',
        data: { image: `/media/${id}/original.png` },
      },
    ],
  };
  assert.deepEqual(await mediaUsage(db, id, 'VIEWER'), []);
  assert.equal((await mediaUsage(db, id, 'SALES')).length, 1);
  assert.equal((await mediaUsage(db, id)).length, 1);
});
test('Production public origins require HTTPS and reject credential-bearing URLs', async () => {
  const { webEnvironmentSchema } = await import('../packages/validation/dist/index.js');
  for (const SITE_URL of [
    'http://example.com',
    'https://user:password@example.com',
    'https://example.com/path',
    'https://example.com?token=secret',
  ])
    assert.equal(
      webEnvironmentSchema.safeParse({ NODE_ENV: 'production', SITE_URL }).success,
      false,
    );
  assert.equal(
    webEnvironmentSchema.safeParse({ NODE_ENV: 'production', SITE_URL: 'https://example.com' })
      .success,
    true,
  );
});

test('Authorization rejects excessive request nesting without a recursive stack overflow', () => {
  let body = {};
  for (let i = 0; i < 40; i++) body = { nested: body };
  assert.throws(
    () =>
      enforceEndpoint('PageBuilderController', 'update', {
        cmsUser: { role: 'EDITOR' },
        method: 'PUT',
        body,
      }),
    { status: 400 },
  );
  assert.throws(
    () =>
      enforceEndpoint('PageBuilderController', 'update', {
        cmsUser: { role: 'EDITOR' },
        method: 'PUT',
        body: { document: { action: 'publish' } },
      }),
    { status: 403 },
  );
});
