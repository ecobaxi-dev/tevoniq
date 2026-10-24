import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['en', 'ar', 'tr']) {
  test(`Pesto ${locale}: honest availability, useful navigation and accessible mobile layout`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/pesto`);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.pesto-download button')).toHaveCount(2);
    for (const button of await page.locator('.pesto-download button').all())
      await expect(button).toBeDisabled();
    await expect(
      page.locator(
        'main a[download], main a[href$=".apk"], main a[href$=".exe"], main input, main form',
      ),
    ).toHaveCount(0);
    await expect(page.locator('main a[href="https://wa.me/905550188126"]')).toBeVisible();
    await expect(
      page.locator('main a[href="mailto:kallas.hossam@gmail.com"]').first(),
    ).toBeVisible();
    for (const id of ['overview', 'downloads', 'activation', 'support']) {
      await page.locator(`.pesto-subnav > div a[href="#${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    const faq = page.locator('.pesto-faq details').first();
    await faq.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(faq).toHaveAttribute('open', '');
    await expect(faq.locator('p')).toBeVisible();
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBeTruthy();
    }
    const scan = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `http://127.0.0.1:3100/${locale}/pesto`,
    );
    for (const language of ['en', 'ar', 'tr'])
      await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveAttribute(
        'href',
        `http://127.0.0.1:3100/${language}/pesto`,
      );
    await page.goto(`/${locale}`);
    await page.locator(`.pesto-home-entry a[href="/${locale}/pesto"]`).click();
    await expect(page).toHaveURL(`/${locale}/pesto`);
  });
}

test('Pesto redirect and sitemap expose the product route without duplicate entries', async ({
  request,
}) => {
  const redirect = await request.get('/pesto', { maxRedirects: 0 });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toBe('/en/pesto');
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBeTruthy();
  const xml = await response.text();
  for (const locale of ['en', 'ar', 'tr'])
    expect(xml.split(`<loc>http://127.0.0.1:3100/${locale}/pesto</loc>`)).toHaveLength(2);
});
