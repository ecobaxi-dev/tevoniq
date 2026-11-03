import { test } from 'node:test';
import assert from 'node:assert/strict';
import { growthPage, growthLink, growthCampaign } from '../apps/web/src/lib/growth-events.ts';
import {
  growthPaths,
  growthFilms,
  growthSectors,
  growthGuides,
} from '../apps/web/src/content/growth.ts';
import { isRetiredPublicPath } from '../packages/types/dist/index.js';
test('Growth analytics strips visitor query values, fragments and unknown slugs', () => {
  assert.deepEqual(growthPage('/ar/contact?email=private@example.test#phone'), {
    locale: 'ar',
    page_type: 'contact',
    page_path: '/ar/contact',
  });
  assert.equal(growthPage('/en/services/person@example.test').page_path, '/en/services');
  assert.equal(growthPage('/ar/services/it-consulting').page_path, '/ar/services/it-consulting');
  assert.equal(growthPage('/ar/unknown/secret').page_path, '/ar');
  assert.equal(growthLink('https://external.test/private', 'https://tevoniq.com'), null);
  assert.equal(
    growthLink('/ar/request-quote?phone=123', 'https://tevoniq.com').destination,
    '/ar/request-quote',
  );
  assert.equal(
    growthLink('/ar/work-systems/maintenance', 'https://tevoniq.com').event,
    'demo_open',
  );
});
test('Month-one content has two sectors, two substantive bilingual guides and four original model films', () => {
  assert.equal(growthSectors.length, 2);
  assert.equal(growthGuides.length, 2);
  assert.equal(growthFilms.length, 4);
  assert.equal(new Set(growthPaths).size, 5);
  for (const item of growthGuides)
    for (const locale of ['ar', 'en']) {
      assert.equal(item[locale].sections.length, 6);
      assert.ok(item[locale].intro.length > 80);
    }
  for (const film of growthFilms) {
    assert.equal(isRetiredPublicPath(film.path), false);
    for (const locale of ['ar', 'en']) assert.equal(film[locale].steps.length, 3);
  }
  for (const sector of growthSectors) {
    assert.equal(isRetiredPublicPath(sector.demo), false);
    assert.equal(isRetiredPublicPath(sector.design), false);
  }
});

test('New guides are discoverable in site search with language isolation', async () => {
  const { addGrowthResults } = await import('../apps/web/src/lib/growth-search.ts');
  const response = { query: 'Excel', groups: [] };
  const found = addGrowthResults(response, 'ar', 'Excel');
  assert.equal(found.groups[0].items[0].url, '/ar/guides/when-to-replace-spreadsheets');
  assert.deepEqual(addGrowthResults(response, 'tr', 'Excel'), response);
  assert.deepEqual(response.groups, []);
});

test('Campaign reporting accepts only the agreed non-personal labels', () => {
  assert.deepEqual(growthCampaign('?utm_source=private@example.test&utm_campaign=12345'), {});
  assert.deepEqual(
    growthCampaign('?utm_source=linkedin&utm_medium=video&utm_campaign=month1-website'),
    { campaign_source: 'linkedin', campaign_medium: 'video', campaign_name: 'month1-website' },
  );
});
