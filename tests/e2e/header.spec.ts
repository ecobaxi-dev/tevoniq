import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('desktop header supports scroll state, menus, routes, search, and locale preservation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  const header = page.locator('.site-header');
  await expect(header).toHaveAttribute('data-transparent', 'false');
  const before = await header.boundingBox();
  await page.evaluate(() => window.scrollTo(0, 150));
  await expect(header).toHaveAttribute('data-scrolled', 'true');
  await expect(header).toHaveAttribute('data-transparent', 'false');
  const after = await header.boundingBox();
  expect(after?.height).toBeCloseTo(before?.height ?? 0, 3);
  await expect.poll(async () => (await header.boundingBox())?.y).toBe(0);
  const mainNavigation = page.getByRole('navigation', { name: 'Main navigation' });
  const solutions = mainNavigation.getByRole('button', { name: 'Solutions', exact: true });
  await solutions.focus();
  await solutions.press('Enter');
  await expect(
    mainNavigation.getByRole('link', { name: 'All solutions', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(solutions).toBeFocused();
  await mainNavigation.getByRole('button', { name: 'Company', exact: true }).click();
  await mainNavigation.getByRole('link', { name: 'Team', exact: true }).click();
  await expect(page).toHaveURL('/en/company/team');
  await expect(
    mainNavigation.getByRole('button', { name: 'Company', exact: true }),
  ).toHaveAttribute('data-active', 'true');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.route('**/api/search?**', (route) =>
    route.fulfill({
      json: {
        query: 'careers',
        groups: [
          {
            type: 'page',
            hasMore: false,
            items: [
              {
                id: 'careers',
                type: 'page',
                title: 'Careers',
                excerpt: 'Join our team',
                url: '/en/company/careers',
              },
            ],
          },
        ],
      },
    }),
  );
  await page.getByRole('dialog').getByRole('searchbox').fill('careers');
  await page.getByRole('dialog').locator('[data-search-result]').click();
  await expect(page).toHaveURL('/en/company/careers');
  await page.goto('/en/contact?source=test#main-content');
  await page.getByLabel('Language', { exact: true }).selectOption('tr');
  await expect(page).toHaveURL('/tr/contact?source=test#main-content');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('mobile drawer closes on navigation and Arabic layout works', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en');
  await expect(page.locator('.site-desktop-nav')).toBeHidden();
  const trigger = page.getByRole('button', { name: 'Open navigation', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Explore TEVONIQ' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Company', exact: true }).click();
  await dialog.getByRole('link', { name: 'Partners', exact: true }).click();
  await expect(page).toHaveURL('/en/company/partners');
  await expect(dialog).toBeHidden();
  await page.getByLabel('Language', { exact: true }).selectOption('ar');
  await expect(page).toHaveURL('/ar/company/partners');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'فتح القائمة', exact: true }).click();
  const arabicDialog = page.getByRole('dialog', { name: 'استكشف TEVONIQ' });
  await expect(arabicDialog).toBeVisible();
  await expect(arabicDialog).toHaveAttribute('dir', 'rtl');
  expect((await arabicDialog.boundingBox())?.x).toBeLessThan(2);
  await page.keyboard.press('Escape');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
});

test('header has no automated accessibility violations in desktop and mobile states', async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/en');
    if (width === 390)
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations,
      JSON.stringify(
        result.violations.map((item) => ({
          id: item.id,
          nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
        })),
        null,
        2,
      ),
    ).toEqual([]);
  }
});
