import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { env } from '@/lib/env';
export async function forwardNewsletter(request: Request, path = 'pages/newsletter') {
  if (request.headers.get('origin') !== new URL(env.SITE_URL).origin)
    return Response.json({ message: 'Invalid origin' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return Response.json({ message: 'Expected JSON' }, { status: 400 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ message: 'Missing body' }, { status: 400 });
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8192) {
        await reader.cancel();
        return Response.json({ message: 'Request too large' }, { status: 413 });
      }
      chunks.push(value);
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Origin: new URL(env.SITE_URL).origin,
    };
    const trusted = process.env.LEAD_CLIENT_IP_HEADER,
      secret = process.env.LEAD_PROXY_SECRET,
      ip = trusted ? request.headers.get(trusted) : null;
    if (secret && ip && isIP(ip)) {
      headers['x-lead-client-ip'] = ip;
      headers['x-lead-ip-signature'] = createHmac('sha256', secret).update(ip).digest('hex');
    }
    const response = await fetch(`${env.API_URL}/${path}`, {
      method: 'POST',
      headers,
      body: Buffer.concat(chunks),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    return Response.json(await response.json(), {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ message: 'Subscription service unavailable' }, { status: 503 });
  }
}

