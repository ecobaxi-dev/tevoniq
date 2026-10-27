import {
  automationServiceCopy,
  type AutomationServiceLocale,
} from '../content/intelligent-automation.ts';
export type JourneyPoint = { x: number; y: number; bottom: number; nextTop?: number | undefined };
// Rounded, orthogonal connectors follow real row bounds, including expanded details.
export function journeyPath(points: JourneyPoint[]): string {
  if (
    !points.length ||
    points.some((p) => ![p.x, p.y, p.bottom, p.nextTop ?? 0].every(Number.isFinite))
  )
    return '';
  const first = points[0]!;
  let path = `M ${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!,
      b = points[i]!;
    if (a.x === b.x) {
      path += ` L ${b.x} ${b.y}`;
      continue;
    }
    const mid = (a.bottom + (a.nextTop ?? b.y)) / 2;
    const r = Math.max(0, Math.min(22, Math.abs(b.x - a.x) / 2, (mid - a.y) / 2, (b.y - mid) / 2));
    const direction = b.x > a.x ? 1 : -1;
    path += ` L ${a.x} ${mid - r} Q ${a.x} ${mid} ${a.x + direction * r} ${mid} L ${b.x - direction * r} ${mid} Q ${b.x} ${mid} ${b.x} ${mid + r} L ${b.x} ${b.y}`;
  }
  return path;
}
export function journeyProgress(first: number, last: number, readingLine: number): number {
  if (![first, last, readingLine].every(Number.isFinite) || last <= first) return 0;
  return Math.round(Math.max(0, Math.min(1, (readingLine - first) / (last - first))) * 1000) / 1000;
}
export function automationJourneyLeadMessage(
  query: Record<string, string | string[] | undefined>,
  locale: AutomationServiceLocale,
): string | undefined {
  if (typeof query.journey !== 'string') return undefined;
  const stage = automationServiceCopy[locale].stages.find((stage) => stage.id === query.journey);
  if (!stage) return undefined;
  return locale === 'ar'
    ? `أرغب في مناقشة الأتمتة والربط — ${stage.title}.\n${stage.question}\nتفاصيل عملي: `
    : `I would like to discuss automation and integration — ${stage.title}.\n${stage.question}\nMy workflow: `;
}
