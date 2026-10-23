'use client';
import { Heading } from '@tevoniq/ui';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import type { Locale, SearchResponse } from '@tevoniq/types';
import './global-search.css';
const searchLabels = {
  en: {
    search: 'Search',
    hint: 'Search the website',
    start: 'Enter a term to search the website.',
    loading: 'Searching…',
    empty: 'No results. Try a different term or fewer words.',
    error: 'Search is unavailable. Please try again.',
    all: 'View all results',
    more: 'Show more',
    results: 'results',
    types: {
      service: 'Services',
      solution: 'Solutions',
      industry: 'Industries',
      project: 'Projects',
      blog: 'Blog',
      resource: 'Resources',
      page: 'Pages',
    },
  },
  tr: {
    search: 'Ara',
    hint: 'Web sitesinde ara',
    start: 'Aramak için bir kelime girin.',
    loading: 'Aranıyor…',
    empty: 'Sonuç bulunamadı. Farklı veya daha az kelime deneyin.',
    error: 'Arama kullanılamıyor. Lütfen tekrar deneyin.',
    all: 'Tüm sonuçları gör',
    more: 'Daha fazla göster',
    results: 'sonuç',
    types: {
      service: 'Hizmetler',
      solution: 'Çözümler',
      industry: 'Sektörler',
      project: 'Projeler',
      blog: 'Blog',
      resource: 'Kaynaklar',
      page: 'Sayfalar',
    },
  },
  ar: {
    search: 'بحث',
    hint: 'ابحث في الموقع',
    start: 'أدخل كلمة للبحث في الموقع.',
    loading: 'جارٍ البحث…',
    empty: 'لا توجد نتائج. جرّب كلمة أخرى أو كلمات أقل.',
    error: 'البحث غير متاح. يرجى المحاولة مرة أخرى.',
    all: 'عرض جميع النتائج',
    more: 'عرض المزيد',
    results: 'نتائج',
    types: {
      service: 'الخدمات',
      solution: 'الحلول',
      industry: 'القطاعات',
      project: 'المشاريع',
      blog: 'المدونة',
      resource: 'الموارد',
      page: 'الصفحات',
    },
  },
};
function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.match(/[\p{L}\p{N}]+/gu) ?? [];
  if (!terms.length) return text;
  const pattern = new RegExp('(' + terms.join('|') + ')', 'giu');
  return text
    .split(pattern)
    .map((part, index) => (index % 2 ? <mark key={index}>{part}</mark> : part));
}
export function GlobalSearch({
  locale,
  initialQuery = '',
  fullPage = false,
  onNavigate,
}: {
  locale: Locale;
  initialQuery?: string;
  fullPage?: boolean;
  onNavigate?: () => void;
}) {
  const labels = searchLabels[locale];
  const [query, setQuery] = useState(initialQuery);
  const [limit, setLimit] = useState(fullPage ? 12 : 4);
  const [state, setState] = useState<{ key: string; data?: SearchResponse; error?: boolean }>({
    key: '',
  });
  const [composing, setComposing] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  useEffect(() => {
    if (!fullPage) {
      const frame = requestAnimationFrame(() => input.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
  }, [fullPage]);
  const term = query.trim();
  const key = JSON.stringify([term, locale, limit]);
  const current = state.key === key ? state : undefined;
  useEffect(() => {
    if (!term || composing) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          '/api/search?' + new URLSearchParams({ q: term, locale, limit: String(limit) }),
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('Search failed');
        const data = (await response.json()) as SearchResponse;
        if (!controller.signal.aborted) setState({ key, data });
      } catch {
        if (!controller.signal.aborted) setState({ key, error: true });
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, locale, limit, key, composing]);
  const groups = term ? (current?.data?.groups ?? []) : [];
  const count = groups.reduce((sum, group) => sum + group.items.length, 0);
  const busy = Boolean(term && !current);
  return (
    <div
      className="global-search"
      ref={root}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const links = Array.from(
          root.current?.querySelectorAll<HTMLAnchorElement>('[data-search-result]') ?? [],
        );
        if (!links.length) return;
        const index = links.indexOf(document.activeElement as HTMLAnchorElement);
        if (document.activeElement !== input.current && index < 0) return;
        event.preventDefault();
        if (event.key === 'ArrowUp' && index === 0) input.current?.focus();
        else
          links[
            (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length
          ]?.focus();
      }}
    >
      <form action={`/${locale}/search`} role="search" onSubmit={onNavigate}>
        <label htmlFor={id}>{labels.hint}</label>
        <div className="global-search-input">
          <input
            ref={input}
            id={id}
            name="q"
            type="search"
            value={query}
            maxLength={200}
            autoComplete="off"
            aria-controls={id + '-results'}
            onChange={(event) => setQuery(event.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
          />
          <button type="submit" className="tv-button" data-variant="primary">
            {labels.search}
          </button>
        </div>
      </form>
      <p role="status" aria-live="polite">
        {!term
          ? labels.start
          : busy
            ? labels.loading
            : current?.error
              ? labels.error
              : count
                ? `${count} ${labels.results}`
                : labels.empty}
      </p>
      <div id={id + '-results'} aria-busy={busy} className="global-search-results">
        {groups.map((group) => (
          <section key={group.type} aria-labelledby={id + group.type}>
            <Heading as="h2" id={id + group.type} className="tv-h3">
              {labels.types[group.type]}
            </Heading>
            <ul>
              {group.items.map((item) => (
                <li key={item.type + item.id}>
                  <Link href={item.url} data-search-result onClick={() => onNavigate?.()}>
                    <small>{labels.types[item.type]}</small>
                    <strong>
                      <Highlight text={item.title} query={term} />
                    </strong>
                    <p>
                      <Highlight text={item.excerpt} query={term} />
                    </p>
                    <span className="global-search-url">{item.url}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {term && !fullPage && (
        <Link
          href={`/${locale}/search?q=${encodeURIComponent(term)}`}
          onClick={() => onNavigate?.()}
        >
          {labels.all}
        </Link>
      )}
      {fullPage && limit < 50 && groups.some((g) => g.hasMore) && (
        <button
          type="button"
          className="tv-button"
          onClick={() => setLimit(Math.min(limit + 12, 50))}
        >
          {labels.more}
        </button>
      )}
    </div>
  );
}
