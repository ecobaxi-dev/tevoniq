import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
const now = '2026-10-26T10:00:00Z';
const row = {
  id: '11111111-1111-4111-8111-111111111111',
  kind: 'verified',
  email: 'owner@example.test',
  managerName: 'Rana Khalil',
  businessName: 'Olive Kitchen',
  country: 'SA',
  phone: '+966501234567',
  language: 'ar',
  registeredAt: '2026-10-01T08:15:00Z',
  verifiedAt: '2026-10-01T08:20:00Z',
  lastActivityAt: now,
  status: 'licensed',
  registrationCount: 3,
  trialCount: 1,
  purchaseCount: 2,
  licenseCount: 1,
  unusedPurchaseKeys: 1,
  latestTrialExpiresAt: '2026-10-16T08:20:00Z',
  latestPurchaseAt: now,
  latestLicenseAt: now,
};
const catalog = () => ({
  asOf: now,
  page: 1,
  pageSize: 20,
  total: 1,
  summary: {
    totalContacts: 148,
    verifiedCustomers: 126,
    pendingContacts: 22,
    activeTrials: 38,
    expiredTrials: 41,
    licensedCustomers: 47,
    unusedPurchaseKeys: 6,
  },
  items: [row],
});
const detail = () => ({
  asOf: now,
  customer: row,
  historyLimit: 50,
  counts: { registrations: 53, trials: 1, purchases: 1, licenses: 1 },
  registrations: [
    {
      id: 'request-test',
      createdAt: now,
      verifiedAt: now,
      expiresAt: now,
      deliveryStatus: 'SENT',
      deliveryAttempts: 1,
      sentAt: now,
      consentAt: now,
      consentVersion: 'privacy-2026-01',
      profile: row,
    },
  ],
  trials: [
    {
      id: 'trial-test',
      issuedAt: row.registeredAt,
      expiresAt: row.latestTrialExpiresAt,
      status: 'expired',
    },
  ],
  purchases: [
    {
      id: 'key-test',
      reference: 'TEV-2026-0042',
      createdAt: now,
      consumedAt: now,
      revokedAt: null,
      status: 'activated',
      licenseId: 'license-test',
    },
  ],
  licenses: [
    {
      id: 'license-test',
      purchaseId: 'key-test',
      reference: 'TEV-2026-0042',
      issuedAt: now,
      delivery: { status: 'SENT', attempts: 1, sentAt: now },
    },
  ],
});
async function session(page: Page, role = 'ADMIN') {
  await page.route('**/api/cms/auth/me', (route) =>
    route.fulfill({ json: { id: 'synthetic-admin', email: 'admin@example.test', role } }),
  );
}
test('non-company role cannot request reports or see navigation', async ({ page }) => {
  await session(page, 'EDITOR');
  let requests = 0;
  await page.route('**/api/cms/pesto/customers**', (route) => {
    requests++;
    return route.fulfill({ json: catalog() });
  });
  await page.goto('/admin/pesto-customers');
  await expect(page.getByRole('heading', { name: 'Access restricted' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pesto customers', exact: false })).toHaveCount(0);
  expect(requests).toBe(0);
});
test('filters dates pagination and reset use bounded report query', async ({ page }) => {
  await session(page);
  const urls: URL[] = [];
  await page.route('**/api/cms/pesto/customers**', (route) => {
    const url = new URL(route.request().url());
    urls.push(url);
    return route.fulfill({
      json: { ...catalog(), total: 21, page: Number(url.searchParams.get('page')) || 1 },
    });
  });
  await page.goto('/admin/pesto-customers');
  await expect(page.getByText('Olive Kitchen')).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Page 2 of 2')).toBeVisible();
  await page.getByLabel('Search customer or reference').fill('Olive');
  await page.getByLabel('Customer status').selectOption('licensed');
  await page.getByLabel('Country code').fill('sa');
  await page.getByLabel('Registered from (UTC)').fill('2026-10-01');
  await page.getByLabel('Registered to (UTC)').fill('2026-10-26');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect.poll(() => urls.at(-1)?.searchParams.get('country')).toBe('SA');
  expect(Object.fromEntries(urls.at(-1)!.searchParams)).toEqual({
    search: 'Olive',
    status: 'licensed',
    country: 'SA',
    from: '2026-10-01',
    to: '2026-10-26',
    page: '1',
  });
  await expect(page.getByText('All contacts · independent of filters')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect.poll(() => urls.at(-1)?.searchParams.get('search')).toBe(null);
  await expect(page.getByLabel('Registered from (UTC)')).toHaveValue('');
});
test('customer panel unifies four histories with accurate delivery and truncation labels', async ({
  page,
}) => {
  await session(page);
  await page.route('**/api/cms/pesto/customers**', (route) =>
    route.fulfill({ json: route.request().url().includes('/verified/') ? detail() : catalog() }),
  );
  await page.goto('/admin/pesto-customers');
  await page.getByRole('button', { name: 'View customer Olive Kitchen' }).click();
  for (const name of [
    'Registration requests',
    'Trial permits',
    'Purchase keys',
    'Operating licenses',
  ])
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.getByText('Showing the newest 1 of 53 records.')).toBeVisible();
  await expect(page.getByText('Issued centrally · TEV-2026-0042')).toBeVisible();
  await expect(
    page.getByText('Payment amounts and payment methods are not recorded here.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByText('not inbox delivery.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Manage purchase keys' })).toHaveAttribute(
    'href',
    '/admin/pesto-purchases',
  );
  await page.getByRole('button', { name: 'Close customer' }).click();
  await expect(
    page.getByRole('heading', { name: 'Registration requests', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'View customer Olive Kitchen' }).click();
  await expect(
    page.getByRole('heading', { name: 'Registration requests', exact: true }),
  ).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('cms-session-expired')));
  await expect(page.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();
  await expect(page.getByText('owner@example.test')).toHaveCount(0);
});
test('independent report and detail errors retry, empty results explain filters', async ({
  page,
}) => {
  await session(page);
  let listAttempts = 0,
    detailAttempts = 0;
  await page.route('**/api/cms/pesto/customers**', (route) => {
    if (route.request().url().includes('/verified/'))
      return ++detailAttempts === 1
        ? route.fulfill({ status: 503, json: { message: 'Synthetic detail unavailable' } })
        : route.fulfill({ json: detail() });
    return ++listAttempts === 1
      ? route.fulfill({ status: 503, json: { message: 'Synthetic list unavailable' } })
      : route.fulfill({
          json: listAttempts === 3 ? { ...catalog(), total: 0, items: [] } : catalog(),
        });
  });
  await page.goto('/admin/pesto-customers');
  await expect(page.getByText('Synthetic list unavailable')).toBeVisible();
  await page.getByRole('button', { name: 'Retry report' }).click();
  await page.getByRole('button', { name: 'View customer Olive Kitchen' }).click();
  await expect(page.getByText('Synthetic detail unavailable')).toBeVisible();
  await expect(page.getByRole('button', { name: 'View customer Olive Kitchen' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry customer' }).click();
  await expect(
    page.getByRole('heading', { name: 'Operating licenses', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('heading', { name: 'No matching customers' })).toBeVisible();
});
test('stale filter and closed detail responses cannot repaint current report', async ({ page }) => {
  await session(page);
  let releaseList!: () => void, releaseDetail!: () => void;
  const listWait = new Promise<void>((resolve) => {
    releaseList = resolve;
  });
  const detailWait = new Promise<void>((resolve) => {
    releaseDetail = resolve;
  });
  await page.route('**/api/cms/pesto/customers**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/verified/')) {
      await detailWait;
      return route.fulfill({ json: detail() });
    }
    if (url.searchParams.get('search') === 'slow') {
      await listWait;
      return route.fulfill({
        json: { ...catalog(), items: [{ ...row, businessName: 'Stale Restaurant' }] },
      });
    }
    return route.fulfill({ json: catalog() });
  });
  await page.goto('/admin/pesto-customers');
  await page.getByLabel('Search customer or reference').fill('slow');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.getByText('Loading customer records…')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByText('Olive Kitchen')).toBeVisible();
  releaseList();
  await expect(page.getByText('Stale Restaurant')).toHaveCount(0);
  await page.getByRole('button', { name: 'View customer Olive Kitchen' }).click();
  await expect(page.getByText('Loading customer history…')).toBeVisible();
  await page.getByRole('button', { name: 'Close customer' }).click();
  releaseDetail();
  await expect(page.getByRole('heading', { name: 'Operating licenses', exact: true })).toHaveCount(
    0,
  );
});
test('readable customer ledger and detail at desktop tablet and mobile widths', async ({
  page,
}) => {
  await session(page);
  await page.route('**/api/cms/pesto/customers**', (route) =>
    route.fulfill({
      json: route.request().url().includes('/verified/')
        ? detail()
        : {
            ...catalog(),
            total: 2,
            items: [
              row,
              {
                ...row,
                id: '22222222-2222-4222-8222-222222222222',
                kind: 'pending',
                businessName: 'مطعم الزعفران والمأكولات الشرقية',
                managerName: 'عبدالرحمن بن أحمد',
                email: 'a-long-customer-email-for-report-wrapping@example.test',
                status: 'pending',
                licenseCount: 0,
                trialCount: 0,
                purchaseCount: 0,
                latestTrialExpiresAt: null,
                latestPurchaseAt: null,
                latestLicenseAt: null,
              },
            ],
          },
    }),
  );
  await page.goto('/admin/pesto-customers');
  const output = join(process.cwd(), '..', 'pesto-customer-reports');
  await mkdir(output, { recursive: true });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(
      page.getByRole('heading', { name: 'Customer reports', exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await page.screenshot({ path: join(output, `customers-${width}.png`), fullPage: true });
  }
  await page.getByRole('button', { name: 'View customer Olive Kitchen' }).click();
  await expect(
    page.getByRole('heading', { name: 'Operating licenses', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await page.screenshot({ path: join(output, 'customer-detail-320.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: join(output, 'customer-detail-1440.png'), fullPage: true });
});
