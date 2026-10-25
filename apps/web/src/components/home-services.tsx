import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ClipboardList,
  Globe2,
  ListChecks,
  Network,
} from 'lucide-react';
import { Container } from '@tevoniq/ui';
import { homeServices, type HomeService } from '@/content/home-services';
import './home-services.css';

const icons = {
  website: Globe2,
  workflow: ListChecks,
  automation: Network,
  dashboard: ChartNoAxesCombined,
};

function ServicePreview({ service, labels }: { service: HomeService['id']; labels: string[] }) {
  return (
    <div className={`sme-service-preview sme-service-preview--${service}`} aria-hidden="true">
      {service === 'website' ? (
        <div className="sme-mini-browser">
          <div className="sme-mini-toolbar">
            <span />
            <span />
            <span />
          </div>
          <div className="sme-mini-site">
            <Globe2 size={30} />
            <div>
              <strong>{labels[0]}</strong>
              <span className="sme-mini-line" />
              <span className="sme-mini-action">{labels[1]}</span>
            </div>
          </div>
        </div>
      ) : service === 'workflow' ? (
        <div className="sme-mini-workflow">
          {labels.map((label, index) => (
            <div key={label}>
              <span>{label}</span>
              <i>{index === 2 ? <Check size={16} /> : <ClipboardList size={16} />}</i>
              <span className="sme-mini-line" />
            </div>
          ))}
        </div>
      ) : service === 'automation' ? (
        <div className="sme-mini-automation">
          {[Globe2, ClipboardList, Bell].map((Icon, index) => (
            <div key={labels[index]}>
              <i>
                <Icon size={24} />
              </i>
              <span>{labels[index]}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="sme-mini-dashboard">
          <span>{labels[0]}</span>
          <div className="sme-mini-chart">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="sme-mini-legend">
            <span>{labels[1]}</span>
            <span>{labels[2]}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function HomeServices({ locale }: { locale: 'ar' | 'en' }) {
  const copy = homeServices[locale];
  return (
    <section
      id="solutions"
      className="sme-home-services"
      aria-labelledby="home-services-title"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <Container>
        <header className="sme-services-heading">
          <p className="sme-services-eyebrow">{copy.eyebrow}</p>
          <h2 id="home-services-title">{copy.title}</h2>
          <p>{copy.introduction}</p>
        </header>
        <div className="sme-services-grid">
          {copy.services.map((service, index) => {
            const Icon = icons[service.id];
            return (
              <article
                className="sme-service-card"
                key={service.id}
                aria-labelledby={`home-service-${service.id}`}
              >
                <div className="sme-service-top">
                  <span className="sme-service-icon">
                    <Icon size={25} aria-hidden="true" />
                  </span>
                  <span className="sme-service-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 id={`home-service-${service.id}`}>{service.title}</h3>
                <p className="sme-service-description">{service.description}</p>
                <ServicePreview service={service.id} labels={copy.previews[service.id]} />
                <p className="sme-service-example">
                  <span>{copy.exampleLabel}</span>
                  {service.example}
                </p>
                <details className="sme-service-details">
                  <summary>
                    {copy.details}
                    <ChevronDown size={17} aria-hidden="true" />
                  </summary>
                  <ul>
                    {service.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>
                <Link
                  className="sme-service-contact"
                  href={`/${locale}/contact?intent=quote`}
                  aria-label={`${copy.discuss}: ${service.title}`}
                >
                  {copy.discuss}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
        <footer className="sme-services-footer">
          <p>{copy.scope}</p>
          <Link href={`/${locale}/services`}>
            {copy.allServices}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </footer>
      </Container>
    </section>
  );
}
