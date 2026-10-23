import { Heading } from '@tevoniq/ui';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Grid2X2,
  Layers3,
  MousePointer2,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { Container } from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import type { PublicService } from '@tevoniq/validation';
import { ContentBlocks } from './content-blocks';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './ui-ux-service.css';

const labels = {
  en: {
    wireframe: 'Structure',
    interface: 'Interface',
    prototype: 'A design in progress',
    process: 'The design process',
    illustration: 'Illustrative concepts',
  },
  tr: {
    wireframe: 'Yapı',
    interface: 'Arayüz',
    prototype: 'Gelişen bir tasarım',
    process: 'Tasarım süreci',
    illustration: 'Temsili kavramlar',
  },
  ar: {
    wireframe: 'البنية',
    interface: 'الواجهة',
    prototype: 'تصميم قيد التطوير',
    process: 'عملية التصميم',
    illustration: 'تصوّرات توضيحية',
  },
};

function DesignWorkbench({
  locale,
  variant = 'hero',
}: {
  locale: Locale;
  variant?: 'hero' | 'portal' | 'operations' | 'mobile';
}) {
  const ui = labels[locale];
  return (
    <div className={`ux-workbench ux-workbench--${variant}`} aria-hidden="true">
      <div className="ux-workbench__grid" />
      <div className="ux-workbench__draft">
        <span>{ui.wireframe}</span>
        <div className="ux-workbench__draft-bar" />
        <div className="ux-workbench__draft-layout">
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="ux-workbench__screen">
        <div className="ux-workbench__chrome">
          <span />
          <span />
          <span />
          <i />
        </div>
        <div className="ux-workbench__app">
          <div className="ux-workbench__sidebar">
            <Grid2X2 size={17} />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="ux-workbench__canvas">
            <span className="ux-workbench__screen-label">{ui.interface}</span>
            <div className="ux-workbench__title-line" />
            <div className="ux-workbench__tiles">
              <span>
                <Check size={21} />
                <i />
              </span>
              <span>
                <Layers3 size={21} />
                <i />
              </span>
            </div>
            <div className="ux-workbench__rows">
              <i />
              <i />
              <i />
            </div>
            <div className="ux-workbench__action">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
      <div className="ux-workbench__palette">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="ux-workbench__cursor">
        <MousePointer2 size={29} strokeWidth={1.5} />
      </div>
      <span className="ux-workbench__caption">{ui.prototype}</span>
    </div>
  );
}

export function UiUxService({ service, locale }: { service: PublicService; locale: Locale }) {
  const ui = labels[locale];
  const contact = service.blocks.find((block) => block.type === 'cta');
  const disciplineIcons = [Search, MousePointer2, Layers3, Sparkles];
  return (
    <div className="ux-service" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <StructuredData
        data={faqData(service.blocks.flatMap((block) => (block.type === 'faq' ? block.items : [])))}
      />
      {service.blocks.map((block) => {
        if (block.type === 'hero')
          return (
            <section key={block.id} className="ux-hero" data-block-id={block.id}>
              <Container className="ux-hero__layout">
                <div className="ux-hero__copy">
                  <p className="ux-eyebrow">{service.title}</p>
                  <Heading as="h1">{block.title}</Heading>
                  <p className="ux-hero__description">{block.description}</p>
                  {contact?.type === 'cta' && (
                    <a className="ux-button" href={`/${locale}${contact.href}`}>
                      {contact.label}
                      <ArrowUpRight size={20} aria-hidden="true" />
                    </a>
                  )}
                </div>
                <DesignWorkbench locale={locale} />
              </Container>
            </section>
          );
        if (block.type === 'overview')
          return (
            <section key={block.id} className="ux-overview ux-section" data-block-id={block.id}>
              <Container className="ux-overview__layout">
                <Heading as="h2">{block.title}</Heading>
                <p>{block.body}</p>
              </Container>
            </section>
          );
        if (block.type === 'benefits')
          return (
            <section key={block.id} className="ux-benefits ux-section" data-block-id={block.id}>
              <Container>
                <Heading as="h2">{block.title}</Heading>
                <div className="ux-benefits__grid">
                  {block.items.map((item, index) => (
                    <article key={index}>
                      <span className="ux-number" aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <Heading as="h3">{item.title}</Heading>
                        <p>{item.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </Container>
            </section>
          );
        if (block.type === 'capabilities')
          return (
            <section key={block.id} className="ux-process ux-section" data-block-id={block.id}>
              <Container className="ux-process__layout">
                <div>
                  <p className="ux-eyebrow">{ui.process}</p>
                  <Heading as="h2">{block.title}</Heading>
                  <div className="ux-process__diagram" aria-hidden="true">
                    <Search />
                    <span />
                    <Grid2X2 />
                    <span />
                    <Check />
                  </div>
                </div>
                <div className="ux-process__steps">
                  {block.items.map((item, index) => (
                    <details key={index} open={index === 0}>
                      <summary>
                        <span className="ux-number" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <Heading as="h3">{item.title}</Heading>
                        <Plus size={21} aria-hidden="true" />
                      </summary>
                      <p>{item.description}</p>
                    </details>
                  ))}
                </div>
              </Container>
            </section>
          );
        if (block.type === 'features')
          return (
            <section key={block.id} className="ux-disciplines ux-section" data-block-id={block.id}>
              <Container>
                <Heading as="h2">{block.title}</Heading>
                <div className="ux-disciplines__grid">
                  {block.items.map((item, index) => {
                    const Icon = disciplineIcons[index] ?? Layers3;
                    return (
                      <article key={index}>
                        <Icon size={31} strokeWidth={1.3} aria-hidden="true" />
                        <Heading as="h3">{item.title}</Heading>
                        <p>{item.description}</p>
                      </article>
                    );
                  })}
                </div>
              </Container>
            </section>
          );
        if (block.type === 'use-cases')
          return (
            <section key={block.id} className="ux-scenarios ux-section" data-block-id={block.id}>
              <Container>
                <div className="ux-section-heading">
                  <Heading as="h2">{block.title}</Heading>
                  <span>{ui.illustration}</span>
                </div>
                <div className="ux-scenarios__grid">
                  {block.items.map((item, index) => (
                    <article key={index}>
                      <DesignWorkbench
                        locale={locale}
                        variant={
                          (['portal', 'operations', 'mobile'] as const)[index % 3] ?? 'portal'
                        }
                      />
                      <div className="ux-scenarios__copy">
                        <Heading as="h3">{item.title}</Heading>
                        <p>{item.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </Container>
            </section>
          );
        if (block.type === 'faq')
          return (
            <section key={block.id} className="ux-faq ux-section" data-block-id={block.id}>
              <Container className="ux-faq__layout">
                <Heading as="h2">{block.title}</Heading>
                <div>
                  {block.items.map((item, index) => (
                    <details key={index}>
                      <summary>
                        <Heading as="h3">{item.question}</Heading>
                        <Plus size={19} aria-hidden="true" />
                      </summary>
                      <p>{item.answer}</p>
                    </details>
                  ))}
                </div>
              </Container>
            </section>
          );
        if (block.type === 'cta')
          return (
            <section key={block.id} className="ux-contact ux-section" data-block-id={block.id}>
              <Container className="ux-contact__layout">
                <div>
                  <Heading as="h2">{block.title}</Heading>
                  <p>{block.body}</p>
                </div>
                <a className="ux-button" href={`/${locale}${block.href}`}>
                  {block.label}
                  <ArrowUpRight size={20} aria-hidden="true" />
                </a>
              </Container>
            </section>
          );
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
