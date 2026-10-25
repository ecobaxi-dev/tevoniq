import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verificationMessage } from '../apps/api/dist/pesto/registration-protocol.js';

const reference = '00000000-0000-4000-8000-000000000001';
for (const language of ['ar', 'en', 'tr']) {
  test(`${language}: branded, localized email preserves copyable leading-zero code and plain fallback`, () => {
    const { subject, text, html } = verificationMessage(language, '01234567', reference);
    assert.ok(subject.length > 10);
    assert.ok(text.includes('01234567'));
    assert.ok(text.includes(reference));
    assert.ok(text.includes('20'));
    assert.ok(text.includes('https://tevoniq.com/pesto'));
    assert.match(
      html,
      new RegExp(`<html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">`),
    );
    assert.match(html, /dir="ltr"[^>]*>01234567<\/div>/);
    assert.match(html, /dir="ltr"[^>]*>00000000-0000-4000-8000-000000000001<\/div>/);
    assert.ok(html.includes('TEVONIQ'));
    assert.ok(html.includes('PESTO'));
    assert.ok(html.includes(`https://www.tevoniq.com/${language}/pesto`));
    assert.match(html, /max-width:600px/);
    assert.match(html, /width=device-width/);
    assert.match(html, /role="presentation"/);
    assert.match(html, /mailto:kallas\.hossam@gmail\.com/);
    assert.doesNotMatch(html, /<(?:script|form|iframe|svg|img)\b/i);
    assert.doesNotMatch(html, /@import|url\(|<link\b/i);
    assert.match(
      html,
      language === 'ar'
        ? /لا يبدأ الفترة التجريبية ولا يفعّل الترخيص/
        : language === 'tr'
          ? /deneme başlatmaz veya lisans etkinleştirmez/
          : /does not start a trial or activate a license/,
    );
  });
}

test('HTML escapes both dynamic values and never turns them into markup or links', () => {
  const value = '<img src="x" onerror=\'bad\'>&';
  const { html, text } = verificationMessage('ar', value, value);
  assert.ok(text.includes(value)); // The existing plain-text fallback is deliberately unchanged.
  assert.equal(
    html.split('&lt;img src=&quot;x&quot; onerror=&#39;bad&#39;&gt;&amp;').length - 1,
    2,
  );
  assert.doesNotMatch(html, /<img\b/);
  const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(links, ['mailto:kallas.hossam@gmail.com', 'https://www.tevoniq.com/ar/pesto']);
});
