// Exercises the actual built Next handlers, with only a synthetic loopback upstream.
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer, request as httpRequest } from 'node:http';
import { createHmac, randomUUID, randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const secret = randomBytes(32).toString('hex'),
  calls = [];
const upstream = createServer(async (req, res) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  const body = JSON.parse(raw);
  calls.push(req.url);
  assert.equal(req.headers.authorization, undefined);
  assert.equal(req.headers.cookie, undefined);
  assert.equal(req.headers['x-lead-client-ip'], '203.0.113.50');
  assert.equal(
    req.headers['x-lead-ip-signature'],
    createHmac('sha256', secret).update('203.0.113.50').digest('hex'),
  );
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Set-Cookie', 'internal=synthetic');
  if (req.url.endsWith('/verify'))
    res.end(
      JSON.stringify({
        registrationTicket: 'a'.repeat(64),
        expiresAt: '2026-12-01T00:00:00.000Z',
        canStartTrial: false,
      }),
    );
  else if (req.url.endsWith('/trial'))
    res.end(
      JSON.stringify({
        permit: JSON.stringify({
          keyId: 'synthetic',
          payload: Buffer.from('{}').toString('base64'),
          signature: Buffer.alloc(64).toString('base64'),
        }),
        expiresAt: '2026-12-01T00:00:00.000Z',
        status: 'trial-active',
      }),
    );
  else {
    res.statusCode = 202;
    res.end(JSON.stringify({ requestId: body.requestId, status: 'pending', canStartTrial: false }));
  }
});
await new Promise((done) => upstream.listen(0, '127.0.0.1', done));
let child;
try {
  for (const enabled of [false, true]) {
    const port = 21000 + Math.floor(Math.random() * 10000),
      origin = `http://127.0.0.1:${port}`;
    child = spawn(process.execPath, [resolve('apps/web/.next/standalone/apps/web/server.js')], {
      cwd: resolve('apps/web/.next/standalone'),
      stdio: 'ignore',
      env: {
        PATH: process.env.PATH,
        SystemRoot: process.env.SystemRoot,
        NODE_ENV: 'production',
        PORT: String(port),
        HOSTNAME: '127.0.0.1',
        SITE_URL: origin,
        API_URL: `http://127.0.0.1:${upstream.address().port}/api/v1`,
        PESTO_PUBLIC_ENROLLMENT_ENABLED: String(enabled),
        PESTO_TRANSPORT_DIAGNOSTICS_ENABLED: String(!enabled),
        PESTO_CLIENT_IP_HEADER: 'x-test-ingress-ip',
        LEAD_PROXY_SECRET: secret,
        NEXT_TELEMETRY_DISABLED: '1',
      },
    });
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      assert.equal(child.exitCode, null, 'Standalone server exited unexpectedly');
      try {
        if ((await fetch(origin + '/health', { signal: AbortSignal.timeout(500) })).ok) {
          ready = true;
          break;
        }
      } catch {
        /* local startup */
      }
      await delay(100);
    }
    assert.ok(ready, 'Standalone server did not become ready');
    const checkUrl = origin + '/api/pesto/transport-check';
    assert.equal((await fetch(checkUrl)).status, 405);
    assert.equal((await fetch(checkUrl, { method: 'POST' })).status, enabled ? 404 : 403);
    const timestamp = String(Math.floor(Date.now() / 1000)),
      nonce = randomBytes(32).toString('hex');
    const check = await fetch(checkUrl, {
      method: 'POST',
      headers: {
        'x-pesto-check-time': timestamp,
        'x-pesto-check-nonce': nonce,
        'x-pesto-check-signature': createHmac('sha256', secret)
          .update(`pesto-transport-v1\nPOST\n/api/pesto/transport-check\n${timestamp}\n${nonce}`)
          .digest('hex'),
        'cf-connecting-ip': '203.0.113.17',
      },
    });
    assert.equal(check.status, enabled ? 404 : 200);
    if (!enabled) {
      const envelope = await check.json();
      assert.equal(
        envelope.signature,
        createHmac('sha256', secret)
          .update(`pesto-transport-response-v1\n${envelope.payload}`)
          .digest('hex'),
      );
      const data = JSON.parse(Buffer.from(envelope.payload, 'base64'));
      assert.equal(data.nonce, nonce);
      assert.equal(data.observations[0].singleIp, true);
      const chunkedStatus = await new Promise((resolve, reject) => {
        const req = httpRequest(
          checkUrl,
          {
            method: 'POST',
            headers: {
              'transfer-encoding': 'chunked',
              'x-pesto-check-time': timestamp,
              'x-pesto-check-nonce': nonce,
              'x-pesto-check-signature': createHmac('sha256', secret)
                .update(
                  `pesto-transport-v1\nPOST\n/api/pesto/transport-check\n${timestamp}\n${nonce}`,
                )
                .digest('hex'),
            },
          },
          (res) => {
            res.resume();
            res.once('end', () => resolve(res.statusCode));
          },
        );
        req.setTimeout(10000, () => req.destroy(new Error('Local chunked probe timeout')));
        req.once('error', reject);
        req.end();
      });
      assert.equal(chunkedStatus, 200, 'Proxy-reframed empty request must still authenticate');
      // Real PowerShell client + real Next server, synthetic secret and loopback only.
      // The local server has no trusted ingress: spoofable headers must NOT pass.
      if (process.platform === 'win32') {
        const helper = resolve('../../setup/Test-PestoIngress.ps1');
        const folder = await mkdtemp(resolve(tmpdir(), 'pesto-ingress-smoke-'));
        const file = resolve(folder, 'probe.ps1');
        const wrapper = resolve(folder, 'run.ps1');
        try {
          const source = (await readFile(helper, 'utf8'))
            .replaceAll('https://www.tevoniq.com', origin)
            .replaceAll('https://tevoniq-preview.onrender.com', origin);
          await writeFile(file, source);
          await writeFile(
            wrapper,
            "& (Join-Path $PSScriptRoot 'probe.ps1') -ProxySecret $args[0] | ConvertTo-Json -Depth 8",
          );
          const { stdout } = await promisify(execFile)(
            'pwsh',
            ['-NoProfile', '-NonInteractive', '-File', wrapper, secret],
            { timeout: 60000 },
          );
          assert.ok(stdout.includes('Read-only probes completed.'));
          assert.ok(!stdout.includes(secret) && !stdout.includes('198.51.100.71'));
          const rows = JSON.parse(stdout).filter((row) => typeof row === 'object');
          assert.equal(rows.length, 8);
          for (const row of rows.filter((row) =>
            ['cf-connecting-ip', 'true-client-ip'].includes(row.Header),
          )) {
            assert.equal(
              row.UnchangedBySpoofProbes,
              false,
              'Spoofable loopback header was accepted',
            );
          }
        } finally {
          await unlink(file).catch(() => {});
          await unlink(wrapper).catch(() => {});
          await rmdir(folder);
        }
      }
    }
    const input = {
      requestId: randomUUID(),
      installationId: randomUUID(),
      deviceHash: 'A'.repeat(64),
      clientSecret: 'b'.repeat(64),
      email: 'synthetic@example.test',
      managerName: 'Owner',
      businessName: 'Restaurant',
      country: 'SA',
      phone: '+905550000000',
      language: 'en',
      consent: true,
    };
    const bodies = {
      '': input,
      '/verify': { requestId: input.requestId, clientSecret: input.clientSecret, code: '12345678' },
      '/trial': {
        registrationTicket: 'a'.repeat(64),
        installationId: input.installationId,
        deviceHash: input.deviceHash,
      },
    };
    for (const [suffix, body] of Object.entries(bodies)) {
      const url = origin + '/api/pesto/registrations' + suffix;
      assert.equal((await fetch(url)).status, 405);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-ingress-ip': '203.0.113.50',
          cookie: 'caller=synthetic',
          authorization: 'Bearer synthetic',
        },
        body: JSON.stringify(body),
      });
      assert.equal(response.status, enabled ? (suffix ? 200 : 202) : 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('set-cookie'), null);
      const data = await response.json();
      if (!enabled) assert.deepEqual(data, { code: 'enrollment_unavailable' });
      else assert.ok(data.requestId || data.registrationTicket || data.permit);
    }
    if (!enabled) assert.equal(calls.length, 0, 'Disabled production route contacted upstream');
    const exited = new Promise((done) => child.once('exit', done));
    child.kill();
    await exited;
    child = null;
  }
  assert.deepEqual(calls, [
    '/api/v1/pesto/registrations',
    '/api/v1/pesto/registrations/verify',
    '/api/v1/pesto/registrations/trial',
  ]);
  console.log(
    'PASS: built Next enrollment and transport handlers honor independent runtime gates, signed metadata and no-store. Real PowerShell probe detects spoofable loopback headers. Synthetic loopback only.',
  );
} finally {
  if (child && child.exitCode === null) {
    const exited = new Promise((done) => child.once('exit', done));
    child.kill();
    await exited;
  }
  await new Promise((done) => upstream.close(done));
}
