import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const slugs = [
  'maintenance',
  'sales-crm',
  'workshop-orders',
  'appointments',
  'inventory',
  'projects-tasks',
];
test('second service card leads to six system demos, details and selected-system contact', async ({
  page,
}) => {
  await page.goto('/ar');
  await page.locator('.sme-service-card--workflow .sme-service-contact').click();
  await expect(page).toHaveURL('/ar/work-systems');
  await expect(page.locator('.design-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'إدارة طلبات الصيانة', exact: true }).click();
  await expect(page.locator('.design-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'التفاصيل ومسار العمل', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'مسار العمل المقترح' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'ماذا يحتاج التشغيل الفعلي؟' })).toBeVisible();
  await page.getByRole('link', { name: 'ناقش متطلبات هذا النظام', exact: false }).click();
  await expect(page.locator('textarea[name=message]')).toHaveValue(/إدارة طلبات الصيانة/);
});
test('maintenance records support create, search, status, notes, dates, delete and reset locally', async ({
  page,
}) => {
  let posts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') posts++;
  });
  await page.goto('/previews/ar/systems/maintenance');
  await page.getByRole('button', { name: 'طلب جديد', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'العنوان', exact: true }).fill('زيارة اختبار');
  await dialog.getByRole('textbox', { name: 'الجهة أو الوصف' }).fill('منشأة توضيحية');
  await dialog.locator('input[name=value]').fill('200');
  await dialog.locator('input[name=date]').fill('2026-12-01');
  await dialog.getByRole('button', { name: 'إضافة إلى المعاينة' }).click();
  await expect(page.locator('.ws-feedback').first()).toContainText('أضيف السجل');
  await page.getByRole('searchbox', { name: 'البحث في السجلات' }).fill('زيارة اختبار');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'زيارة اختبار', exact: false }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'تحديث الحالة' }).selectOption('3');
  await dialog.getByRole('textbox', { name: 'ملاحظة جديدة' }).fill('اختبار توثيق التسليم');
  await dialog.getByRole('button', { name: 'إضافة ملاحظة', exact: true }).click();
  await expect(dialog).toContainText('اختبار توثيق التسليم');
  await expect(dialog.locator('.ws-history')).toContainText('تغيير الحالة إلى مكتمل');
  await dialog.locator('input[name=date]').fill('2026-12-03');
  await dialog.getByRole('button', { name: 'حفظ الموعد' }).click();
  await expect(dialog.locator('.ws-history')).toContainText('تحديث الموعد');
  await dialog.getByText('حذف هذا السجل التوضيحي', { exact: true }).click();
  await dialog.getByRole('button', { name: 'تأكيد حذف السجل' }).click();
  await expect(page.getByRole('heading', { name: 'لا توجد سجلات مطابقة' })).toBeVisible();
  await page.getByRole('button', { name: 'إعادة التجربة', exact: true }).click();
  await page.getByRole('button', { name: 'إعادة البيانات الأصلية' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(4);
  expect(posts).toBe(0);
});
test('inventory rejects overdraw and updates balance, stock status, value and activity', async ({
  page,
}) => {
  await page.goto('/previews/ar/systems/inventory');
  await page.getByRole('button', { name: 'مستلزم تشغيل ب', exact: false }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('input[name=delta]').fill('-6');
  await dialog.getByRole('textbox', { name: 'سبب الحركة' }).fill('صرف توضيحي');
  await dialog.getByRole('button', { name: 'تسجيل الحركة' }).click();
  await expect(dialog.getByRole('alert')).toContainText('لا يمكن أن يصبح الرصيد سالبًا');
  await dialog.locator('input[name=delta]').fill('5');
  await dialog.getByRole('textbox', { name: 'سبب الحركة' }).fill('توريد توضيحي');
  await dialog.getByRole('button', { name: 'تسجيل الحركة' }).click();
  await expect(dialog.locator('.ws-detail-status .ws-status')).toHaveText('متوفر');
  await expect(dialog.locator('.ws-history')).toContainText('+5 · توريد توضيحي');
  await page.keyboard.press('Escape');
  await expect(page.locator('tbody tr').filter({ hasText: 'مستلزم تشغيل ب' })).toContainText(
    await page.evaluate(() => new Intl.NumberFormat('ar').format(10)),
  );
  await page.getByRole('combobox', { name: 'دور المعاينة' }).selectOption('viewer');
  await expect(page.getByRole('button', { name: 'صنف جديد', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'مستلزم تشغيل ب', exact: false }).click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'تسجيل الحركة' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('dialog').getByRole('textbox', { name: 'ملاحظة جديدة' }),
  ).toBeDisabled();
});
test('sales pipeline updates its totals and appointment date changes appear in agenda', async ({
  page,
}) => {
  await page.goto('/previews/en/systems/sales-crm');
  await expect(page.locator('.ws-metrics article').last()).toContainText('13,500');
  await page.getByRole('button', { name: 'Business website enquiry', exact: false }).click();
  await page.getByRole('combobox', { name: 'Update status' }).selectOption('3');
  await page.keyboard.press('Escape');
  await expect(page.locator('.ws-metrics article').last()).toContainText('9,500');
  await expect(
    page
      .locator('.ws-board-column')
      .last()
      .getByRole('button', { name: 'Business website enquiry', exact: false }),
  ).toBeVisible();
  await page.goto('/previews/en/systems/appointments');
  await page.getByRole('button', { name: 'Initial consultation', exact: false }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('input[name=date]').fill('2026-12-10');
  await dialog.locator('input[name=time]').fill('14:30');
  await dialog.getByRole('button', { name: 'Save date' }).click();
  await page.keyboard.press('Escape');
  await expect(
    page.locator('.ws-agenda article').filter({ hasText: 'Initial consultation' }),
  ).toContainText('2026-12-10');
  await expect(
    page.locator('.ws-agenda article').filter({ hasText: 'Initial consultation' }),
  ).toContainText('14:30');
});
test('all six systems work in both languages with mobile layouts, filtering and read-only controls', async ({
  page,
}) => {
  for (const locale of ['ar', 'en']) {
    for (const slug of slugs) {
      await page.goto(`/previews/${locale}/systems/${slug}`);
      await expect(page.locator('main h1')).toBeVisible();
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
      await page.getByRole('searchbox').fill('no-matching-record-xyz');
      await expect(page.locator('.ws-empty')).toBeVisible();
      await page.getByRole('searchbox').clear();
      await page.locator('.ws-topbar select').selectOption('viewer');
      await expect(page.locator('.ws-heading-actions .ws-primary')).toBeDisabled();
    }
  }
});
test('system gallery, details and previews are accessible, responsive and correctly indexed', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of [
    '/ar/work-systems',
    '/en/work-systems/maintenance',
    ...slugs.flatMap((slug) => ['ar', 'en'].map((locale) => `/previews/${locale}/systems/${slug}`)),
  ]) {
    await page.goto(path);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        path,
      ).toBe(true);
    }
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect.soft(scan.violations, path).toEqual([]);
  }
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
  const missing = await page.goto('/ar/work-systems/not-a-system');
  expect(missing?.status()).toBe(404);
  const invalid = await page.goto('/previews/ar/systems/not-a-system');
  expect(invalid?.status()).toBe(404);
  await page.goto('/ar/contact?system=unknown');
  await expect(page.locator('textarea[name=message]')).toHaveValue('');
});
