import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicNavigationSchema } from '../packages/validation/dist/index.js';
import { applyNavigationRecords } from '../apps/web/src/content/navigation-records.ts';
const id = '11111111-1111-4111-8111-111111111111';
test('CMS navigation changes labels and adds grouped local links without losing existing menus', () => {
  const base = {
    items: [
      {
        id: 'company',
        label: 'Company',
        href: '/company',
        menu: 'submenu',
        children: [{ id: 'about', label: 'About', href: '/company/about' }],
      },
    ],
    labels: { search: 'Search' },
  };
  const result = applyNavigationRecords(
    base,
    publicNavigationSchema.parse({
      items: [
        { id, label: 'Who we are', href: '/company/about', group: 'company', order: 0 },
        { id, label: 'Contact', href: '/contact', group: 'company', order: 1 },
      ],
      labels: { search: 'Find content', unknown: 'Ignored' },
    }),
  );
  assert.equal(result.items[0].children[0].label, 'Who we are');
  assert.equal(result.items[0].children[1].href, '/contact');
  assert.equal(result.labels.search, 'Find content');
  assert.equal(result.labels.unknown, undefined);
  assert.equal(base.items[0].children.length, 1);
  for (const href of ['//evil.test', 'javascript:alert(1)', '/ar/contact', '/\\evil.test'])
    assert.equal(
      publicNavigationSchema.safeParse({
        items: [{ id, label: 'Unsafe', href, group: 'main', order: 0 }],
        labels: {},
      }).success,
      false,
    );
});
