import { insightSlugSchema } from '@tevoniq/validation';
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (
    !(path.length === 1 && ['blog', 'resources', 'case-studies'].includes(path[0]!)) &&
    !(path.length === 2 && path[0] === 'blog' && insightSlugSchema.safeParse(path[1]).success)
  )
    return new Response(null, { status: 404 });
  return new Response(null, {
    status: 307,
    headers: { Location: `/en/insights/${path.join('/')}${new URL(request.url).search}` },
  });
}
