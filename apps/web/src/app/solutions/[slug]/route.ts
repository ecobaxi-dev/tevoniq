import { serviceSlugSchema } from '@tevoniq/validation';
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = serviceSlugSchema.safeParse((await params).slug);
  if (!slug.success) return new Response(null, { status: 404 });
  return new Response(null, {
    status: 307,
    headers: { Location: `/en/solutions/${slug.data}${new URL(request.url).search}` },
  });
}
