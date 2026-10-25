// Embedded PostgreSQL and ephemeral signers only. Does not load .env or send mail.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { randomBytes, randomUUID, generateKeyPairSync, verify } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { PestoRegistrationService } from '../apps/api/dist/pesto/registration.service.js';
import { verificationCode, hash } from '../apps/api/dist/pesto/registration-protocol.js';
import { PestoTrialService } from '../apps/api/dist/pesto/trial.service.js';
import { PestoPurchaseService } from '../apps/api/dist/pesto/purchase.service.js';
import { PestoLicenseDeliveryWorker } from '../apps/api/dist/pesto/license-delivery.worker.js';
import { pestoPurchaseEnvironmentSchema } from '../apps/api/dist/pesto/purchase-config.js';
import {
  CmsPestoPurchaseController,
  PublicPestoPurchaseController,
} from '../apps/api/dist/pesto/purchase.controller.js';
import { enforceEndpoint } from '../apps/api/dist/cms/permissions.js';
import { forwardPesto } from '../apps/web/src/lib/pesto-proxy-core.ts';
import { CmsGuard } from '../apps/api/dist/cms/cms.guard.js';
import { LeadBotProtection } from '../apps/api/dist/leads/bot-protection.js';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    transactionOptions: { maxWait: 10000, timeout: 10000 },
  });
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const settings = {
    PESTO_REGISTRATION_ENABLED: 'true',
    PESTO_TRIAL_ENABLED: 'true',
    PESTO_PURCHASE_ENABLED: 'true',
    PESTO_REGISTRATION_EMAIL_KEY: randomBytes(32).toString('hex'),
    PESTO_LICENSE_KEY_ID: 'synthetic-only',
    PESTO_LICENSE_PRIVATE_KEY: privateKey
      .export({ format: 'der', type: 'pkcs8' })
      .toString('base64'),
    EMAIL_TRANSPORT: 'resend',
    CORS_ORIGIN: 'https://pesto.example',
    TURNSTILE_MODE: 'disabled',
  };
  const config = {
    get: (key) => settings[key],
    getOrThrow: (key) => {
      if (!settings[key]) throw new Error();
      return settings[key];
    },
  };
  const sent = [];
  let mailFailure = false;
  const email = {
    enabled: true,
    send: async (message) => {
      if (mailFailure) throw new Error('Synthetic transport failure');
      sent.push(message);
    },
  };
  const registrations = new PestoRegistrationService(db, config, email);
  const trials = new PestoTrialService(db, config);
  const purchases = new PestoPurchaseService(db, config, email);
  const worker = new PestoLicenseDeliveryWorker(db, config, email);
  const profile = (extra = {}) => ({
    requestId: randomUUID(),
    installationId: randomUUID(),
    deviceHash: randomBytes(32).toString('hex').toUpperCase(),
    clientSecret: randomBytes(32).toString('hex'),
    email: 'owner@example.test',
    managerName: 'Owner',
    businessName: 'Synthetic restaurant',
    country: 'SA',
    phone: '+905550000000',
    language: 'ar',
    consent: true,
    ...extra,
  });
  const enroll = async (input) => {
    await registrations.register(input);
    const row = await db.pestoRegistration.findUniqueOrThrow({ where: { id: input.requestId } });
    const result = await registrations.verify({
      requestId: row.id,
      clientSecret: input.clientSecret,
      code: verificationCode(
        Buffer.from(settings.PESTO_REGISTRATION_EMAIL_KEY, 'hex'),
        row.id,
        row.codeNonce,
      ),
    });
    return {
      registrationTicket: result.registrationTicket,
      installationId: input.installationId,
      deviceHash: input.deviceHash,
    };
  };
  assert.equal(pestoPurchaseEnvironmentSchema.parse({}).PESTO_PURCHASE_ENABLED, 'false');
  assert.equal(pestoPurchaseEnvironmentSchema.safeParse(settings).success, true);
  for (const field of [
    'PESTO_REGISTRATION_EMAIL_KEY',
    'PESTO_LICENSE_PRIVATE_KEY',
    'PESTO_LICENSE_KEY_ID',
    'EMAIL_TRANSPORT',
  ])
    assert.equal(
      pestoPurchaseEnvironmentSchema.safeParse({ ...settings, [field]: undefined }).success,
      false,
    );
  const admin = new CmsPestoPurchaseController(purchases);
  const request = {
    cmsUser: { id: randomUUID(), role: 'SUPER_ADMIN' },
    method: 'POST',
    body: {},
    params: {},
  };
  assert.throws(
    () =>
      enforceEndpoint('CmsPestoPurchaseController', 'issue', {
        ...request,
        cmsUser: { ...request.cmsUser, role: 'EDITOR' },
      }),
    { status: 403 },
  );
  assert.throws(() => admin.issue({}, { cmsUser: { id: 'fake', role: 'EDITOR' } }), {
    status: 403,
  });
  const original = profile();
  const trial = await trials.issue(await enroll(original));
  const trialClaims = JSON.parse(
    Buffer.from(JSON.parse(trial.permit).payload, 'base64').toString('utf8'),
  );
  const issueInput = {
    requestId: randomUUID(),
    email: original.email,
    reference: 'Synthetic paid-order reference',
  };
  const issued = await admin.issue(issueInput, request);
  assert.match(issued.purchaseKey, /^PSTO-[A-F0-9]{64}$/);
  assert.deepEqual(
    await admin.issue(issueInput, request),
    issued,
    'Issue retry returns same purchase key',
  );
  await assert.rejects(admin.issue({ ...issueInput, reference: 'changed' }, request), {
    status: 409,
  });
  await assert.rejects(
    admin.issue(
      { ...issueInput, requestId: randomUUID(), email: 'unverified@example.test' },
      request,
    ),
    { status: 400 },
  );
  const storedPurchase = await db.pestoPurchaseKey.findUniqueOrThrow({
    where: { id: issued.purchaseId },
  });
  assert.equal(storedPurchase.keyHash, hash(issued.purchaseKey));
  assert.equal(JSON.stringify(storedPurchase).includes(issued.purchaseKey), false);
  assert.equal(storedPurchase.createdById, request.cmsUser.id);
  const nextProof = await enroll(
    profile({ installationId: original.installationId, deviceHash: original.deviceHash }),
  );
  const activationInput = { ...nextProof, purchaseKey: issued.purchaseKey };
  await assert.rejects(
    purchases.activate({ ...activationInput, purchaseKey: 'PSTO-' + 'A'.repeat(64) }),
    { status: 400 },
  );
  await assert.rejects(purchases.activate({ ...activationInput, expiresAt: '2099-01-01' }), {
    status: 400,
  });
  const wrongOwner = await enroll(profile({ email: 'other@example.test' }));
  await assert.rejects(purchases.activate({ ...wrongOwner, purchaseKey: issued.purchaseKey }), {
    status: 400,
  });
  const simultaneous = await Promise.all([
    purchases.activate(activationInput),
    purchases.activate(activationInput),
  ]);
  const activated = simultaneous[0];
  assert.deepEqual(simultaneous[1], activated);
  assert.deepEqual(Object.keys(activated).sort(), ['activationId', 'status']);
  assert.deepEqual(await purchases.activate(activationInput), activated);
  const license = await db.pestoPerpetualLicense.findUniqueOrThrow({
    where: { id: activated.activationId },
  });
  assert.equal(await db.pestoPerpetualLicense.count(), 1);
  assert.equal(await db.pestoLicenseDelivery.count(), 1);
  assert.ok(
    (await db.pestoPurchaseKey.findUniqueOrThrow({ where: { id: issued.purchaseId } })).consumedAt,
  );
  assert.equal(
    license.registrationId,
    original.requestId,
    'Trial registration pin preserved for Windows upgrade',
  );
  const envelope = JSON.parse(license.envelope),
    payload = Buffer.from(envelope.payload, 'base64');
  const claims = JSON.parse(payload.toString('utf8'));
  assert.equal(
    verify(
      'sha256',
      payload,
      { key: publicKey, dsaEncoding: 'ieee-p1363' },
      Buffer.from(envelope.signature, 'base64'),
    ),
    true,
  );
  assert.equal(claims.kind, 'perpetual');
  assert.equal(claims.expiresAtUtc, null);
  assert.equal(claims.maxUsers, 2);
  assert.equal(claims.maxConcurrentDevices, 2);
  assert.equal(claims.registrationId, trialClaims.registrationId);
  assert.equal(
    (await db.pestoTrial.findUniqueOrThrow({ where: { id: trialClaims.licenseId } })).envelope,
    trial.permit,
  );
  await Promise.all([
    worker.process(),
    new PestoLicenseDeliveryWorker(db, config, email).process(),
  ]);
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].to, [original.email]);
  assert.ok(sent[0].text.includes(license.envelope));
  assert.equal(sent[0].text.includes(issued.purchaseKey), false);
  assert.equal(
    (await db.pestoLicenseDelivery.findUniqueOrThrow({ where: { licenseId: license.id } })).status,
    'SENT',
  );
  await worker.process();
  assert.equal(sent.length, 1);
  await assert.rejects(purchases.revoke(issued.purchaseId, request.cmsUser.id), { status: 409 });
  const reinstalled = await enroll(profile({ deviceHash: original.deviceHash }));
  await assert.rejects(purchases.activate({ ...reinstalled, purchaseKey: issued.purchaseKey }), {
    status: 409,
  });
  const reinstalledRow = await db.pestoRegistration.findUniqueOrThrow({
    where: { ticketHash: hash(reinstalled.registrationTicket) },
  });
  assert.equal(
    reinstalledRow.ticketConsumedAt,
    null,
    'Failed activation rolls proof consumption back',
  );
  const other = profile({ email: 'second@example.test' });
  await enroll(other);
  const otherKey = await admin.issue(
    { requestId: randomUUID(), email: other.email, reference: 'second' },
    request,
  );
  await purchases.revoke(otherKey.purchaseId, request.cmsUser.id);
  await assert.rejects(
    purchases.activate({
      ...(await enroll(profile({ email: other.email }))),
      purchaseKey: otherKey.purchaseKey,
    }),
    { status: 400 },
  );
  const freshProof = await enroll(
    profile({ installationId: original.installationId, deviceHash: original.deviceHash }),
  );
  assert.deepEqual(
    await purchases.activate({ ...freshProof, purchaseKey: issued.purchaseKey }),
    activated,
  );
  assert.equal(
    await db.pestoLicenseDelivery.count(),
    1,
    'Recovery does not duplicate automatic mail',
  );
  const failProfile = profile({ email: 'failure@example.test' });
  const failProof = await enroll(failProfile);
  const failKey = await admin.issue(
    { requestId: randomUUID(), email: failProfile.email, reference: 'failure' },
    request,
  );
  const failLicense = await purchases.activate({ ...failProof, purchaseKey: failKey.purchaseKey });
  mailFailure = true;
  for (let i = 0; i < 5; i++) {
    await db.pestoLicenseDelivery.update({
      where: { licenseId: failLicense.activationId },
      data: { availableAt: new Date(0) },
    });
    await worker.process();
  }
  const failed = await db.pestoLicenseDelivery.findUniqueOrThrow({
    where: { licenseId: failLicense.activationId },
  });
  assert.equal(failed.attempts, 5);
  assert.equal(failed.status, 'FAILED');
  mailFailure = false;
  assert.equal(sent.length, 1);
  const failedPermit = await db.pestoPerpetualLicense.findUniqueOrThrow({
    where: { id: failLicense.activationId },
  });
  const badEnvelope = JSON.parse(failedPermit.envelope);
  const badSignature = Buffer.from(badEnvelope.signature, 'base64');
  badSignature[0] ^= 1;
  badEnvelope.signature = badSignature.toString('base64');
  await db.pestoPerpetualLicense.update({
    where: { id: failLicense.activationId },
    data: { envelope: JSON.stringify(badEnvelope) },
  });
  await db.pestoLicenseDelivery.update({
    where: { licenseId: failLicense.activationId },
    data: { status: 'PENDING', attempts: 0, availableAt: new Date(0) },
  });
  await worker.process();
  assert.equal(sent.length, 1, 'Tampered signed permit must not be emailed');
  await db.pestoLicenseDelivery.update({
    where: { licenseId: failLicense.activationId },
    data: { status: 'RUNNING', attempts: 5, claimedAt: new Date(0) },
  });
  await worker.process();
  assert.equal(
    (
      await db.pestoLicenseDelivery.findUniqueOrThrow({
        where: { licenseId: failLicense.activationId },
      })
    ).status,
    'FAILED',
  );
  assert.equal(sent.length, 1, 'Crashed fifth attempt must not loop forever');
  const expiredProof = await enroll(profile());
  await db.pestoRegistration.updateMany({
    where: { ticketHash: hash(expiredProof.registrationTicket) },
    data: { ticketExpiresAt: new Date(0) },
  });
  await assert.rejects(purchases.activate({ ...expiredProof, purchaseKey: issued.purchaseKey }), {
    status: 400,
  });
  settings.PESTO_PURCHASE_ENABLED = 'false';
  await assert.rejects(purchases.activate(activationInput), { status: 503 });
  await worker.process();
  assert.equal(sent.length, 1);
  settings.PESTO_PURCHASE_ENABLED = 'true';
  // Real HTTP controllers plus global auth/rate guard; all database state is embedded.
  class PurchaseTestModule {}
  Module({
    controllers: [CmsPestoPurchaseController, PublicPestoPurchaseController],
    providers: [
      { provide: PestoPurchaseService, useValue: purchases },
      { provide: ConfigService, useValue: config },
      { provide: LeadBotProtection, useValue: new LeadBotProtection(db, config) },
    ],
  })(PurchaseTestModule);
  app = await NestFactory.create(PurchaseTestModule, { logger: false });
  app.useGlobalGuards(
    new CmsGuard(db, {
      read: async () => {
        throw new Error('Unexpected CMS auth');
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  await app.listen(0, '127.0.0.1');
  const origin = await app.getUrl();
  const post = (path, body, headers = {}) =>
    fetch(origin + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
  assert.equal((await post('/api/v1/cms/pesto/purchases', issueInput)).status, 401);
  assert.equal(
    (
      await post('/api/v1/pesto/registrations/activate', activationInput, {
        Origin: 'https://wrong.example',
      })
    ).status,
    403,
  );
  const http = await post('/api/v1/pesto/registrations/activate', activationInput);
  assert.equal(http.status, 200);
  assert.equal(http.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await http.json(), activated);
  for (let i = 0; i < 9; i++) await post('/api/v1/pesto/registrations/activate', {});
  assert.equal((await post('/api/v1/pesto/registrations/activate', {})).status, 429);
  const proxied = await forwardPesto(
    new Request('https://pesto.example/api/pesto/registrations/activate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-ip': '192.0.2.10' },
      body: JSON.stringify(activationInput),
    }),
    'activate',
    {
      enabled: true,
      siteUrl: 'https://pesto.example',
      apiUrl: 'http://127.0.0.1:4000/api/v1',
      ipHeader: 'x-test-ip',
      proxySecret: 's'.repeat(48),
      fetch: async (url, options) => {
        assert.ok(String(url).endsWith('/activate'));
        assert.equal(JSON.parse(options.body).purchaseKey, issued.purchaseKey);
        return Response.json(activated);
      },
    },
  );
  assert.equal(proxied.status, 200);
  assert.deepEqual(await proxied.json(), activated);
  if (process.env.PESTO_DOTNET_INTEROP_PROJECT) {
    const result = execFileSync(
      'dotnet',
      ['run', '--project', process.env.PESTO_DOTNET_INTEROP_PROJECT],
      {
        input: JSON.stringify({
          publicKey: publicKey.export({ format: 'der', type: 'spki' }).toString('base64'),
          envelope: license.envelope,
          claims,
        }),
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000,
      },
    );
    assert.match(result, /PASS: Node-to-.NET/);
    console.log('PASS: Node-to-.NET perpetual permit compatibility');
  }
  console.log(
    'PASS: isolated purchase issuance, hashed keys, verified ownership, atomic consumption, trial pin upgrade, immutable retries, device transfer rejection, outbox leases/retries, controller auth/rate/proxy controls and disabled defaults. No real key, email or database used.',
  );
} finally {
  await app?.close();
  await db?.$disconnect();
  await socket.stop();
  await embedded.close();
}
