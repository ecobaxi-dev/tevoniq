export class RequestBodyError extends Error {
  readonly code: 'missing' | 'large' | 'timeout';
  constructor(code: 'missing' | 'large' | 'timeout') {
    super('Invalid request body');
    this.code = code;
  }
}
/** Bound memory and waiting time before forwarding untrusted bodies to the API. */
export async function boundedRequestBody(
  stream: ReadableStream<Uint8Array> | null,
  maximum: number,
  signal: AbortSignal = AbortSignal.timeout(15000),
): Promise<Buffer<ArrayBuffer>> {
  if (!stream) throw new RequestBodyError('missing');
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const cancel = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    while (true) {
      if (signal.aborted) throw new RequestBodyError('timeout');
      const { done, value } = await reader.read();
      if (signal.aborted) throw new RequestBodyError('timeout');
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        cancel();
        throw new RequestBodyError('large');
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally {
    signal.removeEventListener('abort', cancel);
    if (signal.aborted) cancel();
    reader.releaseLock();
  }
}
