import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundedRequestBody } from '../apps/web/src/lib/bounded-request-body.ts';
test('Bounded bodies preserve multipart bytes and reject oversized chunked input', async () => {
  const bytes = new Uint8Array([0, 255, 13, 10, 1]);
  assert.deepEqual(
    await boundedRequestBody(
      new ReadableStream({
        start(c) {
          c.enqueue(bytes);
          c.close();
        },
      }),
      5,
    ),
    Buffer.from(bytes),
  );
  let cancelled = false;
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(bytes);
    },
    cancel() {
      cancelled = true;
    },
  });
  await assert.rejects(boundedRequestBody(stream, 4), { code: 'large' });
  assert.equal(cancelled, true);
});
test('Stalled bodies are cancelled on timeout, including already-aborted requests', async () => {
  const controller = new AbortController();
  let cancelled = false;
  const stream = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const result = boundedRequestBody(stream, 100, controller.signal);
  controller.abort();
  await assert.rejects(result, { code: 'timeout' });
  assert.equal(cancelled, true);
  await assert.rejects(boundedRequestBody(new ReadableStream(), 100, controller.signal), {
    code: 'timeout',
  });
  await assert.rejects(boundedRequestBody(null, 100), { code: 'missing' });
});
