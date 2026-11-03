/** Reproducible local recording of original illustrative motion graphics; no external services. */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, rm } from 'node:fs/promises';
import { growthFilms } from '../apps/web/src/content/growth.ts';
import { growthFilmHtml } from './lib/growth-film.mjs';
const output = new URL('../apps/web/public/brand/growth/', import.meta.url).pathname;
const temporary = '/tmp/tevoniq-growth-recordings';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: false,
  executablePath:
    process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
try {
  for (const locale of ['ar', 'en'])
    await Promise.all(
      growthFilms.map(async (film) => {
        const context = await browser.newContext({
          viewport: { width: 1280, height: 800 },
          recordVideo: { dir: temporary, size: { width: 1280, height: 800 } },
        });
        const page = await context.newPage();
        await page.setContent(growthFilmHtml(film.id, locale));
        await page.evaluate(() => document.fonts.ready);
        const frame = await page.screenshot();
        await sharp(frame)
          .resize(960, 600)
          .webp({ quality: 82 })
          .toFile(output + `${film.id}-${locale}.webp`);
        for (let stage = 0; stage < 3; stage++) {
          await page.evaluate((step) => window.showStage(step), stage);
          await page.waitForTimeout(4200);
        }
        const video = page.video();
        await context.close();
        await video.saveAs(output + `${film.id}-${locale}.webm`);
        await rm(await video.path(), { force: true });
        console.log(`Recorded ${film.id}-${locale}`);
      }),
    );
} finally {
  await browser.close();
}
