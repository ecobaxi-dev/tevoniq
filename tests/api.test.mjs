import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { HealthController } from '../apps/api/dist/health/health.controller.js';
test('readiness probes PostgreSQL and hides connection details on failure', async () => {
  let queries = 0;
  const healthy = new HealthController({
    $queryRaw: async () => {
      queries++;
    },
  });
  assert.deepEqual(await healthy.ready(), { status: 'ok', service: 'api' });
  assert.equal(queries, 1);
  const unavailable = new HealthController({
    $queryRaw: async () => {
      throw new Error('secret-connection-string');
    },
  });
  await assert.rejects(
    () => unavailable.ready(),
    (error) => error.getStatus() === 503 && error.message === 'Database unavailable',
  );
});
test('API boots with validated configuration and serves protected HTTP health endpoints', async (t) => {
  const port = 14000 + Math.floor(Math.random() * 1000);
  const child = spawn(process.execPath, ['apps/api/dist/main.js'], {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      DATABASE_URL: 'postgresql://localhost:1/absent',
      CORS_ORIGIN: 'http://localhost:3000',
      LOG_LEVEL: 'info',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (data) => {
    output += data;
  });
  child.stderr.on('data', (data) => {
    output += data;
  });
  t.after(() => {
    child.kill();
  });
  let response;
  for (let attempt = 0; attempt < 300; attempt++) {
    if (child.exitCode !== null) assert.fail('API exited: ' + output);
    try {
      response = await fetch(`http://127.0.0.1:${port}/api/v1/health/live`, {
        signal: AbortSignal.timeout(1000),
      });
      break;
    } catch {
      await setTimeout(100);
    }
  }
  assert.ok(response, 'API did not start: ' + output);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(await response.json(), { status: 'ok', service: 'api' });
  const ready = await fetch(`http://localhost:${port}/api/v1/health/ready`);
  assert.equal(ready.status, 503);
  assert.equal((await ready.json()).message, 'Service temporarily unavailable');
  const allowed = await fetch(`http://localhost:${port}/api/v1/health/live`, {
    headers: { Origin: 'http://localhost:3000' },
  });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  for (let i = 0; i < 118; i++) await fetch(`http://localhost:${port}/api/v1/health/live`);
  const limited = await fetch(`http://localhost:${port}/api/v1/health/live`);
  assert.equal(limited.status, 429);
});
