import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { env } from '@/lib/env';
const MAX_BODY = 7 * 1024 * 1024;
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(env.SITE_URL).origin)
    return Response.json({ message: 'Invalid origin' }, { status: 403 });
  const type = request.headers.get('content-type') || '';
  if (!type.startsWith('multipart/form-data;'))
    return Response.json({ message: 'Expected form data' }, { status: 400 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ message: 'Missing form data' }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BODY) {
        await reader.cancel();
        return Response.json({ message: 'Attachments exceed the upload limit' }, { status: 413 });
      }
      chunks.push(value);
    }
    const headers: Record<string, string> = {
      'Content-Type': type,
      Origin: new URL(env.SITE_URL).origin,
    };
    // Only enable this for a header overwritten by your trusted ingress; arbitrary forwarded headers are ignored.
    const trustedHeader = process.env.LEAD_CLIENT_IP_HEADER,
      secret = process.env.LEAD_PROXY_SECRET;
    const ip = trustedHeader ? request.headers.get(trustedHeader)?.trim() : undefined;
    if (ip && secret && isIP(ip)) {
      headers['x-lead-client-ip'] = ip;
      headers['x-lead-ip-signature'] = createHmac('sha256', secret).update(ip).digest('hex');
    }
    const response = await fetch(`${env.API_URL}/leads/submit`, {
      method: 'POST',
      headers,
      body: Buffer.concat(chunks),
      signal: AbortSignal.timeout(20000),
      cache: 'no-store',
    });
    return Response.json(await response.json(), {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json(
      { message: 'Unable to submit right now. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
