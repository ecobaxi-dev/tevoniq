import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newsletterSubscribeSchema, newsletterTokenSchema, newsletterUpdateSchema, hasPermission, cmsRoles } from '../packages/validation/dist/index.js';
import { subscriberCsv } from '../apps/api/dist/newsletter/newsletter.controller.js';
import { NewsletterService } from '../apps/api/dist/newsletter/newsletter.service.js';
import { NewsletterWorker } from '../apps/api/dist/newsletter/newsletter.worker.js';
test('Newsletter input requires consent and rejects privileged state and malformed tokens', () => {
  const value = { email: 'Person@example.test', consent: true };
  assert.equal(newsletterSubscribeSchema.parse(value).email, 'person@example.test');
  for (const patch of [{ consent: false }, { status: 'ACTIVE' }, { subscribedAt: new Date().toISOString() }, { language: 'xx' }, { website: 'bot' }]) assert.equal(newsletterSubscribeSchema.safeParse({ ...value, ...patch }).success, false);
  assert.equal(newsletterTokenSchema.safeParse({ token: 'a'.repeat(64) }).success, true);
  assert.equal(newsletterTokenSchema.safeParse({ token: 'short' }).success, false);
  assert.equal(newsletterUpdateSchema.safeParse({ status: 'ACTIVE', version: 1 }).success, false);
});
test('Newsletter exports are restricted to administrators and marketing', () => {
  for (const role of cmsRoles) assert.equal(hasPermission(role, 'newsletter.export'), ['SUPER_ADMIN', 'ADMIN', 'MARKETING'].includes(role));
});
test('CSV escapes quotes, preserves dates and neutralizes spreadsheet formulas', () => {
  const csv = subscriberCsv([{ email: 'test@example.test', name: ' =HYPERLINK("bad")', source: '\tformula', language: 'en', status: 'ACTIVE', subscribedAt: new Date('2026-01-01Z'), unsubscribedAt: null }]);
  assert.ok(csv.startsWith('\uFEFF"email","name"'));
  assert.ok(csv.includes('"\' =HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"\'\tformula"'));
  assert.ok(csv.includes('2026-01-01T00:00:00.000Z'));
  assert.equal(csv.includes('tokenHash'), false);
});
test('Public subscription cannot change active or bounced recipients and queues no mail for them', async () => {
  for (const status of ['ACTIVE', 'BOUNCED']) {
    const db = { $transaction: async (fn) => fn({ newsletterSubscriber: { findUnique: async () => ({ status }) } }) };
    assert.equal((await new NewsletterService(db).subscribe({ email: 'test@example.test' }, 'consent')).ok, true);
  }
});
test('Invalid unsubscribe tokens are idempotent while confirmation fails closed', async () => {
  const db = { $transaction: async (fn) => fn({ newsletterToken: { findUnique: async () => null } }) };
  const service = new NewsletterService(db);
  assert.deepEqual(await service.unsubscribe('a'.repeat(64)), { ok: true });
  await assert.rejects(service.confirm('a'.repeat(64)), { status: 400 });
});
test('Disabled delivery provider leaves confirmation jobs pending', async () => {
  let where;
  const db = { newsletterToken: { deleteMany: async () => ({ count: 0 }) }, newsletterDeliveryJob: { updateMany: async () => ({ count: 0 }), findFirst: async (q) => { where = q.where; return null; } } };
  await new NewsletterWorker(db, { confirmationEnabled: false }, {}).process();
  assert.equal(where.kind, 'SYNC');
});
