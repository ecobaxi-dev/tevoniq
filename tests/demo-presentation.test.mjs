import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoContent } from '../scripts/lib/demo-content.mjs';
import {
  projectPresentationPatch,
  articlePresentationPatch,
} from '../scripts/lib/demo-presentation.mjs';
import { demoLabels } from '../content/demo-content.mjs';
const content = buildDemoContent();
test('presentation update removes legacy prefixes and references without changing custom titles', () => {
  for (const locale of ['en', 'tr', 'ar']) {
    const l = demoLabels[locale],
      desired = content.projects[0].value.translations.find((t) => t.locale === locale);
    const old = {
      ...desired,
      title: `${l.demo}: ${desired.title}`,
      summary: l.reference,
      solution: l.reference,
      implementation: `${desired.implementation}\n\n${l.referenceLink}: https://www.n-ix.com/case-study/example/`,
      heroImage: { ...desired.heroImage, caption: l.notice },
    };
    const updated = { ...old, ...projectPresentationPatch(old, desired) };
    assert.equal(updated.title, desired.title);
    assert.doesNotMatch(JSON.stringify(updated), /n[\s-]?ix/i);
    assert.equal(updated.heroImage.caption, l.demo);
    assert.deepEqual(projectPresentationPatch(updated, desired), {});
    assert.equal(
      projectPresentationPatch({ ...updated, title: 'Owner edited title' }, desired).title,
      undefined,
    );
  }
});
test('article migration moves disclosure to the end and preserves custom paragraphs and image URLs', () => {
  const desired = content.articles.find((a) => a.value.kind === 'case-study').value;
  const l = demoLabels[desired.language];
  const before = {
    ...desired,
    title: `Demo: ${desired.title}`,
    excerpt: `${l.articleNote} N-iX describes an example`,
    content: [
      { type: 'paragraph', text: l.reference },
      { type: 'paragraph', text: 'Owner edited paragraph' },
      { type: 'paragraph', text: 'N-iX describes a platform' },
      { type: 'link', text: l.referenceLink, url: 'https://www.n-ix.com/case-study/example/' },
    ],
  };
  const updated = { ...before, ...articlePresentationPatch(before, desired) };
  assert.equal(updated.title, desired.title);
  assert.ok(updated.content.some((b) => b.text === 'Owner edited paragraph'));
  assert.doesNotMatch(JSON.stringify(updated), /n[\s-]?ix/i);
  assert.equal(updated.coverImage, before.coverImage);
  assert.equal(updated.content.at(-1).text, l.articleNote);
  assert.deepEqual(articlePresentationPatch(updated, desired), {});
});
