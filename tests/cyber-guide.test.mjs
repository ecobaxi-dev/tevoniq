import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cyberTopics,
  cyberStates,
  cyberPermissions,
  cyberStartingPoint,
  cyberContactHref,
  cyberLeadMessage,
  cyberLabels,
} from '../apps/web/src/lib/cyber-guide.ts';
import { cyberCases, cyberServices } from '../apps/web/src/content/cybersecurity.ts';
import { isRetiredPublicPath } from '../packages/types/dist/index.js';
test('cyber priority guide resolves permission before review, without assigning a protection score', () => {
  for (const topic of cyberTopics)
    for (const state of cyberStates) {
      assert.equal(cyberStartingPoint({ topic, state, permission: 'pending' }), 'permission');
      assert.equal(
        cyberStartingPoint({ topic, state, permission: 'approved' }),
        state === 'unknown' ? 'inventory' : state === 'needs-work' ? 'priorities' : 'evidence',
      );
    }
});
test('cyber contact passes every approved guide selection and rejects missing, repeated and unknown inputs', () => {
  for (const locale of ['ar', 'en']) {
    for (const topic of cyberTopics)
      for (const state of cyberStates)
        for (const permission of cyberPermissions) {
          const input = { topic, state, permission },
            url = new URL(cyberContactHref(locale, input), 'https://example.invalid'),
            message = cyberLeadMessage(locale, Object.fromEntries(url.searchParams));
          assert.equal(url.pathname, `/${locale}/contact`);
          assert.equal(isRetiredPublicPath(url.pathname), false);
          for (const value of Object.values(input))
            assert.ok(message.includes(cyberLabels[locale][value]));
        }
    for (const key of ['topic', 'state', 'permission'])
      for (const value of [undefined, ['accounts'], 'untrusted'])
        assert.equal(
          cyberLeadMessage(locale, {
            cyber: 'guide',
            topic: 'accounts',
            state: 'unknown',
            permission: 'approved',
            [key]: value,
          }),
          undefined,
        );
    for (const cyber of [undefined, ['review'], 'untrusted', '../', '<script>'])
      assert.equal(cyberLeadMessage(locale, { cyber }), undefined);
    assert.ok(cyberLeadMessage(locale, { cyber: 'review' }));
    for (const item of cyberServices)
      assert.ok(
        cyberLeadMessage(locale, { cyber: `scope-${item.id}` }).includes(item[locale].title),
      );
  }
});
test('cyber scenario handoffs include explicit evidence, deliverables and scope limits', () => {
  for (const item of cyberCases)
    for (const locale of ['ar', 'en']) {
      assert.ok(
        cyberLeadMessage(locale, { cyber: `case-${item.id}` }).includes(item[locale].title),
      );
      for (const field of ['challenge', 'approach', 'evidence', 'deliverable', 'limit'])
        assert.ok(item[locale][field].length > 20);
    }
});
