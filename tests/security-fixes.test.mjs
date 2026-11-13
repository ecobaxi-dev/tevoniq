import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { clientRateKey } from '../apps/api/dist/security/rate-limit.js';
import { trustedClientHeaders } from '../apps/web/src/lib/client-ip.ts';
const secret = 'test-only-secret-'.repeat(4);
const config = { LEAD_PROXY_SECRET: secret, LEAD_CLIENT_IP_HEADER: 'x-edge-ip' };
const req = (ip, sig) => ({
  headers: { 'x-lead-client-ip': ip, 'x-lead-ip-signature': sig },
  ip: '127.0.0.1',
});
test('Rate keys accept only signed identities and group IPv6 addresses in the same subnet', () => {
  assert.equal(clientRateKey(req('203.0.113.2', '0'.repeat(64)), secret), '127.0.0.1');
  const signed = (ip) => req(ip, createHmac('sha256', secret).update(ip).digest('hex'));
  assert.equal(clientRateKey(signed('203.0.113.2'), secret), '203.0.113.2');
  assert.equal(
    clientRateKey(signed('2001:db8:1234:5600::1'), secret),
    clientRateKey(signed('2001:db8:1234:5600::2'), secret),
  );
});
test('BFF replaces caller signatures and accepts forwarding chains only with explicit trusted hops', () => {
  const request = new Request('https://tevoniq.test', {
    headers: { 'x-edge-ip': '203.0.113.2', 'x-lead-ip-signature': 'forged' },
  });
  const headers = trustedClientHeaders(request, config);
  assert.equal(headers['x-lead-client-ip'], '203.0.113.2');
  assert.equal(
    headers['x-lead-ip-signature'],
    createHmac('sha256', secret).update('203.0.113.2').digest('hex'),
  );
  const chain = new Request('https://tevoniq.test', {
    headers: { 'x-forwarded-for': '198.51.100.9, 203.0.113.2' },
  });
  const forwardConfig = { ...config, LEAD_CLIENT_IP_HEADER: 'x-forwarded-for' };
  assert.deepEqual(trustedClientHeaders(chain, forwardConfig), {});
  assert.equal(
    trustedClientHeaders(chain, { ...forwardConfig, LEAD_TRUSTED_PROXY_HOPS: '1' })[
      'x-lead-client-ip'
    ],
    '203.0.113.2',
  );
  assert.deepEqual(trustedClientHeaders(request, {}), {});
});
