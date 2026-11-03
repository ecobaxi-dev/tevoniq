import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const paths = [
  '/business/professional-services',
  '/business/small-retail',
  '/guides/business-website-cost',
  '/guides/when-to-replace-spreadsheets',
  '/showroom',
];
test('month-one pathways are bilingual, linked, indexable and fit small screens', async ({
  page,
  request,
}) => {
  for (const locale of ['ar', 'en'])
    for (const path of paths) {
      const response = await page.goto(`/${locale}${path}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `http://127.0.0.1:3100/${locale}${path}`,
      );
      await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute(
        'href',
        `http://127.0.0.1:3100/ar${path}`,
      );
      await expect(page.locator('link[rel="alternate"][hreflang="tr"]')).toHaveCount(0);
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale}${path}:${width}`,
        ).toBe(true);
      }
      await page.setViewportSize({ width: 1280, height: 900 });
    }
  await page.goto('/ar/industries');
  await expect(page.locator('a[href="/ar/business/professional-services"]')).toBeVisible();
  await page.goto('/ar/insights/blog');
  await expect(page.locator('a[href="/ar/guides/business-website-cost"]')).toBeVisible();
  for (const path of paths) expect((await request.get(`/tr${path}`)).status()).toBe(404);
  const search = await (await request.get('/api/search?q=Excel&locale=ar')).json();
  expect(
    search.groups
      .flatMap((group: { items: { url: string }[] }) => group.items)
      .some((item: { url: string }) => item.url === '/ar/guides/when-to-replace-spreadsheets'),
  ).toBe(true);
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const path of paths) {
    expect(xml).toContain(`/ar${path}`);
    expect(xml).toContain(`/en${path}`);
    expect(xml).not.toContain(`/tr${path}`);
  }
});
test('four films load on request and link to existing models', async ({ page, request }) => {
  await page.goto('/ar/showroom');
  await expect(page.locator('main video')).toHaveCount(4);
  const videos = page.locator('main video');
  for (let i = 0; i < 4; i++) {
    const video = videos.nth(i);
    await expect(video).toHaveAttribute('preload', 'none');
    const source = await video.locator('source').getAttribute('src');
    expect((await request.get(source!)).status()).toBe(200);
  }
  await videos.first().evaluate(async (video: HTMLVideoElement) => {
    await video.play();
  });
  await expect
    .poll(() => videos.first().evaluate((video: HTMLVideoElement) => video.currentTime))
    .toBeGreaterThan(0);
  await videos.first().evaluate((video: HTMLVideoElement) => video.pause());
  expect(
    await videos.first().evaluate((video: HTMLVideoElement) => video.duration),
  ).toBeGreaterThan(12);
  await expect(page.locator('main a[href="/ar/website-designs/business-services"]')).toBeVisible();
});
test('sector and guide accessibility and request CTAs', async ({ page }) => {
  for (const path of [
    '/ar/business/small-retail',
    '/ar/guides/when-to-replace-spreadsheets',
    '/en/showroom',
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  await page.goto('/ar/business/professional-services');
  await page.locator('.growth-hero a[href*="request-quote"]').click();
  await expect(page.locator('.lead-form')).toBeVisible();
  await expect(page).toHaveURL(/\/ar\/request-quote\?utm_source=site/);
  await page.goto('/ar/guides/business-website-cost');
  await page.getByRole('link', { name: 'ما العوامل التي تغيّر التكلفة؟', exact: true }).click();
  await expect(page).toHaveURL(/#part-2$/);
});

test('journey metrics require consent and record only successful enquiries without field data', async ({
  page,
}) => {
  test.skip(
    process.env.GROWTH_METRICS_FIXTURE !== '1',
    'Requires isolated analytics configuration',
  );
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '/* isolated local analytics stub */',
    }),
  );
  await page.goto('/en/contact?email=private@example.test');
  await expect(page.locator('.site-cookie-banner')).toBeVisible();
  expect(await page.locator('#site-ga').count()).toBe(0);
  await page
    .locator('.site-cookie-banner')
    .getByRole('button', { name: 'Accept all', exact: true })
    .click();
  await expect(page.locator('#site-ga')).toHaveCount(1);
  const events = () =>
    page.evaluate(() =>
      ((window as typeof window & { dataLayer?: ArrayLike<unknown>[] }).dataLayer || []).map(
        (row) => Array.from(row),
      ),
    );
  await expect
    .poll(
      async () =>
        (await events()).filter((row) => row[0] === 'event' && row[1] === 'page_view').length,
    )
    .toBe(1);
  const form = page.locator('.lead-form');
  await form.locator('[name="name"]').fill('PRIVATE PERSON');
  await form.locator('[name="email"]').fill('private@example.test');
  await form.locator('[name="country"]').selectOption('SA');
  await form.locator('[name="subject"]').fill('PRIVATE SUBJECT');
  await form.locator('[name="message"]').fill('PRIVATE MESSAGE');
  let fail = true;
  await page.route('**/api/leads', (route) =>
    route.fulfill({
      status: fail ? 503 : 202,
      contentType: 'application/json',
      body: JSON.stringify(fail ? { message: 'Retry fixture' } : { reference: 'metric-fixture' }),
    }),
  );
  await form.locator('[type="submit"]').click();
  await expect(form.getByRole('alert')).toContainText('Retry fixture');
  expect((await events()).filter((row) => row[1] === 'generate_lead')).toHaveLength(0);
  fail = false;
  await form.locator('[type="submit"]').click();
  await expect(page.locator('.lead-success')).toBeVisible();
  const rows = await events(),
    payload = JSON.stringify(rows.filter((row) => row[0] === 'event'));
  expect(rows.filter((row) => row[1] === 'form_start')).toHaveLength(1);
  expect(rows.filter((row) => row[1] === 'generate_lead')).toHaveLength(1);
  expect(payload).not.toContain('PRIVATE');
  expect(payload).not.toContain('private@example.test');
  expect(payload).not.toContain('?email');
  expect(payload).not.toContain('metric-fixture');
});
