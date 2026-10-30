import { ShowcaseArt } from './showcase-cards';
import './showcase.css';
import { Heading } from '@tevoniq/ui';
import { headers } from 'next/headers';
import { getOrganization } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { Container, Section } from '@tevoniq/ui';
import { localeSchema, insightSlugSchema } from '@tevoniq/validation';
import { getInsight } from '@/lib/insights';
import { articlePath, articleUrl, articleStructuredData } from '@/lib/insight-format';
import { env } from '@/lib/env';
import { insightLabels } from '@/content/insights';
import { ArticleContent } from '@/components/article-content';
import { InsightCards } from '@/components/insight-cards';
export type InsightArticleProps = { params: Promise<{ locale: string; slug: string }> };
async function resolve(params: InsightArticleProps['params']) {
  const raw = await params,
    locale = localeSchema.safeParse(raw.locale),
    slug = insightSlugSchema.safeParse(raw.slug);
  if (!locale.success || !slug.success) notFound();
  return { locale: locale.data, slug: slug.data };
}
export async function insightArticleMetadata(
  { params }: InsightArticleProps,
  kind?: 'resource',
): Promise<Metadata> {
  const { locale, slug } = await resolve(params),
    result = await getInsight(locale, slug).catch(() => null);
  if (!result || (kind && result.article.kind !== kind))
    return { robots: { index: false, follow: false } };
  const { article } = result,
    canonical = article.canonicalUrl || articleUrl(article, env.SITE_URL),
    image = article.ogImage || article.coverImage;
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    robots: { index: true, follow: true },
    authors: [{ name: article.author }],
    alternates: {
      canonical,
      types: { 'application/rss+xml': `/insights/rss.xml?locale=${locale}` },
    },
    openGraph: {
      type: 'article',
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      url: canonical,
      siteName: 'TEVONIQ',
      locale: { en: 'en_US', tr: 'tr_TR', ar: 'ar_AR' }[locale],
      publishedTime: article.publicationDate,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: article.tags.map((t) => t.name),
      ...(article.category ? { section: article.category.name } : {}),
      ...(image ? { images: [{ url: image, alt: article.coverImageAlt || article.title }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      ...(image ? { images: [image] } : {}),
    },
  };
}
export async function renderInsightArticle({ params }: InsightArticleProps, kind?: 'resource') {
  const { locale, slug } = await resolve(params),
    labels = insightLabels[locale];
  let result;
  try {
    result = await getInsight(locale, slug);
  } catch {
    return (
      <main id="main-content">
        <Section>
          <Container>
            <Heading as="h1" className="tv-h1">
              {labels.title}
            </Heading>
            <p role="status">{labels.error}</p>
          </Container>
        </Section>
      </main>
    );
  }
  if (!result || (kind && result.article.kind !== kind) || (kind && locale === 'tr')) notFound();
  if (!kind && locale !== 'tr' && result.article.kind === 'resource')
    redirect(articlePath(result.article));
  const { article, related } = result,
    shareUrl = encodeURIComponent(articleUrl(article, env.SITE_URL));
  return (
    <main id="main-content" className={`insights-page${locale !== 'tr' ? ' showcase-modern' : ''}`}>
      <Section>
        <Container>
          <article className="insight-article">
            <nav className="insight-nav" aria-label={labels.title}>
              <Link href={`/${locale}/insights`}>{labels.title}</Link>
              <Link
                href={`/${locale}/insights/${article.kind === 'resource' ? 'resources' : article.kind === 'case-study' ? 'case-studies' : 'blog'}`}
              >
                {article.kind === 'resource'
                  ? labels.resources
                  : article.kind === 'case-study'
                    ? labels.cases
                    : labels.blog}
              </Link>
            </nav>
            <header>
              <p className="insight-kicker">
                {article.kind === 'resource'
                  ? labels.resources
                  : article.kind === 'case-study'
                    ? labels.cases
                    : article.category?.name || labels.blog}
              </p>
              <Heading as="h1" className="tv-h1">
                {article.title}
              </Heading>
              <p className="insights-intro">{article.excerpt}</p>
              <p className="insight-meta">
                {labels.by} {article.author} ·{' '}
                <time dateTime={article.publicationDate}>
                  {new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
                    new Date(article.publicationDate),
                  )}
                </time>{' '}
                · {article.readingTime} {labels.minutes}
              </p>
              {article.coverImage ? (
                <Image
                  unoptimized
                  src={article.coverImage}
                  alt={article.coverImageAlt}
                  width={1200}
                  height={750}
                  className="insight-cover"
                />
              ) : locale !== 'tr' ? (
                <ShowcaseArt kind={article.kind} index={article.kind === 'resource' ? 1 : 2} />
              ) : null}
            </header>
            <ArticleContent
              blocks={article.content}
              compactLastParagraph={article.slug.startsWith('demo-')}
            />
            <div className="insight-tags">
              {article.tags.map((t) => (
                <Link key={t.id} href={`/${locale}/insights?tag=${t.slug}`}>
                  #{t.name}
                </Link>
              ))}
            </div>
            <nav className="insight-nav" aria-label={labels.share}>
              <span>{labels.share}</span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                X
              </a>
              <a href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${shareUrl}`}>
                Email
              </a>
            </nav>
          </article>
        </Container>
      </Section>
      {!!related.length && (
        <Section>
          <Container>
            <Heading as="h2" className="tv-h2">
              {labels.related}
            </Heading>
            <InsightCards articles={related} locale={locale} />
          </Container>
        </Section>
      )}
      <script
        nonce={(await headers()).get('x-nonce') || undefined}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleStructuredData(
              article,
              env.SITE_URL,
              await getOrganization().catch(() => undefined),
            ),
          ).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  );
}
