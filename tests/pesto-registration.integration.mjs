// In-memory PostgreSQL-compatible fixture only. Never reads .env or uses the deployed database/mail service.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import {
  PestoRegistrationService,
  consumePestoRegistration,
} from '../apps/api/dist/pesto/registration.service.js';
import { PestoRegistrationWorker } from '../apps/api/dist/pesto/registration.worker.js';
import { PestoRegistrationController } from '../apps/api/dist/pesto/registration.controller.js';
import { PestoTrialService } from '../apps/api/dist/pesto/trial.service.js';
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
  const settings = {
    PESTO_REGISTRATION_ENABLED: 'true',
    PESTO_REGISTRATION_EMAIL_KEY: randomBytes(32).toString('hex'),
    CORS_ORIGIN: 'https://tevoniq.example',
    TURNSTILE_MODE: 'disabled',
  };
  const config = {
    get: (key) => settings[key],
    getOrThrow: (key) => {
      if (!settings[key]) throw new Error('Missing test config');
      return settings[key];
    },
  };
  const sent = [],
    email = {
      enabled: true,
      send: async (message) => {
        sent.push(message);
      },
    };
  const service = new PestoRegistrationService(db, config, email);
  const worker = new PestoRegistrationWorker(db, config, email);
  const signup = (email = 'owner@example.test') => ({
    requestId: randomUUID(),
    installationId: randomUUID(),
    deviceHash: randomBytes(32).toString('hex').toUpperCase(),
    clientSecret: randomBytes(32).toString('hex'),
    email,
    managerName: 'Synthetic Owner',
    businessName: 'Synthetic Restaurant',
    country: 'SA',
    phone: '+905550000000',
    language: 'en',
    consent: true,
  });
  const proof = (input, code) => ({
    requestId: input.requestId,
    clientSecret: input.clientSecret,
    code,
  });
  const codeFrom = (message) => message.text.match(/code is: (\d{8})/)[1];
  const first = signup();
  assert.deepEqual(await service.register(first), {
    requestId: first.requestId,
    status: 'pending',
    canStartTrial: false,
  });
  await service.register({ ...first, email: ' OWNER@EXAMPLE.TEST ', botToken: 'fresh' });
  assert.equal(await db.pestoRegistration.count(), 1);
  assert.equal(await db.pestoCustomer.count(), 0);
  assert.equal(sent.length, 0);
  await assert.rejects(service.register({ ...first, businessName: 'Changed by public retry' }), {
    status: 409,
  });
  await worker.process();
  assert.equal(sent.length, 1);
  const code = codeFrom(sent[0]);
  let stored = await db.pestoRegistration.findUniqueOrThrow({ where: { id: first.requestId } });
  assert.equal(stored.deliveryStatus, 'SENT');
  assert.notEqual(stored.clientSecretHash, first.clientSecret);
  assert.notEqual(stored.codeHash, code);
  await worker.process();
  assert.equal(sent.length, 1);
  await assert.rejects(service.verify({ ...proof(first, code), clientSecret: 'c'.repeat(64) }), {
    status: 400,
  });
  assert.equal(
    (await db.pestoRegistration.findUniqueOrThrow({ where: { id: first.requestId } }))
      .verificationAttempts,
    0,
  );
  const verified = await service.verify(proof(first, code));
  assert.match(verified.registrationTicket, /^[a-f0-9]{64}$/);
  assert.equal(verified.canStartTrial, false);
  assert.deepEqual(
    await service.verify(proof(first, code)),
    verified,
    'Lost response retry must return same grant/expiry',
  );
  stored = await db.pestoRegistration.findUniqueOrThrow({ where: { id: first.requestId } });
  assert.notEqual(stored.ticketHash, verified.registrationTicket);
  assert.equal(await db.pestoCustomer.count(), 1);
  assert.equal(await db.cmsUser.count(), 0);
  assert.equal(await db.newsletterSubscriber.count(), 0);
  const consume = (ticket, install = first.installationId, device = first.deviceHash) =>
    db.$transaction((tx) => consumePestoRegistration(tx, ticket, install, device));
  assert.equal(await consume(verified.registrationTicket, randomUUID()), null);
  assert.equal(
    await consume(verified.registrationTicket, first.installationId, 'A'.repeat(64)),
    null,
  );
  const claims = await Promise.all([
    consume(verified.registrationTicket),
    consume(verified.registrationTicket),
  ]);
  assert.equal(claims.filter(Boolean).length, 1);
  const consumed = claims.find(Boolean);
  assert.equal(consumed.installationId, first.installationId);
  assert.equal(await consume(verified.registrationTicket), null);
  await assert.rejects(service.verify(proof(first, code)), { status: 400 });

  const again = { ...signup('OWNER@example.test'), businessName: 'Unapproved replacement' };
  await service.register(again);
  await worker.process();
  await service.verify(proof(again, codeFrom(sent.at(-1))));
  assert.equal(await db.pestoCustomer.count(), 1);
  assert.equal(
    (await db.pestoCustomer.findUniqueOrThrow({ where: { email: 'owner@example.test' } }))
      .businessName,
    first.businessName,
  );
  const wrong = signup('wrong@example.test');
  await service.register(wrong);
  await worker.process();
  const actualCode = codeFrom(sent.at(-1)),
    wrongCode = ((Number(actualCode) + 1) % 100000000).toString().padStart(8, '0');
  for (let attempt = 0; attempt < 5; attempt++)
    await assert.rejects(service.verify(proof(wrong, wrongCode)), { status: 400 });
  assert.equal(
    (await db.pestoRegistration.findUniqueOrThrow({ where: { id: wrong.requestId } }))
      .verificationAttempts,
    5,
  );
  await assert.rejects(service.verify(proof(wrong, actualCode)), { status: 400 });
  const expired = signup('expired@example.test');
  await service.register(expired);
  await db.pestoRegistration.update({
    where: { id: expired.requestId },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  const beforeExpired = sent.length;
  await worker.process();
  assert.equal(sent.length, beforeExpired);
  await assert.rejects(service.verify(proof(expired, '12345678')), { status: 400 });

  const retry = signup('retry@example.test');
  await service.register(retry);
  const attempted = [];
  await new PestoRegistrationWorker(db, config, {
    enabled: true,
    send: async (message) => {
      attempted.push(message);
      throw new Error('SECRET PROVIDER ERROR');
    },
  }).process();
  stored = await db.pestoRegistration.findUniqueOrThrow({ where: { id: retry.requestId } });
  assert.equal(stored.deliveryStatus, 'PENDING');
  assert.equal(stored.lastError, 'Verification email delivery failed');
  await db.pestoRegistration.update({
    where: { id: retry.requestId },
    data: { availableAt: new Date(0) },
  });
  await new PestoRegistrationWorker(db, config, {
    enabled: true,
    send: async (message) => {
      attempted.push(message);
    },
  }).process();
  assert.equal(attempted.length, 2);
  assert.deepEqual(attempted[0], attempted[1]);

  const concurrent = signup('concurrent@example.test');
  await service.register(concurrent);
  const beforeConcurrent = sent.length;
  await Promise.all([
    new PestoRegistrationWorker(db, config, email).process(),
    new PestoRegistrationWorker(db, config, email).process(),
  ]);
  assert.equal(sent.length, beforeConcurrent + 1, 'Only the worker owning the lease may send');
  assert.equal(
    (await db.pestoRegistration.findUniqueOrThrow({ where: { id: concurrent.requestId } }))
      .deliveryAttempts,
    1,
  );

  const bot = new LeadBotProtection(db, config);
  class RegistrationTestModule {}
  Module({
    controllers: [PestoRegistrationController],
    providers: [
      { provide: PestoRegistrationService, useValue: service },
      { provide: PestoTrialService, useValue: new PestoTrialService(db, config) },
      { provide: LeadBotProtection, useValue: bot },
      { provide: ConfigService, useValue: config },
    ],
  })(RegistrationTestModule);
  app = await NestFactory.create(RegistrationTestModule, { logger: false });
  app.useGlobalGuards(
    new CmsGuard(db, {
      read: async () => {
        throw new Error('Pesto registration entered CMS authentication');
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  await app.listen(0, '127.0.0.1');
  const origin = await app.getUrl();
  const post = (path, payload, headers = {}) =>
    fetch(origin + '/api/v1/pesto/registrations' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
  const httpSignup = signup('http@example.test');
  assert.equal((await post('', httpSignup, { Origin: 'https://untrusted.example' })).status, 403);
  const response = await post('', httpSignup, { Origin: settings.CORS_ORIGIN });
  assert.equal((await post('/trial', {})).status, 503);
  assert.equal(response.status, 202);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.json()).canStartTrial, false);
  await worker.process();
  const httpCode = codeFrom(sent.at(-1));
  const verifiedHttp = await post('/verify', proof(httpSignup, httpCode));
  assert.equal(verifiedHttp.status, 200);
  assert.equal(verifiedHttp.headers.get('cache-control'), 'no-store');
  assert.equal((await verifiedHttp.json()).canStartTrial, false);
  for (let request = 0; request < 3; request++) await post('', signup('limited@example.test'));
  assert.equal((await post('', signup('limited@example.test'))).status, 429);
  settings.PESTO_REGISTRATION_ENABLED = 'false';
  assert.equal((await post('', signup('disabled@example.test'))).status, 503);
  assert.equal(await db.pestoCustomer.count(), 2, 'Only verified customers should exist');
  console.log(
    'PASS: Pesto registration migrations, isolated HTTP routes, explicit consent, immutable/idempotent requests, separate customers, durable email retries, hashed proofs, five-attempt verification limit, ticket binding/replay, origin/rate controls and disabled-by-default behavior. No real mail, trial or license issued.',
  );
} finally {
  await app?.close();
  await db?.$disconnect();
  await socket.stop();
  await embedded.close();
}
