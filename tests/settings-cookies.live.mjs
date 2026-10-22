import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  siteSettingsSchema,
  publicSiteSettings,
  settingsOrganization,
  settingsGroups,
} from '../packages/validation/dist/index.js';

test('grouped settings and category consent work in the production app', async (t) => {
  let settings = siteSettingsSchema.parse({
      email: { notificationRecipients: ['private-routing@example.com'] },
    }),
    version = 0;
  const api = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path === '/site-settings') return res.end(JSON.stringify(publicSiteSettings(settings)));
    if (path === '/seo/organization')
      return res.end(JSON.stringify(settingsOrganization(publicSiteSettings(settings))));
    if (path === '/seo/routes') return res.end(JSON.stringify({ items: [], total: 0 }));
    if (path === '/newsletter/config') return res.end(JSON.stringify({ turnstileSiteKey: null }));
    if (path === '/cms/auth/me')
      return res.end(
        JSON.stringify({ id: 'fixture-admin', email: 'admin@example.com', role: 'ADMIN' }),
      );
    if (path === '/cms/site-settings') {
      if (req.method === 'PUT') {
        let body = '';
        for await (const chunk of req) body += chunk;
        const input = JSON.parse(body);
        if (input.version !== version) {
          res.statusCode = 409;
          return res.end(
            JSON.stringify({
              message: 'Settings changed in another session. Reload before saving.',
            }),
          );
        }
        settings = siteSettingsSchema.parse(input.settings);
        version++;
      }
      return res.end(
        JSON.stringify({
          settings,
          version,
          updatedAt: new Date().toISOString(),
          deployment: { emailConfigured: false, botProtectionEnabled: false, maxUploadMB: 10 },
        }),
      );
    }
    res.statusCode = 404;
    res.end('{}');
  });
  await new Promise((r) => api.listen(0, '127.0.0.1', r));
  t.after(() => api.close());
  const port = 21000 + Math.floor(Math.random() * 1000),
    base = `http://127.0.0.1:${port}`;
  const server = spawn(
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
  server.stdout.on('data', (d) => (output += d));
  server.stderr.on('data', (d) => (output += d));
  t.after(() => server.kill());
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + '/health')).ok) break;
    } catch {
      /* Startup retry. */
    }
    if (server.exitCode !== null) assert.fail(output);
    await setTimeout(100);
  }
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  await mkdir('artifacts/settings-cookies', { recursive: true });
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await adminContext.addCookies([
    { name: 'tevoniq_cms_session', value: 'a'.repeat(64), url: base },
  ]);
  const admin = await adminContext.newPage();
  await admin.goto(base + '/admin/site-settings');
  await admin.getByLabel('Site name', { exact: true }).waitFor();
  const groupNav = admin.getByRole('navigation', { name: 'Settings groups' });
  assert.equal(await groupNav.getByRole('button').count(), settingsGroups.length);
  await admin.getByLabel('Site name', { exact: true }).fill('TEVONIQ Verified');
  await groupNav.getByRole('button', { name: 'Contact', exact: true }).click();
  await admin.getByLabel('Sales email', { exact: true }).fill('sales@example.com');
  await groupNav.getByRole('button', { name: 'Localization', exact: true }).click();
  await admin.getByLabel('Default language', { exact: true }).selectOption('tr');
  await groupNav.getByRole('button', { name: 'SEO', exact: true }).click();
  await admin.getByLabel('Default title', { exact: true }).fill('Verified default title');
  await admin.getByRole('button', { name: 'Save changes', exact: true }).click();
  await admin.getByRole('status').filter({ hasText: 'Settings saved' }).waitFor();
  assert.equal(settings.general.siteName, 'TEVONIQ Verified');
  assert.equal(settings.contact.salesEmail, 'sales@example.com');
  assert.equal(settings.localization.defaultLanguage, 'tr');
  await admin.screenshot({ path: 'artifacts/settings-cookies/admin-desktop.png', fullPage: true });
  assert.deepEqual(
    (await new AxeBuilder({ page: admin }).include('.settings-editor').analyze()).violations.map(
      (v) => v.id,
    ),
    [],
  );
  version++;
  await admin.getByLabel('Default title', { exact: true }).fill('Conflicting value');
  await admin.getByRole('button', { name: 'Save changes', exact: true }).click();
  await admin.getByRole('alert').filter({ hasText: 'another session' }).waitFor();
  assert.notEqual(settings.seo.defaultTitle, 'Conflicting value');
  const root = await fetch(base, { redirect: 'manual' });
  assert.equal(root.headers.get('location'), '/tr');
  const html = await (await fetch(base + '/en')).text();
  assert.doesNotMatch(html, /private-routing@example.com/);
  assert.match(html, /<title>Verified default title<\/title>/);
  settings.analytics = {
    googleAnalytics: 'G-TEST1234',
    googleTagManager: 'GTM-TEST1234',
    microsoftClarity: 'test12345',
    metaPixel: '1234567890',
  };
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }),
    page = await context.newPage();
  const requests = [];
  await context.route(
    /https:\/\/(www\.googletagmanager\.com|www\.clarity\.ms|connect\.facebook\.net)\//,
    async (route) => {
      requests.push(route.request().url());
      await route.fulfill({
        contentType: 'application/javascript',
        body: '/* isolated provider fixture */',
      });
    },
  );
  const securityResponse = await page.goto(base + '/en');
  const policy = securityResponse.headers()['content-security-policy'];
  assert.match(policy, /script-src .*'nonce-[^']+' 'strict-dynamic'/);
  assert.ok(!policy.includes("'unsafe-eval'"));
  const attackPage = await context.newPage();
  await attackPage.route(base + '/en', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()).replace(
        '</body>',
        '<script>window.injectedSecurityProbe=true</script></body>',
      ),
    });
  });
  await attackPage.goto(base + '/en');
  assert.equal(
    await attackPage.evaluate(() => window.injectedSecurityProbe),
    undefined,
    'CSP blocks parser-injected inline JavaScript',
  );
  await attackPage.close();
  await page.getByRole('button', { name: 'Choose preferences', exact: true }).waitFor();
  assert.equal(requests.length, 0, 'No optional scripts before consent');
  await page.screenshot({ path: 'artifacts/settings-cookies/banner-desktop.png' });
  await page.getByRole('button', { name: 'Reject optional', exact: true }).click();
  assert.equal(
    JSON.parse(await page.evaluate(() => localStorage.getItem('tevoniq-consent-v1'))).categories
      .necessary,
    true,
  );
  await page.reload();
  await page.getByRole('button', { name: 'Cookie settings', exact: true }).waitFor();
  assert.equal(
    await page.getByRole('button', { name: 'Choose preferences', exact: true }).count(),
    0,
  );
  assert.equal(requests.length, 0);
  await page.getByRole('button', { name: 'Cookie settings', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Cookie settings', exact: true });
  await modal.waitFor();
  assert.equal(
    await modal.getByRole('checkbox', { name: 'Necessary', exact: true }).isChecked(),
    true,
  );
  assert.equal(
    await modal.getByRole('checkbox', { name: 'Necessary', exact: true }).isEnabled(),
    false,
  );
  await modal.getByRole('checkbox', { name: 'Analytics', exact: true }).check();
  await modal.getByRole('button', { name: 'Save preferences', exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector('script[src*="gtag/js"]') &&
      document.querySelector('script[src*="clarity.ms/tag"]'),
  );
  assert.ok(requests.some((u) => u.includes('/gtag/js')));
  assert.ok(requests.some((u) => u.includes('clarity.ms')));
  assert.equal(
    requests.some((u) => u.includes('/gtm.js') || u.includes('facebook')),
    false,
  );
  await page.getByRole('button', { name: 'Cookie settings', exact: true }).click();
  await modal.getByRole('checkbox', { name: 'Marketing', exact: true }).check();
  await modal.getByRole('checkbox', { name: 'Preferences', exact: true }).check();
  await page.screenshot({ path: 'artifacts/settings-cookies/preferences-desktop.png' });
  assert.deepEqual(
    (await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations.map(
      (v) => v.id,
    ),
    [],
  );
  await modal.getByRole('button', { name: 'Save preferences', exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector('script[src*="gtm.js"]') &&
      document.querySelector('script[src*="fbevents.js"]'),
  );
  await page
    .locator('footer')
    .getByRole('combobox', { name: 'Footer language', exact: true })
    .selectOption('ar');
  await page.waitForURL('**/ar');
  assert.equal((await context.cookies()).find((c) => c.name === 'tevoniq_language')?.value, 'ar');
  await page.goto(base);
  await page.waitForURL('**/ar');
  await context.addCookies([
    { name: '_ga', value: 'fixture', url: base },
    { name: '_fbp', value: 'fixture', url: base },
  ]);
  await page.getByRole('button', { name: 'إعدادات ملفات الارتباط', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'رفض الاختيارية', exact: true })
    .click();
  await page.waitForLoadState('load');
  await page.waitForFunction(() => !document.querySelector('script[src*="gtag/js"]'));
  const remaining = (await context.cookies()).map((c) => c.name);
  assert.equal(remaining.includes('_ga'), false);
  assert.equal(remaining.includes('_fbp'), false);
  assert.equal(remaining.includes('tevoniq_language'), false);
  settings.legal.cookiePolicyVersion = '2';
  await page.goto(base + '/en');
  await page.getByRole('button', { name: 'Choose preferences', exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/settings-cookies/banner-mobile.png' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.getByRole('button', { name: 'Choose preferences', exact: true }).click();
  await page.screenshot({ path: 'artifacts/settings-cookies/preferences-mobile.png' });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Reject optional', exact: true }).click();
  for (const locale of ['en', 'tr', 'ar'])
    for (const route of ['privacy-policy', 'cookie-policy']) {
      const response = await page.goto(base + '/' + locale + '/' + route);
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('main h1').count(), 1);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
    }
  await page
    .locator('main')
    .getByRole('button', { name: 'إعدادات ملفات الارتباط', exact: true })
    .click();
  await page.getByRole('dialog').waitFor();
  await page.screenshot({ path: 'artifacts/settings-cookies/preferences-ar.png' });
  // Empty IDs never inject scripts, even with accepted optional categories.
  settings.analytics = siteSettingsSchema.parse({}).analytics;
  const clean = await browser.newContext();
  let vendorRequests = 0;
  await clean.route(
    /https:\/\/(www\.googletagmanager\.com|www\.clarity\.ms|connect\.facebook\.net)\//,
    async (route) => {
      vendorRequests++;
      await route.abort();
    },
  );
  const blank = await clean.newPage();
  await blank.goto(base + '/en');
  await blank.getByRole('button', { name: 'Accept all', exact: true }).click();
  assert.equal(await blank.locator('script[id^="site-"]').count(), 0);
  assert.equal(vendorRequests, 0);
  // A refused choice must survive synchronization even when the browser blocks storage.
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    });
    Object.defineProperty(document, 'cookie', { get: () => '', set: () => {} });
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(base + '/en');
  await blockedPage.getByRole('button', { name: 'Reject optional', exact: true }).click();
  await blockedPage.getByRole('status').filter({ hasText: 'could not store' }).waitFor();
  await blockedPage.evaluate(() => window.dispatchEvent(new Event('focus')));
  await blockedPage.getByRole('button', { name: 'Cookie settings', exact: true }).click();
  const blockedModal = blockedPage.getByRole('dialog');
  await blockedModal.waitFor();
  assert.equal(
    await blockedModal.getByRole('checkbox', { name: 'Necessary', exact: true }).isEnabled(),
    false,
  );
  assert.equal(
    await blockedModal.getByRole('checkbox', { name: 'Analytics', exact: true }).isChecked(),
    false,
  );
  await blockedModal.getByRole('button', { name: 'Close', exact: true }).click();
  assert.equal(
    await blockedPage.getByRole('button', { name: 'Choose preferences', exact: true }).count(),
    0,
  );
  await blocked.close();
  await adminContext.close();
  await context.close();
  await clean.close();
});
