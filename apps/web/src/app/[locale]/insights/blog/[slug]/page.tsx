import { Heading } from '@tevoniq/ui';
import { headers } from 'next/headers';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { getOrganization, routeMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container, Section } from '@tevoniq/ui';
import { localeSchema, insightSlugSchema } from '@tevoniq/validation';
import { getInsight } from '@/lib/insights';
import { articleUrl, articleStructuredData } from '@/lib/insight-format';
import { env } from '@/lib/env';
import { insightLabels } from '@/content/insights';
import { ArticleContent } from '@/components/article-content';
import { InsightCards } from '@/components/insight-cards';
type Props = { params: Promise<{ locale: string; slug: string }> };
async function resolve(params: Props['params']) {
  const raw = await params,
    locale = localeSchema.safeParse(raw.locale),
    slug = insightSlugSchema.safeParse(raw.slug);
  if (!locale.success || !slug.success) notFound();
  return { locale: locale.data, slug: slug.data };
}
async function baseMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await resolve(params),
    result = await getInsight(locale, slug).catch(() => null);
  if (!result) return { robots: { index: false, follow: false } };
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
async function PublicPage({ params }: Props) {
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
  if (!result) notFound();
  const { article, related } = result,
    shareUrl = encodeURIComponent(articleUrl(article, env.SITE_URL));
  return (
    <main id="main-content" className="insights-page">
      <Section>
        <Container>
          <article className="insight-article">
            <nav className="insight-nav" aria-label={labels.title}>
              <Link href={`/${locale}/insights`}>{labels.title}</Link>
              <Link href={`/${locale}/insights/blog`}>{labels.blog}</Link>
            </nav>
            <header>
              <p className="insight-kicker">{article.category?.name}</p>
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
              {article.coverImage && (
                <Image
                  unoptimized
                  src={article.coverImage}
                  alt={article.coverImageAlt}
                  width={1200}
                  height={750}
                  className="insight-cover"
                />
              )}
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

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/insights/blog/[slug]', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/insights/blog/[slug]'.replace(
    '[slug]',
    Array.isArray(slug) ? slug.join('/') : String(slug),
  );
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
