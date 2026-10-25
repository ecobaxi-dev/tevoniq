import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
const row = {
  purchaseId: '11111111-1111-4111-8111-111111111111',
  reference: 'TEV-2026-0042',
  email: 'owner@example.test',
  businessName: 'Olive Kitchen',
  createdAt: '2026-10-25T10:00:00Z',
  status: 'unused',
  revokedAt: null,
  consumedAt: null,
  activationId: null,
  issuedAt: null,
  delivery: null,
};
const catalog = (enabled = true) => ({ enabled, page: 1, pageSize: 20, total: 1, items: [row] });
async function session(page: Page, role = 'ADMIN') {
  await page.route('**/api/cms/auth/me', (route) =>
    route.fulfill({ json: { id: 'company-test-admin', email: 'admin@example.test', role } }),
  );
}
test('restricted role cannot list or issue keys', async ({ page }) => {
  await session(page, 'EDITOR');
  let requests = 0;
  await page.route('**/api/cms/pesto/purchases**', (route) => {
    requests++;
    return route.fulfill({ json: catalog() });
  });
  await page.goto('/admin/pesto-purchases');
  await expect(page.getByRole('heading', { name: 'Access restricted' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pesto licenses', exact: false })).toHaveCount(0);
  expect(requests).toBe(0);
});
test('disabled service keeps records readable and prevents mutations', async ({ page }) => {
  await session(page);
  await page.route('**/api/cms/pesto/purchases**', (route) =>
    route.fulfill({ json: catalog(false) }),
  );
  await page.goto('/admin/pesto-purchases');
  await expect(page.getByText('Purchase activation is being prepared')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Issue purchase key', exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Revoke key', exact: true })).toBeDisabled();
  await expect(page.getByText('Olive Kitchen')).toBeVisible();
});
test('uncertain issuance retries identical request, reveals in memory and dismisses', async ({
  page,
}) => {
  await session(page);
  const requests: Record<string, unknown>[] = [];
  const syntheticKey = `PSTO-${'A'.repeat(64)}`;
  await page.route('**/api/cms/pesto/purchases**', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: catalog() });
    requests.push(route.request().postDataJSON());
    return requests.length === 1
      ? route.fulfill({ status: 503, json: { message: 'Synthetic uncertain response' } })
      : route.fulfill({
          json: { purchaseId: row.purchaseId, purchaseKey: syntheticKey, email: row.email },
        });
  });
  await page.goto('/admin/pesto-purchases');
  await page.getByLabel('Verified customer email').fill(row.email);
  await page.getByLabel('Order / payment reference').fill(row.reference);
  await page.getByLabel('I have confirmed payment').check();
  await page.getByRole('button', { name: 'Issue purchase key', exact: true }).click();
  await expect(page.getByLabel('Verified customer email')).toBeDisabled();
  await expect(page.getByText('Synthetic uncertain response')).toBeVisible();
  await page.getByRole('button', { name: 'Start a different order' }).click();
  await expect(page.getByRole('button', { name: 'Confirm action', exact: true })).toBeDisabled();
  await expect(page.getByText('This does not cancel a purchase', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).first().click();
  await expect(page.getByLabel('Verified customer email')).toHaveValue(row.email);
  expect(requests).toHaveLength(1);
  await page.getByRole('button', { name: 'Retry same request' }).click();
  await expect(page.locator('.pesto-console-reveal code')).toHaveText(syntheticKey);
  expect(requests).toHaveLength(2);
  expect(requests[0]).toEqual(requests[1]);
  expect(
    await page.evaluate(
      (key) =>
        [JSON.stringify(localStorage), JSON.stringify(sessionStorage), location.href].some(
          (value) => value.includes(key),
        ),
      syntheticKey,
    ),
  ).toBe(false);
  await page.getByRole('button', { name: 'Dismiss key' }).click();
  await expect(page.getByText(syntheticKey)).toHaveCount(0);
  await expect(page.getByLabel('Verified customer email')).toHaveValue('');
});
test('session expiry removes a revealed key immediately', async ({ page }) => {
  await session(page);
  const syntheticKey = `PSTO-${'B'.repeat(64)}`;
  await page.route('**/api/cms/pesto/purchases**', (route) =>
    route.fulfill({
      json:
        route.request().method() === 'GET'
          ? catalog()
          : { purchaseId: row.purchaseId, purchaseKey: syntheticKey, email: row.email },
    }),
  );
  await page.goto('/admin/pesto-purchases');
  await page.getByLabel('Verified customer email').fill(row.email);
  await page.getByLabel('Order / payment reference').fill(row.reference);
  await page.getByLabel('I have confirmed payment').check();
  await page.getByRole('button', { name: 'Issue purchase key', exact: true }).click();
  await expect(page.locator('.pesto-console-reveal code')).toHaveText(syntheticKey);
  await page.evaluate(() => window.dispatchEvent(new Event('cms-session-expired')));
  await expect(page.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();
  await expect(page.getByText(syntheticKey)).toHaveCount(0);
});
test('filters, pagination and revoke race retain a visible explanation', async ({ page }) => {
  await session(page);
  const queries: string[] = [];
  await page.route('**/api/cms/pesto/purchases**', async (route) => {
    if (route.request().method() !== 'GET')
      return route.fulfill({ status: 409, json: { message: 'Already activated' } });
    queries.push(route.request().url());
    return route.fulfill({ json: { ...catalog(), total: 21 } });
  });
  await page.goto('/admin/pesto-purchases');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect.poll(() => queries.some((url) => url.includes('page=2'))).toBe(true);
  await page.getByLabel('Purchase status', { exact: true }).selectOption('unused');
  await expect
    .poll(() => queries.some((url) => url.includes('status=unused') && url.includes('page=1')))
    .toBe(true);
  await page.getByLabel('Search customer or reference').fill('Olive');
  await page
    .locator('.pesto-console-filters')
    .getByRole('button', { name: 'Search', exact: true })
    .click();
  await expect.poll(() => queries.some((url) => url.includes('search=Olive'))).toBe(true);
  await page.getByRole('button', { name: 'Revoke key', exact: true }).click();
  await page.getByLabel('Type CONFIRM to continue').fill('CONFIRM');
  await page.getByRole('button', { name: 'Confirm action', exact: true }).click();
  await expect(
    page
      .getByText(
        'This key changed or was activated. Records have been refreshed; review its current status.',
      )
      .first(),
  ).toBeVisible();
});
test('responsive status trail and no horizontal overflow', async ({ page }) => {
  await session(page);
  await page.route('**/api/cms/pesto/purchases**', (route) =>
    route.fulfill({
      json: {
        ...catalog(false),
        total: 2,
        items: [
          row,
          {
            ...row,
            purchaseId: '22222222-2222-4222-8222-222222222222',
            businessName: 'Saffron Table',
            status: 'activated',
            issuedAt: row.createdAt,
            delivery: { status: 'SENT', attempts: 1, sentAt: row.createdAt },
          },
        ],
      },
    }),
  );
  await page.goto('/admin/pesto-purchases');
  await expect(page.getByText('Email accepted', { exact: true })).toBeVisible();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (process.env.PESTO_CONSOLE_SCREENSHOT_DIR) {
      await mkdir(process.env.PESTO_CONSOLE_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({
        path: join(process.env.PESTO_CONSOLE_SCREENSHOT_DIR, `console-${width}.png`),
        fullPage: true,
      });
    }
  }
});
