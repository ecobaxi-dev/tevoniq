import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
const slugs = ['sales', 'service-requests', 'inventory', 'appointments', 'projects', 'expenses'];
test('fourth service card opens six dashboards, details and selected-dashboard contact', async ({
  page,
}) => {
  await page.goto('/ar');
  await page.locator('.sme-service-card--dashboard .sme-service-contact').click();
  await expect(page).toHaveURL('/ar/dashboard-demos');
  await expect(page.locator('.design-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'لوحة متابعة المبيعات', exact: true }).click();
  await expect(page.locator('.design-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'الفائدة ومصادر البيانات', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'مصادر يمكن ربطها' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'ما الذي نعرضه في هذه اللوحة؟' })).toBeVisible();
  await page.getByRole('link', { name: 'ناقش متطلبات هذه اللوحة', exact: false }).click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(/لوحة متابعة المبيعات/);
});
test('filters and chart drill-down share the same records and empty search remains editable', async ({
  page,
}) => {
  await page.goto('/previews/en/dashboards/sales');
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByRole('combobox', { name: 'Branch', exact: true }).selectOption('1');
  await expect(page.locator('tbody tr')).toHaveCount(5);
  await expect(page.locator('.dd-metrics article').first()).toContainText('5');
  await page.getByRole('combobox', { name: 'Branch', exact: true }).selectOption('all');
  await page.locator('.dd-category-bars button').first().click();
  await expect(page.getByRole('combobox', { name: 'Category', exact: true })).toHaveValue('0');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.locator('.dd-category-bars button').first().click();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByRole('button', { name: 'Bar chart', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bar chart', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('searchbox', { name: 'Search records' }).fill('no-record-xyz');
  await expect(page.locator('.dd-empty')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export results', exact: true })).toBeDisabled();
  await page.getByRole('searchbox', { name: 'Search records' }).clear();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByRole('combobox', { name: 'Period', exact: true }).selectOption('week');
  await expect(page.locator('tbody tr')).toHaveCount(4);
});
test('editing source data recalculates metrics and reset restores sample values without submission', async ({
  page,
}) => {
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') posts++;
  });
  await page.goto('/previews/en/dashboards/sales');
  await expect(page.locator('.dd-metrics article').nth(1)).toContainText('2,120');
  await page.locator('tbody tr').first().getByRole('button').click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('select[name=status]').selectOption('0');
  await dialog.locator('input[name=value]').fill('1000');
  await dialog.getByRole('button', { name: 'Save and recalculate' }).click();
  await expect(page.locator('.dd-metrics article').nth(1)).toContainText('3,120');
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('button', { name: 'Restore sample data', exact: true }).click();
  await expect(page.locator('.dd-metrics article').nth(1)).toContainText('2,120');
  expect(posts).toBe(0);
});
test('inventory thresholds update stock status filters and exports contain only the visible subset', async ({
  page,
}) => {
  await page.goto('/previews/en/dashboards/inventory');
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('1');
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await page.getByRole('slider', { name: 'Low-stock threshold (below)' }).fill('20');
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('all');
  await page.getByRole('combobox', { name: 'Branch', exact: true }).selectOption('1');
  const count = await page.locator('tbody tr').count();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export results', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('tevoniq-demo-inventory-en.csv');
  const csv = await readFile((await download.path())!, 'utf8');
  expect(csv.split('\r\n')).toHaveLength(count + 1);
  expect(csv).toContain('Branch B');
  expect(csv).not.toContain('Branch A');
});
test('all dashboards fit mobile screens, keep calculated charts valid and reset edits on reload', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['ar', 'en'])
    for (const slug of slugs) {
      await page.goto(`/previews/${locale}/dashboards/${slug}`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.dd-svg')).toBeVisible();
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale}/${slug}/${width}`,
        ).toBe(true);
      }
      await page.locator('.dd-filter-grid select').first().selectOption('all');
      await expect(page.locator('tbody tr')).toHaveCount(12);
      await page.reload();
      await expect(page.locator('tbody tr')).toHaveCount(10);
    }
  expect(errors).toEqual([]);
});
test('dashboard pages meet accessibility, indexing and progressive rendering expectations', async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of [
    '/ar/dashboard-demos',
    '/en/dashboard-demos/sales',
    ...slugs.flatMap((slug) =>
      ['ar', 'en'].map((locale) => `/previews/${locale}/dashboards/${slug}`),
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
  const missing = await page.goto('/ar/dashboard-demos/unknown');
  expect(missing?.status()).toBe(404);
  const preview = await page.goto('/previews/ar/dashboards/unknown');
  expect(preview?.status()).toBe(404);
  await page.goto('/ar/contact?dashboard=unknown');
  await expect(page.locator('textarea[name=message]')).toHaveValue('');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/ar/dashboard-demos');
  await expect(staticPage.locator('.design-card')).toHaveCount(6);
  await context.close();
});
