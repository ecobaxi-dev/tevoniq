import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { createServer } from 'node:http';
import sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
import { prepareImage, sanitizeSvg } from '../apps/api/dist/media/image-processing.js';
import { LocalStorageProvider, S3StorageProvider } from '../apps/api/dist/media/storage.js';
import { mediaUsage } from '../apps/api/dist/media/usage.js';
import { mediaEnvironmentSchema } from '../apps/api/dist/media/media-config.js';
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><title>Safe &amp; static</title><rect width="120" height="80" fill="#2563ff"/></svg>';
test('SVG is rebuilt with escaped text and bounded dimensions', () => {
  const result = sanitizeSvg(Buffer.from(svg), 100000);
  assert.equal(result.width, 120);
  assert.equal(result.height, 80);
  assert.match(result.bytes.toString(), /Safe &amp; static/);
  assert.doesNotThrow(() => sanitizeSvg(result.bytes, 100000));
});
test('SVG rejects active content, external fetches, entities and complexity attacks', () => {
  for (const attack of [
    '<script>alert(1)</script>',
    '<foreignObject><div>HTML</div></foreignObject>',
    '<image href="https://attacker.invalid/a"/>',
    '<use href="#x"/>',
    '<style>path{fill:red}</style>',
    '<rect onload="alert(1)"/>',
    '<rect style="fill:red"/>',
    '<animate attributeName="href" values="javascript:alert(1)"/>',
    '<path fill="url(https://attacker.invalid)"/>',
    '<path fill="url(&#106;avascript:alert(1))"/>',
    '<?xml-stylesheet href="https://attacker.invalid/x"?>',
    '<g xmlns="http://www.w3.org/1999/xhtml"/>',
  ])
    assert.throws(
      () => sanitizeSvg(Buffer.from('<svg viewBox="0 0 10 10">' + attack + '</svg>'), 100000),
      attack,
    );
  assert.throws(() =>
    sanitizeSvg(
      Buffer.from(
        '<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg viewBox="0 0 10 10"><title>&x;</title></svg>',
      ),
      100000,
    ),
  );
  assert.throws(() => sanitizeSvg(Buffer.from('<svg width="99999" height="99999"/>'), 100000));
  assert.throws(() =>
    sanitizeSvg(
      Buffer.from('<svg viewBox="0 0 10 10">' + '<g>'.repeat(45) + '</g>'.repeat(45) + '</svg>'),
      100000,
    ),
  );
});
test('Raster MIME validation fully decodes supported files and preserves originals', async () => {
  for (const [format, mime] of [
    ['jpeg', 'image/jpeg'],
    ['png', 'image/png'],
    ['webp', 'image/webp'],
    ['avif', 'image/avif'],
  ]) {
    const bytes = await sharp({
      create: { width: 500, height: 250, channels: 3, background: '#2563ff' },
    })
      .toFormat(format)
      .toBuffer();
    const result = await prepareImage(bytes, mime, 1000000);
    assert.deepEqual(result[0].bytes, bytes);
    assert.equal(result[0].width, 500);
    const thumb = result.find((file) => file.name === 'thumb.webp');
    assert.equal(thumb.width, 320);
    assert.equal(thumb.height, 160);
    assert.equal((await sharp(thumb.bytes).metadata()).format, 'webp');
    await assert.rejects(
      prepareImage(bytes, mime === 'image/jpeg' ? 'image/png' : 'image/jpeg', 1000000),
    );
  }
  await assert.rejects(prepareImage(Buffer.from(svg), 'image/png', 100000));
  await assert.rejects(prepareImage(Buffer.from('<html>fake</html>'), 'image/jpeg', 100000));
});
test('Protected originals generate no derivatives; pixel limits prevent image bombs', async () => {
  const bytes = await sharp({ create: { width: 100, height: 100, channels: 3, background: 'red' } })
    .png()
    .toBuffer();
  assert.equal((await prepareImage(bytes, 'image/png', 100000, true)).length, 1);
  assert.deepEqual(
    (await prepareImage(Buffer.from(svg), 'image/svg+xml', 100000, true))[0].bytes,
    Buffer.from(svg),
  );
  await assert.rejects(prepareImage(bytes, 'image/png', 9999));
  await assert.rejects(prepareImage(bytes.subarray(0, 50), 'image/png', 100000));
});

test('Protected SVG rejects encoding declarations that disagree with validation', async () => {
  for (const encoding of ['UTF-16', 'ISO-8859-1']) {
    await assert.rejects(
      prepareImage(
        Buffer.from(`<?xml version="1.0" encoding="${encoding}"?>${svg}`),
        'image/svg+xml',
        100000,
        true,
      ),
      /UTF-8/,
    );
  }
});

test('Derivatives encode once from oriented source pixels without upscaling', async () => {
  const bytes = await sharp({
    create: { width: 80, height: 40, channels: 4, background: '#2563ff80' },
  })
    .png()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  const result = await prepareImage(bytes, 'image/png', 100000);
  assert.deepEqual(result[0].bytes, bytes);
  assert.equal(result.length, 2);
  assert.equal(result[1].width, 40);
  assert.equal(result[1].height, 80);
  const expected = await sharp(bytes)
    .rotate()
    .resize({ width: 320, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  assert.deepEqual(result[1].bytes, expected);
});
test('Local provider prevents traversal and overwrite', async () => {
  const root = resolve('.data/media-tests');
  await mkdir(root, { recursive: true });
  const dir = await mkdtemp(root + sep);
  try {
    const provider = new LocalStorageProvider(dir),
      key = randomUUID() + '/original.png';
    await provider.put(key, Buffer.from('immutable'));
    assert.equal((await provider.get(key)).toString(), 'immutable');
    await assert.rejects(provider.put(key, Buffer.from('replacement')));
    assert.throws(() => provider.get('../brand/logo.png'));
    await provider.remove(key);
    await assert.rejects(provider.get(key));
  } finally {
    assert.ok(dir.startsWith(root + sep));
    await rm(dir, { recursive: true, force: true });
  }
});
test('S3 provider supports private compatible endpoints and immutable writes', async () => {
  const requests = [];
  const server = createServer((req, res) => {
    requests.push({ method: req.method, url: req.url, headers: req.headers });
    req.resume();
    req.on('end', () => {
      res.statusCode = 200;
      res.end(req.method === 'GET' ? 'image-bytes' : '');
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const oldKey = process.env.AWS_ACCESS_KEY_ID,
    oldSecret = process.env.AWS_SECRET_ACCESS_KEY;
  process.env.AWS_ACCESS_KEY_ID = 'test-access';
  process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
  try {
    const provider = new S3StorageProvider(
      new ConfigService({
        MEDIA_S3_BUCKET: 'media-test',
        MEDIA_S3_REGION: 'us-east-1',
        MEDIA_S3_ENDPOINT: `http://127.0.0.1:${server.address().port}`,
        MEDIA_S3_FORCE_PATH_STYLE: 'true',
      }),
    );
    const key = randomUUID() + '/original.png';
    await provider.put(key, Buffer.from('image-bytes'), 'image/png');
    assert.equal((await provider.get(key)).toString(), 'image-bytes');
    await provider.remove(key);
    assert.deepEqual(
      requests.map((r) => r.method),
      ['PUT', 'GET', 'DELETE'],
    );
    assert.equal(requests[0].headers['if-none-match'], '*');
    assert.equal(requests[0].headers['content-type'], 'image/png');
    assert.match(requests[0].headers.authorization, /AWS4-HMAC-SHA256/);
  } finally {
    if (oldKey === undefined) delete process.env.AWS_ACCESS_KEY_ID;
    else process.env.AWS_ACCESS_KEY_ID = oldKey;
    if (oldSecret === undefined) delete process.env.AWS_SECRET_ACCESS_KEY;
    else process.env.AWS_SECRET_ACCESS_KEY = oldSecret;
    await new Promise((resolve) => server.close(resolve));
  }
});
test('Usage checks include derivative links in drafts and archived generic content', async () => {
  const id = randomUUID(),
    empty = { findMany: async () => [] };
  const db = {
    insightArticle: empty,
    companyPage: empty,
    serviceTranslation: empty,
    solutionTranslation: empty,
    industryTranslation: empty,
    projectTranslation: empty,
    cmsPage: {
      findMany: async () => [
        { id: 'page', path: '/example', draft: { src: `/media/${id}/medium.webp` } },
      ],
    },
    adminRecord: {
      findMany: async () => [
        {
          id: 'record',
          title: 'Archived testimonial',
          data: { image: `https://example.com/media/${id}/original.png` },
        },
      ],
    },
  };
  const result = await mediaUsage(db, id);
  assert.equal(result.length, 2);
  assert.equal(result[0].kind, 'Pages');
});
test('Media configuration bounds file and pixel limits and requires an S3 bucket', () => {
  assert.equal(mediaEnvironmentSchema.parse({}).MEDIA_STORAGE, 'local');
  assert.equal(
    mediaEnvironmentSchema.safeParse({ MEDIA_MAX_FILE_BYTES: 999999999 }).success,
    false,
  );
  assert.equal(mediaEnvironmentSchema.safeParse({ MEDIA_STORAGE: 's3' }).success, false);
});
