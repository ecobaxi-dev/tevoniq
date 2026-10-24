import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { z } from 'zod';
import {
  registrationInputSchema,
  verificationInputSchema,
  trialInputSchema,
} from '@tevoniq/validation';

export type PestoOperation = 'register' | 'verify' | 'trial';
export type PestoProxyConfig = {
  enabled: boolean;
  siteUrl: string;
  apiUrl: string;
  ipHeader?: string | undefined;
  proxySecret?: string | undefined;
  timeoutMs?: number;
  fetch?: typeof fetch;
};
const suffixes = { register: '', verify: '/verify', trial: '/trial' } as const;
const requests = {
  register: registrationInputSchema,
  verify: verificationInputSchema,
  trial: trialInputSchema,
};
const envelope = z.strictObject({
  keyId: z.string().min(1).max(80),
  payload: z
    .string()
    .min(1)
    .max(8000)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/),
  signature: z.string().regex(/^[A-Za-z0-9+/]{86}==$/),
});
const replies = {
  register: z.object({
    requestId: z.uuid(),
    status: z.literal('pending'),
    canStartTrial: z.literal(false),
  }),
  verify: z.object({
    registrationTicket: z.string().regex(/^[a-f0-9]{64}$/),
    expiresAt: z.iso.datetime(),
    canStartTrial: z.literal(false),
  }),
  trial: z.object({
    permit: z
      .string()
      .max(12000)
      .refine((value) => {
        try {
          return envelope.safeParse(JSON.parse(value)).success;
        } catch {
          return false;
        }
      }),
    expiresAt: z.iso.datetime(),
    status: z.enum(['trial-active', 'expired']),
  }),
};
const securityHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};
function failure(status: number, code: string) {
  return Response.json({ code }, { status, headers: securityHeaders });
}

async function boundedBody(
  stream: ReadableStream<Uint8Array> | null,
  max: number,
  signal: AbortSignal,
) {
  if (!stream) throw new Error('Missing body');
  const reader = stream.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  let abort: () => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    abort = () => {
      void reader.cancel().catch(() => {});
      reject(new Error('Request timeout'));
    };
    signal.addEventListener('abort', abort, { once: true });
  });
  try {
    if (signal.aborted) throw new Error('Request timeout');
    while (true) {
      const { done, value } = await Promise.race([reader.read(), aborted]);
      if (signal.aborted) throw new Error('Request timeout');
      if (done) break;
      size += value.length;
      if (size > max) {
        void reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally {
    signal.removeEventListener('abort', abort);
    reader.releaseLock();
  }
}

/** No logging, persistence or customer-controlled target/header forwarding. */
export async function forwardPesto(
  request: Request,
  operation: PestoOperation,
  config: PestoProxyConfig,
) {
  if (!config.enabled) return failure(503, 'enrollment_unavailable');
  if (request.method !== 'POST') return failure(405, 'method_not_allowed');
  if (!Object.hasOwn(suffixes, operation)) return failure(404, 'not_found');
  let site: URL, api: URL;
  try {
    site = new URL(config.siteUrl);
    api = new URL(config.apiUrl);
    if (
      site.href.replace(/\/$/, '') !== site.origin ||
      site.username ||
      site.password ||
      !['http:', 'https:'].includes(site.protocol) ||
      !['http:', 'https:'].includes(api.protocol) ||
      api.username ||
      api.password ||
      api.search ||
      api.hash ||
      api.pathname.replace(/\/$/, '') !== '/api/v1'
    )
      return failure(503, 'enrollment_unavailable');
  } catch {
    return failure(503, 'enrollment_unavailable');
  }
  // An absent Origin is permitted for the main Windows server; a browser's wrong/null Origin is rejected.
  if (
    (request.headers.has('origin') && request.headers.get('origin') !== site.origin) ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    return failure(403, 'invalid_origin');
  if (new URL(request.url).search) return failure(400, 'invalid_request');
  if (
    request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json'
  )
    return failure(415, 'expected_json');
  const ipHeader = config.ipHeader?.toLowerCase(),
    secret = config.proxySecret;
  if (!ipHeader || !/^[a-z0-9-]+$/.test(ipHeader) || !secret || secret.length < 32)
    return failure(503, 'enrollment_unavailable');
  // Only configure a header that the trusted edge OVERWRITES; never infer it from arbitrary forwarding chains.
  const ip = request.headers.get(ipHeader);
  if (!ip || !isIP(ip)) return failure(503, 'enrollment_unavailable');
  const timeout = AbortSignal.timeout(config.timeoutMs ?? 20000);
  const signal = AbortSignal.any([request.signal, timeout]);
  try {
    const content = await boundedBody(request.body, 12288, signal);
    if (content === null) return failure(413, 'request_too_large');
    let body: unknown;
    try {
      body = JSON.parse(content.toString('utf8'));
    } catch {
      return failure(400, 'invalid_request');
    }
    const input = requests[operation].safeParse(body);
    if (!input.success) return failure(400, 'invalid_request');
    const response = await (config.fetch ?? fetch)(
      `${api.href.replace(/\/$/, '')}/pesto/registrations${suffixes[operation]}`,
      {
        method: 'POST',
        redirect: 'manual',
        cache: 'no-store',
        credentials: 'omit',
        signal,
        headers: {
          'Content-Type': 'application/json',
          Origin: site.origin,
          'x-lead-client-ip': ip,
          'x-lead-ip-signature': createHmac('sha256', secret).update(ip).digest('hex'),
        },
        body: JSON.stringify(input.data),
      },
    );
    const expectedStatus = operation === 'register' ? 202 : 200;
    if (response.status !== expectedStatus) {
      void response.body?.cancel().catch(() => {});
      const errors: Record<number, string> = {
        400: 'verification_expired_or_invalid',
        403: 'verification_required',
        409: 'enrollment_conflict',
        429: 'rate_limited',
      };
      return errors[response.status]
        ? failure(response.status, errors[response.status]!)
        : failure(503, 'enrollment_unavailable');
    }
    if (
      response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !==
      'application/json'
    ) {
      void response.body?.cancel().catch(() => {});
      return failure(503, 'enrollment_unavailable');
    }
    const output = await boundedBody(response.body, 16384, signal);
    if (!output) return failure(503, 'enrollment_unavailable');
    const parsed = replies[operation].safeParse(JSON.parse(output.toString('utf8')));
    if (!parsed.success) return failure(503, 'enrollment_unavailable');
    if (
      operation === 'register' &&
      'requestId' in parsed.data &&
      'requestId' in input.data &&
      parsed.data.requestId !== input.data.requestId
    )
      return failure(503, 'enrollment_unavailable');
    return Response.json(parsed.data, { status: expectedStatus, headers: securityHeaders });
  } catch {
    return failure(503, 'enrollment_unavailable');
  }
}
