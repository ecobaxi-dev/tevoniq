import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseSecurityIssues } from '../scripts/release-security.mjs';
const config = {
  SITE_URL: 'https://www.tevoniq.test',
  CORS_ORIGIN: 'https://www.tevoniq.test',
  TURNSTILE_MODE: 'turnstile',
  TURNSTILE_SITE_KEY: 'production-public-key',
  TURNSTILE_SECRET_KEY: 'production-secret-key',
  TURNSTILE_HOSTNAMES: 'www.tevoniq.test',
  EMAIL_TRANSPORT: 'resend',
  LEAD_PROXY_SECRET: 's'.repeat(32),
  LEAD_CLIENT_IP_HEADER: 'x-overwritten-edge-ip',
};
test('Release gate requires real bot/email configuration and matching authenticated client forwarding', () => {
  assert.deepEqual(releaseSecurityIssues(config, config), []);
  for (const patch of [
    { TURNSTILE_MODE: 'disabled' },
    { TURNSTILE_SITE_KEY: '1x00000000000000000000AA' },
    { TURNSTILE_SECRET_KEY: '' },
    { EMAIL_TRANSPORT: 'disabled' },
    { TURNSTILE_HOSTNAMES: 'wrong.test' },
  ])
    assert.ok(releaseSecurityIssues({ ...config, ...patch }, config).length);
  assert.ok(releaseSecurityIssues(config, { ...config, LEAD_PROXY_SECRET: 'different' }).length);
  assert.ok(
    releaseSecurityIssues(config, { ...config, LEAD_CLIENT_IP_HEADER: 'x-forwarded-for' }).length,
  );
  assert.deepEqual(
    releaseSecurityIssues(config, {
      ...config,
      LEAD_CLIENT_IP_HEADER: 'x-forwarded-for',
      LEAD_TRUSTED_PROXY_HOPS: '1',
    }),
    [],
  );
});
