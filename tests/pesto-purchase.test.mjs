import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, randomBytes, randomUUID, verify } from 'node:crypto';
import { purchaseActivationInputSchema, purchaseIssueInputSchema } from '@tevoniq/validation';
import { purchaseKey } from '../apps/api/dist/pesto/purchase.service.js';
import { signPerpetual } from '../apps/api/dist/pesto/trial-signing.js';
import { licenseMessage } from '../apps/api/dist/pesto/license-message.js';
import { pestoPurchaseEnvironmentSchema } from '../apps/api/dist/pesto/purchase-config.js';
test('purchase keys use high-entropy purpose-separated derivation and strict input', () => {
  const secret = randomBytes(32),
    id = randomUUID(),
    nonce = randomBytes(32).toString('hex');
  const key = purchaseKey(secret, id, nonce);
  assert.match(key, /^PSTO-[A-F0-9]{64}$/);
  assert.equal(purchaseKey(secret, id, nonce), key);
  assert.notEqual(purchaseKey(secret, randomUUID(), nonce), key);
  assert.notEqual(purchaseKey(randomBytes(32), id, nonce), key);
  const input = {
    registrationTicket: 'a'.repeat(64),
    installationId: randomUUID(),
    deviceHash: 'A'.repeat(64),
    purchaseKey: key.toLowerCase(),
  };
  assert.equal(purchaseActivationInputSchema.parse(input).purchaseKey, key);
  for (const changed of [
    { purchaseKey: 'bad' },
    { email: 'other@example.test' },
    { maxUsers: 10 },
    { expiresAt: null },
  ])
    assert.equal(purchaseActivationInputSchema.safeParse({ ...input, ...changed }).success, false);
  assert.equal(
    purchaseIssueInputSchema.safeParse({
      requestId: randomUUID(),
      email: 'owner@example.test',
      reference: 'paid',
      createdById: 'forged',
    }).success,
    false,
  );
  assert.equal(pestoPurchaseEnvironmentSchema.parse({}).PESTO_PURCHASE_ENABLED, 'false');
});
test('perpetual signing preserves v1 offline contract and excludes email/purchase key', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const signed = JSON.parse(
    signPerpetual(privateKey, 'synthetic', {
      licenseId: randomUUID(),
      registrationId: randomUUID(),
      installationId: randomUUID(),
      deviceHash: 'A'.repeat(64),
      issuedAt: new Date(),
    }),
  );
  const payload = Buffer.from(signed.payload, 'base64'),
    claims = JSON.parse(payload);
  assert.equal(
    verify(
      'sha256',
      payload,
      { key: publicKey, dsaEncoding: 'ieee-p1363' },
      Buffer.from(signed.signature, 'base64'),
    ),
    true,
  );
  assert.equal(claims.kind, 'perpetual');
  assert.equal(claims.expiresAtUtc, null);
  assert.equal(claims.maxUsers, 2);
  assert.equal(claims.maxConcurrentDevices, 2);
  assert.equal('email' in claims, false);
  assert.equal('purchaseKey' in claims, false);
});
for (const lang of ['ar', 'en', 'tr'])
  test(`operating mail ${lang} preserves permit and escapes dynamic markup`, () => {
    const permit = '<test>"&';
    const message = licenseMessage(lang, permit, '<ref>');
    assert.ok(message.text.includes(permit));
    assert.ok(message.html.includes('&lt;test&gt;&quot;&amp;'));
    assert.ok(message.html.includes('TEVONIQ'));
    assert.ok(message.html.includes('dir="ltr"'));
    assert.ok(message.html.includes('table-layout:fixed'));
    assert.doesNotMatch(message.html, /<script|<form|<img|<ref>/);
  });
