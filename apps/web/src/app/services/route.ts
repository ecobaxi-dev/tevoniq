export function GET(request: Request) {
  const target = new URL(request.url);
  return new Response(null, { status: 307, headers: { Location: `/en/services${target.search}` } });
}
