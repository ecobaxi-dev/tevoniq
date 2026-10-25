import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entryLanguage } from '../apps/web/src/content/entry-language.ts';

test('a fresh visitor enters Arabic even with an older English CMS default', () => {
  assert.equal(entryLanguage(['en', 'ar', 'tr'], 'en'), 'ar');
});
test('a valid explicit preference wins; unsupported and malformed values are ignored', () => {
  assert.equal(entryLanguage(['en', 'ar'], 'en', 'en'), 'en');
  assert.equal(entryLanguage(['en', 'ar'], 'en', 'fr'), 'ar');
  assert.equal(entryLanguage(['en', 'ar'], 'en', '../en'), 'ar');
});
test('disabling Arabic keeps the entry point within enabled site languages', () => {
  assert.equal(entryLanguage(['en'], 'en'), 'en');
});
