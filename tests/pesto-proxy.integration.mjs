// Public proxy -> real local API -> isolated database. No production network/mail/key use.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { randomBytes, randomUUID, generateKeyPairSync, verify } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { PestoRegistrationService } from '../apps/api/dist/pesto/registration.service.js';
import { PestoRegistrationWorker } from '../apps/api/dist/pesto/registration.worker.js';
import { PestoTrialService } from '../apps/api/dist/pesto/trial.service.js';
import { PestoRegistrationController } from '../apps/api/dist/pesto/registration.controller.js';
import { LeadBotProtection } from '../apps/api/dist/leads/bot-protection.js';
import { CmsGuard } from '../apps/api/dist/cms/cms.guard.js';
import { forwardPesto } from '../apps/web/src/lib/pesto-proxy-core.ts';
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
  });
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const settings = {
    PESTO_REGISTRATION_ENABLED: 'true',
    PESTO_TRIAL_ENABLED: 'true',
    PESTO_REGISTRATION_EMAIL_KEY: randomBytes(32).toString('hex'),
    PESTO_LICENSE_KEY_ID: 'synthetic',
    PESTO_LICENSE_PRIVATE_KEY: privateKey
      .export({ format: 'der', type: 'pkcs8' })
      .toString('base64'),
    CORS_ORIGIN: 'https://tevoniq.example',
    TURNSTILE_MODE: 'disabled',
    LEAD_PROXY_SECRET: randomBytes(32).toString('hex'),
  };
  const config = {
    get: (key) => settings[key],
    getOrThrow: (key) => {
      if (!settings[key]) throw new Error('Missing synthetic setting');
      return settings[key];
    },
  };
  const messages = [],
    email = {
      enabled: true,
      send: async (message) => {
        messages.push(message);
      },
    };
  const service = new PestoRegistrationService(db, config, email);
  const trials = new PestoTrialService(db, config);
  const worker = new PestoRegistrationWorker(db, config, email);
  class ProxyTestModule {}
  Module({
    controllers: [PestoRegistrationController],
    providers: [
      { provide: PestoRegistrationService, useValue: service },
      { provide: PestoTrialService, useValue: trials },
      { provide: LeadBotProtection, useValue: new LeadBotProtection(db, config) },
      { provide: ConfigService, useValue: config },
    ],
  })(ProxyTestModule);
  app = await NestFactory.create(ProxyTestModule, { logger: false });
  app.useGlobalGuards(
    new CmsGuard(db, {
      read: async () => {
        throw new Error('Proxy entered CMS login');
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  await app.listen(0, '127.0.0.1');
  const proxyConfig = {
    enabled: true,
    siteUrl: settings.CORS_ORIGIN,
    apiUrl: (await app.getUrl()) + '/api/v1',
    ipHeader: 'x-test-ingress-ip',
    proxySecret: settings.LEAD_PROXY_SECRET,
  };
  const post = (operation, input, extraHeaders = {}, patch = {}) =>
    forwardPesto(
      new Request(settings.CORS_ORIGIN + '/api/pesto/registrations', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-test-ingress-ip': '203.0.113.42',
          ...extraHeaders,
        },
        body: JSON.stringify(input),
      }),
      operation,
      { ...proxyConfig, ...patch },
    );
  const input = {
    requestId: randomUUID(),
    installationId: randomUUID(),
    deviceHash: randomBytes(32).toString('hex').toUpperCase(),
    clientSecret: randomBytes(32).toString('hex'),
    email: 'synthetic@example.test',
    managerName: 'Synthetic owner',
    businessName: 'Synthetic restaurant',
    country: 'SA',
    phone: '+905550000000',
    language: 'en',
    consent: true,
  };
  assert.equal((await post('register', input, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await post('register', input, {}, { enabled: false })).status, 503);
  assert.equal(await db.pestoRegistration.count(), 0);
  const registered = await post('register', input); // Native Windows host sends no browser Origin.
  assert.equal(registered.status, 202);
  assert.equal(registered.headers.get('cache-control'), 'no-store');
  assert.equal((await registered.json()).canStartTrial, false);
  assert.equal(await db.pestoCustomer.count(), 0);
  await worker.process();
  assert.equal(messages.length, 1);
  const code = messages[0].text.match(/code is: (\d{8})/)[1];
  const verified = await post('verify', {
    requestId: input.requestId,
    clientSecret: input.clientSecret,
    code,
  });
  assert.equal(verified.status, 200);
  const ticket = (await verified.json()).registrationTicket;
  const trialInput = {
    registrationTicket: ticket,
    installationId: input.installationId,
    deviceHash: input.deviceHash,
  };
  const issued = await post('trial', trialInput);
  assert.equal(issued.status, 200);
  const result = await issued.json(),
    envelope = JSON.parse(result.permit);
  assert.equal(result.status, 'trial-active');
  assert.equal(
    verify(
      'sha256',
      Buffer.from(envelope.payload, 'base64'),
      { key: publicKey, dsaEncoding: 'ieee-p1363' },
      Buffer.from(envelope.signature, 'base64'),
    ),
    true,
  );
  const claims = JSON.parse(Buffer.from(envelope.payload, 'base64').toString());
  assert.equal(claims.installationId, input.installationId);
  assert.equal(claims.deviceHash, input.deviceHash);
  assert.equal(Date.parse(claims.expiresAtUtc) - Date.parse(claims.issuedAtUtc), 15 * 86400000);
  assert.equal((await (await post('trial', trialInput)).json()).permit, result.permit);
  assert.equal((await post('trial', { ...trialInput, deviceHash: 'F'.repeat(64) })).status, 400);
  assert.equal(await db.pestoTrial.count(), 1);
  // A website challenge configuration is not bypassed by the new native-compatible proxy.
  settings.TURNSTILE_MODE = 'turnstile';
  const challengeBlocked = await post('register', { ...input, requestId: randomUUID() });
  assert.equal(challengeBlocked.status, 400);
  assert.equal(await db.pestoRegistration.count(), 1);
  assert.equal(messages.length, 1);
  settings.TURNSTILE_MODE = 'disabled';
  settings.PESTO_TRIAL_ENABLED = 'false';
  assert.equal((await post('trial', trialInput)).status, 503);
  assert.equal(await db.cmsUser.count(), 0);
  assert.equal(await db.newsletterSubscriber.count(), 0);
  console.log(
    'PASS: public proxy -> isolated HTTP API -> email proof -> signed 15-day trial, immutable retries, device binding, challenge enforcement, feature gates and separate customer records. No real emails or production enrollment.',
  );
} finally {
  await app?.close();
  await db?.$disconnect();
  await socket.stop();
  await embedded.close();
}
