import { Heading } from '@tevoniq/ui';
import { StructuredData } from '../seo/json-ld';
import { faqData } from '@/lib/seo-core';
/* eslint-disable @next/next/no-img-element -- CMS media URLs are validated and rendered without server-side fetching. */
import type {
  BuilderSection,
  PageDocument,
  BuilderLocale,
  BuilderCard,
  SectionCopy,
  SectionType,
} from '@tevoniq/validation';
import { NewsletterSection } from './newsletter-section';
import './page-builder.css';
type Media = NonNullable<SectionCopy<'Hero'>['media']>;
export function builderLink(href: string, locale: BuilderLocale) {
  return href.startsWith('/') && !/^\/(en|tr|ar)(\/|$)/.test(href) ? `/${locale}${href}` : href;
}
function Picture({ media }: { media: Media }) {
  return (
    <figure className="pb-media">
      <img src={media.src} alt={media.alt} loading="lazy" decoding="async" />
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  );
}
function Action({
  action,
  locale,
}: {
  action: { label: string; href: string };
  locale: BuilderLocale;
}) {
  return action.href && action.label ? (
    <a className="pb-button" href={builderLink(action.href, locale)}>
      {action.label}
      <span aria-hidden="true"> ↗</span>
    </a>
  ) : null;
}
function Content({
  section,
  locale,
  cards,
  pageId,
  preview,
  siteKey,
}: {
  section: BuilderSection;
  locale: BuilderLocale;
  cards: BuilderCard[];
  pageId: string;
  preview: boolean;
  siteKey: string | null;
}) {
  const copy = <T extends SectionType>() => section.content[locale] as SectionCopy<T>;
  switch (section.type) {
    case 'Hero': {
      const c = copy<'Hero'>();
      return (
        <div className="pb-actions">
          {c.actions.map((action, i) => (
            <Action key={i} action={action} locale={locale} />
          ))}
        </div>
      );
    }
    case 'RichText': {
      const c = copy<'RichText'>();
      return (
        <div className="pb-rich">
          {c.nodes.map((n, i) => {
            switch (n.type) {
              case 'paragraph':
                return <p key={i}>{n.text}</p>;
              case 'heading':
                return n.level === 'h3' ? (
                  <Heading as="h3" key={i}>
                    {n.text}
                  </Heading>
                ) : (
                  <Heading as="h4" key={i}>
                    {n.text}
                  </Heading>
                );
              case 'quote':
                return (
                  <blockquote key={i}>
                    <p>{n.text}</p>
                    <cite>{n.attribution}</cite>
                  </blockquote>
                );
              case 'link':
                return (
                  <p key={i}>
                    <a href={builderLink(n.href, locale)}>{n.label}</a>
                  </p>
                );
              case 'list': {
                const List = n.ordered ? 'ol' : 'ul';
                return (
                  <List key={i}>
                    {n.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </List>
                );
              }
            }
          })}
        </div>
      );
    }
    case 'ImageText':
      return <Action action={copy<'ImageText'>().action} locale={locale} />;
    case 'FeatureGrid':
      return (
        <div className="pb-grid">
          {copy<'FeatureGrid'>().items.map((item, i) => (
            <article className="pb-card" key={i}>
              <span className="pb-marker" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <Heading as="h3">{item.title}</Heading>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      );
    case 'ServiceGrid':
    case 'SolutionGrid':
    case 'IndustryGrid':
    case 'ProjectGrid':
      return (
        <div className="pb-grid">
          {cards.map((card) => (
            <article className="pb-card" key={card.id}>
              {card.image && <Picture media={card.image} />}
              <Heading as="h3">
                <a href={card.href}>
                  {card.title}
                  <span aria-hidden="true"> ↗</span>
                </a>
              </Heading>
              <p>{card.text}</p>
            </article>
          ))}
          {preview && !cards.length && (
            <p className="pb-empty">Select published catalog records to preview this grid.</p>
          )}
        </div>
      );
    case 'Stats':
      return (
        <dl className="pb-grid pb-stats">
          {copy<'Stats'>().items.map((item, i) => (
            <div key={i}>
              <dt>{item.label}</dt>
              <dd>
                <strong>{item.value}</strong>
                {item.note && <small>{item.note}</small>}
              </dd>
            </div>
          ))}
        </dl>
      );
    case 'LogoGrid':
      return (
        <div className="pb-grid pb-logos">
          {copy<'LogoGrid'>().items.map((item, i) => (
            <div className="pb-card" key={i}>
              {item.media && <Picture media={item.media} />}
              <p>
                {item.href ? <a href={builderLink(item.href, locale)}>{item.name}</a> : item.name}
              </p>
            </div>
          ))}
        </div>
      );
    case 'TeamGrid':
      return (
        <div className="pb-grid">
          {copy<'TeamGrid'>().items.map((item, i) => (
            <article className="pb-card" key={i}>
              {item.media && <Picture media={item.media} />}
              <Heading as="h3">{item.name}</Heading>
              <p className="pb-role">{item.role}</p>
              <p>{item.bio}</p>
            </article>
          ))}
        </div>
      );
    case 'Testimonials':
      return (
        <div className="pb-grid">
          {copy<'Testimonials'>().items.map((item, i) => (
            <figure className="pb-card" key={i}>
              <blockquote>{item.quote}</blockquote>
              <figcaption>
                <strong>{item.author}</strong>
                {item.company && <span> · {item.company}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      );
    case 'FAQ':
      return (
        <div className="pb-faq">
          {copy<'FAQ'>().items.map((item, i) => (
            <details key={i}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      );
    case 'CTA':
      return <Action action={copy<'CTA'>().action} locale={locale} />;
    case 'ImageGallery':
      return (
        <div className="pb-grid pb-gallery">
          {copy<'ImageGallery'>().images.map((media, i) => (
            <Picture key={i} media={media} />
          ))}
        </div>
      );
    case 'Video': {
      const c = copy<'Video'>();
      return (
        <div>
          {c.videoId &&
            (preview ? (
              <div className="pb-video-placeholder">
                {c.provider} video · {c.videoId}
              </div>
            ) : (
              <iframe
                className="pb-video"
                src={
                  c.provider === 'YOUTUBE'
                    ? `https://www.youtube-nocookie.com/embed/${c.videoId}`
                    : `https://player.vimeo.com/video/${c.videoId}`
                }
                title={c.heading}
                loading="lazy"
                allow="fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ))}
          {c.transcript && (
            <details className="pb-transcript">
              <summary>
                {locale === 'ar'
                  ? 'النص المكتوب'
                  : locale === 'tr'
                    ? 'Video metni'
                    : 'Video transcript'}
              </summary>
              <p>{c.transcript}</p>
            </details>
          )}
        </div>
      );
    }
    case 'Timeline':
      return (
        <ol className="pb-timeline">
          {copy<'Timeline'>().items.map((item, i) => (
            <li key={i}>
              <span>{item.label}</span>
              <div>
                <Heading as="h3">{item.title}</Heading>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'ContactBlock': {
      const c = copy<'ContactBlock'>();
      return (
        <div className="pb-contact">
          <address>
            {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
            {c.phone && <a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`}>{c.phone}</a>}
            {c.address && <p>{c.address}</p>}
          </address>
          <Action action={c.action} locale={locale} />
        </div>
      );
    }
    case 'Newsletter':
      return (
        <NewsletterSection
          copy={copy<'Newsletter'>()}
          pageId={pageId}
          sectionId={section.id}
          locale={locale}
          preview={preview}
          siteKey={siteKey}
        />
      );
    case 'CustomHeading':
      return null;
  }
}
export function PageRenderer({
  document,
  locale,
  cards = {},
  pageId = '',
  preview = false,
  siteKey = null,
}: {
  document: PageDocument;
  locale: BuilderLocale;
  cards?: Record<string, BuilderCard[]>;
  pageId?: string;
  preview?: boolean;
  siteKey?: string | null;
}) {
  const sections = document.sections
    .filter((s) => s.visible && s.content[locale])
    .sort((a, b) => a.order - b.order);
  return (
    <div className="pb-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <StructuredData
        data={
          preview
            ? null
            : faqData(
                sections.flatMap((s) =>
                  s.type === 'FAQ' ? (s.content[locale] as SectionCopy<'FAQ'>).items : [],
                ),
              )
        }
      />
      <Heading as="h1" className={sections[0]?.type === 'Hero' ? 'pb-sr-only' : 'pb-page-title'}>
        {document.translations[locale]?.title || (preview ? 'Page preview' : '')}
      </Heading>
      {sections.map((s) => {
        const c = s.content[locale]!;
        const imageText = s.type === 'ImageText';
        const heading =
          s.type === 'CustomHeading' &&
          c &&
          'level' in c &&
          c.level === 'h3' &&
          sections
            .slice(0, sections.indexOf(s))
            .some((previous) => previous.content[locale]?.heading) ? (
            <Heading as="h3">{c.heading}</Heading>
          ) : (
            <Heading as="h2">{c.heading}</Heading>
          );
        return (
          <section
            id={`section-${s.id}`}
            className={`pb-section pb-${s.type}`}
            key={s.id}
            data-theme={s.theme}
            data-background={s.background}
            data-spacing={s.spacing}
            data-align={
              s.type === 'CustomHeading' ? (c as SectionCopy<'CustomHeading'>).alignment : undefined
            }
          >
            <div
              className={imageText ? 'pb-inner pb-image-text' : 'pb-inner'}
              data-image-side={imageText ? (c as SectionCopy<'ImageText'>).imageSide : undefined}
            >
              <div className="pb-copy">
                {s.type === 'Hero' && (c as SectionCopy<'Hero'>).eyebrow && (
                  <p className="pb-eyebrow">{(c as SectionCopy<'Hero'>).eyebrow}</p>
                )}
                {c.heading && heading}
                {c.text && <p className="pb-intro">{c.text}</p>}
                {!imageText && c.media && <Picture media={c.media} />}
                <Content
                  section={s}
                  locale={locale}
                  cards={cards[s.id] || []}
                  pageId={pageId}
                  preview={preview}
                  siteKey={siteKey}
                />
              </div>
              {imageText && c.media && <Picture media={c.media} />}
            </div>
          </section>
        );
      })}
      {preview && !sections.length && (
        <p className="pb-empty">Add visible content in this language to preview your page.</p>
      )}
    </div>
  );
}
