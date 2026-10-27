import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
async function completeGuide(page: import('@playwright/test').Page, values: string[]) {
  for (let i = 0; i < values.length; i++) {
    await page.locator(`.tc-guide-main input[value="${values[i]}"]`).check();
    await page.locator('.tc-guide-controls button[type=submit]').click();
  }
  await expect(page.locator('.tc-guide-result')).toBeVisible();
}
test('consulting presentation still respects an unpublished service in both public languages', async ({
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
    await request.post('http://127.0.0.1:4100/fixture/consulting-state', { data: { published } });
    expect(
      (await request.put(`/api/cms/services/${service.id}`, { headers, data: service })).ok(),
    ).toBe(true);
  };
  await setPublication(false);
  try {
    for (const locale of ['ar', 'en']) {
      const response = await page.goto(`/${locale}/services/it-consulting`);
      expect(response?.status()).toBe(404);
      await expect(page.locator('.tc-consulting')).toHaveCount(0);
    }
  } finally {
    await setPublication(true);
    await request.post('/api/cms/auth/logout', { headers, data: {} });
  }
});
test('Arabic consulting guide produces a scoped result, downloads a brief and passes choices to contact', async ({
  page,
}) => {
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') posts++;
  });
  await page.goto('/ar/services/it-consulting');
  await expect(page.locator('main h1')).toHaveText('اختر الخطوة التقنية المناسبة لأعمالك');
  await expect(page.locator('.tc-guide-controls button[type=submit]')).toBeDisabled();
  await completeGuide(page, ['services', 'requests', 'files', 'daily', 'clear']);
  await expect(page.locator('.tc-guide-result')).toContainText(
    'قارن أداة جاهزة بنظام متابعة محدود',
  );
  await expect(
    page.locator('.tc-guide-main').getByRole('link', { name: 'تصفّح النموذج المناسب' }),
  ).toHaveAttribute('href', '/ar/work-systems');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'تحميل ملخص الاحتياج' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('tevoniq-consulting-brief-ar.txt');
  expect(await readFile((await download.path())!, 'utf8')).toContain(
    'قارن أداة جاهزة بنظام متابعة محدود',
  );
  await page.getByRole('link', { name: 'ناقش هذا الاقتراح', exact: true }).click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(
    /قارن أداة جاهزة بنظام متابعة محدود/,
  );
  expect(posts).toBe(0);
});
test('guide can recommend improving existing software and can edit or reset choices', async ({
  page,
}) => {
  await page.goto('/en/services/it-consulting');
  await completeGuide(page, ['retail', 'visibility', 'software-fits', 'daily', 'clear']);
  await expect(page.locator('.tc-guide-result')).toContainText('Review your current tool first');
  await page.getByRole('button', { name: 'Edit answers', exact: true }).click();
  await expect(page.locator('.tc-guide-main input[value=retail]')).toBeChecked();
  await page.locator('.tc-guide-controls button[type=submit]').click();
  await page.locator('.tc-guide-main input[value=repetition]').check();
  await page.locator('.tc-guide-controls button[type=submit]').click();
  await page.locator('.tc-guide-main input[value=software-gaps]').check();
  await page.locator('.tc-guide-controls button[type=submit]').click();
  await page.locator('.tc-guide-main input[value=occasional]').check();
  await page.locator('.tc-guide-controls button[type=submit]').click();
  await page.locator('.tc-guide-controls button[type=submit]').click();
  await expect(page.locator('.tc-guide-result')).toContainText(
    'Try a simpler step before automation',
  );
  await page.getByRole('button', { name: 'Start again', exact: true }).click();
  await expect(page.locator('.tc-guide-result')).toHaveCount(0);
  await expect(page.locator('.tc-guide-main input:checked')).toHaveCount(0);
});
test('comparison priorities and illustrative report examples have real handoffs and local downloads', async ({
  page,
}) => {
  await page.goto('/ar/services/it-consulting');
  await page.getByRole('radio', { name: 'نقل متكرر بين أدوات قائمة', exact: true }).check();
  await expect(page.locator('.tc-comparison-detail h3')).toHaveText('ربط الأدوات الحالية');
  await expect(page.getByRole('link', { name: 'ناقش هذا الخيار' })).toHaveAttribute(
    'href',
    '/ar/contact?intent=quote&consulting=comparison&route=connect',
  );
  await page
    .locator('.tc-comparison-tabs')
    .getByRole('button', { name: 'بناء نطاق مخصص', exact: false })
    .click();
  await expect(page.locator('.tc-comparison-detail h3')).toHaveText('بناء نطاق مخصص');
  await page
    .getByRole('group', { name: 'اختيار المثال التوضيحي' })
    .getByRole('button', { name: 'ورشة تتابع المواصفات', exact: false })
    .click();
  await page
    .getByRole('group', { name: 'أجزاء الملخص' })
    .getByRole('button', { name: 'ما نؤجله', exact: true })
    .click();
  await expect(page.locator('.tc-report-section')).toContainText('إدارة شاملة للمصنع');
  await expect(page.getByRole('link', { name: 'شاهد النموذج التفاعلي' })).toHaveAttribute(
    'href',
    '/ar/work-systems',
  );
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'تحميل المثال', exact: true }).click();
  const download = await downloadEvent;
  expect(await readFile((await download.path())!, 'utf8')).toContain('ورشة تتابع المواصفات');
});
test('new consulting page is responsive, accessible, uses local links and has no browser errors', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/services/it-consulting`);
    await expect(page.locator('.tc-gallery-links a')).toHaveCount(4);
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${locale}/${width}`,
      ).toBe(true);
    }
    for (const href of await page
      .locator('.tc-consulting a')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('href'))))
      expect(href).toMatch(new RegExp(`^(#|/${locale}/)`));
    const scan = await new AxeBuilder({ page })
      .include('.tc-consulting')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(scan.violations, locale).toEqual([]);
    await completeGuide(page, ['services', 'visibility', 'files', 'weekly', 'clear']);
    const resultScan = await new AxeBuilder({ page })
      .include('.tc-consulting')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(resultScan.violations, locale + ' result').toEqual([]);
  }
  expect(errors).toEqual([]);
});
test('published Turkish content stays generic, invalid handoffs are ignored and page content works without JS', async ({
  page,
  browser,
}) => {
  await page.goto('/tr/services/it-consulting');
  await expect(page.locator('.tc-consulting')).toHaveCount(0);
  await expect(page.locator('main h1')).toBeVisible();
  await page.goto('/ar/contact?consulting=guide&goal=presence');
  await expect(page.locator('textarea[name=message]')).toHaveValue('');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/ar/services/it-consulting');
  await expect(staticPage.locator('main h1')).toHaveText('اختر الخطوة التقنية المناسبة لأعمالك');
  await expect(staticPage.locator('.tc-options-overview article')).toHaveCount(4);
  await staticPage.locator('#tc-faq summary').first().click();
  await expect(staticPage.locator('#tc-faq details').first()).toHaveAttribute('open', '');
  await context.close();
});
