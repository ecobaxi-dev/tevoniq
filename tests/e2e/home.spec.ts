import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('homepage contains approved capabilities, hides empty CMS sections, and links its calls to action', async ({
  page,
}) => {
  await page.goto('/en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Premium Technologyfor a Smarter Tomorrow',
  );
  await expect(page.locator('.sme-service-card')).toHaveCount(4);
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
    page.locator('#solutions').getByRole('heading', { name: 'Business websites', exact: true }),
  ).toBeVisible();
  const details = page.locator('.sme-service-details').first();
  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
  await expect(details.locator('li')).toHaveCount(3);
  await context.close();
});

test('Arabic service cards follow the product entries and expose examples, delivery scope and working contact links', async ({
  page,
}) => {
  await page.goto('/ar');
  const section = page.locator('.sme-home-services');
  await expect(
    page.locator('.artwork-hero + .pesto-home-entry + .advocas-home-entry + .sme-home-services'),
  ).toHaveCount(1);
  await expect(page.locator('#solutions')).toHaveCount(1);
  const cards = section.locator('article');
  await expect(cards.locator('h3')).toHaveText([
    'مواقع الأعمال',
    'أنظمة إدارة العمل',
    'الأتمتة والربط',
    'لوحات المعلومات',
  ]);
  await expect(cards.locator('.sme-service-example > span')).toHaveText(
    Array(4).fill('مثال توضيحي'),
  );
  for (const card of await cards.all()) {
    const details = card.locator('details');
    await card.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');
    await expect(details.locator('li')).toHaveCount(3);
    await expect(card.getByRole('link', { name: /ناقش احتياجك/ })).toHaveAttribute(
      'href',
      '/ar/contact?intent=quote',
    );
  }
  await cards
    .first()
    .getByRole('link', { name: /ناقش احتياجك/ })
    .click();
  await expect(page).toHaveURL('/ar/contact?intent=quote');
  await expect(page.locator('main h1')).toBeVisible();
});

test('product entries appear once in the requested order with the supplied Advocas logo and local links', async ({
  page,
}) => {
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}`);
    await expect(
      page.locator('.artwork-hero + .pesto-home-entry + .advocas-home-entry + .sme-home-services'),
    ).toHaveCount(1);
    const entry = page.locator('.advocas-home-entry');
    await expect(entry).toHaveCount(1);
    await expect(page.locator('.advocas-showcase')).toHaveCount(0);
    const logo = entry.locator('img');
    await expect(logo).toHaveAttribute(
      'alt',
      locale === 'ar' ? 'شعار المحامون' : 'Al Muhamoon — Advocas logo',
    );
    await expect
      .poll(() => logo.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
    await expect(entry.locator('a').first()).toHaveAttribute('href', `/${locale}/advocas`);
    await expect(entry.locator('a').last()).toHaveAttribute(
      'href',
      `/${locale}/contact?intent=quote`,
    );
    await entry.locator('a').first().click();
    await expect(page).toHaveURL(`/${locale}/advocas`);
    await expect(page.locator('main h1')).toBeVisible();
  }
});

test('Advocas title fits one line, matches Pesto lighting, and keeps readable hover colors', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/ar');
  await page.evaluate(() => document.fonts.ready);
  const entry = page.locator('.advocas-home-entry');
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const title = await entry.locator('h2').evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return {
        lines: new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.top))).size,
        fits: el.scrollWidth <= el.clientWidth,
      };
    });
    expect(title.lines).toBe(1);
    expect(title.fits).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  const surfaces = await page.evaluate(() => {
    const pesto = document.querySelector('.pesto-home-entry')!;
    const advocas = document.querySelector('.advocas-home-entry')!;
    const read = (el: Element) => {
      const base = getComputedStyle(el),
        before = getComputedStyle(el, '::before'),
        after = getComputedStyle(el, '::after');
      return [
        base.backgroundColor,
        base.backgroundImage,
        before.boxShadow,
        before.animationName,
        before.animationDuration,
        after.backgroundImage,
        after.animationName,
        after.animationDuration,
      ];
    };
    return {
      pesto: read(pesto),
      advocas: read(advocas),
      gap: advocas.getBoundingClientRect().top - pesto.getBoundingClientRect().bottom,
    };
  });
  expect(surfaces.advocas).toEqual(surfaces.pesto);
  expect(surfaces.gap).toBeCloseTo(12, 1);
  expect(surfaces.advocas).toContain('pesto-entry-glow');
  expect(surfaces.advocas).toContain('pesto-entry-sheen');
  await page.setViewportSize({ width: 1440, height: 1000 });
  const buttons = entry.locator('.advocas-entry-actions a');
  const backgrounds = ['rgb(143, 221, 211)', 'rgb(217, 250, 246)'];
  for (let index = 0; index < 2; index++) {
    await buttons.nth(index).hover();
    await expect(buttons.nth(index)).toHaveCSS('background-color', backgrounds[index]!);
    await expect(buttons.nth(index)).toHaveCSS('color', 'rgb(7, 59, 66)');
    const scan = await new AxeBuilder({ page })
      .include('.advocas-entry-actions')
      .withTags(['wcag2aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const pseudo of ['::before', '::after']) {
    expect(
      await entry.evaluate((el, pseudo) => getComputedStyle(el, pseudo).animationName, pseudo),
    ).toBe('none');
  }
});
