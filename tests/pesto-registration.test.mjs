import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import {
  registrationInputSchema,
  verificationInputSchema,
  verificationCode,
  codeDigest,
  equalDigest,
  hash,
  inputDigest,
  registrationTicket,
  verificationMessage,
} from '../apps/api/dist/pesto/registration-protocol.js';
import { pestoRegistrationEnvironmentSchema } from '../apps/api/dist/pesto/registration-config.js';
import { PestoRegistrationService } from '../apps/api/dist/pesto/registration.service.js';
import { PestoRegistrationWorker } from '../apps/api/dist/pesto/registration.worker.js';
import { publicEndpoints } from '../apps/api/dist/cms/permissions.js';

const key = randomBytes(32);
const input = {
  requestId: randomUUID(),
  installationId: randomUUID(),
  deviceHash: 'A'.repeat(64),
  clientSecret: 'b'.repeat(64),
  email: ' Person@Example.test ',
  managerName: 'Test Owner',
  businessName: 'Test Restaurant',
  country: 'sa',
  phone: '+905550000000',
  language: 'ar',
  consent: true,
};
test('registration validates and normalizes explicit consent and device-bound client requests', () => {
  const parsed = registrationInputSchema.parse(input);
  assert.equal(parsed.email, 'person@example.test');
  assert.equal(parsed.country, 'SA');
  for (const changed of [
    { consent: false },
    { clientSecret: 'short' },
    { deviceHash: 'not-a-hash' },
    { country: 'invalid' },
    { email: 'a@example.test\r\nBcc:other@example.test' },
    { managerName: 'bad\nname' },
    { phone: '((((((((' },
    { unknown: 'value' },
  ])
    assert.equal(registrationInputSchema.safeParse({ ...input, ...changed }).success, false);
  assert.equal(inputDigest(parsed), inputDigest({ ...parsed, botToken: 'new-challenge' }));
  assert.notEqual(inputDigest(parsed), inputDigest({ ...parsed, installationId: randomUUID() }));
  assert.equal(
    verificationInputSchema.safeParse({
      requestId: input.requestId,
      clientSecret: input.clientSecret,
      code: '12345678',
    }).success,
    true,
  );
  assert.equal(
    verificationInputSchema.safeParse({
      requestId: input.requestId,
      clientSecret: input.clientSecret,
      code: '1234',
    }).success,
    false,
  );
});
test('email proof, client challenge and registration ticket are purpose-separated and not stored raw', () => {
  const nonce = randomBytes(32).toString('hex'),
    code = verificationCode(key, input.requestId, nonce);
  assert.match(code, /^\d{8}$/);
  assert.equal(code, verificationCode(key, input.requestId, nonce));
  assert.notEqual(codeDigest(key, input.requestId, code), code);
  assert.equal(
    equalDigest(codeDigest(key, input.requestId, code), codeDigest(key, randomUUID(), code)),
    false,
  );
  const ticket = registrationTicket(key, input.requestId, nonce, hash(input.clientSecret));
  assert.match(ticket, /^[a-f0-9]{64}$/);
  assert.notEqual(ticket, hash(ticket));
  assert.notEqual(ticket, registrationTicket(key, input.requestId, nonce, hash('other-client')));
  assert.equal(equalDigest('', ''), false);
  for (const locale of ['en', 'ar', 'tr']) {
    const email = verificationMessage(locale, code, input.requestId);
    assert.ok(email.text.includes(code));
    assert.ok(email.text.includes(input.requestId));
    assert.equal(JSON.stringify(email).includes(input.clientSecret), false);
    assert.equal(JSON.stringify(email).includes(key.toString('hex')), false);
  }
});
test('registration is disabled by default and requires separate email key and delivery configuration', async () => {
  assert.equal(pestoRegistrationEnvironmentSchema.parse({}).PESTO_REGISTRATION_ENABLED, 'false');
  assert.equal(
    pestoRegistrationEnvironmentSchema.safeParse({ PESTO_REGISTRATION_ENABLED: 'true' }).success,
    false,
  );
  assert.equal(
    pestoRegistrationEnvironmentSchema.safeParse({
      PESTO_REGISTRATION_ENABLED: 'true',
      EMAIL_TRANSPORT: 'resend',
      PESTO_REGISTRATION_EMAIL_KEY: key.toString('hex'),
    }).success,
    true,
  );
  const config = { get: () => undefined };
  const db = new Proxy(
    {},
    {
      get() {
        throw new Error('Disabled registration touched database');
      },
    },
  );
  const email = {
    enabled: true,
    send() {
      throw new Error('Real email attempted');
    },
  };
  const service = new PestoRegistrationService(db, config, email);
  await assert.rejects(service.register(input), { status: 503 });
  await assert.rejects(service.verify({}), { status: 503 });
  await new PestoRegistrationWorker(db, config, email).process();
  assert.deepEqual(publicEndpoints.PestoRegistrationController, ['register', 'verify']);
});
