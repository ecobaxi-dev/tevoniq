import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { forwardPesto } from '../apps/web/src/lib/pesto-proxy-core.ts';

const profile = () => ({
  requestId: randomUUID(),
  installationId: randomUUID(),
  deviceHash: 'A'.repeat(64),
  clientSecret: 'b'.repeat(64),
  email: ' OWNER@EXAMPLE.TEST ',
  managerName: 'Owner',
  businessName: 'Restaurant',
  country: 'sa',
  phone: '+905550000000',
  language: 'en',
  consent: true,
});
const site = 'https://tevoniq.example',
  proxySecret = 's'.repeat(48);
const config = (fetch) => ({
  enabled: true,
  siteUrl: site,
  apiUrl: 'http://127.0.0.1:4000/api/v1',
  ipHeader: 'x-test-edge-ip',
  proxySecret,
  fetch,
});
function request(body = profile(), headers = {}, url = site + '/api/pesto/registrations') {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-test-edge-ip': '203.0.113.10', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
const unavailable = async () => {
  throw new Error('Unexpected forwarding');
};
test('Pesto proxy is independently disabled and fails closed without trusted configuration', async () => {
  for (const patch of [
    { enabled: false },
    { ipHeader: undefined },
    { proxySecret: undefined },
    { proxySecret: 'short' },
    { apiUrl: 'http://internal/api/v1?secret=private' },
    { apiUrl: 'http://user:pass@internal/api/v1' },
    { apiUrl: 'http://internal/admin' },
    { siteUrl: site + '/nested' },
  ]) {
    const result = await forwardPesto(request(), 'register', { ...config(unavailable), ...patch });
    assert.equal(result.status, 503);
    assert.equal(result.headers.get('cache-control'), 'no-store');
  }
});
test('Pesto proxy rejects browser origins, query credentials, invalid content and malformed schemas before forwarding', async () => {
  for (const headers of [
    { origin: 'https://evil.example' },
    { origin: 'null' },
    { origin: site, 'sec-fetch-site': 'cross-site' },
  ])
    assert.equal(
      (await forwardPesto(request(profile(), headers), 'register', config(unavailable))).status,
      403,
    );
  assert.equal(
    (
      await forwardPesto(
        request(profile(), {}, site + '/api/pesto/registrations?code=private'),
        'register',
        config(unavailable),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await forwardPesto(
        request(profile(), { 'content-type': 'text/plain' }),
        'register',
        config(unavailable),
      )
    ).status,
    415,
  );
  assert.equal((await forwardPesto(request('{'), 'register', config(unavailable))).status, 400);
  for (const patch of [
    { consent: false },
    { licenseKind: 'perpetual' },
    { expiresAt: '2099-01-01' },
    { serviceUrl: 'https://evil.example' },
    { deviceHash: 'bad' },
  ])
    assert.equal(
      (await forwardPesto(request({ ...profile(), ...patch }), 'register', config(unavailable)))
        .status,
      400,
    );
  assert.equal(
    (await forwardPesto(new Request(site, { method: 'GET' }), 'register', config(unavailable)))
      .status,
    405,
  );
  assert.equal((await forwardPesto(request(), 'admin', config(unavailable))).status, 404);
});
test('Pesto proxy forwards canonical input to a fixed target with a signed edge IP and no caller credentials', async () => {
  const body = profile();
  let count = 0;
  const result = await forwardPesto(
    request(body, {
      origin: site,
      cookie: 'cms=private',
      authorization: 'Bearer private',
      'x-lead-client-ip': '198.51.100.1',
      'x-lead-ip-signature': 'forged',
      'x-forwarded-for': '198.51.100.2',
    }),
    'register',
    config(async (url, options) => {
      count++;
      assert.equal(url, 'http://127.0.0.1:4000/api/v1/pesto/registrations');
      assert.equal(options.redirect, 'manual');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.credentials, 'omit');
      assert.deepEqual(options.headers, {
        'Content-Type': 'application/json',
        Origin: site,
        'x-lead-client-ip': '203.0.113.10',
        'x-lead-ip-signature': createHmac('sha256', proxySecret)
          .update('203.0.113.10')
          .digest('hex'),
      });
      const sent = JSON.parse(options.body);
      assert.equal(sent.email, 'owner@example.test');
      assert.equal(sent.country, 'SA');
      assert.equal(sent.clientSecret, body.clientSecret);
      return Response.json(
        {
          requestId: body.requestId,
          status: 'pending',
          canStartTrial: false,
          internalCredential: 'private',
        },
        { status: 202, headers: { 'Set-Cookie': 'internal=private', 'X-Internal-Key': 'private' } },
      );
    }),
  );
  assert.equal(count, 1);
  assert.equal(result.status, 202);
  assert.deepEqual(await result.json(), {
    requestId: body.requestId,
    status: 'pending',
    canStartTrial: false,
  });
  assert.equal(result.headers.get('set-cookie'), null);
  assert.equal(result.headers.get('x-internal-key'), null);
  assert.equal(result.headers.get('referrer-policy'), 'no-referrer');
});
test('Pesto proxy accepts native Origin omission and validated IPv6, never an arbitrary forwarding chain', async () => {
  const body = profile();
  assert.equal(
    (
      await forwardPesto(
        request(body, { 'x-test-edge-ip': '2001:db8::1' }),
        'register',
        config(async (_, options) => {
          assert.equal(options.headers['x-lead-client-ip'], '2001:db8::1');
          return Response.json(
            { requestId: body.requestId, status: 'pending', canStartTrial: false },
            { status: 202 },
          );
        }),
      )
    ).status,
    202,
  );
  for (const value of ['', '203.0.113.1, 203.0.113.2', 'not-an-ip'])
    assert.equal(
      (
        await forwardPesto(
          request(body, { 'x-test-edge-ip': value }),
          'register',
          config(unavailable),
        )
      ).status,
      503,
    );
});
test('Verification and trial responses expose only protocol fields and bounded envelope shape', async () => {
  const input = profile(),
    expiresAt = '2026-11-10T12:00:00.000Z';
  const verify = await forwardPesto(
    request({ requestId: input.requestId, clientSecret: input.clientSecret, code: '12345678' }),
    'verify',
    config(async (url) => {
      assert.ok(url.endsWith('/registrations/verify'));
      return Response.json({
        registrationTicket: 'c'.repeat(64),
        expiresAt,
        canStartTrial: false,
        secret: 'private',
      });
    }),
  );
  assert.deepEqual(await verify.json(), {
    registrationTicket: 'c'.repeat(64),
    expiresAt,
    canStartTrial: false,
  });
  const permit = JSON.stringify({
    keyId: 'synthetic',
    payload: Buffer.from('{}').toString('base64'),
    signature: Buffer.alloc(64).toString('base64'),
  });
  const trialInput = {
    registrationTicket: 'c'.repeat(64),
    installationId: input.installationId,
    deviceHash: input.deviceHash,
  };
  const trial = await forwardPesto(
    request(trialInput),
    'trial',
    config(async (url) => {
      assert.ok(url.endsWith('/registrations/trial'));
      return Response.json({
        permit,
        expiresAt,
        status: 'trial-active',
        internalCustomer: 'private',
      });
    }),
  );
  assert.deepEqual(await trial.json(), { permit, expiresAt, status: 'trial-active' });
  assert.equal(
    (
      await forwardPesto(
        request(trialInput),
        'trial',
        config(async () =>
          Response.json({ permit: 'private-invalid-envelope', expiresAt, status: 'trial-active' }),
        ),
      )
    ).status,
    503,
  );
  assert.equal(
    (
      await forwardPesto(
        request(input),
        'register',
        config(async () =>
          Response.json(
            { requestId: randomUUID(), status: 'pending', canStartTrial: false },
            { status: 202 },
          ),
        ),
      )
    ).status,
    503,
  );
});
test('Internal errors, redirects and malformed/large upstream bodies are never exposed', async () => {
  for (const status of [400, 403, 409, 429, 500, 503, 302, 307]) {
    const result = await forwardPesto(
      request(),
      'register',
      config(async () =>
        Response.json(
          { message: 'private database/credential failure' },
          { status, headers: { Location: 'https://evil.example', 'Set-Cookie': 'private' } },
        ),
      ),
    );
    assert.equal(result.status, [400, 403, 409, 429].includes(status) ? status : 503);
    assert.equal((await result.text()).includes('private'), false);
    assert.equal(result.headers.get('location'), null);
  }
  for (const upstream of [
    new Response('private html', { status: 202 }),
    new Response('x'.repeat(20000), {
      status: 202,
      headers: { 'content-type': 'application/json' },
    }),
    Response.json(
      { requestId: randomUUID(), status: 'pending', canStartTrial: true },
      { status: 202 },
    ),
  ])
    assert.equal(
      (
        await forwardPesto(
          request(),
          'register',
          config(async () => upstream),
        )
      ).status,
      503,
    );
  const failure = await forwardPesto(
    request(),
    'register',
    config(async () => {
      throw new Error('private key failure');
    }),
  );
  assert.deepEqual(await failure.json(), { code: 'enrollment_unavailable' });
});
test('Stream limits and timeouts bound slow/oversized clients before contacting the API', async () => {
  assert.equal(
    (await forwardPesto(request('x'.repeat(13000)), 'register', config(unavailable))).status,
    413,
  );
  let cancelled = false;
  const stream = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const slow = new Request(site, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-test-edge-ip': '203.0.113.10' },
    body: stream,
    duplex: 'half',
  });
  const keepAlive = setTimeout(() => {}, 300);
  try {
    assert.equal(
      (await forwardPesto(slow, 'register', { ...config(unavailable), timeoutMs: 10 })).status,
      503,
    );
    assert.equal(cancelled, true);
  } finally {
    clearTimeout(keepAlive);
  }
});
test('Only three fixed POST route handlers expose the Pesto proxy', async () => {
  for (const [file, operation] of [
    ['', 'register'],
    ['/verify', 'verify'],
    ['/trial', 'trial'],
  ]) {
    const source = await readFile(
      new URL(`../apps/web/src/app/api/pesto/registrations${file}/route.ts`, import.meta.url),
      'utf8',
    );
    assert.match(source, /export async function POST/);
    assert.ok(source.includes(`'${operation}'`));
    assert.doesNotMatch(source, /export async function (GET|PUT|DELETE)/);
  }
});
