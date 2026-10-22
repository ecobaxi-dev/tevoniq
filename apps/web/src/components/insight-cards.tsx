import Link from 'next/link';
import Image from 'next/image';
import type { PublicArticle } from '@tevoniq/validation';
import { insightLabels } from '@/content/insights';
export function InsightCards({
  articles,
  locale,
}: {
  articles: PublicArticle[];
  locale: 'en' | 'tr' | 'ar';
}) {
  const labels = insightLabels[locale];
  return (
    <div className="insight-grid">
      {articles.map((article) => (
        <article key={article.id} className="insight-card">
          {article.coverImage && (
            <Image
              unoptimized
              src={article.coverImage}
              alt={article.coverImageAlt}
              width={720}
              height={450}
              className="insight-cover"
            />
          )}
          <div className="insight-card-body">
            <p className="insight-kicker">
              {article.featured ? `${labels.featured} · ` : ''}
              {article.category?.name || labels.blog}
            </p>
            <h2 className="tv-h3">
              <Link href={`/${locale}/insights/blog/${article.slug}`}>{article.title}</Link>
            </h2>
            <p>{article.excerpt}</p>
            <p className="insight-meta">
              <time dateTime={article.publicationDate}>
                {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
                  new Date(article.publicationDate),
                )}
              </time>{' '}
              · {article.readingTime} {labels.minutes}
            </p>
            <p className="insight-meta">{article.author}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
