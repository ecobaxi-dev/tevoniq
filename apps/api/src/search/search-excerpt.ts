/** Plain text only: clients render their own safe, semantic highlights. */
export function searchExcerpt(text: string, query: string, length = 240): string {
  if (text.length <= length) return text;
  const terms = query.match(/[\p{L}\p{N}]+/gu) ?? [];
  const match = terms.length ? text.search(new RegExp(terms.join('|'), 'iu')) : -1;
  const start = Math.max(0, match - 60);
  return (
    (start ? '…' : '') +
    text.slice(start, start + length) +
    (start + length < text.length ? '…' : '')
  );
}
