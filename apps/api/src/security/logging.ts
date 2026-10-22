/** Deliberately omit headers, query strings, bodies, remote addresses and raw errors. */
export function safeRequestLog(req: { id?: unknown; method?: unknown; url?: string }) {
  return { id: req.id, method: req.method, url: (req.url || '').split('?')[0] };
}
export function safeErrorLog(error: { name?: string }) {
  return { type: error?.name || 'Error', message: 'Request failed' };
}
