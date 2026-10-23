import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHmac } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import {
  leadSubmissionSchema,
  leadSettingsSchema,
  defaultLeadSettings,
  leadUpdateSchema,
} from '../packages/validation/dist/index.js';
import { leadEnvironmentSchema } from '../apps/api/dist/leads/lead-config.js';
import { validateAttachments } from '../apps/api/dist/leads/attachments.js';
import { LeadBotProtection, submissionIp } from '../apps/api/dist/leads/bot-protection.js';
import { LeadEmailWorker } from '../apps/api/dist/email/lead-email.worker.js';
import { SmtpEmailTransport } from '../apps/api/dist/email/email-transport.js';
const contact = {
  submissionId: randomUUID(),
  type: 'contact',
  language: 'en',
  name: 'Test Person',
  company: '',
  email: 'PERSON@example.test',
  phone: '',
  country: 'Türkiye',
  subject: 'Project question',
  message: 'Hello',
  sourcePage: '/en/contact',
};
test('Lead validation sanitizes plain text, normalizes emails, enforces fields and blocks unknown properties', () => {
  const parsed = leadSubmissionSchema.parse({
    ...contact,
    name: ' <b>Test</b> ',
    message: '<script>alert(1)</script>\nQuestion',
  });
  assert.equal(parsed.name, 'Test');
  assert.equal(parsed.email, 'person@example.test');
  assert.equal(parsed.message, 'alert(1)\nQuestion');
  for (const patch of [
    { email: 'bad' },
    { subject: '' },
    { message: '<p></p>' },
    { name: ' ' },
    { company: 'a\nb' },
    { utm: { source: 'a\nb' } },
    { status: 'WON' },
    { sourcePage: 'https://evil.test/contact' },
    { phone: 'javascript:abc' },
    { preferredContactMethod: 'phone' },
  ])
    assert.equal(
      leadSubmissionSchema.safeParse({ ...contact, ...patch }).success,
      false,
      JSON.stringify(patch),
    );
  const quote = {
    ...contact,
    type: 'quote',
    sourcePage: '/ar/request-quote',
    language: 'ar',
    phone: '+90 555 555 5555',
    industry: 'Software',
    projectType: 'Website',
    timeline: 'This year',
    projectDescription: 'A customer portal',
    consent: true,
  };
  assert.equal(leadSubmissionSchema.safeParse(quote).success, true);
  for (const patch of [
    { consent: false },
    { phone: '' },
    { projectDescription: '' },
    { sourcePage: '/contact' },
    { servicesInterested: [randomUUID(), 'bad'] },
  ])
    assert.equal(leadSubmissionSchema.safeParse({ ...quote, ...patch }).success, false);
  assert.equal(leadUpdateSchema.safeParse({ status: 'open', version: 1 }).success, false);
});
test('Budgets are empty by default, explicitly configured, and unique; secrets are required only for enabled integrations', () => {
  assert.deepEqual(defaultLeadSettings.budgetRanges, []);
  assert.equal(
    leadSettingsSchema.safeParse({ ...defaultLeadSettings, notificationRecipients: ['invalid'] })
      .success,
    false,
  );
  assert.equal(
    leadSettingsSchema.safeParse({
      ...defaultLeadSettings,
      budgetRanges: [
        { value: 'a', label: 'One' },
        { value: 'a', label: 'Two' },
      ],
    }).success,
    false,
  );
  assert.equal(leadEnvironmentSchema.parse({}).EMAIL_TRANSPORT, 'disabled');
  assert.equal(leadEnvironmentSchema.safeParse({ EMAIL_TRANSPORT: 'smtp' }).success, false);
  assert.equal(leadEnvironmentSchema.safeParse({ TURNSTILE_MODE: 'turnstile' }).success, false);
});
test('Private attachments enforce count, size, file signature, and safe names', () => {
  const buffer = Buffer.from('%PDF-1.4\nfixture'),
    file = {
      buffer,
      size: buffer.length,
      mimetype: 'application/pdf',
      originalname: '../../brief<script>.pdf',
    };
  assert.equal(validateAttachments([file])[0].name, 'brief_script_.pdf');
  assert.throws(() => validateAttachments([{ ...file, mimetype: 'image/png' }]), { status: 400 });
  assert.throws(
    () => validateAttachments([{ ...file, buffer: Buffer.from('<script>bad</script>') }]),
    { status: 400 },
  );
  assert.throws(() => validateAttachments([{ ...file, size: 2097153 }]), { status: 400 });
  assert.throws(() => validateAttachments([file, file, file, file]), { status: 400 });
});
test('Client IP is trusted only with a valid proxy signature', () => {
  const secret = 's'.repeat(40),
    ip = '203.0.113.8';
  const headers = {
    'x-lead-client-ip': ip,
    'x-lead-ip-signature': createHmac('sha256', secret).update(ip).digest('hex'),
  };
  const req = { ip: '127.0.0.1', header: (key) => headers[key], socket: {} };
  assert.equal(submissionIp(req, secret), ip);
  assert.equal(submissionIp(req), '127.0.0.1');
  headers['x-lead-ip-signature'] = '0'.repeat(64);
  assert.equal(submissionIp(req, secret), '127.0.0.1');
});
test('Turnstile fails closed for missing, failed, wrong-action, and wrong-host tokens', async () => {
  const bot = new LeadBotProtection(
    {},
    new ConfigService({
      TURNSTILE_MODE: 'turnstile',
      TURNSTILE_SECRET_KEY: 'fixture',
      TURNSTILE_HOSTNAMES: 'tevoniq.test',
    }),
  );
  const original = globalThis.fetch;
  try {
    await assert.rejects(bot.verify('', 'contact', '127.0.0.1'), { status: 400 });
    for (const value of [
      { success: false },
      { success: true, hostname: 'evil.test', action: 'contact' },
      { success: true, hostname: 'tevoniq.test', action: 'quote' },
    ]) {
      globalThis.fetch = async () => Response.json(value);
      await assert.rejects(bot.verify('token', 'contact', '127.0.0.1'), { status: 400 });
    }
    globalThis.fetch = async () => {
      throw Error('offline');
    };
    await assert.rejects(bot.verify('token', 'contact', '127.0.0.1'), { status: 503 });
    globalThis.fetch = async (url, init) => {
      assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
      assert.equal(init.body.get('secret'), 'fixture');
      return Response.json({ success: true, hostname: 'tevoniq.test', action: 'contact' });
    };
    await bot.verify('token', 'contact', '127.0.0.1');
  } finally {
    globalThis.fetch = original;
  }
});
test('Database rate limits reject excess attempts without storing raw email keys', async () => {
  let attempts = 0;
  const bot = new LeadBotProtection(
    {
      leadThrottle: {
        upsert: async (args) => {
          assert.match(args.where.key, /^[a-f0-9]{64}$/);
          return { attempts: ++attempts };
        },
      },
    },
    new ConfigService({}),
  );
  for (let i = 0; i < 3; i++) await bot.rateLimit('email:fixture@example.test', 3, 3600000);
  await assert.rejects(bot.rateLimit('email:fixture@example.test', 3, 3600000), { status: 429 });
});
function workerFixture({
  fail = false,
  recipients = ['team@example.test'],
  attempts = 0,
  enabled = true,
  status = 'NEW',
} = {}) {
  const lead = {
    id: randomUUID(),
    name: 'Person',
    email: 'sender@example.test',
    language: 'en',
    type: 'quote',
    status,
    deletedAt: null,
    company: 'Example',
    sourcePage: '/en/request-quote',
  };
  const jobs = ['notification', 'confirmation'].map((kind) => ({
    id: randomUUID(),
    leadId: lead.id,
    lead,
    kind,
    attempts,
  }));
  const updates = [],
    sent = [],
    activities = [];
  const db = {
    leadThrottle: { deleteMany: async () => ({ count: 0 }) },
    lead: { findUniqueOrThrow: async () => lead },
    leadEmail: {
      findMany: async (args) => {
        if (!recipients.length) assert.equal(args.where.kind, 'confirmation');
        return jobs.filter((j) => recipients.length || j.kind === 'confirmation');
      },
      updateMany: async () => ({ count: 1 }),
      update: async (args) => {
        updates.push(args.data);
        return {};
      },
    },
    leadActivity: {
      create: async (args) => {
        activities.push(args.data);
        return {};
      },
    },
    $transaction: async (ops) => Promise.all(ops),
  };
  const worker = new LeadEmailWorker(
    db,
    {
      enabled,
      send: async (message) => {
        if (fail) throw Error('secret provider detail');
        sent.push(message);
      },
    },
    { get: async () => ({ notificationRecipients: recipients }) },
    new ConfigService({ CORS_ORIGIN: 'https://tevoniq.test' }),
  );
  return { worker, sent, updates, activities };
}
test('Email abstraction sends both messages through a fake adapter and records delivery', async () => {
  const f = workerFixture();
  await f.worker.flush();
  assert.equal(f.sent.length, 2);
  assert.deepEqual(f.sent[0].to, ['team@example.test']);
  assert.deepEqual(f.sent[1].to, ['sender@example.test']);
  assert.ok(f.sent[1].html.includes('What happens next?'));
  assert.ok(f.sent[1].text.includes('Reference:'));
  assert.equal(f.sent[1].replyTo, 'team@example.test');
  assert.equal(
    f.updates.every((u) => u.status === 'sent'),
    true,
  );
  assert.equal(f.activities.length, 2);
  const noRecipients = workerFixture({ recipients: [] });
  await noRecipients.worker.flush();
  assert.equal(noRecipients.sent.length, 1);
  const disabled = workerFixture({ enabled: false });
  await disabled.worker.flush();
  assert.equal(disabled.sent.length, 0);
  await assert.rejects(new SmtpEmailTransport(new ConfigService({})).send({}), /not configured/);
});
test('Email failure retries safely, stops after five attempts, and spam cancels delivery', async () => {
  const retry = workerFixture({ fail: true });
  await retry.worker.flush();
  assert.equal(retry.updates[0].status, 'pending');
  assert.ok(retry.updates[0].nextAttemptAt > new Date());
  assert.ok(!retry.updates[0].lastError.includes('secret'));
  const terminal = workerFixture({ fail: true, attempts: 4 });
  await terminal.worker.flush();
  assert.equal(terminal.updates[0].status, 'failed');
  const spam = workerFixture({ status: 'SPAM' });
  await spam.worker.flush();
  assert.equal(spam.sent.length, 0);
  assert.equal(spam.updates[0].status, 'cancelled');
});
