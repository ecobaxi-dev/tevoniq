import Image from 'next/image';
import { mobileServiceAssets } from '@/config/mobile-assets';
import { MobileContactSection } from './mobile-contact-section';
import { MobileCollaboration } from './mobile-collaboration';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Layers3,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Container } from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import type { PublicService } from '@tevoniq/validation';
import { ContentBlocks } from './content-blocks';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './mobile-service.css';

const journeyId = '894c7159-bf42-47a7-9759-aac399701011';
const collaborationId = '894c7159-bf42-47a7-9759-aac399701012';
const icons = [Smartphone, Layers3, Code2, ShieldCheck, Workflow, Sparkles];

export function MobileService({ service, locale }: { service: PublicService; locale: Locale }) {
  const contact = service.blocks.find((block) => block.type === 'cta');
  const contactLink =
    contact?.type === 'cta' ? (
      <a
        className="mobile-button"
        href={contact.href === '/contact' ? '#mobile-contact' : `/${locale}${contact.href}`}
      >
        {contact.label}
        <ArrowRight size={19} aria-hidden="true" />
      </a>
    ) : null;
  return (
    <div className="mobile-service" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <StructuredData
        data={faqData(service.blocks.flatMap((block) => (block.type === 'faq' ? block.items : [])))}
      />
      {service.blocks.map((block) => {
        if (block.type === 'related-services') {
          const records = block.ids.flatMap((id) => {
            const record = service.relatedServices.find((item) => item.id === id);
            return record ? [record] : [];
          });
          if (!records.length) return null;
          return (
            <section className="mobile-directory" data-block-id={block.id} key={block.id}>
              <Container>
                <h2>{block.title}</h2>
                <ul className="mobile-directory__links">
                  {records.map((record) => (
                    <li key={record.id}>
                      <a href={`/${locale}/services/${record.slug}`}>{record.title}</a>
                    </li>
                  ))}
                </ul>
              </Container>
            </section>
          );
        }
        if (block.type === 'hero')
          return (
            <section className="mobile-hero" data-block-id={block.id} key={block.id}>
              <Container className="mobile-hero__layout">
                <div className="mobile-hero__copy">
                  <h1>{block.title}</h1>
                  <p>{block.description}</p>
                  {contactLink}
                </div>
                <div className="mobile-hero__image">
                  <Image
                    src={mobileServiceAssets.hero.src}
                    width={mobileServiceAssets.hero.width}
                    height={mobileServiceAssets.hero.height}
                    alt=""
                    sizes="(max-width: 767px) 100vw, 45vw"
                    preload
                  />
                </div>
              </Container>
            </section>
          );
        if (block.type === 'overview')
          return (
            <section
              className="mobile-section mobile-overview"
              data-block-id={block.id}
              key={block.id}
            >
              <Container className="mobile-overview__layout">
                <h2>{block.title}</h2>
                <p>{block.body}</p>
              </Container>
            </section>
          );
        if (block.type === 'faq')
          return (
            <section className="mobile-section mobile-faq" data-block-id={block.id} key={block.id}>
              <Container>
                <h2>{block.title}</h2>
                <div className="mobile-faq__list">
                  {block.items.map((item, index) => (
                    <details key={index}>
                      <summary>
                        <span>{item.question}</span>
                        <ChevronDown size={19} aria-hidden="true" />
                      </summary>
                      <p>{item.answer}</p>
                    </details>
                  ))}
                </div>
              </Container>
            </section>
          );
        if (block.type === 'cta')
          return <MobileContactSection key={block.id} block={block} locale={locale} />;
        if (
          ['benefits', 'capabilities', 'features', 'use-cases', 'technology-stack'].includes(
            block.type,
          ) &&
          'items' in block
        ) {
          const variant =
            block.id === journeyId
              ? 'journey'
              : block.id === collaborationId
                ? 'collaboration'
                : block.type === 'capabilities'
                  ? 'services'
                  : block.type === 'technology-stack'
                    ? 'platform'
                    : block.type;
          return (
            <section
              className={`mobile-section mobile-${variant}`}
              data-block-id={block.id}
              key={block.id}
            >
              <Container>
                <h2>{block.title}</h2>
                {variant === 'collaboration' ? (
                  <MobileCollaboration items={block.items} />
                ) : (
                  <div className={`mobile-grid mobile-${variant}__grid`}>
                    {block.items.map((item, index) => {
                      const Icon = icons[index % icons.length] ?? Smartphone;
                      return (
                        <article key={index}>
                          {variant === 'journey' ? (
                            <span className="mobile-step" aria-hidden="true">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          ) : variant === 'benefits' ? (
                            <Check className="mobile-item-icon" size={20} aria-hidden="true" />
                          ) : variant === 'platform' ? (
                            <Icon
                              className="mobile-item-icon"
                              size={27}
                              strokeWidth={1.4}
                              aria-hidden="true"
                            />
                          ) : null}
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </article>
                      );
                    })}
                  </div>
                )}
                {variant === 'services' && (
                  <div className="mobile-section-action">{contactLink}</div>
                )}
              </Container>
            </section>
          );
        }
        return (
          <ContentBlocks
            key={block.id}
            blocks={[block]}
            relatedServices={service.relatedServices}
            relatedProjects={service.relatedProjects}
            locale={locale}
          />
        );
      })}
    </div>
  );
}
