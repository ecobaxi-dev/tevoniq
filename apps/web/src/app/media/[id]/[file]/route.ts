import { env } from '@/lib/env';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; file: string }> },
) {
  const { id, file } = await params;
  if (
    !/^[a-f0-9-]{36}$/.test(id) ||
    !/^(original\.(jpg|png|webp|avif|svg)|(?:thumb|medium|large)\.webp)$/.test(file)
  )
    return new Response(null, { status: 404 });
  try {
    const response = await fetch(`${env.API_URL}/media/${id}/${file}`, {
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
    if (!response.ok) return new Response(null, { status: response.status === 404 ? 404 : 503 });
    const mime = response.headers.get('content-type')?.split(';')[0] || '';
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'].includes(mime))
      return new Response(null, { status: 502 });
    return new Response(response.body, {
      headers: {
        'Content-Type': mime,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'none'; sandbox",
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
