// Isolated database and ephemeral signing key. Never loads .env or sends email.
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
import { verificationCode } from '../apps/api/dist/pesto/registration-protocol.js';
import { PestoTrialService } from '../apps/api/dist/pesto/trial.service.js';
import { pestoTrialEnvironmentSchema, signTrial } from '../apps/api/dist/pesto/trial-signing.js';
import { PestoRegistrationController } from '../apps/api/dist/pesto/registration.controller.js';
import { LeadBotProtection } from '../apps/api/dist/leads/bot-protection.js';
import { CmsGuard } from '../apps/api/dist/cms/cms.guard.js';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

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
    PESTO_REGISTRATION_EMAIL_KEY: randomBytes(32).toString('hex'),
    PESTO_LICENSE_KEY_ID: 'synthetic-only',
    PESTO_LICENSE_PRIVATE_KEY: privateKey
      .export({ format: 'der', type: 'pkcs8' })
      .toString('base64'),
    CORS_ORIGIN: 'https://tevoniq.example',
    TURNSTILE_MODE: 'disabled',
  };
  const config = {
    get: (key) => settings[key],
    getOrThrow: (key) => {
      if (!settings[key]) throw new Error('Missing synthetic config');
      return settings[key];
    },
  };
  assert.equal(pestoTrialEnvironmentSchema.parse({}).PESTO_TRIAL_ENABLED, 'false');
  assert.equal(pestoTrialEnvironmentSchema.safeParse(settings).success, true);
  assert.equal(
    pestoTrialEnvironmentSchema.safeParse({ ...settings, PESTO_LICENSE_PRIVATE_KEY: 'invalid' })
      .success,
    false,
  );
  const otherKey = generateKeyPairSync('ec', { namedCurve: 'secp384r1' }).privateKey;
  assert.equal(
    pestoTrialEnvironmentSchema.safeParse({
      ...settings,
      PESTO_LICENSE_PRIVATE_KEY: otherKey
        .export({ format: 'der', type: 'pkcs8' })
        .toString('base64'),
    }).success,
    false,
  );
  const service = new PestoRegistrationService(db, config, { enabled: true });
  const trials = new PestoTrialService(db, config);
  const signup = (extra = {}) => ({
    requestId: randomUUID(),
    installationId: randomUUID(),
    deviceHash: randomBytes(32).toString('hex').toUpperCase(),
    clientSecret: randomBytes(32).toString('hex'),
    email: 'synthetic-owner@example.test',
    managerName: 'Test',
    businessName: 'Test',
    country: 'SA',
    phone: '+905550000000',
    language: 'en',
    consent: true,
    ...extra,
  });
  const enroll = async (input) => {
    await service.register(input);
    const row = await db.pestoRegistration.findUniqueOrThrow({ where: { id: input.requestId } });
    const code = verificationCode(
      Buffer.from(settings.PESTO_REGISTRATION_EMAIL_KEY, 'hex'),
      row.id,
      row.codeNonce,
    );
    const result = await service.verify({
      requestId: row.id,
      clientSecret: input.clientSecret,
      code,
    });
    return {
      registrationTicket: result.registrationTicket,
      installationId: input.installationId,
      deviceHash: input.deviceHash,
    };
  };
  const input = signup(),
    proof = await enroll(input);
  await assert.rejects(trials.issue({ ...proof, expiresAt: '2099-01-01' }), { status: 400 });
  await assert.rejects(trials.issue({ ...proof, deviceHash: 'A'.repeat(64) }), { status: 400 });
  const first = await trials.issue(proof);
  assert.equal(first.status, 'trial-active');
  const envelope = JSON.parse(first.permit),
    payloadBytes = Buffer.from(envelope.payload, 'base64');
  assert.equal(Buffer.from(envelope.signature, 'base64').length, 64);
  assert.equal(
    verify(
      'sha256',
      payloadBytes,
      { key: publicKey, dsaEncoding: 'ieee-p1363' },
      Buffer.from(envelope.signature, 'base64'),
    ),
    true,
  );
  const claims = JSON.parse(payloadBytes.toString('utf8'));
  assert.equal(Date.parse(claims.expiresAtUtc) - Date.parse(claims.issuedAtUtc), 15 * 86400000);
  assert.equal(claims.registrationId, input.requestId);
  assert.equal(claims.maxUsers, 2);
  assert.equal(claims.maxConcurrentDevices, 2);
  assert.equal(first.permit.includes(input.email), false);
  assert.deepEqual(
    await trials.issue(proof),
    first,
    'Lost-response retry must preserve exact signed bytes',
  );
  const repeatProof = await enroll(
    signup({ installationId: input.installationId, deviceHash: input.deviceHash }),
  );
  assert.deepEqual(
    await trials.issue(repeatProof),
    first,
    'New verified registration cannot restart trial',
  );
  const reinstall = await enroll(signup({ deviceHash: input.deviceHash }));
  await assert.rejects(trials.issue(reinstall), { status: 409 });
  const changedDevice = await enroll(signup({ installationId: input.installationId }));
  await assert.rejects(trials.issue(changedDevice), { status: 409 });
  const changedOwner = await enroll(
    signup({
      email: 'different@example.test',
      installationId: input.installationId,
      deviceHash: input.deviceHash,
    }),
  );
  await assert.rejects(trials.issue(changedOwner), { status: 409 });
  for (const rejected of [reinstall, changedDevice, changedOwner]) {
    const row = await db.pestoRegistration.findUniqueOrThrow({
      where: {
        ticketHash: (await import('../apps/api/dist/pesto/registration-protocol.js')).hash(
          rejected.registrationTicket,
        ),
      },
    });
    assert.equal(row.ticketConsumedAt, null, 'Failed issuance must roll back ticket consumption');
  }
  const concurrentProof = await enroll(signup());
  const outcomes = await Promise.allSettled([
    trials.issue(concurrentProof),
    trials.issue(concurrentProof),
  ]);
  assert.ok(outcomes.some((r) => r.status === 'fulfilled'));
  for (const outcome of outcomes)
    if (outcome.status === 'rejected') assert.equal(outcome.reason.status, 409);
  assert.equal(await db.pestoTrial.count(), 2);
  const replay = await trials.issue(concurrentProof);
  for (const outcome of outcomes)
    if (outcome.status === 'fulfilled') assert.deepEqual(outcome.value, replay);

  // Change only the synthetic DB clock fixture, preserving the database duration constraint.
  const oldIssued = new Date(Date.now() - 16 * 86400000);
  const oldExpiry = new Date(oldIssued.getTime() + 15 * 86400000);
  const expiredEnvelope = signTrial(privateKey, settings.PESTO_LICENSE_KEY_ID, {
    licenseId: claims.licenseId,
    registrationId: claims.registrationId,
    installationId: input.installationId,
    deviceHash: input.deviceHash,
    issuedAt: oldIssued,
    expiresAt: oldExpiry,
  });
  await db.pestoTrial.update({
    where: { installationId: input.installationId },
    data: {
      issuedAt: oldIssued,
      expiresAt: oldExpiry,
      envelope: expiredEnvelope,
    },
  });
  const expired = await trials.issue(
    await enroll(signup({ installationId: input.installationId, deviceHash: input.deviceHash })),
  );
  assert.equal(expired.status, 'expired');
  assert.equal(expired.permit, expiredEnvelope, 'Even expiry recovery never signs a new duration');
  const expiryProof = await enroll(signup());
  await db.pestoRegistration.updateMany({
    where: {
      ticketHash: (await import('../apps/api/dist/pesto/registration-protocol.js')).hash(
        expiryProof.registrationTicket,
      ),
    },
    data: { ticketExpiresAt: new Date(0) },
  });
  await assert.rejects(trials.issue(expiryProof), { status: 400 });
  await db.pestoTrialGrant.updateMany({ data: { retryUntil: new Date(0) } });
  await assert.rejects(trials.issue(proof), { status: 400 });
  settings.PESTO_TRIAL_ENABLED = 'false';
  await assert.rejects(trials.issue(proof), { status: 503 });
  settings.PESTO_TRIAL_ENABLED = 'true';

  class TrialTestModule {}
  Module({
    controllers: [PestoRegistrationController],
    providers: [
      { provide: PestoRegistrationService, useValue: service },
      { provide: PestoTrialService, useValue: trials },
      { provide: ConfigService, useValue: config },
      { provide: LeadBotProtection, useValue: new LeadBotProtection(db, config) },
    ],
  })(TrialTestModule);
  app = await NestFactory.create(TrialTestModule, { logger: false });
  app.useGlobalGuards(
    new CmsGuard(db, {
      read: async () => {
        throw new Error('Unexpected CMS auth');
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  await app.listen(0, '127.0.0.1');
  const origin = await app.getUrl(),
    httpProof = await enroll(signup());
  const post = (body, headers = {}) =>
    fetch(origin + '/api/v1/pesto/registrations/trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
  assert.equal((await post(httpProof, { Origin: 'https://untrusted.example' })).status, 403);
  const response = await post(httpProof);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.json()).status, 'trial-active');
  for (let i = 0; i < 19; i++) await post({});
  assert.equal((await post({})).status, 429);

  // Optional interop check: only PUBLIC synthetic fixture crosses into .NET.
  if (process.env.PESTO_DOTNET_INTEROP_PROJECT) {
    const fixture = {
      publicKey: publicKey.export({ format: 'der', type: 'spki' }).toString('base64'),
      envelope: first.permit,
      claims,
    };
    const output = execFileSync(
      'dotnet',
      ['run', '--project', process.env.PESTO_DOTNET_INTEROP_PROJECT],
      {
        input: JSON.stringify(fixture),
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000,
      },
    );
    assert.match(output, /PASS: Node-to-.NET/);
    console.log('PASS: Node-to-.NET signed trial interoperability');
  }
  console.log(
    'PASS: isolated trial issuance, exact 15 days, signature, atomic proof consumption, immutable recovery, reinstall/device/owner rejection, expiry, concurrency, HTTP/rate controls and disabled configuration. No production keys or trials created.',
  );
} finally {
  await app?.close();
  await db?.$disconnect();
  await socket.stop();
  await embedded.close();
}
