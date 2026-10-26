import { test, expect } from '@playwright/test';
const slugs = [
  'furniture-atelier',
  'retail-store',
  'industrial',
  'real-estate',
  'agriculture',
  'business-services',
];
test('gallery, design capabilities and selected design reach the contact form', async ({
  page,
}) => {
  await page.goto('/ar');
  await page.locator('.sme-service-card--website .sme-service-contact').click();
  await expect(page).toHaveURL('/ar/website-designs');
  await expect(page.locator('.design-card')).toHaveCount(6);
  await page.screenshot({ path: test.info().outputPath('gallery-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'معرض الأثاث والتصميم حسب الطلب', exact: true }).click();
  await expect(page.locator('.design-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'التفاصيل والإمكانات', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'هل يمكن البيع أونلاين؟' })).toBeVisible();
  await expect(page.getByText('بوابة الدفع وخدمة الشحن', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'أرسل متطلبات هذا التصميم', exact: false }).click();
  await expect(page.locator('textarea[name="message"]')).toHaveValue(
    /معرض الأثاث والتصميم حسب الطلب/,
  );
});
test('furniture preview slides, customisation, basket and local request work without network submission', async ({
  page,
}) => {
  let submissions = 0;
  page.on('request', (r) => {
    if (r.method() === 'POST') submissions++;
  });
  await page.goto('/previews/ar/furniture-atelier');
  await page.getByRole('button', { name: 'الصورة التالية' }).click();
  await expect(page.locator('h1')).toHaveText('كل تفصيلة، أقرب إليك.');
  await page.getByRole('button', { name: 'أضف للسلة', exact: false }).first().click();
  await page.getByRole('button', { name: 'السلة (1)', exact: true }).click();
  const basket = page.getByRole('dialog');
  await expect(basket).toBeVisible();
  await basket.getByRole('spinbutton').fill('2');
  await expect(basket).toContainText('900');
  await page.keyboard.press('Escape');
  await expect(basket).toBeHidden();
  await page.getByRole('spinbutton', { name: 'العرض بالسنتيمتر' }).fill('220');
  await page.getByRole('button', { name: 'جهّز طلب التصميم', exact: false }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('220 cm');
  await dialog.getByRole('textbox', { name: 'الاسم', exact: true }).fill('زائر تجريبي');
  await dialog.getByRole('textbox', { name: 'البريد الإلكتروني' }).fill('demo@example.com');
  await dialog.getByRole('button', { name: 'تجربة تأكيد الطلب' }).click();
  await expect(dialog.getByRole('status')).toContainText('لم تُرسل بياناتك');
  expect(submissions).toBe(0);
});
test('all six previews are available in Arabic and English and fit mobile screens', async ({
  page,
}) => {
  for (const locale of ['ar', 'en']) {
    for (const slug of slugs) {
      await page.goto(`/previews/${locale}/${slug}`);
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.locator('.wp-product')).toHaveCount(3);
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate(
              (el) =>
                (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0,
            ),
          )
          .toBe(true);
      }
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    }
  }
});
test('property filtering and service appointments remain illustrative', async ({ page }) => {
  await page.goto('/previews/ar/real-estate');
  await page.getByRole('button', { name: 'فلل', exact: true }).click();
  await expect(page.locator('.wp-product')).toHaveCount(2);
  await page.getByRole('button', { name: 'حفظ فيلا بإطلالة مفتوحة' }).click();
  await expect(page.locator('.wp-status')).toHaveText('عقارات محفوظة: 1');
  await page.goto('/previews/ar/business-services');
  await page.getByRole('button', { name: 'ناقش هذا الاحتياج', exact: false }).first().click();
  const d = page.getByRole('dialog');
  await d.getByRole('textbox', { name: 'الاسم', exact: true }).fill('Demo');
  await d.getByRole('textbox', { name: 'البريد الإلكتروني' }).fill('demo@example.com');
  await d.locator('input[type=date]').fill('2027-12-01');
  await d.getByRole('button', { name: 'تجربة تأكيد الطلب' }).click();
  await expect(d.getByRole('status')).toContainText('موعد فعلي');
});
test('gallery and details fit small screens, missing designs are 404 and previews are noindex', async ({
  page,
}) => {
  for (const locale of ['ar', 'en']) {
    for (const path of ['website-designs', 'website-designs/furniture-atelier']) {
      await page.goto(`/${locale}/${path}`);
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    }
  }
  await page.goto('/previews/ar/furniture-atelier');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
  const missing = await page.goto('/ar/website-designs/not-a-design');
  expect(missing?.status()).toBe(404);
  await page.goto('/ar/contact?design=unknown');
  await expect(page.locator('textarea[name=message]')).toHaveValue('');
});

test('gallery and preview support accessible navigation and reduced motion', async ({
  page,
  browser,
}) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of [
    '/ar/website-designs',
    ...slugs.flatMap((slug) => ['ar', 'en'].map((locale) => `/previews/${locale}/${slug}`)),
  ]) {
    await page.goto(path);
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(scan.violations, path).toEqual([]);
  }
  await page.goto('/previews/ar/furniture-atelier');
  await expect(page.locator('.wp-ribbon')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'السلة (0)' }).click();
  await page.keyboard.press('Tab');
  expect(await page.getByRole('dialog').evaluate((el) => el.contains(document.activeElement))).toBe(
    true,
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/ar/website-designs');
  await expect(staticPage.locator('.design-card')).toHaveCount(6);
  await staticPage
    .locator('.design-card')
    .first()
    .getByRole('link', { name: 'التفاصيل والإمكانات', exact: false })
    .click();
  await expect(staticPage.locator('main h1')).toBeVisible();
  await context.close();
});
