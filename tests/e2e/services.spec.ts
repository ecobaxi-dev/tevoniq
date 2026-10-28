import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('service catalog, dynamic blocks, SEO and unavailable translations', async ({ page }) => {
  await page.goto('/services');
  await expect(page).toHaveURL('/en/services');
  await page.getByRole('link', { name: 'Development service fixture', exact: true }).click();
  await expect(page).toHaveURL('/en/services/development-fixture');
  await expect(page).toHaveTitle('Development fixture SEO');
  await page.getByRole('button', { name: 'Is this commercial content?' }).click();
  await expect(page.getByText('No. This is isolated browser test data.')).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect((await page.goto('/ar/services/development-fixture'))?.status()).toBe(404);
  await page.goto('/en/services?q=empty');
  await expect(page.getByRole('status')).toHaveText('No published services match this search.');
});
test('CMS requires a session, rejects cross-origin writes and saves through a secure cookie proxy', async ({
  page,
  request,
}) => {
  expect((await request.get('/api/cms/services')).status()).toBe(401);
  expect(
    (
      await request.post('/api/cms/auth/login', {
        headers: { Origin: 'https://outside.example' },
        data: { email: 'test@example.invalid', password: 'test' },
      })
    ).status(),
  ).toBe(403);
  await page.goto('/admin/services');
  await page.getByLabel('Email', { exact: true }).fill('test@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('Development-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: /Development service fixture/ }).click();
  await page.getByLabel('SEO title', { exact: true }).fill('Updated development SEO');
  await page.getByRole('button', { name: 'Save service', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Service saved.');
  await page.getByLabel('Publish this translation', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Save service', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Service saved.');
  await page.goto('/en/services/development-fixture');
  await expect(
    page.getByRole('heading', { name: 'This page could not be found.', exact: true }),
  ).toBeVisible();
  await page.goto('/admin/services');
  await page.getByRole('button', { name: /Development service fixture/ }).click();
  await page.getByLabel('Publish this translation', { exact: true }).check();
  await page.getByRole('button', { name: 'Save service', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Service saved.');
  await page.goto('/en/services/development-fixture');
  await expect(
    page.getByRole('heading', { name: 'Development service fixture', exact: true }),
  ).toBeVisible();
  await page.goto('/admin/services');
  const cookie = (await page.context().cookies('http://127.0.0.1:3100/api/cms')).find(
    (c) => c.name === 'tevoniq_cms_session',
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe('Strict');
  await page.getByRole('banner').getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();
});
test('reference hero uses localized text and functioning controls', async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto('/en');
  await expect(page.getByRole('heading', { name: /Premium Technology/ })).toBeVisible();
  await expect(page.locator('.artwork-hero-image')).toHaveAttribute('src', '/brand/mainpage.png');
  await expect(page.getByRole('button', { name: 'Watch Video', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Get Started', exact: true }).click();
  await expect(page).toHaveURL('/en#solutions');
});
