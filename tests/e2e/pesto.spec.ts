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
    const entry = page.locator('.pesto-home-entry');
    const logo = entry.getByRole('img', { name: 'Pesto — Restaurant System' });
    await entry.scrollIntoViewIfNeeded();
    await expect(logo).toBeVisible();
    await expect
      .poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0);
    await expect(entry.locator('.pesto-kicker')).toHaveCount(0);
    const entryLink = entry.getByRole('link');
    for (const state of ['default', 'hover', 'focus']) {
      if (state === 'hover') await entryLink.hover();
      if (state === 'focus') {
        await entryLink.focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab');
        await expect(entryLink).toBeFocused();
        expect(
          await entryLink.evaluate((link) => {
            const style = getComputedStyle(link);
            return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2;
          }),
        ).toBeTruthy();
      }
      await expect
        .poll(
          () =>
            entryLink.evaluate((link) => {
              const style = getComputedStyle(link);
              const channels = (value: string) => value.match(/[\d.]+/g)?.map(Number) ?? [];
              const foreground = channels(style.color);
              const background = channels(style.backgroundColor);
              if (foreground.length < 3 || background.length < 3 || (background[3] ?? 1) < 1)
                return 0;
              const luminance = (rgb: number[]) =>
                rgb.slice(0, 3).reduce((sum, channel, index) => {
                  const value = channel / 255;
                  const linear =
                    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
                  return sum + linear * [0.2126, 0.7152, 0.0722][index];
                }, 0);
              const light = Math.max(luminance(foreground), luminance(background));
              const dark = Math.min(luminance(foreground), luminance(background));
              return (light + 0.05) / (dark + 0.05);
            }),
          `CTA readable in ${state} state`,
        )
        .toBeGreaterThanOrEqual(4.5);
    }
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(logo).toBeVisible();
      expect(
        await entry.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return [...element.querySelectorAll('img, h2, p, a')].every((child) => {
            const rect = child.getBoundingClientRect();
            return rect.left >= bounds.left && rect.right <= bounds.right;
          });
        }),
      ).toBeTruthy();
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const pseudo of ['::before', '::after']) {
      expect(
        await entry.evaluate(
          (element, pseudo) => getComputedStyle(element, pseudo).animationName,
          pseudo,
        ),
      ).toBe('none');
    }
    const entryScan = await new AxeBuilder({ page })
      .include('.pesto-home-entry')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(entryScan.violations).toEqual([]);
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
