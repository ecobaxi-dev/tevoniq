import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogHref } from '../apps/web/src/content/solution-experience.ts';

test('switching the featured filter preserves search and service, and returns to the first page', () => {
  const query = { q: 'معالجة المستندات', service: 'api-integration', page: 4, featured: 'true' };
  const all = new URL(catalogHref('ar', query, '', 1), 'https://example.invalid');
  assert.equal(all.pathname, '/ar/solutions');
  assert.equal(all.searchParams.get('q'), query.q);
  assert.equal(all.searchParams.get('service'), query.service);
  assert.equal(all.searchParams.has('featured'), false);
  assert.equal(all.searchParams.has('page'), false);
  assert.equal(all.hash, '#solution-catalog');
  assert.equal(query.page, 4);
});
test('pagination preserves filters and safely encodes search terms', () => {
  const url = new URL(
    catalogHref('tr', { q: 'cloud & access', featured: 'false', page: 2 }, 'false', 3),
    'https://example.invalid',
  );
  assert.equal(url.searchParams.get('q'), 'cloud & access');
  assert.equal(url.searchParams.get('featured'), 'false');
  assert.equal(url.searchParams.get('page'), '3');
  assert.equal(url.searchParams.has('service'), false);
});
