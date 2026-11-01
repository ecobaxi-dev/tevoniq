import { test, expect } from '@playwright/test';
import catalog from '../../content/service-expansion.json';
import { retiredServiceSlugs } from '../../packages/types/src/retired-catalog';
const publicGroups = catalog.groups
  .map((group) => ({
    ...group,
    services: group.services.filter((service) => !retiredServiceSlugs.includes(service.slug)),
  }))
  .filter((group) => group.services.length > 0);

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} Services menu exposes every catalog route once across its groups`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.mouse.move(0, 0);
    await page.goto(`/${locale}`);
    const navigation = page.locator('.site-desktop-nav');
    await navigation
      .getByRole('button', { name: locale === 'ar' ? 'خدماتنا' : 'Services', exact: true })
      .press('Enter');
    const panel = page.locator('.site-services-panel');
    await expect(panel).toBeVisible();
    const seen: string[] = [];
    for (const group of publicGroups) {
      const category = panel.getByRole('button', { name: group.labels[locale], exact: true });
      await category.focus();
      await category.press('Space');
      await expect(category).toHaveAttribute('aria-pressed', 'true');
      const links = panel.locator('.site-services-content li:not(.site-services-feature) a');
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
    expect(new Set(seen).size).toBe(publicGroups.flatMap((group) => group.services).length);
    for (const slug of retiredServiceSlugs)
      await expect(panel.locator(`a[href="/${locale}/services/${slug}"]`)).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });
}
