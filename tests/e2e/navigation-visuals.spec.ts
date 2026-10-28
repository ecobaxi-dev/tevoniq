import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function openServices(page: import('@playwright/test').Page, locale: string) {
  await page.mouse.move(0, 0);
  await page.goto(`/${locale}`);
  await page
    .locator('.site-desktop-nav')
    .getByRole('button', { name: locale === 'ar' ? 'خدماتنا' : 'Services', exact: true })
    .press('Enter');
  await expect(page.locator('.site-services-menu')).toBeVisible();
}
test('service categories show vivid local previews only for matching public services', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['ar', 'en']) {
    await openServices(page, locale);
    for (const [group, asset, slug] of [
      [
        locale === 'ar' ? 'هندسة المنتجات البرمجية' : 'Software Product Engineering',
        'engineering',
        'software-product-engineering',
      ],
      [
        locale === 'ar' ? 'المنصات الذكية والأتمتة' : 'Intelligent Platforms & Automation',
        'automation',
        'business-automation',
      ],
    ]) {
      const category = page
        .locator('.site-services-categories')
        .getByRole('button', { name: group, exact: true });
      await category.focus();
      await category.press('Space');
      const feature = page.locator('.site-services-feature');
      await expect(feature).toHaveCount(1);
      await expect(feature.locator('a')).toHaveAttribute('href', `/${locale}/services/${slug}`);
      const img = feature.locator('img');
      await expect(img).toHaveAttribute('src', `/brand/navigation/${asset}-v1.webp`);
      await expect
        .poll(() =>
          img.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth === 560),
        )
        .toBe(true);
      expect(await img.getAttribute('src')).not.toContain('/_next/image');
      const response = await request.get(`/brand/navigation/${asset}-v1.webp`);
      expect(response.ok()).toBe(true);
      expect((await response.body()).length).toBeLessThan(35000);
      expect(await img.getAttribute('alt')).toBe('');
    }
    await page.locator('.site-services-categories button').first().click();
    await expect(page.locator('.site-services-feature')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
test('thumbnail links work with keyboard, close the menu and preserve service navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openServices(page, 'ar');
  await page
    .locator('.site-services-categories')
    .getByRole('button', { name: 'هندسة المنتجات البرمجية', exact: true })
    .click();
  const feature = page.locator('.site-services-feature-link');
  await feature.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/ar/services/software-product-engineering');
  await expect(page.locator('.site-services-menu')).toBeHidden();
  await page
    .locator('.site-desktop-nav')
    .getByRole('button', { name: 'خدماتنا', exact: true })
    .click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.site-services-menu')).toBeHidden();
});
test('both preview layouts remain contained and accessible in Arabic and English and respect reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    for (const category of [
      locale === 'ar' ? 'هندسة المنتجات البرمجية' : 'Software Product Engineering',
      locale === 'ar' ? 'المنصات الذكية والأتمتة' : 'Intelligent Platforms & Automation',
    ]) {
      // Axe may blur Radix's focused menu; open each category as an independent scenario.
      await page.setViewportSize({ width: 1440, height: 900 });
      await openServices(page, locale);
      const categoryButton = page
        .locator('.site-services-categories')
        .getByRole('button', { name: category, exact: true });
      await categoryButton.focus();
      await categoryButton.press('Space');
      for (const width of [1440, 1280]) {
        await page.setViewportSize({ width, height: 760 });
        await expect(page.locator('.site-services-feature img')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        const bounds = await page.locator('.site-services-panel').boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      }
      await expect(page.locator('.site-services-feature-link')).toBeVisible();
      expect(
        await page
          .locator('.site-services-feature-image img')
          .evaluate((node) => getComputedStyle(node).transitionDuration),
      ).toBe('0s');
      const scan = await new AxeBuilder({ page })
        .include('.site-services-menu')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect.soft(scan.violations, `${locale}/${category}`).toEqual([]);
    }
  }
});
test('mobile drawer and legacy Turkish navigation keep their existing content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ar');
  await page.getByRole('button', { name: 'فتح القائمة', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.site-services-feature')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/tr');
  await page
    .locator('.site-desktop-nav')
    .getByRole('button', { name: 'Hizmetler', exact: true })
    .click();
  await expect(page.locator('.site-services-menu')).toBeVisible();
  await expect(page.locator('.site-services-feature')).toHaveCount(0);
});
