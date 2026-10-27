import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('automation presentation respects publication in both languages', async ({
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
    await request.post('http://127.0.0.1:4100/fixture/business-automation-state', {
      data: { published },
    });
    expect(
      (await request.put(`/api/cms/services/${service.id}`, { headers, data: service })).ok(),
    ).toBe(true);
  };
  await setPublication(false);
  try {
    for (const locale of ['ar', 'en']) {
      expect((await page.goto(`/${locale}/services/business-automation`))?.status()).toBe(404);
      await expect(page.locator('.ia-service')).toHaveCount(0);
    }
  } finally {
    await setPublication(true);
    await request.post('/api/cms/auth/logout', { headers, data: {} });
  }
});

test('five-stage journey mirrors the desktop layout, follows scroll and realigns expanded rows', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/services/business-automation`);
    await expect(page.locator('.ia-stage')).toHaveCount(5);
    await expect(page.locator('.ia-journey-path')).toHaveAttribute('data-progress', '0');
    const circles = await page.locator('.ia-stage-number').evaluateAll((nodes) =>
      nodes.map((node) => ({
        x: node.getBoundingClientRect().x,
        y: node.getBoundingClientRect().y,
      })),
    );
    expect(locale === 'ar' ? circles[0].x > circles[1].x : circles[0].x < circles[1].x).toBe(true);
    expect(circles.every((circle, i) => i === 0 || circle.y > circles[i - 1].y)).toBe(true);
    const title = page.locator('.ia-journey-heading h2');
    expect(
      await title.evaluate(
        (node) =>
          node.getBoundingClientRect().height < parseFloat(getComputedStyle(node).lineHeight) * 1.5,
      ),
    ).toBe(true);
    await page.locator('.ia-stage').nth(2).scrollIntoViewIfNeeded();
    await expect
      .poll(async () =>
        Number(await page.locator('.ia-journey-path').getAttribute('data-progress')),
      )
      .toBeGreaterThan(0.2);
    const before = await page.locator('.ia-path-track').getAttribute('d');
    await page.locator('.ia-stage summary').nth(2).click();
    await expect(page.locator('.ia-stage details').nth(2)).toHaveAttribute('open', '');
    await expect.poll(() => page.locator('.ia-path-track').getAttribute('d')).not.toBe(before);
    expect(await page.locator('.ia-path-track').getAttribute('d')).not.toMatch(/NaN|Infinity/);
  }
  expect(errors).toEqual([]);
});

test('stage details work by keyboard and transfer a validated brief to contact without sending it', async ({
  page,
}) => {
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') posts++;
  });
  await page.goto('/ar/services/business-automation');
  const summary = page.locator('.ia-stage summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.ia-stage details').first()).toHaveAttribute('open', '');
  await page.locator('.ia-stage details').first().getByRole('link').click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(/نفهم طريقة عملك/);
  expect(posts).toBe(0);
  await page.goto('/en/contact?journey=unknown');
  await expect(page.locator('textarea[name=message]')).toHaveValue('');
});

test('automation page is accessible and responsive, with local demo links and stable reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/services/business-automation`);
    await expect(page.locator('.ia-examples>a')).toHaveCount(6);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `http://127.0.0.1:3100/${locale}/services/business-automation`,
    );
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${locale}/${width}`,
      ).toBe(true);
    }
    const circles = await page
      .locator('.ia-stage-number')
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().x));
    expect(new Set(circles).size).toBe(1);
    await expect(page.locator('.ia-journey-path')).toHaveAttribute('data-progress', '1');
    expect(
      await page
        .locator('.ia-path-progress')
        .evaluate((node) => getComputedStyle(node).transitionDuration),
    ).toBe('0s');
    for (const href of await page
      .locator('.ia-service a')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))))
      expect(href).toMatch(new RegExp(`^(#|/${locale}/)`));
    expect(await page.locator('.ia-service').innerText()).not.toMatch(
      /N-iX|N-IX|RPA|SAP|DevSecOps|استعراض المصدر/,
    );
    const scan = await new AxeBuilder({ page })
      .include('.ia-service')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(scan.violations, locale).toEqual([]);
    await page.locator('.ia-stage summary').first().click();
    const expandedScan = await new AxeBuilder({ page })
      .include('.ia-service')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(expandedScan.violations, locale + ' expanded').toEqual([]);
  }
});

test('published Turkish content is preserved and all journey content works without JavaScript', async ({
  page,
  browser,
}) => {
  await page.goto('/tr/services/business-automation');
  await expect(page.locator('.ia-service')).toHaveCount(0);
  await expect(page.locator('main h1')).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/ar/services/business-automation');
  await expect(staticPage.locator('.ia-stage h3')).toHaveCount(5);
  await expect(staticPage.locator('.ia-stage-output')).toHaveCount(5);
  await staticPage.locator('.ia-stage summary').last().click();
  await expect(staticPage.locator('.ia-stage details').last()).toHaveAttribute('open', '');
  await expect(staticPage.locator('.ia-stage details').last().getByRole('link')).toBeVisible();
  await staticPage.locator('#ia-faq summary').first().click();
  await expect(staticPage.locator('#ia-faq details').first()).toHaveAttribute('open', '');
  await context.close();
});
