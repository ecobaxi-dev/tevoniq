import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Heading, editorialHeading } from '../packages/ui/dist/typography.js';

test('Editorial headings connect the published phrases without changing technical names', () => {
  assert.equal(
    editorialHeading('One vision. Every layer of technology.'),
    'One vision across every layer of technology',
  );
  assert.equal(
    editorialHeading('رؤية واحدة. تشمل كل طبقات التقنية.'),
    'رؤية متكاملة لكل طبقات التقنية',
  );
  assert.equal(
    editorialHeading('Technology built around your business.'),
    'Technology built around your business',
  );
  for (const title of [
    'Node.js',
    '.NET development',
    'U.S.',
    'How can we help?',
    'Tek vizyon. Teknolojinin her katmanında.',
  ])
    assert.equal(editorialHeading(title), title);
});

test('Heading preserves semantics, links and escaped visitor text', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Heading,
      { as: 'h2', id: 'title', className: 'tv-h2' },
      createElement('a', { href: '/en/services' }, 'Our services.'),
    ),
  );
  assert.equal(markup, '<h2 id="title" class="tv-h2"><a href="/en/services">Our services</a></h2>');
  assert.ok(
    renderToStaticMarkup(
      createElement(Heading, { as: 'h1' }, '<script>alert(1)</script>'),
    ).includes('&lt;script&gt;'),
  );
});
