import { notFound } from 'next/navigation';
import { localeSchema } from '@tevoniq/validation';
import { GlobalSearch } from '@/components/global-search';
export const metadata = { title: 'Search | TEVONIQ', robots: { index: false, follow: true } };
export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  const { q } = await searchParams;
  const query = typeof q === 'string' ? q.slice(0, 200) : '';
  return (
    <main id="main-content" className="global-search-page">
      <h1 className="tv-h1">{{ en: 'Search', tr: 'Ara', ar: 'بحث' }[locale.data]}</h1>
      <GlobalSearch key={query} locale={locale.data} initialQuery={query} fullPage />
    </main>
  );
}
