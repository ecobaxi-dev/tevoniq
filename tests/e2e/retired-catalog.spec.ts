import { test, expect } from '@playwright/test';

test('legacy CMS records cannot restore retired navigation, service cards, search results or sitemap routes', async ({
  page,
  request,
}) => {
  const { isRetiredPublicPath } = await import('../../packages/types/dist/retired-catalog.js');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/ar');
  await page
    .locator('.site-desktop-nav')
    .getByRole('button', { name: 'خدماتنا', exact: true })
    .click();
  const menu = page.locator('.site-services-panel');
  await expect(menu).toBeVisible();
  for (const label of [
    'الحلول والاستشارات السحابية',
    'البيانات والتحليلات',
    'تطوير الألعاب',
    'Renamed legacy service',
  ])
    await expect(menu.getByText(label, { exact: true })).toHaveCount(0);
  const links = await page
    .locator('a[href]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href')!));
  expect(links.some(isRetiredPublicPath)).toBe(false);
  await page.goto('/en/services?q=retirement-check');
  await expect(page.locator('.services-grid .tv-card')).toHaveCount(1);
  await expect(page.getByText('Legacy published service', { exact: true })).toHaveCount(0);
  const search = await request.get('/api/search?q=retirement-check&locale=en');
  expect(search.status()).toBe(200);
  const result = await search.json();
  expect(result.groups[0].items).toHaveLength(1);
  expect(result.groups[0].items[0].url).toBe('/en/services/development-fixture');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const { retiredServiceSlugs } = await import('../../packages/types/dist/retired-catalog.js');
  const xml = await sitemap.text();
  for (const slug of retiredServiceSlugs) expect(xml).not.toContain(`/services/${slug}`);
});

test('retired public pages are 404 even while the old upstream CMS record remains published', async ({
  request,
}) => {
  const { retiredServiceSlugs } = await import('../../packages/types/dist/retired-catalog.js');
  expect(
    (await request.get('http://127.0.0.1:4100/api/v1/services/cloud-solutions?locale=en')).status(),
  ).toBe(200);
  for (const slug of retiredServiceSlugs) {
    expect(
      (await request.get(`http://127.0.0.1:4100/api/v1/services/${slug}?locale=en`)).status(),
    ).toBe(200);
    for (const locale of ['ar', 'en', 'tr'])
      expect((await request.get(`/${locale}/services/${slug}`)).status(), `${locale}/${slug}`).toBe(
        404,
      );
  }
  for (const path of [
    '/ar/services/cloud-solutions',
    '/tr/services/sap-services',
    '/en/solutions/resilient-hybrid-cloud',
    '/ar/insights/case-studies/brand-protection-security',
  ])
    expect((await request.get(path)).status(), path).toBe(404);
});
