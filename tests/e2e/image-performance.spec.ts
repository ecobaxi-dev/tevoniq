import { test, expect } from '@playwright/test';

test('gallery thumbnails and system screenshots load directly without runtime image processing', async ({
  page,
}) => {
  for (const path of ['/ar/work-systems', '/en/website-designs', '/ar/work-systems/maintenance']) {
    const processed: string[] = [];
    const listener = (request: import('@playwright/test').Request) => {
      if (new URL(request.url()).pathname === '/_next/image') processed.push(request.url());
    };
    page.on('request', listener);
    await page.goto(path);
    const images = page.locator('main .design-card img, main .design-detail-hero img');
    await expect(images.first()).toBeVisible();
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
        .toBe(true);
      expect(
        await image.evaluate((el: HTMLImageElement) => new URL(el.currentSrc).pathname),
      ).toMatch(/^\/brand\/(work-systems|website-designs)\//);
    }
    expect(processed).toEqual([]);
    page.off('request', listener);
  }
});
test('Arabic hero uses a compact WebP and image resizing avoids AVIF encoding', async ({
  page,
  request,
}) => {
  await page.goto('/ar');
  await expect(page.locator('.artwork-hero-image')).toHaveAttribute(
    'src',
    '/brand/hero-ar-background.webp',
  );
  const image = await request.get('/brand/hero-ar-background.webp');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/webp');
  expect((await image.body()).length).toBeLessThan(150000);
  const processed = await request.get(
    '/_next/image?url=%2Fbrand%2Fwebsite-designs%2Ffurniture.webp&w=640&q=75',
    { headers: { Accept: 'image/avif,image/webp,*/*' } },
  );
  expect(processed.ok()).toBe(true);
  expect(processed.headers()['content-type']).toContain('image/webp');
});
