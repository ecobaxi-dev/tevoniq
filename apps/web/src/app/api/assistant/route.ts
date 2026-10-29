import { env } from '@/lib/env';
import { assistantKnowledge } from '@/lib/site-assistant-knowledge';
import {
  assistantConfig,
  assistantContactIntent,
  assistantRequestSchema,
  AssistantFailure,
  createAssistantBudget,
  readAssistantBody,
  requestAssistant,
  selectAssistantSources,
} from '@/lib/site-assistant-core';
export const runtime = 'nodejs';
const budget = createAssistantBudget();
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
function failure(status: number, code: string, retry?: number) {
  return Response.json(
    { code },
    { status, headers: { ...headers, ...(retry ? { 'Retry-After': String(retry) } : {}) } },
  );
}
export async function POST(request: Request) {
  const config = assistantConfig({ ...process.env, SITE_URL: env.SITE_URL });
  if (!config) return failure(503, 'unavailable');
  if (
    request.headers.get('origin') !== config.siteUrl ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    return failure(403, 'origin');
  if (
    new URL(request.url).search ||
    !request.headers.get('content-type')?.startsWith('application/json')
  )
    return failure(400, 'invalid');
  let raw: unknown;
  try {
    raw = JSON.parse(await readAssistantBody(request.body, 20000, AbortSignal.timeout(5000)));
  } catch {
    return failure(400, 'invalid');
  }
  const parsed = assistantRequestSchema.safeParse(raw);
  if (!parsed.success) return failure(400, 'invalid');
  const reservation = budget.reserve();
  if (!reservation.ok) return failure(429, 'busy', reservation.retry);
  try {
    const knowledge = await assistantKnowledge(parsed.data.locale);
    const previousQuestion =
      parsed.data.history.filter((message) => message.role === 'user').at(-1)?.content ?? '';
    let selected = selectAssistantSources(`${previousQuestion} ${parsed.data.message}`, knowledge);
    const contact = knowledge.find((source) => source.href === `/${parsed.data.locale}/contact`);
    if (contact && assistantContactIntent(`${previousQuestion} ${parsed.data.message}`)) {
      selected = [contact, ...selected.filter((source) => source !== contact)].slice(0, 4);
    }
    // Company and contact facts are authoritative in every turn, including ambiguous follow-ups.
    const company = knowledge[0];
    const context = [
      ...new Set(
        [company, contact, ...selected].filter(
          (source): source is NonNullable<typeof source> => !!source,
        ),
      ),
    ];
    const answer = await requestAssistant(config, parsed.data, context);
    return Response.json(
      { answer, sources: selected.map(({ title, href }) => ({ title, href })) },
      { headers },
    );
  } catch (error) {
    return failure(
      error instanceof AssistantFailure && error.code === 'quota'
        ? 429
        : error instanceof AssistantFailure && error.code === 'timeout'
          ? 504
          : 503,
      error instanceof AssistantFailure ? error.code : 'unavailable',
    );
  } finally {
    reservation.release();
  }
}
