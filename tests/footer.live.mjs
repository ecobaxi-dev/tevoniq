import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { organizationSettingsSchema, footerLinkSchema } from '../packages/validation/dist/index.js';
import { configuredSocialLinks, footerHref } from '../apps/web/src/content/footer.ts';

test('footer only accepts safe configured links and preserves locale URLs', () => {
  assert.equal(footerLinkSchema.safeParse('//evil.example').success, false);
  assert.equal(footerLinkSchema.safeParse('/\\evil.example').success, false);
  assert.equal(footerLinkSchema.safeParse('javascript:alert(1)').success, false);
  assert.equal(footerHref('ar', '/privacy'), '/ar/privacy');
  assert.equal(footerHref('ar', '/en/privacy'), '/en/privacy');
  assert.equal(footerHref('tr', 'https://example.com/privacy'), 'https://example.com/privacy');
  assert.deepEqual(configuredSocialLinks(''), []);
  const social = configuredSocialLinks(
    'https://linkedin.com/company/test\nhttps://linkedin.com/company/test\njavascript:alert(1)\nhttps://linkedin.com.evil.example/test',
  );
  assert.equal(social.length, 2);
  assert.equal(social[0].name, 'LinkedIn');
  assert.notEqual(social[1].name, 'LinkedIn');
});

test('footer desktop/mobile/RTL rendering, configured settings, and newsletter interactions', async (t) => {
  let configured = true,
    failSubscription = true;
  const submissions = [];
  const settings = organizationSettingsSchema.parse({
    companyName: 'TEVONIQ',
    legalName: 'Verified fixture company',
    footerDescriptionEn: 'Technology for a more connected tomorrow.',
    email: 'contact@example.com',
    phone: '+90 212 000 00 00',
    streetAddress: 'Fixture address',
    addressLocality: 'Istanbul',
    addressCountry: 'TR',
    socialProfiles: 'https://www.linkedin.com/company/fixture\nhttps://www.instagram.com/fixture',
    privacyPolicyUrl: '/privacy',
    termsUrl: '/terms',
    cookiePolicyUrl: '/cookies',
  });
  const api = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path.endsWith('/seo/organization'))
      return res.end(JSON.stringify(configured ? settings : {}));
    if (path.endsWith('/seo/routes')) return res.end(JSON.stringify({ items: [], total: 0 }));
    if (path.endsWith('/newsletter/config'))
      return res.end(JSON.stringify({ turnstileSiteKey: null }));
    if (path.endsWith('/newsletter/subscribe')) {
      let body = '';
      for await (const chunk of req) body += chunk;
      submissions.push(JSON.parse(body));
      res.statusCode = failSubscription ? 503 : 202;
      return res.end(JSON.stringify(failSubscription ? { message: 'Unavailable' } : { ok: true }));
    }
    res.statusCode = 404;
    res.end('{}');
  });
  await new Promise((r) => api.listen(0, '127.0.0.1', r));
  t.after(() => api.close());
  const port = 19000 + Math.floor(Math.random() * 1000),
    base = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [resolve('node_modules/next/dist/bin/next'), 'start', '--port', String(port)],
    {
      cwd: resolve('apps/web'),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        API_URL: `http://127.0.0.1:${api.address().port}`,
        SITE_URL: base,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let output = '';
  child.stdout.on('data', (d) => (output += d));
  child.stderr.on('data', (d) => (output += d));
  t.after(() => child.kill());
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + '/health')).ok) break;
    } catch {
      /* Startup retry. */
    }
    if (child.exitCode !== null) assert.fail(output);
    await setTimeout(100);
  }
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await mkdir('artifacts/footer', { recursive: true });
  await page.goto(base + '/en');
  await page.getByRole('button', { name: 'Reject optional', exact: true }).click();
  const footer = page.locator('footer.site-footer');
  assert.equal(await page.locator('footer').count(), 1);
  assert.equal(await footer.getByRole('link', { name: 'LinkedIn', exact: true }).count(), 1);
  assert.equal(await footer.getByRole('link', { name: 'Facebook', exact: true }).count(), 0);
  assert.equal(await footer.getByRole('link', { name: 'Privacy Policy', exact: true }).count(), 2);
  assert.equal(
    await footer
      .getByRole('link', { name: 'Privacy Policy', exact: true })
      .first()
      .getAttribute('href'),
    '/en/privacy',
  );
  assert.match(await footer.textContent(), /Verified fixture company/);
  await footer.scrollIntoViewIfNeeded();
  await footer.screenshot({ path: 'artifacts/footer/desktop-en.png' });
  const accessibility = await new AxeBuilder({ page }).include('.site-footer').analyze();
  assert.deepEqual(
    accessibility.violations.map((v) => ({ id: v.id, impact: v.impact })),
    [],
  );
  await footer
    .getByRole('textbox', { name: 'Email address', exact: true })
    .fill('footer-test@example.com');
  await footer.getByRole('button', { name: 'Subscribe', exact: true }).click();
  assert.equal(submissions.length, 0, 'Consent is required');
  await footer.getByRole('checkbox').check();
  await footer.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await footer.getByRole('alert').waitFor();
  failSubscription = false;
  await footer.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await footer.getByRole('status').waitFor();
  assert.equal(submissions.length, 2);
  assert.equal(submissions[1].source, 'footer');
  assert.equal(submissions[1].consent, true);
  assert.equal(submissions[1].language, 'en');
  await page.goto(base + '/en?utm_source=test#main-content');
  await page
    .locator('footer')
    .getByRole('combobox', { name: 'Footer language', exact: true })
    .selectOption('tr');
  await page.waitForURL('**/tr?utm_source=test#main-content');
  await page.setViewportSize({ width: 390, height: 844 });
  for (const locale of ['en', 'tr', 'ar']) {
    await page.goto(base + '/' + locale);
    await footer.scrollIntoViewIfNeeded();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      false,
      locale + ' has no horizontal overflow',
    );
    assert.equal(await footer.getAttribute('dir'), locale === 'ar' ? 'rtl' : 'ltr');
    await footer.screenshot({ path: `artifacts/footer/mobile-${locale}.png` });
  }
  configured = false;
  await page.goto(base + '/en/contact');
  assert.equal(await page.locator('footer').count(), 1, 'Footer is shared outside homepage');
  assert.equal(await footer.getByRole('link', { name: 'LinkedIn', exact: true }).count(), 0);
  assert.equal(
    await footer.getByRole('link', { name: 'Privacy Policy', exact: true }).count(),
    2,
    'Built-in privacy policy is available',
  );
  assert.equal(
    await footer.locator('a[href^="mailto:"]').count(),
    0,
    'No invented contact information',
  );
});
