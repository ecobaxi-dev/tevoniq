import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('modern directory shows published services in navigation categories and removes every retired offering', async ({
  page,
}) => {
  const { isRetiredPublicPath } = await import('../../packages/types/dist/retired-catalog.js');
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/services?q=directory-check`);
    await expect(page.locator('.sd-directory')).toBeVisible();
    await expect(page.locator('.sd-paths>a')).toHaveCount(4);
    await expect(page.locator('.sd-service-group')).toHaveCount(locale === 'en' ? 8 : 7);
    await expect(page.locator('.sd-service-card')).toHaveCount(locale === 'en' ? 12 : 11);
    await expect(page.getByText('Archived offering', { exact: true })).toHaveCount(0);
    const links = await page
      .locator('main a[href]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')!));
    expect(links.some(isRetiredPublicPath)).toBe(false);
    await expect(page.locator('.sd-card-note')).toHaveCount(9);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `http://127.0.0.1:3100/${locale}/services`,
    );
    await expect(page.locator('.sd-services-grid .concept-visual')).toHaveCount(0);
  }
  await page
    .locator('.sd-service-card h3')
    .getByRole('link', { name: 'Technology Consulting', exact: true })
    .click();
  await expect(page).toHaveURL('/en/services/it-consulting');
  await expect(page.locator('.tc-consulting')).toBeVisible();
});
test('hero action reaches the directory and gallery paths lead to the four existing demo collections', async ({
  page,
}) => {
  await page.goto('/ar');
  await page
    .locator('.artwork-hero')
    .getByRole('link', { name: 'استكشف الخدمات', exact: true })
    .click();
  await expect(page).toHaveURL('/ar/services');
  await expect(page.locator('.sd-hero h1')).toHaveText('خدمات رقمية تنظّم أعمالك');
  await page
    .locator('.sd-hero')
    .getByRole('link', { name: 'استكشف الخدمات المنشورة', exact: true })
    .click();
  await expect(page).toHaveURL('/ar/services#service-directory');
  for (const [index, path] of [
    'website-designs',
    'work-systems',
    'automation-demos',
    'dashboard-demos',
  ].entries())
    await expect(page.locator('.sd-paths>a').nth(index)).toHaveAttribute('href', `/ar/${path}`);
  await page.locator('.sd-paths>a').nth(2).click();
  await expect(page).toHaveURL('/ar/automation-demos');
  await expect(page.locator('main h1')).toBeVisible();
});
test('search resets pagination, pagination preserves search, and empty and unavailable states contain no invented services', async ({
  page,
}) => {
  await page.goto('/en/services');
  await page.getByLabel('Search services', { exact: true }).fill('directory-pages');
  await page.locator('.sd-search button[type=submit]').click();
  await expect(page).toHaveURL('/en/services?q=directory-pages');
  await expect(page.locator('.sd-service-card')).toHaveCount(4);
  await page.locator('.sd-pagination').getByRole('link', { name: 'Next', exact: false }).click();
  await expect(page).toHaveURL('/en/services?page=2&q=directory-pages');
  await expect(page.locator('.sd-service-card')).toHaveCount(4);
  await expect(
    page.locator('.sd-pagination').getByRole('link', { name: 'Previous', exact: true }),
  ).toHaveAttribute('href', '/en/services?page=1&q=directory-pages');
  await page.getByLabel('Search services', { exact: true }).fill('empty');
  await page.locator('.sd-search button[type=submit]').click();
  await expect(page).toHaveURL('/en/services?q=empty');
  await expect(page.getByRole('status')).toHaveText('No published services match this search.');
  await expect(page.locator('.sd-service-card')).toHaveCount(0);
  await page.goto('/ar/services?q=directory-error');
  await expect(page.getByRole('status')).toHaveText(
    'الخدمات غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.',
  );
  await expect(page.locator('.sd-service-card')).toHaveCount(0);
  await expect(page.locator('.sd-category-nav')).toHaveCount(0);
  expect((await page.goto('/en/services?page=0'))?.status()).toBe(404);
});
test('directory is responsive, accessible, uses lightweight local images and has no browser errors', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/services?q=directory-check`);
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${locale}/${width}`,
      ).toBe(true);
    }
    for (const src of await page
      .locator('.sd-directory img')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src')!))) {
      expect(src.startsWith('/brand/')).toBe(true);
      expect(src).not.toContain('/_next/image');
      expect((await request.get(src)).ok()).toBe(true);
    }
    const scan = await new AxeBuilder({ page })
      .include('.sd-directory')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(scan.violations, locale).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test('directory grouping, search and anchors work without JavaScript and Turkish retains the original template', async ({
  page,
  browser,
}) => {
  await page.goto('/tr/services');
  await expect(page.locator('.sd-directory')).toHaveCount(0);
  await expect(page.locator('.services-search')).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/ar/services?q=directory-check');
  await expect(staticPage.locator('.sd-service-card')).toHaveCount(11);
  const category = staticPage.locator('.sd-category-nav a').nth(2);
  await category.click();
  await expect(staticPage).toHaveURL(/#service-group-automation$/);
  await expect(staticPage.locator('#service-group-automation h2')).toBeVisible();
  await context.close();
});
