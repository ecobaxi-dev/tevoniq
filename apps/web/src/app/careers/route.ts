export function GET(request: Request) {
  return new Response(null, { status: 307, headers: { Location: `/en/careers${new URL(request.url).search}` } });
}
