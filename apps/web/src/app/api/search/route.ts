import { env } from '@/lib/env';
import { pruneRetiredCatalog } from '@tevoniq/types';
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const key of ['q', 'locale', 'limit']) {
    const value = input.get(key);
    if (value !== null) query.set(key, value);
  }
  if ((query.get('q')?.length ?? 0) > 200)
    return Response.json({ error: 'Query too long' }, { status: 400 });
  try {
    const response = await fetch(`${env.API_URL}/search?${query}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok)
      return Response.json(
        { error: 'Search unavailable' },
        { status: response.status === 400 ? 400 : 503 },
      );
    return Response.json(pruneRetiredCatalog(await response.json()), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: 'Search unavailable' }, { status: 503 });
  }
}
