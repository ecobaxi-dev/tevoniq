import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container } from '@tevoniq/ui';
import { localeSchema } from '@tevoniq/validation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { aiCaseStudies, aiCaseCopy, digitalCasePresentation } from '@/content/ai-case-studies';
import { AiCaseCards } from '@/components/ai-case-cards';
import { routeMetadata } from '@/lib/seo';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import '@/components/ai-case-studies.css';

type Props = { params: Promise<{ locale: string; slug: string }> };
async function resolve(params: Props['params']) {
  const raw = await params,
    parsed = localeSchema.safeParse(raw.locale);
  if (!parsed.success) notFound();
  const study = aiCaseStudies.find((s) => s.slug === raw.slug);
  if (!study) notFound();
  return { locale: parsed.data, study };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, study } = await resolve(props.params),
    t = study.translations[locale];
  return routeMetadata(props, '/insights/case-studies/[slug]', {
    title: t.title,
    description: t.sections[0]!.paragraphs[0],
    alternates: {
      canonical: `/${locale}/insights/case-studies/${study.slug}`,
      languages: Object.fromEntries(
        ['ar', 'en', 'tr'].map((l) => [l, `/${l}/insights/case-studies/${study.slug}`]),
      ),
    },
    openGraph: {
      title: t.title,
      description: t.sections[0]!.paragraphs[0],
      type: 'article',
      images: [{ url: study.cover }],
    },
  });
}
export default async function Page({ params }: Props) {
  const { locale, study } = await resolve(params),
    c =
      study.serviceSlug === 'digital-transformation'
        ? { ...aiCaseCopy[locale], ...digitalCasePresentation[locale] }
        : aiCaseCopy[locale],
    t = study.translations[locale];
  return (
    <>
      <PageBreadcrumbs locale={locale} path={`/insights/case-studies/${study.slug}`} />
      <main id="main-content" className="ai-case-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <section className="ai-case-hero">
          <Container>
            <a
              className="ai-case-back"
              href={`/${locale}/services/${study.serviceSlug}#${study.serviceSlug === 'digital-transformation' ? 'digital-cases' : 'ai-case-studies'}`}
            >
              <ArrowLeft size={17} aria-hidden="true" />
              {c.back}
            </a>
            <div className="ai-case-hero-grid">
              <div>
                <p className="ai-case-eyebrow">
                  {c.label} / {t.sector}
                </p>
                <h1>{t.title}</h1>
                <p className="ai-case-disclosure">{c.notice}</p>
              </div>
              <Image
                src={study.cover}
                alt={`${c.image}: ${t.sector}`}
                width={study.images.cover.width}
                height={study.images.cover.height}
                unoptimized
                priority
              />
            </div>
          </Container>
        </section>
        <nav className="ai-case-nav" aria-label={c.sections}>
          <Container>
            {t.sections.map((s, i) => (
              <a key={s.title} href={`#case-section-${i}`}>
                {s.title}
              </a>
            ))}
          </Container>
        </nav>
        <section className="ai-case-results" aria-labelledby="case-results-title">
          <Container>
            <h2 id="case-results-title">{c.results}</h2>
            <ul>
              {study.metrics.map((m) => (
                <li key={m.value}>
                  <strong dir="ltr" data-textual={m.value.length > 4 && /[a-z]/i.test(m.value)}>
                    {m.value}
                  </strong>
                  <span>{m.labels[locale]}</span>
                </li>
              ))}
            </ul>
            <p>{c.snapshot}</p>
          </Container>
        </section>
        <Container className="ai-case-article-layout">
          <article className="ai-case-article">
            {t.sections.map((s, i) => (
              <section id={`case-section-${i}`} key={s.title}>
                <h2>{s.title}</h2>
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {i === study.imageSection &&
                  study.gallery.map((image) => (
                    <figure key={image.src}>
                      <Image
                        src={image.src}
                        alt={`${c.image}: ${t.sector}`}
                        width={image.width}
                        height={image.height}
                        unoptimized
                        sizes="(max-width: 767px) 100vw, 70vw"
                      />
                    </figure>
                  ))}
              </section>
            ))}
          </article>
          <aside className="ai-case-sidebar">
            <p className="ai-case-eyebrow">{t.sector}</p>
            <h2>{c.sections}</h2>
            <ol>
              {t.sections.map((s, i) => (
                <li key={s.title}>
                  <a href={`#case-section-${i}`}>{s.title}</a>
                </li>
              ))}
            </ol>
            {study.serviceSlug !== 'digital-transformation' && (
              <a
                className="ai-case-source"
                href={study.source}
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.source}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            )}
          </aside>
        </Container>
        <section className="ai-case-more">
          <Container>
            <h2>{c.related}</h2>
            <AiCaseCards locale={locale} exclude={study.slug} serviceSlug={study.serviceSlug} />
            <a
              className="ai-case-contact"
              href={`/${locale}/services/${study.serviceSlug}#${study.serviceSlug === 'digital-transformation' ? 'digital-contact' : 'ai-contact'}`}
            >
              {c.contact}
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </Container>
        </section>
      </main>
    </>
  );
}
