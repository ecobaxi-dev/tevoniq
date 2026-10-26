import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const slugs = [
  'lead-capture',
  'order-sync',
  'appointment-reminders',
  'invoice-follow-up',
  'stock-alerts',
  'daily-summary',
];
const run = async (page: import('@playwright/test').Page) => {
  await page.locator('.ad-inputs .ad-primary').click();
  await expect(page.locator('.ad-outcome')).toBeVisible();
};
test('third service card leads to six flows, detail capabilities and the selected-flow contact message', async ({
  page,
}) => {
  await page.goto('/ar');
  await page.locator('.sme-service-card--automation .sme-service-contact').click();
  await expect(page).toHaveURL('/ar/automation-demos');
  await expect(page.locator('.design-card')).toHaveCount(6);
  await page
    .getByRole('button', { name: 'استقبال الاستفسارات وتنظيم المتابعة', exact: true })
    .click();
  await expect(page.locator('.design-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'الفائدة وإمكانات الربط', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'البرامج التي يمكن ربطها' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'ماذا يحتاج التشغيل الفعلي؟' })).toBeVisible();
  await page.getByRole('link', { name: 'ناقش متطلبات هذا الربط', exact: false }).click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(
    /استقبال الاستفسارات وتنظيم المتابعة/,
  );
});
test('enquiry simulation prevents duplicates, detects changed data and does not submit externally', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') posts++;
  });
  await page.goto('/previews/en/automation/lead-capture');
  await run(page);
  await expect(page.locator('.ad-outcome')).toHaveText('Simulation completed');
  await expect(page.locator('.ad-stats strong').first()).toHaveText('1');
  await expect(page.locator('.ad-draft')).toContainText('not sent');
  await run(page);
  await expect(page.locator('.ad-outcome')).toHaveText('Already processed');
  await expect(page.locator('.ad-stats strong').first()).toHaveText('1');
  await page.locator('#automation-description').fill('Changed request');
  await run(page);
  await expect(page.locator('.ad-outcome')).toHaveText('Event ID conflict');
  await page.locator('#automation-eventId').fill('DEMO-1002');
  await run(page);
  await expect(page.locator('.ad-stats strong').first()).toHaveText('2');
  expect(posts).toBe(0);
});
test('order flow pauses for approval, fails without output and retries safely', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/previews/ar/automation/order-sync');
  await run(page);
  await expect(page.locator('.ad-outcome')).toHaveText('بانتظار المراجعة');
  await expect(page.locator('.ad-effect-list')).toHaveCount(0);
  await page.locator('#automation-approved').check();
  await page.getByRole('checkbox', { name: 'محاكاة تعطل وجهة الربط' }).check();
  await run(page);
  await expect(page.locator('.ad-outcome')).toHaveText('توقف المسار');
  await expect(page.locator('.ad-draft')).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'محاكاة تعطل وجهة الربط' }).uncheck();
  await run(page);
  await expect(page.locator('.ad-outcome')).toHaveText('اكتملت المحاكاة');
  await expect(page.locator('.ad-effect-list')).toContainText('الرصيد المقترح بعد الطلب');
  await expect(page.locator('.ad-stats strong').first()).toHaveText('1');
});
test('conditions skip reminders and paid invoices, report validation and reset work', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/previews/en/automation/appointment-reminders');
  await page.locator('#automation-consent').uncheck();
  await run(page);
  await expect(page.locator('.ad-outcome')).toHaveText('Skipped by condition');
  await expect(page.locator('.ad-draft')).toHaveCount(0);
  await page.goto('/previews/en/automation/invoice-follow-up');
  await page.locator('#automation-paid').check();
  await run(page);
  await expect(page.locator('.ad-outcome')).toHaveText('Skipped by condition');
  await page.goto('/previews/en/automation/daily-summary');
  await page.locator('#automation-orders').fill('A,10\nA,20');
  await run(page);
  await expect(page.locator('.ad-outcome')).toHaveText('Flow stopped');
  await expect(page.locator('.ad-result')).toContainText('Duplicate order ID');
  await page.locator('#automation-orders').fill('A,125\nB,240\nC,350');
  await run(page);
  await expect(page.locator('.ad-effect-list')).toContainText('715 SAR');
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('button', { name: 'Restore demo data' }).click();
  await expect(page.locator('.ad-stats strong').first()).toHaveText('0');
  await expect(page.locator('.ad-outcome')).toHaveCount(0);
});
test('all six flow previews run in both languages, fit mobile and keep results temporary', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const locale of ['ar', 'en'])
    for (const slug of slugs) {
      await page.goto(`/previews/${locale}/automation/${slug}`);
      await expect(page.locator('h1')).toBeVisible();
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale}/${slug}/${width}`,
        ).toBe(true);
      }
      const approval = page.locator('#automation-approved');
      if (await approval.isVisible()) await approval.check();
      await run(page);
      await expect(page.locator('.ad-outcome')).toHaveClass(/ad-outcome--completed/);
      await page.reload();
      await expect(page.locator('.ad-stats strong').first()).toHaveText('0');
    }
  expect(errors).toEqual([]);
});
test('gallery, flow details and previews meet accessibility and indexing expectations', async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of [
    '/ar/automation-demos',
    '/en/automation-demos/order-sync',
    ...slugs.flatMap((slug) =>
      ['ar', 'en'].map((locale) => `/previews/${locale}/automation/${slug}`),
    ),
  ]) {
    await page.goto(path);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        path,
      ).toBe(true);
    }
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(scan.violations, path).toEqual([]);
  }
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
  const missing = await page.goto('/ar/automation-demos/unknown');
  expect(missing?.status()).toBe(404);
  const invalid = await page.goto('/previews/ar/automation/unknown');
  expect(invalid?.status()).toBe(404);
  await page.goto('/ar/contact?automation=unknown');
  await expect(page.locator('textarea[name=message]')).toHaveValue('');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/ar/automation-demos');
  await expect(staticPage.locator('.design-card')).toHaveCount(6);
  await context.close();
});
