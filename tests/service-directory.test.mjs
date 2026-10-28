import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupServiceDirectory } from '../apps/web/src/lib/service-directory.ts';
import { retiredServiceSlugs } from '../packages/types/src/retired-catalog.ts';
const card = (slug, title = slug) => ({ id: slug, slug, title, summary: 'Published summary' });
const navigation = [
  {
    id: 'consulting',
    label: 'Consulting',
    items: [{ href: '/services/it-consulting' }, { href: '/services/cloud-solutions' }],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    items: [
      { href: '/services/software-product-engineering' },
      { href: '/services/it-consulting' },
    ],
  },
];
test('directory classification never creates cards from navigation and uses each published service once', () => {
  assert.deepEqual(groupServiceDirectory([], navigation, 'Other'), []);
  const groups = groupServiceDirectory(
    [card('it-consulting'), card('development-fixture')],
    navigation,
    'Other',
  );
  assert.deepEqual(
    groups.map((g) => [g.id, g.items.map((i) => i.slug)]),
    [
      ['consulting', ['it-consulting']],
      ['other', ['development-fixture']],
    ],
  );
});
test('every retired slug and renamed archived entry is excluded even when upstream and navigation contain it', () => {
  const items = [
    ...retiredServiceSlugs.map((slug) => card(slug, 'Renamed archive')),
    card('published-alias', 'SAP'),
    card('it-consulting'),
  ];
  const result = groupServiceDirectory(items, navigation, 'Other');
  assert.deepEqual(
    result.flatMap((g) => g.items.map((i) => i.slug)),
    ['it-consulting'],
  );
});
test('directory categories preserve navigation order, show only published matches and retain current-page card copy', () => {
  const items = [
    card('software-product-engineering', 'CMS title'),
    card('it-consulting', 'Consulting title'),
  ];
  const result = groupServiceDirectory(items, navigation, 'Other');
  assert.deepEqual(
    result.map((g) => g.id),
    ['consulting', 'engineering'],
  );
  assert.equal(result[1].items[0].title, 'CMS title');
  assert.deepEqual(
    items.map((i) => i.slug),
    ['software-product-engineering', 'it-consulting'],
  );
});
