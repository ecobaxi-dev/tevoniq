import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '@nestjs/config';
import { ResendEmailTransport } from '../apps/api/dist/email/email-transport.js';
import { leadEnvironmentSchema } from '../apps/api/dist/leads/lead-config.js';

test('Resend requires credentials and a sender', () => {
  assert.equal(leadEnvironmentSchema.safeParse({ EMAIL_TRANSPORT: 'resend' }).success, false);
  assert.equal(
    leadEnvironmentSchema.safeParse({
      EMAIL_TRANSPORT: 'resend',
      RESEND_API_KEY: 'test',
      EMAIL_FROM: 'notifications@tevoniq.com',
    }).success,
    true,
  );
});

test('Resend maps messages, preserves retry identity, and rejects failed or invalid responses', async () => {
  const original = globalThis.fetch;
  const calls = [];
  const transport = new ResendEmailTransport(
    new ConfigService({ RESEND_API_KEY: 'test-key', EMAIL_FROM: 'notifications@tevoniq.com' }),
  );
  const message = {
    to: ['owner@example.test'],
    subject: 'New enquiry',
    text: 'Test',
    html: '<p>Test</p>',
    replyTo: 'visitor@example.test',
    messageId: '<job-123@tevoniq.com>',
  };
  try {
    globalThis.fetch = async (url, init) => {
      calls.push({ url, init });
      return Response.json({ id: 'email-123' });
    };
    await transport.send(message);
    await transport.send(message);
    assert.equal(calls[0].url, 'https://api.resend.com/emails');
    assert.equal(
      calls[0].init.headers['Idempotency-Key'],
      calls[1].init.headers['Idempotency-Key'],
    );
    assert.equal(calls[0].init.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      from: 'TEVONIQ <notifications@tevoniq.com>',
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      reply_to: message.replyTo,
    });
    globalThis.fetch = async () =>
      Response.json({ message: 'private provider error' }, { status: 429 });
    await assert.rejects(transport.send(message), { message: 'Resend delivery failed' });
    globalThis.fetch = async () => Response.json({});
    await assert.rejects(transport.send(message), { message: 'Invalid delivery response' });
  } finally {
    globalThis.fetch = original;
  }
});
