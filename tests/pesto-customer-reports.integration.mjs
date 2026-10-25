// Real isolated PostgreSQL migrations/queries and HTTP authorization. No .env or mail.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { randomUUID, randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { PestoCustomerReportsService } from '../apps/api/dist/pesto/customer-reports.service.js';
import { CmsPestoCustomerReportsController } from '../apps/api/dist/pesto/customer-reports.controller.js';
import { CmsGuard } from '../apps/api/dist/cms/cms.guard.js';
import { digest } from '../apps/api/dist/cms/password.js';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

const embedded = await PGlite.create();
const socket = new PGLiteSocketServer({ db: embedded, port: 0, host: '127.0.0.1' });
let db, app;
try {
  const migrations = new URL('../apps/api/prisma/migrations/', import.meta.url);
  for (const entry of (await readdir(migrations, { withFileTypes: true }))
    .filter((x) => x.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name)))
    await embedded.exec(await readFile(new URL(`${entry.name}/migration.sql`, migrations), 'utf8'));
  await socket.start();
  db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: `postgresql://postgres:postgres@${socket.getServerConn()}/postgres`,
      max: 1,
    }),
  });
  const reports = new PestoCustomerReportsService(db);
  const now = new Date(),
    day = 86400000;
  const before = new Date(now.getTime() - day),
    future = new Date(now.getTime() + day);
  const privateMarker = 'MUST-NOT-APPEAR-IN-REPORT';
  const profile = (email, extra = {}) => ({
    email,
    managerName: 'Owner',
    businessName: 'Synthetic Kitchen',
    phone: '+905550000000',
    country: 'SA',
    language: 'en',
    ...extra,
  });
  const customer = (email, extra = {}) =>
    db.pestoCustomer.create({
      data: { ...profile(email), emailVerifiedAt: now, createdAt: now, ...extra },
    });
  const registration = (email, createdAt, extra = {}) =>
    db.pestoRegistration.create({
      data: {
        id: randomUUID(),
        installationId: randomUUID(),
        deviceHash: privateMarker,
        ...profile(email),
        consentAt: createdAt,
        consentVersion: 'v1',
        inputHash: privateMarker,
        clientSecretHash: privateMarker,
        codeNonce: privateMarker,
        codeHash: privateMarker,
        expiresAt: new Date(createdAt.getTime() + 1200000),
        createdAt,
        ...extra,
      },
    });
  const trial = (customerId, expiresAt) =>
    db.pestoTrial.create({
      data: {
        id: randomUUID(),
        customerId,
        registrationId: randomUUID(),
        installationId: randomUUID(),
        deviceHash: randomBytes(32).toString('hex'),
        issuedAt: new Date(expiresAt.getTime() - 15 * day),
        expiresAt,
        envelope: privateMarker,
      },
    });
  const purchase = (customerId, reference, extra = {}) =>
    db.pestoPurchaseKey.create({
      data: {
        id: randomUUID(),
        customerId,
        reference,
        keyHash: randomBytes(32).toString('hex'),
        keyNonce: privateMarker,
        createdById: randomUUID(),
        ...extra,
      },
    });
  const license = (owner, purchaseId) =>
    db.pestoPerpetualLicense.create({
      data: {
        id: randomUUID(),
        customerId: owner.id,
        purchaseId,
        registrationId: randomUUID(),
        installationId: randomUUID(),
        deviceHash: randomBytes(32).toString('hex'),
        issuedAt: now,
        envelope: privateMarker,
      },
    });
  const pending1 = await registration('pending@example.test', new Date('2026-01-01T00:00:00Z'), {
    businessName: 'Old pending profile',
  });
  const pending2 = await registration('pending@example.test', new Date('2026-01-02T23:59:59Z'), {
    businessName: 'Latest pending profile',
    country: 'TR',
  });
  const verified = await customer('verified@example.test', { managerName: 'Verified Owner' });
  await registration(verified.email, new Date('2026-01-03T23:59:59Z'), {
    verifiedAt: now,
    customerId: verified.id,
  });
  const laterUnverified = await registration(verified.email, now, {
    businessName: 'Unverified profile must not replace verified data',
  });
  const active = await customer('active@example.test');
  await trial(active.id, before);
  await trial(active.id, future);
  const literalReference = "ORDER_%' OR 1=1 --";
  await purchase(active.id, literalReference);
  const expired = await customer('expired@example.test');
  await trial(expired.id, before);
  const licensed = await customer('licensed@example.test');
  await trial(licensed.id, future);
  const key1 = await purchase(licensed.id, 'INTERNAL-QA-1', { consumedAt: now });
  const key2 = await purchase(licensed.id, 'INTERNAL-QA-2', { consumedAt: now });
  await purchase(licensed.id, 'REVOKED-QA', { revokedAt: now });
  const license1 = await license(licensed, key1.id),
    license2 = await license(licensed, key2.id);
  await db.pestoLicenseDelivery.create({
    data: {
      licenseId: license1.id,
      status: 'SENT',
      attempts: 1,
      sentAt: now,
      lastError: privateMarker,
    },
  });
  await db.pestoLicenseDelivery.create({
    data: { licenseId: license2.id, status: 'FAILED', attempts: 5, lastError: privateMarker },
  });
  const originalCounts = await Promise.all([
    db.pestoCustomer.count(),
    db.pestoRegistration.count(),
    db.pestoPurchaseKey.count(),
    db.pestoPerpetualLicense.count(),
  ]);

  const all = await reports.list({});
  assert.equal(all.total, 5);
  assert.deepEqual(all.summary, {
    totalContacts: 5,
    verifiedCustomers: 4,
    pendingContacts: 1,
    activeTrials: 1,
    expiredTrials: 1,
    licensedCustomers: 1,
    unusedPurchaseKeys: 1,
  });
  const pendingRow = all.items.find((x) => x.email === pending1.email);
  assert.equal(pendingRow.id, pending2.id);
  assert.equal(pendingRow.registrationCount, 2);
  assert.equal(pendingRow.businessName, 'Latest pending profile');
  assert.equal(pendingRow.country, 'TR');
  assert.equal(pendingRow.registeredAt.toISOString(), '2026-01-01T00:00:00.000Z');
  const verifiedRow = all.items.find((x) => x.id === verified.id);
  assert.equal(verifiedRow.businessName, 'Synthetic Kitchen');
  assert.equal(verifiedRow.registrationCount, 2);
  const licensedRow = all.items.find((x) => x.id === licensed.id);
  assert.equal(licensedRow.status, 'licensed');
  assert.equal(licensedRow.licenseCount, 2);
  assert.equal(licensedRow.purchaseCount, 3);
  assert.equal(all.items.find((x) => x.id === active.id).trialCount, 2);
  const safe = (data) => {
    const json = JSON.stringify(data);
    assert.equal(json.includes(privateMarker), false);
    for (const field of [
      'keyHash',
      'keyNonce',
      'codeHash',
      'codeNonce',
      'clientSecretHash',
      'inputHash',
      'ticketHash',
      'deviceHash',
      'installationId',
      'envelope',
      'lastError',
    ])
      assert.equal(json.includes(`"${field}"`), false, field);
  };
  safe(all);
  for (const status of ['pending', 'verified', 'trial-active', 'trial-expired', 'licensed']) {
    const result = await reports.list({ status });
    assert.equal(result.total, 1);
    assert.equal(result.items[0].status, status);
    assert.deepEqual(result.summary, all.summary, 'Summary must remain global');
  }
  assert.equal((await reports.list({ search: 'VERIFIED OWNER' })).total, 1);
  assert.equal(
    (await reports.list({ search: literalReference })).total,
    1,
    'Search must be literal and parameterized',
  );
  assert.equal(
    (await reports.list({ search: '%' })).total,
    1,
    'Wildcard should not match every customer',
  );
  assert.equal((await reports.list({ search: 'nonexistent@example.test' })).total, 0);
  assert.equal((await reports.list({ country: 'tr' })).total, 1);
  assert.equal((await reports.list({ from: '2026-01-01', to: '2026-01-01' })).total, 1);
  assert.equal(
    (await reports.list({ from: '2026-01-03', to: '2026-01-03' })).total,
    1,
    'Inclusive UTC end day',
  );
  for (const bad of [
    { unknown: 'true' },
    { page: '0' },
    { page: '1.5' },
    { page: ['1'] },
    { page: '100001' },
    { status: 'deleted' },
    { search: 'x'.repeat(121) },
    { search: ['injected'] },
    { country: 'SAU' },
    { from: '2026-02-30' },
    { to: '2026-01-01T00:00:00Z' },
    { from: '2026-02-02', to: '2026-02-01' },
  ])
    await assert.rejects(reports.list(bad), { status: 400 });
  const detail = await reports.detail('verified', licensed.id);
  safe(detail);
  assert.equal(detail.trials.length, 1);
  assert.equal(detail.purchases.length, 3);
  assert.equal(detail.licenses.length, 2);
  assert.equal(
    detail.licenses.some((x) => x.delivery.status === 'SENT'),
    true,
  );
  assert.equal(
    detail.licenses.some((x) => x.delivery.status === 'FAILED'),
    true,
  );
  assert.equal(
    detail.purchases.some((x) => x.status === 'revoked'),
    true,
  );
  const pendingDetail = await reports.detail('pending', pending1.id);
  safe(pendingDetail);
  assert.equal(pendingDetail.customer.id, pending2.id);
  assert.equal(pendingDetail.registrations.length, 2);
  assert.equal(
    pendingDetail.trials.length + pendingDetail.purchases.length + pendingDetail.licenses.length,
    0,
    'Pending-only history isolation',
  );
  const mergedDetail = await reports.detail('pending', laterUnverified.id);
  assert.equal(
    mergedDetail.customer.id,
    verified.id,
    'Registration link should resolve existing verified customer',
  );
  await assert.rejects(reports.detail('verified', randomUUID()), { status: 404 });
  await assert.rejects(reports.detail('unknown', verified.id), { status: 400 });
  await assert.rejects(reports.detail('verified', "' OR true --"), { status: 400 });
  for (let n = 0; n < 51; n++) await registration(verified.email, new Date(now.getTime() + n));
  const bounded = await reports.detail('verified', verified.id);
  assert.equal(bounded.counts.registrations, 53);
  assert.equal(bounded.registrations.length, 50);
  assert.equal(bounded.historyLimit, 50);
  for (let n = 0; n < 21; n++) await customer(`pagination-${n}@example.test`);
  const first = await reports.list({}),
    second = await reports.list({ page: '2' });
  assert.equal(first.total, 26);
  assert.equal(first.items.length, 20);
  assert.equal(second.items.length, 6);
  assert.equal(
    new Set([...first.items, ...second.items].map((x) => x.email)).size,
    26,
    'Pagination must not duplicate contacts',
  );
  const finalCounts = await Promise.all([
    db.pestoCustomer.count(),
    db.pestoRegistration.count(),
    db.pestoPurchaseKey.count(),
    db.pestoPerpetualLicense.count(),
  ]);
  assert.deepEqual(
    finalCounts,
    [originalCounts[0] + 21, originalCounts[1] + 51, originalCounts[2], originalCounts[3]],
    'Reports must never change records',
  );

  class ReportsModule {}
  Module({
    controllers: [CmsPestoCustomerReportsController],
    providers: [{ provide: PestoCustomerReportsService, useValue: reports }],
  })(ReportsModule);
  app = await NestFactory.create(ReportsModule, { logger: false });
  app.useGlobalGuards(
    new CmsGuard(db, {
      read: async () => ({ settings: { security: { sessionIdleMinutes: 30 } } }),
    }),
  );
  app.setGlobalPrefix('api/v1');
  await app.listen(0, '127.0.0.1');
  const origin = await app.getUrl();
  const endpoint = origin + '/api/v1/cms/pesto/customers';
  assert.equal((await fetch(endpoint)).status, 401);
  assert.equal((await fetch(endpoint + '/verified/' + licensed.id)).status, 401);
  for (const role of ['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'SALES', 'VIEWER']) {
    const token = randomBytes(32).toString('hex');
    const user = await db.cmsUser.create({
      data: { email: role.toLowerCase() + '@example.test', role, passwordHash: 'no-real-password' },
    });
    await db.cmsSession.create({
      data: { tokenHash: digest(token), userId: user.id, expiresAt: new Date(Date.now() + 60000) },
    });
    for (const suffix of ['', '/verified/' + licensed.id]) {
      const response = await fetch(endpoint + suffix, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(response.status, ['ADMIN', 'SUPER_ADMIN'].includes(role) ? 200 : 403);
      if (response.ok) {
        assert.equal(response.headers.get('cache-control'), 'no-store');
        safe(await response.json());
      }
    }
  }
  console.log(
    'PASS: customer report SQL aggregation, pending-email deduplication, verified profile precedence, complete bounded histories, global summary, literal/filter/UTC dates, pagination, read-only behavior, secret exclusion and real HTTP administrator authorization. Isolated database only.',
  );
} finally {
  await app?.close();
  await db?.$disconnect();
  await socket.stop();
  await embedded.close();
}
