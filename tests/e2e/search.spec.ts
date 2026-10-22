import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('search modal supports keyboard navigation, debounce, safe highlights and focus restoration', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/api/search?**', async (route) => {
    requests++;
    const query = new URL(route.request().url()).searchParams.get('q')!;
    await route.fulfill({
      json: {
        query,
        groups: [
          {
            type: 'service',
            hasMore: false,
            items: [
              {
                id: 'one',
                type: 'service',
                title: 'Cloud <script> service',
                excerpt: 'Cloud infrastructure',
                url: '/en/services/cloud',
              },
            ],
          },
        ],
      },
    });
  });
  await page.goto('/en/search');
  const trigger = page.locator('.site-header').getByRole('button', { name: 'Search', exact: true });
  await trigger.focus();
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog');
  const input = dialog.getByRole('searchbox');
  await expect(input).toBeFocused();
  await input.fill('c');
  await input.fill('cl');
  await input.fill('cloud');
  const result = dialog.locator('[data-search-result]');
  await expect(result).toBeVisible();
  expect(requests).toBe(1);
  await expect(result.locator('mark').first()).toHaveText('Cloud');
  await expect(result).toContainText('<script>');
  await input.press('ArrowDown');
  await expect(result).toBeFocused();
  await result.press('ArrowUp');
  await expect(input).toBeFocused();
  const scan = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(scan.violations).toEqual([]);
  await input.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
test('search deep link, empty state, errors, and clear input', async ({ page }) => {
  await page.route('**/api/search?**', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('q')!;
    if (query === 'error') return route.fulfill({ status: 503, json: { error: 'Unavailable' } });
    return route.fulfill({ json: { query, groups: [] } });
  });
  await page.goto('/search?q=missing');
  await expect(page).toHaveURL('/en/search?q=missing');
  const input = page.getByRole('main').getByRole('searchbox');
  await expect(input).toHaveValue('missing');
  await expect(page.getByRole('status')).toContainText('No results');
  await input.fill('error');
  await expect(page.getByRole('status')).toContainText('unavailable');
  await input.fill('');
  await expect(page.getByRole('status')).toContainText('Enter a term');
});
