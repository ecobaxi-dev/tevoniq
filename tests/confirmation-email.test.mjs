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
  assert.ok(html.includes('mailto:kallas.hossam@gmail.com?subject=Enquiry%20test-123'));
  assert.ok(html.includes('max-width:620px'));
});
