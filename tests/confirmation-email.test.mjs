import { test } from 'node:test';
import assert from 'node:assert/strict';
import { confirmationHtml } from '../apps/api/dist/email/confirmation-template.js';
test('Confirmation escapes visitor input and includes the correct reference and safe links', () => {
  const html = confirmationHtml({
    name: '<img src=x onerror=alert(1)>',
    reference: 'test-123',
    quote: true,
    origin: 'https://www.tevoniq.com',
  });
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('test-123'));
  assert.ok(html.includes('quote request'));
  assert.ok(html.includes('https://www.tevoniq.com/en'));
  assert.ok(html.includes('https://www.tevoniq.com/en/contact'));
  assert.ok(html.includes('unicode-bidi:isolate'));
  assert.ok(html.includes('max-width:620px'));
});

for (const quote of [false, true])
  test(`Arabic receipt supports RTL and an isolated reference (quote=${quote})`, () => {
    const html = confirmationHtml({
      name: 'محمد',
      reference: '12345678-1234-1234-1234-123456789012',
      quote,
      locale: 'ar',
      origin: 'https://www.tevoniq.com',
    });
    assert.ok(html.includes('lang="ar" dir="rtl"'));
    assert.ok(html.includes('dir="ltr" style="direction:ltr;unicode-bidi:isolate'));
    assert.ok(html.includes('/ar/privacy-policy'));
    assert.ok(html.includes(quote ? 'طلب عرض سعر' : 'رسالة تواصل'));
    assert.ok(!html.includes('<script'));
    assert.ok(!html.includes('فريقنا'));
  });
test('Email rejects executable origins', () => {
  assert.throws(() =>
    confirmationHtml({
      name: 'Test',
      reference: 'abc',
      quote: false,
      origin: 'javascript:alert(1)',
    }),
  );
});
