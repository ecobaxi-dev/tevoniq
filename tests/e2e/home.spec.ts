import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('homepage contains approved capabilities, hides empty CMS sections, and links its calls to action', async ({
  page,
}) => {
  await page.goto('/en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Premium Technologyfor a Smarter Tomorrow',
  );
  await expect(page.locator('.home-solutions .tv-card')).toHaveCount(6);
  await expect(page.locator('.technology-ecosystem__choices button')).toHaveCount(9);
  await expect(page.locator('.why-tevoniq__value')).toHaveCount(6);
  for (const id of ['industries', 'projects', 'partners', 'insights'])
    await expect(page.locator(`main #${id}`)).toHaveCount(0);
  await page.getByRole('link', { name: 'Get Started', exact: true }).first().click();
  await expect(page).toHaveURL('/en#solutions');
  await page.getByRole('link', { name: 'Contact Us', exact: true }).first().click();
  await expect(page).toHaveURL('/en/contact');
});
test('localized homepages are accessible and responsive with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['en', 'tr', 'ar']) {
    for (const width of [360, 768, 1440, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBeTruthy();
    }
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
  }
  await page.locator('.why-tevoniq').scrollIntoViewIfNeeded();
  expect(
    await page
      .locator('.why-tevoniq')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
});
test('homepage remains readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3100/en');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(
    page
      .locator('#solutions')
      .getByRole('heading', { name: 'Artificial Intelligence', exact: true }),
  ).toBeVisible();
  await context.close();
});
