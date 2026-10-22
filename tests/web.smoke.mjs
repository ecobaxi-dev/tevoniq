import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { brandAssets, resolveFaviconAsset } from '../apps/web/src/config/assets.ts';

test('production web serves locale documents, original logo, health and redirects', async (t) => {
  const port = 15000 + Math.floor(Math.random() * 1000);
  const child = spawn(
    process.execPath,
    [resolve('node_modules/next/dist/bin/next'), 'start', '--port', String(port)],
    {
      cwd: resolve('apps/web'),
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
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
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 300; attempt++) {
    if (child.exitCode !== null) assert.fail(output);
    try {
      const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* Retry while Next starts. */
    }
    await setTimeout(100);
  }
  assert.ok(ready, output);
  const root = await fetch(base, { redirect: 'manual' });
  assert.equal(root.status, 307);
  assert.equal(root.headers.get('location'), '/en');
  const logoAsset = brandAssets.logo.horizontal;
  for (const [locale, direction] of [
    ['en', 'ltr'],
    ['tr', 'ltr'],
    ['ar', 'rtl'],
  ]) {
    const page = await fetch(`${base}/${locale}`);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
    const html = await page.text();
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${direction}"`));
    assert.match(html, /<meta name="robots" content="index, follow"/);
    assert.match(html, /<link rel="canonical"/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /<main/);
    const logoTag = html
      .match(/<img\b[^>]*>/g)
      ?.find((tag) => tag.includes(`src="${logoAsset.src}"`));
    assert.ok(
      logoTag?.includes(`src="${logoAsset.src}"`),
      'Logo must use the original URL, not an optimized derivative',
    );
    assert.ok(logoTag.includes(`width="${logoAsset.width}"`));
    assert.ok(logoTag.includes(`height="${logoAsset.height}"`));
    assert.ok(
      html.includes(`href="${resolveFaviconAsset().src}"`),
      'Favicon must use the registry',
    );
  }
  assert.equal((await fetch(`${base}/de`)).status, 404);
  const logo = await fetch(`${base}${logoAsset.src}`);
  assert.equal(logo.status, 200);
  assert.match(logo.headers.get('content-type'), /image\/png/);
  assert.deepEqual(
    Buffer.from(await logo.arrayBuffer()),
    await readFile(resolve('apps/web/public', logoAsset.src.slice(1))),
  );
});
