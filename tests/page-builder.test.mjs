import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  sectionTypes,
  builderSectionSchema,
  pageDocumentSchema,
  pageWriteSchema,
  builderPathSchema,
  pageCatalogReferences,
  normalizeSectionOrder,
} from '../packages/validation/dist/index.js';
import {
  resolvePage,
  publishedDocument,
  catalogCards,
} from '../apps/api/dist/page-builder/page-content.js';
import { PageBuilderController } from '../apps/api/dist/page-builder/page-builder.controller.js';
import { makeDocument, makeSection } from './page-builder.fixtures.mjs';

test('Editor normalizes sparse section orders without changing the saved snapshot', () => {
  const doc = makeDocument();
  doc.sections = [makeSection('FAQ', 79), makeSection('Hero', 2), makeSection('CTA', 12)];
  const before = structuredClone(doc);
  assert.equal(pageDocumentSchema.safeParse(doc).success, true);
  const normalized = normalizeSectionOrder(doc);
  assert.deepEqual(
    normalized.sections.map((s) => s.type),
    ['Hero', 'CTA', 'FAQ'],
  );
  assert.deepEqual(
    normalized.sections.map((s) => s.order),
    [0, 1, 2],
  );
  assert.deepEqual(doc, before);
  normalized.sections.push(makeSection('Stats', normalized.sections.length));
  assert.equal(pageDocumentSchema.safeParse(normalized).success, true);
});
test('All 20 section types have valid typed data and common presentation fields', () => {
  const doc = makeDocument();
  assert.equal(sectionTypes.length, 20);
  assert.equal(
    pageWriteSchema.safeParse({ document: doc, version: 0, action: 'publish' }).success,
    true,
  );
  for (const section of doc.sections) {
    assert.equal(builderSectionSchema.safeParse(section).success, true, section.type);
    assert.equal(builderSectionSchema.safeParse({ ...section, theme: 'CUSTOM' }).success, false);
    assert.equal(
      builderSectionSchema.safeParse({ ...section, style: { color: 'red' } }).success,
      false,
    );
  }
});
test('Builder rejects raw HTML blocks, arbitrary attributes, unsafe media links and iframe sources', () => {
  const hero = makeSection('Hero');
  for (const patch of [
    { html: '<script>alert(1)</script>' },
    { onClick: 'evil' },
    { type: 'HTML' },
    { theme: 'url(javascript:evil)' },
  ])
    assert.equal(builderSectionSchema.safeParse({ ...hero, ...patch }).success, false);
  for (const href of [
    'javascript:alert(1)',
    'data:text/html,bad',
    '//evil.test',
    'http://evil.test',
    '/\\evil.test',
  ])
    assert.equal(
      builderSectionSchema.safeParse({
        ...hero,
        content: { en: { ...hero.content.en, actions: [{ label: 'Unsafe', href }] } },
      }).success,
      false,
      href,
    );
  const video = makeSection('Video');
  assert.equal(
    builderSectionSchema.safeParse({
      ...video,
      content: { en: { ...video.content.en, videoId: 'https://evil.test/embed' } },
    }).success,
    false,
  );
  assert.equal(
    builderSectionSchema.safeParse({
      ...hero,
      content: {
        en: {
          ...hero.content.en,
          media: { src: 'https://example.test/x.png', alt: '', caption: '' },
        },
      },
    }).success,
    false,
  );
});
test('Page paths cannot shadow application routes; IDs, order and payload size are bounded', () => {
  for (const path of [
    '/',
    '/admin/users',
    '/company/about',
    '/insights/blog',
    '/en/test',
    '/a/../admin',
    '//evil.test',
    '/api',
    '/request-quote',
  ])
    assert.equal(builderPathSchema.safeParse(path).success, false, path);
  assert.equal(builderPathSchema.safeParse('/campaign/cloud-platform').success, true);
  const doc = makeDocument();
  assert.equal(
    pageDocumentSchema.safeParse({ ...doc, sections: [doc.sections[0], doc.sections[0]] }).success,
    false,
  );
  assert.equal(
    pageDocumentSchema.safeParse({
      ...doc,
      sections: doc.sections.map((s) => ({ ...s, order: 0 })),
    }).success,
    false,
  );
  const oversized = {
    ...doc,
    sections: Array.from({ length: 30 }, (_, i) => ({
      ...makeSection('CustomHeading', i),
      content: {
        en: {
          heading: 'Heading',
          text: 'a'.repeat(5000),
          media: null,
          level: 'h2',
          alignment: 'START',
        },
      },
    })),
  };
  assert.equal(pageDocumentSchema.safeParse(oversized).success, false);
});
test('Drafts may be incomplete while publication requires useful content and per-language metadata', () => {
  const doc = makeDocument();
  doc.sections = [];
  assert.equal(
    pageWriteSchema.safeParse({ document: doc, version: 0, action: 'save' }).success,
    true,
  );
  assert.equal(
    pageWriteSchema.safeParse({ document: doc, version: 0, action: 'publish' }).success,
    false,
  );
  const full = makeDocument();
  full.translations.ar = { title: 'عنوان', seoTitle: '', seoDescription: 'وصف', ogImage: '' };
  assert.equal(
    pageWriteSchema.safeParse({ document: full, version: 0, action: 'publish' }).success,
    false,
  );
  const faq = makeSection('FAQ');
  faq.content.en.items[0].answer = '';
  assert.equal(
    pageWriteSchema.safeParse({
      document: { ...doc, sections: [faq] },
      version: 0,
      action: 'publish',
    }).success,
    false,
  );
});
test('Public resolution excludes hidden blocks and every other language without exposing draft fields', async () => {
  const doc = makeDocument();
  doc.sections = doc.sections.filter((s) => !s.type.endsWith('Grid'));
  doc.sections[1].visible = false;
  doc.sections[0].content.ar = { ...doc.sections[0].content.en, heading: 'Private Arabic draft' };
  const result = await resolvePage({}, doc, 'en');
  assert.equal(result.document.sections.length, doc.sections.length - 1);
  assert.equal(JSON.stringify(result).includes('Private Arabic draft'), false);
  assert.equal(JSON.stringify(result).includes(doc.sections[1].id), false);
  assert.deepEqual(Object.keys(result.document.translations), ['en']);
  assert.equal(publishedDocument({ html: 'bad' }), null);
});
test('Catalog references are unique across sections and languages', () => {
  const id = randomUUID(),
    doc = makeDocument('/fixture', { service: id });
  const section = doc.sections.find((s) => s.type === 'ServiceGrid');
  section.content.ar = section.content.en;
  doc.sections.push({ ...section, id: randomUUID(), order: 20 });
  assert.equal(pageCatalogReferences(doc).filter((r) => r.kind === 'service').length, 1);
});
test('Catalog cards enforce public and locale predicates and never return private project data', async () => {
  let where;
  const service = {
    service: {
      findMany: async (args) => {
        where = args.where;
        return [
          {
            id: randomUUID(),
            slug: 'service',
            translations: [{ title: 'Service', summary: 'Summary' }],
          },
        ];
      },
    },
  };
  const cards = await catalogCards(service, 'service', 'ar');
  assert.equal(where.active, true);
  assert.equal(where.deletedAt, null);
  assert.deepEqual(where.translations.some, { locale: 'ar', published: true });
  assert.equal(cards[0].href, '/ar/services/service');
  const projects = {
    project: {
      findMany: async () => [
        {
          id: randomUUID(),
          slug: 'private',
          clientName: 'Hidden client',
          clientVisibility: 'PRIVATE',
          published: true,
          verified: true,
          translations: [
            {
              locale: 'en',
              published: true,
              title: 'Hidden client title',
              summary: 'Summary',
              seoTitle: 'SEO',
              seoDescription: 'Description',
              challenge: 'Challenge',
              solution: 'Solution',
            },
          ],
        },
      ],
    },
  };
  assert.deepEqual(await catalogCards(projects, 'project', 'en'), []);
});
test('Stale page saves fail before changing drafts, published snapshots or references', async () => {
  const db = {
    cmsPage: { findUnique: async () => ({ version: 3, deletedAt: null }) },
    $transaction: async (fn) => fn(db),
  };
  const controller = new PageBuilderController(db);
  await assert.rejects(
    controller.update(
      randomUUID(),
      { document: makeDocument(), version: 2, action: 'save' },
      { cmsUser: { id: randomUUID(), role: 'ADMIN' } },
    ),
    { status: 409 },
  );
});
