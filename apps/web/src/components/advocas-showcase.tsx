import { ArrowUpRight, Globe2, Scale } from 'lucide-react';
import { Container, Heading, Section } from '@tevoniq/ui';
import { ADVOCAS_URL, advocasCopy } from '@/content/advocas';
import './advocas.css';

export function AdvocasShowcase({
  locale,
  detail = false,
}: {
  locale: 'en' | 'ar';
  detail?: boolean;
}) {
  const copy = advocasCopy[locale];
  return (
    <Section className="advocas-showcase" id="advocas">
      <Container>
        {!detail && (
          <div className="advocas-section-intro">
            <p className="tv-eyebrow">{copy.portfolio}</p>
            <Heading as="h2">{copy.homeTitle}</Heading>
            <p>{copy.homeBody}</p>
          </div>
        )}
        <div className="advocas-card">
          <div className="advocas-card-copy">
            <p className="advocas-category">{copy.category}</p>
            <p className="advocas-wordmark" dir="ltr">
              <Scale aria-hidden="true" size={32} />
              Advocas<span>.online</span>
            </p>
            <Heading as={detail ? 'h1' : 'h3'}>{copy.title}</Heading>
            <p>{copy.intro}</p>
            <div className="advocas-actions">
              <a
                className="tv-button"
                data-variant="primary"
                data-size="md"
                href={detail ? ADVOCAS_URL : `/${locale}/advocas`}
                {...(detail
                  ? {
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      'aria-label': `${copy.visit} — ${copy.newTab}`,
                    }
                  : {})}
              >
                {detail ? copy.visit : copy.details}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              {detail && <a href={`/${locale}/contact`}>{copy.contact}</a>}
            </div>
          </div>
          <aside className="advocas-journey" aria-label={copy.choose}>
            <Globe2 size={38} strokeWidth={1.4} aria-hidden="true" />
            <Heading as={detail ? 'h2' : 'h4'}>{copy.choose}</Heading>
            <p>{copy.chooseBody}</p>
            <ol>
              {copy.steps.map((step, index) => (
                <li key={step}>
                  <span aria-hidden="true">0{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <span className="advocas-domain" dir="ltr">
              www.advocas.online
            </span>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
