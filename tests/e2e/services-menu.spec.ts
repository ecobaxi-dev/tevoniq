import { test, expect } from '@playwright/test';
import catalog from '../../content/service-expansion.json';

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} Services menu exposes every catalog route once across its groups`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.goto(`/${locale}`);
    const navigation = page.locator('.site-desktop-nav');
    await navigation
      .getByRole('button', { name: locale === 'ar' ? 'خدماتنا' : 'Services', exact: true })
      .click();
    const panel = page.locator('.site-services-panel');
    await expect(panel).toBeVisible();
    const seen: string[] = [];
    for (const group of catalog.groups) {
      const category = panel.getByRole('button', { name: group.labels[locale], exact: true });
      await category.click();
      await expect(category).toHaveAttribute('aria-pressed', 'true');
      const links = panel.locator('.site-services-content li a');
      await expect(links).toHaveCount(group.services.length);
      for (let index = 0; index < group.services.length; index++) {
        const service = group.services[index]!;
        await expect(links.nth(index)).toHaveAttribute(
          'href',
          `/${locale}/services/${service.slug}`,
        );
        seen.push(service.slug);
      }
    }
    expect(new Set(seen).size).toBe(catalog.groups.flatMap((group) => group.services).length);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });
}
