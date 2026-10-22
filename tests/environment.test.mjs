import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiEnvironmentSchema, localeSchema } from '@tevoniq/validation';
import { directionFor } from '@tevoniq/types';
const valid = {
  DATABASE_URL: 'postgresql://localhost:5432/test',
  CORS_ORIGIN: 'http://localhost:3000',
};
test('environment requires a PostgreSQL connection and exact browser origin', () => {
  assert.equal(apiEnvironmentSchema.safeParse(valid).success, true);
  for (const changed of [
    { DATABASE_URL: '' },
    { DATABASE_URL: 'https://example.com' },
    { CORS_ORIGIN: '*' },
    { CORS_ORIGIN: 'https://example.com/path' },
    { PORT: 0 },
  ]) {
    assert.equal(apiEnvironmentSchema.safeParse({ ...valid, ...changed }).success, false);
  }
});
test('public production origins require HTTPS; local container previews permit loopback', () => {
  assert.equal(
    apiEnvironmentSchema.safeParse({
      ...valid,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'http://example.com',
    }).success,
    false,
  );
  assert.equal(apiEnvironmentSchema.safeParse({ ...valid, NODE_ENV: 'production' }).success, true);
  assert.equal(
    apiEnvironmentSchema.safeParse({
      ...valid,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://example.com',
    }).success,
    true,
  );
});
test('locales are constrained and Arabic selects RTL', () => {
  assert.equal(localeSchema.safeParse('de').success, false);
  assert.equal(directionFor('ar'), 'rtl');
  assert.equal(directionFor('tr'), 'ltr');
  assert.equal(directionFor('en'), 'ltr');
});
