export async function GET(request: Request) {
  return new Response(null, {
    status: 307,
    headers: { Location: `/en/insights${new URL(request.url).search}` },
  });
}
