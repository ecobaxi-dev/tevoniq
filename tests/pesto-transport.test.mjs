import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { checkPestoTransport } from '../apps/web/src/lib/pesto-transport-check.ts';

const secret = 'synthetic-transport-secret-'.repeat(3),
  now = 1800000000000;
const nonce = 'a'.repeat(64),
  timestamp = String(now / 1000);
const mac = (s) => createHmac('sha256', secret).update(s).digest('hex');
function request(extra = {}, suffix = '') {
  return new Request('https://example.test/api/pesto/transport-check' + suffix, {
    method: 'POST',
    headers: {
      'x-pesto-check-time': timestamp,
      'x-pesto-check-nonce': nonce,
      'x-pesto-check-signature': mac(
        `pesto-transport-v1\nPOST\n/api/pesto/transport-check\n${timestamp}\n${nonce}`,
      ),
      ...extra,
    },
  });
}
const run = (r, options = {}) => checkPestoTransport(r, { enabled: true, secret, now, ...options });
test('transport diagnostic is independently disabled and authenticated, with fresh bounded metadata', () => {
  assert.equal(run(request(), { enabled: false }).status, 404);
  assert.equal(run(request(), { secret: undefined }).status, 404);
  for (const extra of [
    { 'x-pesto-check-signature': 'b'.repeat(64) },
    { 'x-pesto-check-time': '0' },
    { origin: 'https://example.test' },
    { cookie: 'test=1' },
    { 'x-pesto-check-nonce': 'x'.repeat(5000) },
  ])
    assert.equal(run(request(extra)).status, 403);
  assert.equal(run(request({}, '?secret=no')).status, 403);
  assert.equal(run(request(), { now: now + 121000 }).status, 403);
});
test('proxy request framing does not replace or bypass operator authentication', async () => {
  for (const framing of [
    { 'transfer-encoding': 'chunked' },
    { 'content-length': '0' },
    { 'content-length': '2' },
  ]) {
    const response = run(request(framing));
    assert.equal(response.status, 200);
    assert.equal(
      run(request({ ...framing, 'x-pesto-check-signature': 'b'.repeat(64) })).status,
      403,
    );
  }
  assert.equal(
    (await run(request({ 'x-pesto-check-signature': 'b'.repeat(64) })).json()).code,
    'transport_check_proof_rejected',
  );
  assert.equal(
    (await run(request(), { now: now + 121000 }).json()).code,
    'transport_check_clock_rejected',
  );
  assert.equal(
    (await run(request({ cookie: 'test=1' })).json()).code,
    'transport_check_request_rejected',
  );
});
test('signed observations reveal only allowed header shape and nonce-bound HMACs', async () => {
  const response = run(
    request({
      'cf-connecting-ip': '203.0.113.1',
      'x-forwarded-for': '203.0.113.2, 203.0.113.3',
      authorization: 'must-not-appear',
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const raw = await response.text(),
    envelope = JSON.parse(raw);
  assert.equal(envelope.signature, mac(`pesto-transport-response-v1\n${envelope.payload}`));
  const decoded = Buffer.from(envelope.payload, 'base64').toString();
  assert.ok(
    !decoded.includes('203.0.113.') &&
      !decoded.includes('must-not-appear') &&
      !decoded.includes(secret),
  );
  const data = JSON.parse(decoded);
  assert.equal(data.nonce, nonce);
  assert.deepEqual(data.observations[0], {
    name: 'cf-connecting-ip',
    present: true,
    count: 1,
    singleIp: true,
    digest: mac(`pesto-transport-ip-v1\n${nonce}\ncf-connecting-ip\n203.0.113.1`),
  });
  assert.equal(data.observations[3].count, 2);
  assert.equal(data.observations[3].digest, null);
  assert.equal(data.observations[1].present, false);
});
test('oversized and invalid header values are never reflected or treated as a client IP', async () => {
  for (const value of ['invalid', 'x'.repeat(2048)]) {
    const data = await run(request({ 'cf-connecting-ip': value })).json();
    const observation = JSON.parse(Buffer.from(data.payload, 'base64')).observations[0];
    assert.equal(observation.singleIp, false);
    assert.equal(observation.digest, null);
  }
});
