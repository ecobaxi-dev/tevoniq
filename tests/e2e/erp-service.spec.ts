import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
test('ERP presentation respects publication in both public languages', async ({
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
    await request.post('http://127.0.0.1:4100/fixture/erp-state', { data: { published } });
    expect(
      (await request.put(`/api/cms/services/${service.id}`, { headers, data: service })).ok(),
    ).toBe(true);
  };
  await setPublication(false);
  try {
    for (const locale of ['ar', 'en']) {
      expect((await page.goto(`/${locale}/services/erp-solutions`))?.status()).toBe(404);
      await expect(page.locator('.erp-service')).toHaveCount(0);
    }
  } finally {
    await setPublication(true);
    await request.post('/api/cms/auth/logout', { headers, data: {} });
  }
});
test('all six module choices show records, output, scope boundaries and a functioning related model link', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/services/erp-solutions`);
    const inputs = page.locator('.erp-module-choices input');
    await expect(inputs).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await inputs.nth(i).check();
      await expect(inputs.nth(i)).toBeChecked();
      await expect(page.locator('.erp-module-panel h3')).toHaveText(
        (await page.locator('.erp-module-choices label strong').nth(i).textContent())!,
      );
      await expect(page.locator('.erp-module-fields>span')).toHaveCount(3);
      await expect(page.locator('.erp-module-output')).toBeVisible();
      await expect(page.locator('.erp-module-boundary')).not.toBeEmpty();
      await expect(page.locator('.erp-module-panel .erp-primary')).toHaveAttribute(
        'href',
        new RegExp(`^/${locale}/work-systems/`),
      );
    }
    await page.locator('.erp-module-panel .erp-primary').click();
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/${locale}/work-systems/projects-tasks$`));
  }
  expect(errors).toEqual([]);
});
test('selected module downloads an original brief and prefills contact without automatically sending', async ({
  page,
}) => {
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') posts++;
  });
  await page.goto('/ar/services/erp-solutions');
  await page.locator('.erp-module-choices input[value=inventory]').check();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'تحميل الملخص' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('tevoniq-erp-inventory-ar.txt');
  const brief = await readFile((await download.path())!, 'utf8');
  expect(brief).toContain('المخزون والأصناف');
  expect(brief).toContain('ليس عرض تنفيذ');
  await page.locator('.erp-module-panel .erp-secondary').click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(/المخزون والأصناف/);
  expect(posts).toBe(0);
  await page.goto('/en/contact?erp=module&module=unknown');
  await expect(page.locator('textarea[name=message]')).toHaveValue('');
});
test('comparison keeps both options visible and selected option has an accurate contact handoff', async ({
  page,
}) => {
  await page.goto('/en/services/erp-solutions');
  await expect(page.locator('.erp-comparison tbody tr')).toHaveCount(7);
  await expect(page.locator('.erp-comparison tbody td')).toHaveCount(14);
  await page.locator('.erp-option-review input[value=custom]').check();
  await expect(page.locator('.erp-option-detail h3')).toHaveText('Build a defined custom scope');
  await expect(page.locator('.erp-comparison thead th[data-selected=true]')).toHaveText(
    'Build a defined custom scope',
  );
  await page.locator('.erp-option-detail a').click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(/Build a defined custom scope/);
});
test('ERP page fits desktop and mobile, meets accessibility checks and has only local links', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/services/erp-solutions`);
    await expect(page.locator('.erp-services-grid article')).toHaveCount(6);
    await expect(page.locator('.erp-process>li')).toHaveCount(4);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `http://127.0.0.1:3100/${locale}/services/erp-solutions`,
    );
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${locale}/${width}`,
      ).toBe(true);
    }
    for (const href of await page
      .locator('.erp-service a')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))))
      expect(href).toMatch(new RegExp(`^(#|/${locale}/)`));
    expect(await page.locator('.erp-service').innerText()).not.toMatch(
      /N-iX|N-IX|SAP|RPA|استعراض المصدر/,
    );
    expect(
      await page.locator('.erp-art-orbit').evaluate((node) => getComputedStyle(node).animationName),
    ).toBe('none');
    const scan = await new AxeBuilder({ page })
      .include('.erp-service')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(scan.violations, locale).toEqual([]);
    await page.locator('.erp-module-choices input[value=inventory]').check();
    await page.locator('.erp-option-review input[value=custom]').check();
    await page.locator('#erp-faq summary').first().click();
    const changed = await new AxeBuilder({ page })
      .include('.erp-service')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(changed.violations, locale + ' changed').toEqual([]);
  }
});
test('legacy Turkish stays generic, static ERP content and module details work without JavaScript', async ({
  page,
  browser,
}) => {
  await page.goto('/tr/services/erp-solutions');
  await expect(page.locator('.erp-service')).toHaveCount(0);
  await expect(page.locator('main h1')).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/ar/services/erp-solutions');
  await expect(staticPage.locator('.erp-services-grid article')).toHaveCount(6);
  await expect(staticPage.locator('.erp-static-modules details')).toHaveCount(6);
  await expect(staticPage.locator('.erp-comparison tbody tr')).toHaveCount(7);
  await staticPage.locator('.erp-static-modules summary').nth(2).click();
  await expect(staticPage.locator('.erp-static-modules details').nth(2)).toHaveAttribute(
    'open',
    '',
  );
  await expect(
    staticPage.locator('.erp-static-modules details').nth(2).getByRole('link'),
  ).toBeVisible();
  await staticPage.locator('#erp-faq summary').first().click();
  await expect(staticPage.locator('#erp-faq details').first()).toHaveAttribute('open', '');
  await context.close();
});
