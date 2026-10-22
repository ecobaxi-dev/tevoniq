import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('design system interactions, keyboard navigation, focus restoration, and validation', async ({
  page,
}) => {
  await page.goto('/design-system');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Precision.');
  const tab = page.getByRole('tab', { name: 'Overview', exact: true });
  await tab.focus();
  await tab.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Details', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('button', { name: 'What guides the visual language?' }).click();
  await expect(
    page.getByText('Clarity, restraint, and a consistent TEVONIQ identity.'),
  ).toBeVisible();
  const trigger = page.getByRole('button', { name: 'Open modal', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'A focused conversation' });
  await expect(dialog).toBeVisible();
  await page.getByLabel('Example name', { exact: true }).fill('Keyboard test');
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate((element) => element.contains(document.activeElement)),
    ).toBeTruthy();
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Open drawer', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'A little more context' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open drawer', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Open actions', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Copy example', exact: true }).click();
  await expect(page.getByText('Example copied', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  const form = page.locator('form');
  await form.getByRole('button', { name: 'Validate form' }).click();
  await expect(form.getByLabel('Email address')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.getByLabel('Your message')).toHaveAttribute('aria-invalid', 'true');
  await form.getByLabel('Email address').fill('design@example.com');
  await form.getByLabel('Your message').fill('Development validation example.');
  await form.getByRole('button', { name: 'Validate form' }).click();
  await expect(page.getByText('Validation passed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove Interface', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove Interface', exact: true })).toHaveCount(0);
});

test('light and dark specimens pass automated WCAG checks', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/design-system');
  await page.evaluate(() => document.fonts.ready);
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(
        results.violations.map((item) => ({
          id: item.id,
          nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
        })),
        null,
        2,
      ),
    ).toEqual([]);
  }
});

test('responsive showcase and RTL layout have no horizontal page overflow', async ({ page }) => {
  for (const width of [360, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/design-system');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
  }
  await page.getByLabel('Preview direction').selectOption('ar');
  await expect(page.locator('.tv-root')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'Open drawer', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'A little more context' });
  await expect(drawer).toHaveAttribute('dir', 'rtl');
  expect((await drawer.boundingBox())?.x).toBeLessThan(2);
});
