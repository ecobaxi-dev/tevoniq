import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('IoT presentation remains behind service publication in both public languages', async ({
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
    await request.post('http://127.0.0.1:4100/fixture/iot-state', { data: { published } });
    expect(
      (await request.put(`/api/cms/services/${service.id}`, { headers, data: service })).ok(),
    ).toBe(true);
  };
  await setPublication(false);
  try {
    for (const locale of ['ar', 'en']) {
      expect((await page.goto(`/${locale}/services/iot-solutions`))?.status()).toBe(404);
      await expect(page.locator('.iot-service')).toHaveCount(0);
    }
  } finally {
    await setPublication(true);
    await request.post('/api/cms/auth/logout', { headers, data: {} });
  }
});
test('simulator distinguishes current alerts, outdated readings and offline sources without sending data', async ({
  page,
}) => {
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') posts++;
  });
  await page.goto('/en/services/iot-solutions');
  const form = page.locator('.iot-simulator-form');
  const run = form.getByRole('button', { name: 'Evaluate the simulated reading', exact: false });
  await run.click();
  await expect(page.locator('.iot-reading-status')).toHaveText('Fresh reading within the rule');
  await form.locator('input[name=reading]').fill('35');
  await run.click();
  await expect(page.locator('.iot-reading-status')).toHaveText('Fresh reading needs review');
  await form.locator('input[name=age]').fill('16');
  await run.click();
  await expect(page.locator('.iot-reading-status')).toHaveText('Outdated reading — refresh needed');
  await form.locator('input[type=checkbox]').uncheck();
  await run.click();
  await expect(page.locator('.iot-reading-status')).toHaveText(
    'Source disconnected — no new reading',
  );
  await expect(page.locator('.iot-reading-value')).toHaveText('—');
  await expect(page.locator('.iot-history li')).toHaveCount(4);
  expect(posts).toBe(0);
  await form.getByRole('button', { name: 'Reset this example', exact: false }).click();
  await expect(page.locator('.iot-history li')).toHaveCount(0);
  await expect(form.locator('input[name=reading]')).toHaveValue('24');
  await expect(form.locator('input[type=checkbox]')).toBeChecked();
});
test('scenario changes reset history, example limits reject invalid readings and logs remain bounded and local', async ({
  page,
}) => {
  await page.goto('/ar/services/iot-solutions');
  const form = page.locator('.iot-simulator-form');
  await form.locator('select').selectOption('moisture');
  await form.locator('input[name=reading]').fill('20');
  await form.locator('button[type=submit]').click();
  await expect(page.locator('.iot-reading-status')).toHaveText('قراءة حديثة تستدعي المراجعة');
  await form.locator('select').selectOption('tank');
  await expect(page.locator('.iot-history li')).toHaveCount(0);
  await expect(form.locator('input[name=reading]')).toHaveValue('60');
  await form.locator('input[name=reading]').fill('150');
  expect(
    await form
      .locator('input[name=reading]')
      .evaluate((node: HTMLInputElement) => node.checkValidity()),
  ).toBe(false);
  await form.locator('button[type=submit]').click();
  await expect(page.locator('.iot-history li')).toHaveCount(0);
  await form.locator('input[name=reading]').fill('10');
  for (let i = 0; i < 7; i++) await form.locator('button[type=submit]').click();
  await expect(page.locator('.iot-history li')).toHaveCount(5);
  await expect(page.locator('.iot-history li').first()).toContainText('#7');
  await page.reload();
  await expect(page.locator('.iot-history li')).toHaveCount(0);
});
test('scenario details and simulator selections have meaningful local contact handoffs', async ({
  page,
}) => {
  await page.goto('/ar/services/iot-solutions');
  await expect(page.locator('.iot-case-grid>article')).toHaveCount(3);
  await page.locator('.iot-case-grid summary').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.iot-case-grid details').first()).toHaveAttribute('open', '');
  await page.locator('.iot-case-copy').first().getByRole('link').click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(/متابعة بيئة غرفة معدات/);
  await page.goto('/en/services/iot-solutions');
  await page.locator('.iot-simulator-form select').selectOption('moisture');
  await page.locator('.iot-discuss').click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(
    /Relative soil-moisture readings/,
  );
  await page.goto('/en/contact?iot=unknown');
  await expect(page.locator('textarea[name=message]')).toHaveValue('');
});
test('IoT page and simulator fit mobile, are accessible and expose no browser errors or retired offerings', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/${locale}/services/iot-solutions`);
    if (locale === 'ar')
      expect(
        await page
          .locator('.iot-hero h1')
          .evaluate(
            (node) =>
              node.getBoundingClientRect().height <
              parseFloat(getComputedStyle(node).lineHeight) * 1.5,
          ),
      ).toBe(true);
    await expect(page.locator('.iot-services-grid article')).toHaveCount(6);
    await expect(page.locator('.iot-layers>li')).toHaveCount(4);
    await expect(page.locator('.iot-process>li')).toHaveCount(6);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `http://127.0.0.1:3100/${locale}/services/iot-solutions`,
    );
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${locale}/${width}`,
      ).toBe(true);
    }
    for (const href of await page
      .locator('.iot-service a')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))))
      expect(href).toMatch(new RegExp(`^(#|/${locale}/)`));
    expect(await page.locator('.iot-service').innerText()).not.toMatch(
      /N-iX|APEX|SAP|RPA|DevSecOps|ISO|Fortune/,
    );
    const initial = await new AxeBuilder({ page })
      .include('.iot-service')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(initial.violations, locale).toEqual([]);
    await page.locator('.iot-simulator-form input[name=reading]').fill('35');
    await page.locator('.iot-simulator-form button[type=submit]').click();
    await page.locator('#iot-faq summary').first().click();
    const evaluated = await new AxeBuilder({ page })
      .include('.iot-service')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(evaluated.violations, locale + ' evaluated').toEqual([]);
  }
  expect(errors).toEqual([]);
});
test('Turkish keeps its existing content and static IoT marketing works without JavaScript', async ({
  page,
  browser,
}) => {
  await page.goto('/tr/services/iot-solutions');
  await expect(page.locator('.iot-service')).toHaveCount(0);
  await expect(page.locator('main h1')).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/ar/services/iot-solutions');
  await expect(staticPage.locator('.iot-services-grid article')).toHaveCount(6);
  await expect(staticPage.locator('.iot-process>li')).toHaveCount(6);
  await expect(staticPage.locator('.iot-simulator-workspace')).toBeHidden();
  await staticPage.locator('#iot-faq summary').first().click();
  await expect(staticPage.locator('#iot-faq details').first()).toHaveAttribute('open', '');
  await context.close();
});
