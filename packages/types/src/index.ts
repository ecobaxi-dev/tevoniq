export const locales = ['en', 'tr', 'ar'] as const;
export type Locale = (typeof locales)[number];
export type HealthResponse = { status: 'ok'; service: 'api' };
export function directionFor(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
export * from './search.js';
