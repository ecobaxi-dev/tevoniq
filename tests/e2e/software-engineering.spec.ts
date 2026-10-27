import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('engineering page remains gated by publication in both languages', async ({
  page,
  request,
}) => {
  const headers = { Origin: 'http://127.0.0.1:3100' };
  expect(
    (
      await request.post('/api/cms/auth/login', {
        headers,
        data: { email: 'test@example.invalid', password: 'Development-only-password' },
      })
    ).ok(),
  ).toBe(true);
  const service = (await (await request.get('/api/cms/services')).json()).items[0];
  const setPublication = async (published: boolean) => {
    await request.post('http://127.0.0.1:4100/fixture/engineering-state', { data: { published } });
    expect(
      (await request.put(`/api/cms/services/${service.id}`, { headers, data: service })).ok(),
    ).toBe(true);
  };
  await setPublication(false);
  try {
    for (const locale of ['ar', 'en']) {
      expect((await page.goto(`/${locale}/services/software-product-engineering`))?.status()).toBe(
        404,
      );
      await expect(page.locator('.se-service')).toHaveCount(0);
    }
  } finally {
    await setPublication(true);
    await request.post('/api/cms/auth/logout', { headers, data: {} });
  }
});
test('all services and delivery stages show matching outputs and pass the selected context to contact', async ({
  page,
}) => {
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') posts++;
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/services/software-product-engineering`);
    for (let i = 0; i < 6; i++) {
      await page.locator('.se-service-choices input').nth(i).check();
      const title = await page.locator('.se-service-choices strong').nth(i).textContent();
      await expect(page.locator('.se-service-panel:visible h3')).toHaveText(title!);
      await expect(page.locator('.se-service-panel:visible li')).toHaveCount(3);
      await expect(page.locator('.se-service-panel:visible .se-output')).toBeVisible();
    }
    for (let i = 0; i < 4; i++) {
      await page.locator('.se-stage-choices input').nth(i).check();
      const title = await page.locator('.se-stage-choices strong').nth(i).textContent();
      await expect(page.locator('.se-stage-panels>article:visible h3')).toHaveText(title!);
      await expect(page.locator('.se-stage-panels>article:visible .se-stage-grid>div')).toHaveCount(
        2,
      );
    }
    await page.locator('.se-stage-panels>article:visible a').click();
    await expect(page.locator('textarea[name=message]')).toHaveValue(
      locale === 'ar' ? /نسلّم ونحسّن/ : /Hand over and improve/,
    );
  }
  expect(posts).toBe(0);
  expect(errors).toEqual([]);
});
test('three original scenario studies expose scope, acceptance checks and working demo and contact links', async ({
  page,
}) => {
  await page.goto('/ar/services/software-product-engineering');
  await expect(page.locator('.se-case')).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const item = page.locator('.se-case').nth(i);
    await item.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(item.locator('details')).toHaveAttribute('open', '');
    await expect(item.locator('details h4')).toHaveCount(4);
    await expect(item.locator('details li')).toHaveCount(6);
    await expect(item.locator('.se-output')).toBeVisible();
  }
  await page.locator('.se-case').first().locator('.se-case-discuss').click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(/منشأة صيانة تنظّم طلباتها/);
  await page.goto('/en/services/software-product-engineering');
  await page.locator('.se-case').last().locator('.se-demo-link').click();
  await expect(page).toHaveURL(/\/en\/automation-demos\/lead-capture$/);
  await page.goto('/ar/contact?engineering=case&id=unknown');
  await expect(page.locator('textarea[name=message]')).toHaveValue('');
});
test('engineering layout is responsive, accessible and uses local links and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/services/software-product-engineering`);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `http://127.0.0.1:3100/${locale}/services/software-product-engineering`,
    );
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${locale}/${width}`,
      ).toBe(true);
    }
    for (const href of await page
      .locator('.se-service a')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))))
      expect(href).toMatch(new RegExp(`^(#|/${locale}/)`));
    expect(await page.locator('.se-service').innerText()).not.toMatch(
      /N-iX|APEX|Fortune|SAP|RPA|DevSecOps/,
    );
    expect(
      await page
        .locator('.se-code-symbol>svg')
        .evaluate((node) => getComputedStyle(node).animationName),
    ).toBe('none');
    const scan = await new AxeBuilder({ page })
      .include('.se-service')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(scan.violations, locale).toEqual([]);
    await page.locator('.se-service-choices input').last().check();
    await page.locator('.se-stage-choices input').last().check();
    await page.locator('.se-case summary').first().click();
    await page.locator('#se-faq summary').first().click();
    const expanded = await new AxeBuilder({ page })
      .include('.se-service')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(expanded.violations, locale + ' expanded').toEqual([]);
  }
});
test('legacy Turkish is unchanged and all service and stage content remains available without JavaScript', async ({
  page,
  browser,
}) => {
  await page.goto('/tr/services/software-product-engineering');
  await expect(page.locator('.se-service')).toHaveCount(0);
  await expect(page.locator('main h1')).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/ar/services/software-product-engineering');
  await expect(staticPage.locator('.se-service-panel')).toHaveCount(6);
  await expect(staticPage.locator('.se-stage-panels>article')).toHaveCount(4);
  await expect(staticPage.locator('.se-service-choices')).toBeHidden();
  for (const item of await staticPage.locator('.se-service-panel').all())
    await expect(item).toBeVisible();
  for (const item of await staticPage.locator('.se-stage-panels>article').all())
    await expect(item).toBeVisible();
  await staticPage.locator('.se-case summary').first().click();
  await expect(staticPage.locator('.se-case details').first()).toHaveAttribute('open', '');
  await staticPage.locator('#se-faq summary').first().click();
  await expect(staticPage.locator('#se-faq details').first()).toHaveAttribute('open', '');
  await context.close();
});
