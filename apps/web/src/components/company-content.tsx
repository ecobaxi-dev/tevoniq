import { Container, Section, ButtonLink } from '@tevoniq/ui';
import type { CompanyContent } from '@tevoniq/validation';
export function CompanyContentView({
  content,
  locale,
  partners = [],
}: {
  content: CompanyContent;
  locale: string;
  partners?: { id: string; title: string; description: string }[];
}) {
  const href = /^\/(en|tr|ar)(\/|$)/.test(content.cta.href)
    ? content.cta.href
    : `/${locale}${content.cta.href}`;
  return (
    <>
      <Section className="company-hero">
        <Container>
          <p className="company-eyebrow">TEVONIQ</p>
          <h1 className="tv-h1">{content.title}</h1>
          <p className="company-intro">{content.intro}</p>
          {content.foundingYear !== null && (
            <p>
              {
                ({ en: 'Founded', tr: 'Kuruluş', ar: 'سنة التأسيس' } as Record<string, string>)[
                  locale
                ]
              }
              : {content.foundingYear}
            </p>
          )}
          {content.geographicCoverage && <p>{content.geographicCoverage}</p>}
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="company-sections">
            {content.sections.map((section, index) => (
              <article className="company-section" key={index}>
                <span className="company-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="tv-h3">{section.title}</h2>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="company-cta">
        {partners.length > 0 && (
          <Container>
            <div className="company-sections">
              {partners.map((partner) => (
                <article className="company-section" key={partner.id}>
                  <h2 className="tv-h3">{partner.title}</h2>
                  <p>{partner.description}</p>
                </article>
              ))}
            </div>
          </Container>
        )}
        <Container>
          <h2 className="tv-h2">{content.cta.title}</h2>
          <p>{content.cta.body}</p>
          <ButtonLink href={href}>{content.cta.label}</ButtonLink>
        </Container>
      </Section>
    </>
  );
}
