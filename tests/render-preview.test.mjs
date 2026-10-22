import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderEnvironment } from '../scripts/render/environment.mjs';
import { DisabledStorageProvider, storageFactory } from '../apps/api/dist/media/storage.js';
import { validateEnvironment } from '../apps/api/dist/config/environment.js';
import { ConfigService } from '@nestjs/config';

test('Render uses its generated HTTPS origin and a private loopback API', () => {
  const env = renderEnvironment({
    RENDER: 'true',
    RENDER_EXTERNAL_URL: 'https://example.onrender.com',
    PORT: '10000',
  });
  assert.equal(env.SITE_URL, 'https://example.onrender.com');
  assert.equal(env.CORS_ORIGIN, env.SITE_URL);
  assert.equal(env.API_URL, 'http://127.0.0.1:4000/api/v1');
  assert.equal(env.API_BIND_HOST, '127.0.0.1');
  assert.equal(
    renderEnvironment({ ...env, SITE_URL: 'https://tevoniq.com' }).SITE_URL,
    'https://tevoniq.com',
  );
  for (const SITE_URL of [
    'https://example.com/path',
    'https://user:pass@example.com',
    'http://example.com',
    'https://example.com/?secret=1',
  ]) {
    assert.throws(() => renderEnvironment({ RENDER: 'true', SITE_URL }));
  }
  assert.throws(() => renderEnvironment({ PORT: '4000' }));
});
test('a production preview can disable storage without allowing ephemeral local uploads', async () => {
  const env = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://localhost/test',
    CORS_ORIGIN: 'https://example.onrender.com',
    MEDIA_STORAGE: 'disabled',
  };
  assert.equal(validateEnvironment(env).MEDIA_STORAGE, 'disabled');
  assert.throws(() => validateEnvironment({ ...env, MEDIA_STORAGE: 'local' }));
  const storage = storageFactory(new ConfigService({ MEDIA_STORAGE: 'disabled' }));
  assert.ok(storage instanceof DisabledStorageProvider);
  await assert.rejects(storage.put(), { status: 503 });
  await assert.rejects(storage.get(), { status: 503 });
  await assert.rejects(storage.remove(), { status: 503 });
});
