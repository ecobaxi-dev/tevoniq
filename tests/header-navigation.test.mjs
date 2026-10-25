import { test } from 'node:test';
import assert from 'node:assert/strict';
import { headerNavigation } from '../apps/web/src/content/header-navigation.ts';

const base = {
  labels: { quote: 'اطلب عرض سعر', search: 'بحث' },
  items: [
    { id: 'home', label: 'الرئيسية', href: '/' },
    { id: 'solutions', label: 'الحلول', href: '/solutions' },
    {
      id: 'services',
      label: 'الخدمات',
      href: '/services',
      groups: [
        {
          id: 'web',
          label: 'Web',
          items: [{ id: 'web-dev', label: 'Web dev', href: '/services/web-development' }],
        },
      ],
    },
    { id: 'projects', label: 'المشاريع', href: '/projects' },
    {
      id: 'company',
      label: 'الشركة',
      href: '/company',
      children: [
        { id: 'about', label: 'من نحن', href: '/company/about' },
        { id: 'advocas', label: 'Advocas المحرر', href: '/advocas' },
      ],
    },
    {
      id: 'insights',
      label: 'المعرفة',
      href: '/insights',
      children: [{ id: 'blog', label: 'المدونة', href: '/insights/blog' }],
    },
    { id: 'contact', label: 'اتصل بنا', href: '/contact' },
    { id: 'pesto', label: 'بيستو المحرر', href: '/pesto' },
    { id: 'custom', label: 'صفحة مخصصة', href: '/custom' },
  ],
};
const paths = (items) =>
  new Set(
    items.flatMap((item) => [
      item.href,
      ...paths(item.children ?? []),
      ...paths(item.groups?.flatMap((group) => group.items) ?? []),
    ]),
  );

test('clean header groups all published destinations under five entries without mutating CMS content', () => {
  const original = structuredClone(base);
  const result = headerNavigation('ar', base);
  assert.deepEqual(base, original);
  assert.deepEqual(
    result.items.map((item) => item.label),
    ['الرئيسية', 'خدماتنا', 'حلولنا', 'منتجاتنا', 'عن الشركة'],
  );
  assert.deepEqual(paths(result.items), paths(base.items));
  assert.equal(result.labels.quote, 'لنناقش احتياجك');
  const products = result.items.find((item) => item.id === 'products');
  assert.deepEqual(
    products.children.map((item) => item.label),
    ['بيستو المحرر', 'Advocas المحرر'],
  );
  assert.ok(
    !result.items
      .find((item) => item.id === 'company')
      .children.some((item) => item.href === '/advocas'),
  );
});

test('custom navigation labels survive grouping and existing Turkish navigation stays intact', () => {
  const custom = structuredClone(base);
  custom.items.find((item) => item.id === 'services').label = 'خدمات مخصصة';
  assert.equal(headerNavigation('ar', custom).items[1].label, 'خدمات مخصصة');
  assert.equal(headerNavigation('tr', custom), custom);
  assert.equal(
    headerNavigation('en', custom).items.find((item) => item.id === 'products').label,
    'Products',
  );
});
