import { ConceptVisual } from './concept-visual';
import type { ConceptArt } from '@/config/concept-art';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import { Container, Section, Card, ButtonLink, CTA, Accordion } from '@tevoniq/ui';
import type { PublicService } from '@tevoniq/validation';
import type { Locale } from '@tevoniq/types';
import { BrandImage } from './brand-image';
import { brandAssets } from '@/config/assets';
export function ContentBlocks({
  blocks,
  relatedServices,
  relatedProjects,
  locale,
  art,
}: {
  blocks: PublicService['blocks'];
  relatedServices: PublicService['relatedServices'];
  relatedProjects: PublicService['relatedProjects'];
  locale: Locale;
  art?: ConceptArt | undefined;
}) {
  return (
    <>
      <StructuredData data={faqData(blocks.flatMap((b) => (b.type === 'faq' ? b.items : [])))} />
      {blocks.map((block) => {
        if (block.type === 'hero')
          return (
            <Section key={block.id} tone="navy" spacing="generous" className="service-hero">
              <Container>
                <div className="service-hero-grid">
                  <div>
                    <h1 className="tv-h1">{block.title}</h1>
                    <p className="tv-description">{block.description}</p>
                  </div>
                  {block.assetKey === 'brand-icon' && art ? (
                    <ConceptVisual art={art} locale={locale} hero />
                  ) : block.assetKey !== 'none' ? (
                    <BrandImage
                      asset={
                        block.assetKey === 'home' ? brandAssets.hero.home : brandAssets.icons.brand
                      }
                      alt=""
                      sizes="(max-width: 768px) 80vw, 35vw"
                    />
                  ) : null}
                </div>
              </Container>
            </Section>
          );
        if (block.type === 'cta')
          return (
            <Section key={block.id}>
              <Container>
                <CTA
                  title={block.title}
                  description={block.body}
                  actions={<ButtonLink href={`/${locale}${block.href}`}>{block.label}</ButtonLink>}
                />
              </Container>
            </Section>
          );
        if (block.type === 'related-services' || block.type === 'related-projects') {
          const collection = block.type === 'related-services' ? relatedServices : relatedProjects;
          const records = block.ids.flatMap((id) => {
            const record = collection.find((item) => item.id === id);
            return record ? [record] : [];
          });
          if (!records.length) return null;
          return (
            <Section key={block.id}>
              <Container>
                <h2 className="tv-h2">{block.title}</h2>
                <div className="services-grid">
                  {records.map((item) => (
                    <Card key={item.id}>
                      <h3 className="tv-h3">
                        {block.type === 'related-services' ? (
                          <a href={`/${locale}/services/${item.slug}`}>{item.title}</a>
                        ) : (
                          <a href={`/${locale}/projects/${item.slug}`}>{item.title}</a>
                        )}
                      </h3>
                      <p className="tv-description">{item.summary}</p>
                    </Card>
                  ))}
                </div>
              </Container>
            </Section>
          );
        }
        return (
          <Section key={block.id} className="service-content-section">
            <Container width="narrow">
              <h2 className="tv-h2">{block.title}</h2>
              {block.type === 'overview' ? (
                <p className="service-prose">{block.body}</p>
              ) : block.type === 'faq' ? (
                <Accordion
                  items={block.items.map((item, index) => ({
                    value: String(index),
                    title: item.question,
                    content: <p className="service-prose">{item.answer}</p>,
                  }))}
                />
              ) : 'items' in block ? (
                <div className="service-items">
                  {block.items.map((item, index) => (
                    <Card key={index}>
                      <h3 className="tv-h3">{item.title}</h3>
                      <p className="tv-description service-prose">{item.description}</p>
                    </Card>
                  ))}
                </div>
              ) : null}
            </Container>
          </Section>
        );
      })}
    </>
  );
}
