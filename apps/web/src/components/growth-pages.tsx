import { StructuredData } from './seo/json-ld';
import { env } from '@/lib/env';
import Link from 'next/link';
import { ArrowUpLeft, ArrowUpRight, Check, Compass, Play, Layers3 } from 'lucide-react';
import { growthSectors, growthGuides, growthFilms, type GrowthLocale } from '@/content/growth';
import './growth.css';
const ui = {
  ar: {
    start: 'خطوة واضحة لأعمالك',
    sectors: 'حلول أقرب إلى نشاطك',
    guides: 'قرارات أوضح قبل التطوير',
    films: 'شاهد الفكرة. ثم جرّبها.',
    talk: 'لنناقش احتياجك',
    demo: 'جرّب النموذج',
    design: 'استكشف تصميم الموقع',
    next: 'كيف نبدأ؟',
    phases: [
      'نفهم طريقة عملك والمشكلة المطلوبة.',
      'نحدد نطاقًا ومخرجات ومعايير قبول.',
      'ننفذ على مراحل ونراجع قبل التوسع.',
    ],
    integrations: 'الربط والأتمتة',
    scope: 'نطاق واضح قبل التنفيذ',
    note: 'الأمثلة والنماذج توضيحية، وليست مشروعات منفذة لعملاء.',
    read: 'اقرأ الدليل',
    explore: 'استكشف المسار',
    transcript: 'مسار العرض — دون صوت',
    duration: 'عرض توضيحي قصير',
    author: 'إعداد TEVONIQ · دليل عملي لأصحاب المنشآت',
    summary: 'قبل التفاصيل',
    contents: 'في هذا الدليل',
    home: 'الرئيسية',
    back: 'القطاعات',
    show: 'شاهد العروض القصيرة',
  },
  en: {
    start: 'A clear next step for your business',
    sectors: 'Solutions closer to your business',
    guides: 'Clearer decisions before development',
    films: 'See the idea. Then try it.',
    talk: 'Discuss your needs',
    demo: 'Try the demo',
    design: 'Explore the website design',
    next: 'How do we start?',
    phases: [
      'Understand your workflow and the problem.',
      'Agree scope, deliverables and acceptance criteria.',
      'Build in phases and review before expanding.',
    ],
    integrations: 'Integrations & automation',
    scope: 'Clear scope before delivery',
    note: 'Examples and demos are illustrative, not delivered client engagements.',
    read: 'Read the guide',
    explore: 'Explore the pathway',
    transcript: 'Walkthrough — no audio',
    duration: 'Short illustrative walkthrough',
    author: 'Prepared by TEVONIQ · A practical guide for business owners',
    summary: 'Before the details',
    contents: 'In this guide',
    home: 'Home',
    back: 'Industries',
    show: 'Watch short walkthroughs',
  },
};
function Arrow({ locale }: { locale: GrowthLocale }) {
  return locale === 'ar' ? (
    <ArrowUpLeft size={19} aria-hidden="true" />
  ) : (
    <ArrowUpRight size={19} aria-hidden="true" />
  );
}
export function GrowthLinks({
  locale,
  kind = 'all',
}: {
  locale: 'ar' | 'en' | 'tr';
  kind?: 'sectors' | 'guides' | 'all';
}) {
  if (locale === 'tr') return null;
  const c = ui[locale];
  return (
    <section className="growth-entry" aria-label={kind === 'guides' ? c.guides : c.sectors}>
      <p className="growth-kicker">TEVONIQ / {c.start}</p>
      <h2>{kind === 'guides' ? c.guides : c.sectors}</h2>
      <div className="growth-link-grid">
        {kind !== 'guides' &&
          growthSectors.map((item) => (
            <Link
              className={`growth-link growth-${item.accent}`}
              key={item.slug}
              href={`/${locale}/business/${item.slug}`}
            >
              <Compass aria-hidden="true" />
              <h3>{item[locale].name}</h3>
              <p>{item[locale].intro}</p>
              <span>
                {c.explore} <Arrow locale={locale} />
              </span>
            </Link>
          ))}
        {kind !== 'sectors' &&
          growthGuides.map((item) => (
            <Link className="growth-link" key={item.slug} href={`/${locale}/guides/${item.slug}`}>
              <Layers3 aria-hidden="true" />
              <h3>{item[locale].title}</h3>
              <p>{item[locale].summary}</p>
              <span>
                {c.read} <Arrow locale={locale} />
              </span>
            </Link>
          ))}
      </div>
      <Link className="growth-text-link" href={`/${locale}/showroom`}>
        <Play size={17} aria-hidden="true" />
        {c.show}
      </Link>
    </section>
  );
}
function GrowthCrumbs({ locale, title }: { locale: GrowthLocale; title: string }) {
  return (
    <nav className="growth-crumbs" aria-label={locale === 'ar' ? 'مسار الصفحة' : 'Breadcrumb'}>
      <Link href={`/${locale}`}>{ui[locale].home}</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{title}</span>
    </nav>
  );
}
export function SectorPage({
  locale,
  item,
}: {
  locale: GrowthLocale;
  item: (typeof growthSectors)[number];
}) {
  const c = item[locale],
    labels = ui[locale];
  return (
    <main id="main-content" className={`growth-page growth-${item.accent}`}>
      <GrowthCrumbs locale={locale} title={c.name} />
      <header className="growth-hero">
        <div>
          <p className="growth-kicker">{c.name}</p>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
          <div className="growth-actions">
            <Link
              className="growth-button"
              href={`/${locale}/request-quote?utm_source=site&utm_medium=sector&utm_campaign=${item.slug}`}
            >
              {labels.talk}
              <Arrow locale={locale} />
            </Link>
            <Link className="growth-ghost" href={`/${locale}${item.demo}`}>
              {labels.demo}
            </Link>
          </div>
        </div>
        <div className="growth-blueprint" aria-hidden="true">
          <div className="growth-orbit" />
          <span>01</span>
          <div>{c.problems[0]}</div>
          <span>02</span>
          <div>{c.deliverables[1]}</div>
          <span>03</span>
          <div>{c.deliverables[2]}</div>
          <small>TEVONIQ / WORKFLOW</small>
        </div>
      </header>
      <section className="growth-section">
        <p className="growth-kicker">01 / {labels.start}</p>
        <h2>{c.problem}</h2>
        <div className="growth-three">
          {c.problems.map((problem, index) => (
            <article className="growth-problem" key={problem}>
              <span>0{index + 1}</span>
              <h3>{problem}</h3>
            </article>
          ))}
        </div>
      </section>
      <section className="growth-section growth-tint">
        <div className="growth-two">
          <div>
            <p className="growth-kicker">02 / TEVONIQ</p>
            <h2>{c.outcome}</h2>
            <p>{c.example}</p>
            <p className="growth-note">{labels.note}</p>
          </div>
          <ul className="growth-checks">
            {c.deliverables.map((text) => (
              <li key={text}>
                <Check size={20} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="growth-actions">
          <Link className="growth-button" href={`/${locale}${item.design}`}>
            {labels.design}
            <Arrow locale={locale} />
          </Link>
          <Link className="growth-text-link" href={`/${locale}/showroom`}>
            {labels.show}
          </Link>
        </div>
      </section>
      <section className="growth-section growth-two">
        <article>
          <h2>{labels.integrations}</h2>
          <p>{c.connections}</p>
        </article>
        <article>
          <h2>{labels.scope}</h2>
          <p>{c.boundary}</p>
        </article>
      </section>
      <section className="growth-section growth-next">
        <h2>{labels.next}</h2>
        <ol>
          {labels.phases.map((phase) => (
            <li key={phase}>{phase}</li>
          ))}
        </ol>
        <Link
          className="growth-button"
          href={`/${locale}/contact?utm_source=site&utm_medium=sector&utm_campaign=${item.slug}`}
        >
          {labels.talk}
          <Arrow locale={locale} />
        </Link>
      </section>
      <GrowthLinks locale={locale} kind="guides" />
    </main>
  );
}
export function GuidePage({
  locale,
  item,
}: {
  locale: GrowthLocale;
  item: (typeof growthGuides)[number];
}) {
  const c = item[locale],
    labels = ui[locale];
  return (
    <main id="main-content" className="growth-page growth-guide">
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: c.title,
          description: c.intro,
          inLanguage: locale,
          author: { '@type': 'Organization', name: 'TEVONIQ', url: env.SITE_URL },
          mainEntityOfPage: new URL(`/${locale}/guides/${item.slug}`, env.SITE_URL).href,
        }}
      />
      <GrowthCrumbs locale={locale} title={c.title} />
      <header className="growth-guide-head">
        <p className="growth-kicker">{labels.author}</p>
        <h1>{c.title}</h1>
        <p>{c.intro}</p>
        <div className="growth-summary">
          <strong>{labels.summary}</strong>
          <p>{c.summary}</p>
        </div>
      </header>
      <div className="growth-reading">
        <aside>
          <nav aria-label={labels.contents}>
            <h2>{labels.contents}</h2>
            {c.sections.map(([heading], index) => (
              <a key={heading} href={`#part-${index + 1}`}>
                {heading}
              </a>
            ))}
          </nav>
        </aside>
        <article>
          {c.sections.map(([heading, body], index) => (
            <section key={heading} id={`part-${index + 1}`}>
              <p className="growth-kicker">0{index + 1}</p>
              <h2>{heading}</h2>
              <p>{body}</p>
            </section>
          ))}
          <div className="growth-summary">
            <h2>{c.action}</h2>
            <p>
              {locale === 'ar'
                ? 'نبدأ بفهم احتياجك، ثم نوضح النطاق والخطوة المناسبة. لا تحتاج إلى إرسال بيانات حساسة لتبدأ النقاش.'
                : 'We start by understanding your needs, then clarify the scope and next step. No sensitive data is needed to start a conversation.'}
            </p>
            <Link
              className="growth-button"
              href={`/${locale}/contact?utm_source=site&utm_medium=guide&utm_campaign=${item.slug}`}
            >
              {c.action}
              <Arrow locale={locale} />
            </Link>
          </div>
        </article>
      </div>
      <GrowthLinks locale={locale} kind="sectors" />
    </main>
  );
}
export function ShowroomPage({ locale }: { locale: GrowthLocale }) {
  const c = ui[locale];
  return (
    <main id="main-content" className="growth-page">
      <GrowthCrumbs locale={locale} title={c.films} />
      <header className="growth-guide-head">
        <p className="growth-kicker">TEVONIQ / DEMO STORIES</p>
        <h1>{c.films}</h1>
        <p>{c.note}</p>
      </header>
      <section className="growth-film-grid" aria-label={c.films}>
        {growthFilms.map((film, index) => (
          <article className={`growth-film growth-film-${film.id}`} key={film.id}>
            <div className="growth-film-top">
              <span>0{index + 1}</span>
              <span>{c.duration}</span>
            </div>
            <h2>{film[locale].title}</h2>
            <video
              controls
              playsInline
              preload="none"
              poster={`/brand/growth/${film.id}-${locale}.webp`}
              data-film={film.id}
              aria-label={film[locale].title}
            >
              <source src={`/brand/growth/${film.id}-${locale}.webm`} type="video/webm" />
            </video>
            <p>{film[locale].description}</p>
            <details>
              <summary>{c.transcript}</summary>
              <ol>
                {film[locale].steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </details>
            <Link className="growth-button" href={`/${locale}${film.path}`}>
              {c.demo}
              <Arrow locale={locale} />
            </Link>
          </article>
        ))}
      </section>
      <GrowthLinks locale={locale} kind="sectors" />
    </main>
  );
}
