import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '@nestjs/config';
import { newsletterConfirmationEmail } from '../apps/api/dist/newsletter/confirmation-email.js';
import { GenericNewsletterProvider } from '../apps/api/dist/newsletter/newsletter.provider.js';
import { NewsletterController } from '../apps/api/dist/newsletter/newsletter.controller.js';

const confirmationUrl = 'https://www.tevoniq.com/ar/newsletter/confirm#token=' + 'a'.repeat(64);
const unsubscribeUrl = 'https://www.tevoniq.com/ar/newsletter/unsubscribe#token=' + 'b'.repeat(64);
test('Newsletter HTML and plain text preserve action tokens and language direction', async () => {
  for (const language of ['ar', 'en']) {
    const messages = [];
    const provider = new GenericNewsletterProvider({
      enabled: true,
      send: async (m) => messages.push(m),
    });
    await provider.sendConfirmation({
      contact: { email: 'test@example.test', language },
      confirmationUrl,
      unsubscribeUrl,
      idempotencyKey: 'fixture',
    });
    const message = messages[0];
    assert.equal(message.to[0], 'test@example.test');
    assert.equal(message.messageId, '<newsletter-fixture@tevoniq.mail>');
    assert.ok(
      message.html.includes(`lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}"`),
    );
    for (const link of [confirmationUrl, unsubscribeUrl]) {
      assert.ok(message.html.includes(`href="${link}"`));
      assert.ok(message.text.includes(link));
    }
    assert.ok(message.html.includes('48'));
    assert.ok(!message.html.includes('<script'));
    assert.ok(!message.html.includes('<img'));
    assert.ok(!message.html.includes('>https://'));
  }
});
test('Newsletter links reject unsafe protocols and mismatched origins, and escape HTML attributes', () => {
  for (const link of ['javascript:alert(1)', 'https://user:pass@www.tevoniq.com/'])
    assert.throws(() =>
      newsletterConfirmationEmail({ language: 'ar', confirmationUrl: link, unsubscribeUrl }),
    );
  assert.throws(() =>
    newsletterConfirmationEmail({
      language: 'en',
      confirmationUrl,
      unsubscribeUrl: 'https://example.org/',
    }),
  );
  const result = newsletterConfirmationEmail({
    language: 'en',
    confirmationUrl: confirmationUrl + '&x=" onmouseover="bad',
    unsubscribeUrl,
  });
  assert.ok(!result.html.includes('" onmouseover="bad'));
});
test('Existing Turkish newsletter content is preserved', async () => {
  let message;
  const provider = new GenericNewsletterProvider({
    enabled: true,
    send: async (m) => {
      message = m;
    },
  });
  await provider.sendConfirmation({
    contact: { email: 'test@example.test', language: 'tr' },
    confirmationUrl,
    unsubscribeUrl,
    idempotencyKey: 'tr',
  });
  assert.equal(message.subject, 'TEVONIQ bülten aboneliğinizi onaylayın');
  assert.equal(message.html, undefined);
});
test('Newsletter does not queue email when Turnstile rejects the request', async () => {
  let calls = 0;
  const controller = new NewsletterController(
    {
      subscribe: async () => {
        calls++;
      },
    },
    {
      rateLimit: async () => {},
      verify: async (token, action) => {
        assert.equal(token, '');
        assert.equal(action, 'newsletter');
        throw new Error('Verification required');
      },
    },
    new ConfigService({ TURNSTILE_MODE: 'turnstile' }),
    { confirmationEnabled: true },
  );
  await assert.rejects(
    () =>
      controller.subscribe(
        { email: 'test@example.test', consent: true },
        { headers: {}, ip: '127.0.0.1' },
      ),
    /Verification required/,
  );
  assert.equal(calls, 0);
});
