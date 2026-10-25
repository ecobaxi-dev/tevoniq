import { Heading } from '@tevoniq/ui';
import { Container, Section, ButtonLink } from '@tevoniq/ui';
import type { CompanyContent } from '@tevoniq/validation';
export function CompanyContentView({
  content,
  locale,
  partners = [],
  team = [],
}: {
  content: CompanyContent;
  locale: string;
  partners?: { id: string; title: string; description: string }[];
  team?: { id: string; title: string; role: string; bio: string }[];
}) {
  const href = /^\/(en|tr|ar)(\/|$)/.test(content.cta.href)
    ? content.cta.href
    : `/${locale}${content.cta.href}`;
  return (
    <>
      <Section className="company-hero">
        <Container>
          <p className="company-eyebrow">TEVONIQ</p>
          <Heading as="h1" className="tv-h1">
            {content.title}
          </Heading>
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
                <Heading as="h2" className="tv-h3">
                  {section.title}
                </Heading>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="company-cta">
        {team.length > 0 && (
          <Container>
            <div className="company-sections">
              {team.map((person) => (
                <article className="company-section" key={person.id}>
                  <Heading as="h2" className="tv-h3">
                    {person.title}
                  </Heading>
                  <p>
                    <strong>{person.role}</strong>
                  </p>
                  <p>{person.bio}</p>
                </article>
              ))}
            </div>
          </Container>
        )}
        {partners.length > 0 && (
          <Container>
            <div className="company-sections">
              {partners.map((partner) => (
                <article className="company-section" key={partner.id}>
                  <Heading as="h2" className="tv-h3">
                    {partner.title}
                  </Heading>
                  <p>{partner.description}</p>
                </article>
              ))}
            </div>
          </Container>
        )}
        <Container>
          <Heading as="h2" className="tv-h2">
            {content.cta.title}
          </Heading>
          <p>{content.cta.body}</p>
          <ButtonLink href={href}>{content.cta.label}</ButtonLink>
        </Container>
      </Section>
    </>
  );
}
