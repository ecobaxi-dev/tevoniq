import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { MAX_CV_BYTES } from '@tevoniq/validation';
import { env } from '@/lib/env';
export async function POST(request: Request) {
  const noStore = { 'Cache-Control': 'no-store' };
  if (request.headers.get('origin') !== new URL(env.SITE_URL).origin) return Response.json({ message: 'Invalid origin' }, { status: 403, headers: noStore });
  const type = request.headers.get('content-type') || '';
  if (!type.startsWith('multipart/form-data;')) return Response.json({ message: 'Expected form data' }, { status: 400, headers: noStore });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ message: 'Missing form data' }, { status: 400, headers: noStore });
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.length;
      if (size > MAX_CV_BYTES + 100 * 1024) { await reader.cancel(); return Response.json({ message: 'CV exceeds the upload limit' }, { status: 413, headers: noStore }); }
      chunks.push(value);
    }
    const headers: Record<string, string> = { 'Content-Type': type, Origin: new URL(env.SITE_URL).origin };
    const trustedHeader = process.env.LEAD_CLIENT_IP_HEADER, secret = process.env.LEAD_PROXY_SECRET;
    const ip = trustedHeader ? request.headers.get(trustedHeader)?.trim() : undefined;
    if (ip && secret && isIP(ip)) { headers['x-lead-client-ip'] = ip; headers['x-lead-ip-signature'] = createHmac('sha256', secret).update(ip).digest('hex'); }
    const response = await fetch(`${env.API_URL}/careers/apply`, { method: 'POST', headers, body: Buffer.concat(chunks), cache: 'no-store', signal: AbortSignal.timeout(30000) });
    return Response.json(await response.json(), { status: response.status, headers: noStore });
  } catch { return Response.json({ message: 'Unable to submit right now. Please try again.' }, { status: 503, headers: noStore }); }
}
