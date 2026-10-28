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
      [
        locale === 'ar' ? 'الاستشارات والتنفيذ' : 'Consulting & Delivery',
        'consulting',
        'it-consulting',
      ],
      [
        locale === 'ar' ? 'الأنظمة المدمجة وإنترنت الأشياء' : 'Embedded & IoT',
        'iot',
        'iot-solutions',
      ],
      [locale === 'ar' ? 'الأمن والجودة' : 'Security & Quality', 'security', 'cybersecurity'],
      [locale === 'ar' ? 'خدمات إضافية' : 'Additional Services', 'additional', 'api-integration'],
      [
        locale === 'ar' ? 'استشارات وتطبيق الذكاء الاصطناعي' : 'AI Consulting & Implementation',
        'ai',
        'artificial-intelligence',
      ],
    ]) {
      await openServices(page, locale);
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
      expect((await response.body()).length).toBeLessThan(50000);
      expect(await img.getAttribute('alt')).toBe('');
    }
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
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    for (const category of [
      locale === 'ar' ? 'هندسة المنتجات البرمجية' : 'Software Product Engineering',
      locale === 'ar' ? 'المنصات الذكية والأتمتة' : 'Intelligent Platforms & Automation',
      locale === 'ar' ? 'الاستشارات والتنفيذ' : 'Consulting & Delivery',
      locale === 'ar' ? 'الأنظمة المدمجة وإنترنت الأشياء' : 'Embedded & IoT',
      locale === 'ar' ? 'الأمن والجودة' : 'Security & Quality',
      locale === 'ar' ? 'خدمات إضافية' : 'Additional Services',
      locale === 'ar' ? 'استشارات وتطبيق الذكاء الاصطناعي' : 'AI Consulting & Implementation',
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

test('solutions show their illustration and product menus use original marks on desktop and mobile', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['ar', 'en']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    const nav = page.locator('.site-desktop-nav');
    await nav
      .getByRole('button', { name: locale === 'ar' ? 'حلولنا' : 'Solutions', exact: true })
      .press('Enter');
    await page
      .locator('.site-mega-panel')
      .evaluate((node) => Promise.all(node.getAnimations().map((animation) => animation.finished)));
    const illustration = page.locator('.site-mega-solutions-image');
    await expect(illustration).toBeVisible();
    await expect(illustration).toHaveAttribute('src', '/brand/navigation/solutions-v1.webp');
    await expect
      .poll(() =>
        illustration.evaluate(
          (node: HTMLImageElement) => node.complete && node.naturalWidth === 560,
        ),
      )
      .toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .include('.site-mega-intro')
          .include('.site-mega-links')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await nav
      .getByRole('button', { name: locale === 'ar' ? 'منتجاتنا' : 'Products', exact: true })
      .press('Enter');
    await page
      .locator('.site-products-panel')
      .evaluate((node) => Promise.all(node.getAnimations().map((animation) => animation.finished)));
    await expect(page.locator('.site-products-panel .site-product-mark img')).toHaveCount(2);
    for (const name of ['pesto', 'advocas']) {
      const link = page.locator(`.site-products-panel a[href="/${locale}/${name}"]`);
      await expect(link.locator('img')).toHaveAttribute(
        'src',
        `/brand/navigation/${name}-logo-v1.webp`,
      );
      await expect
        .poll(() =>
          link
            .locator('img')
            .evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth === 320),
        )
        .toBe(true);
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include('.site-products-panel')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.goto(`/${locale}`);
    await nav
      .getByRole('button', { name: locale === 'ar' ? 'منتجاتنا' : 'Products', exact: true })
      .press('Enter');
    const target = page.locator(`.site-products-panel a[href="/${locale}/pesto"]`);
    await target.focus();
    await target.press('Enter');
    await expect(page).toHaveURL(`/${locale}/pesto`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await page
      .getByRole('button', {
        name: locale === 'ar' ? 'فتح القائمة' : 'Open navigation',
        exact: true,
      })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog
      .getByRole('button', { name: locale === 'ar' ? 'منتجاتنا' : 'Products', exact: true })
      .click();
    await expect(dialog.locator('.site-product-mark img')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await dialog.locator(`a[href="/${locale}/advocas"]`).click();
    await expect(page).toHaveURL(`/${locale}/advocas`);
  }
  expect(errors).toEqual([]);
});
