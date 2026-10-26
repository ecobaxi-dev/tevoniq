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
  MousePointer2,
  Send,
  Zap,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { Container } from '@tevoniq/ui';
import { homeServices, type HomeService } from '@/content/home-services';
import './home-services.css';
import { ServiceDemo } from './service-demo';

const icons = {
  website: Globe2,
  workflow: ListChecks,
  automation: Network,
  dashboard: ChartNoAxesCombined,
};

function ServicePreview({ service, labels }: { service: HomeService['id']; labels: string[] }) {
  return (
    <>
      {service === 'website' ? (
        <div className="service-web-scene">
          <div className="scene-browser">
            <div className="scene-browser-bar">
              <span />
              <span />
              <span />
              <small>your-business.example</small>
            </div>
            <div className="scene-web-nav">
              <Globe2 size={17} />
              <span>{labels[0]}</span>
              <i />
              <i />
            </div>
            <div className="scene-web-hero">
              <div>
                <strong>{labels[1]}</strong>
                <i className="scene-line" />
                <i className="scene-line short" />
                <span className="scene-web-button">
                  {labels[2]}
                  <Send size={11} />
                </span>
              </div>
              <div className="scene-web-art">
                <LayersArtwork />
              </div>
            </div>
            <div className="scene-web-tiles">
              <i />
              <i />
              <i />
            </div>
            <MousePointer2 className="scene-web-pointer" size={22} />
          </div>
          <div className="scene-phone">
            <span />
            <Globe2 size={17} />
            <i />
            <i />
            <b />
          </div>
          <div className="scene-confirmation">
            <Check size={16} />
            {labels[3]}
          </div>
          <span className="scene-device-label">{labels[4]}</span>
        </div>
      ) : service === 'workflow' ? (
        <div className="service-work-scene">
          <div className="scene-work-header">
            <ListChecks size={20} />
            <strong>{labels[4]}</strong>
            <Search size={15} />
          </div>
          <div className="scene-board">
            {labels.slice(0, 3).map((label, index) => (
              <div className="scene-board-column" key={label}>
                <span>
                  <i />
                  {label}
                </span>
                <div className="scene-ticket-ghost">
                  <i />
                  <i />
                  <b />
                </div>
                {index !== 1 && (
                  <div className="scene-ticket-ghost faint">
                    <i />
                    <i />
                  </div>
                )}
              </div>
            ))}
            <div className="scene-moving-ticket">
              <ClipboardList size={17} />
              <strong>{labels[3]}</strong>
              <i className="scene-line" />
              <span>
                <i />
                <i />
                <Check size={13} />
              </span>
            </div>
          </div>
          <div className="scene-work-timeline">
            <span />
            <i />
            <span />
            <i />
            <span>
              <Check size={11} />
            </span>
          </div>
        </div>
      ) : service === 'automation' ? (
        <div className="service-auto-scene">
          <div className="scene-auto-node scene-auto-input">
            <Globe2 size={22} />
            <strong>{labels[0]}</strong>
            <i />
            <i />
          </div>
          <div className="scene-auto-wire first">
            <span />
          </div>
          <div className="scene-auto-hub">
            <Zap size={29} />
            <span>{labels[3]}</span>
          </div>
          <div className="scene-auto-wire second">
            <span />
          </div>
          <div className="scene-auto-outputs">
            <div className="scene-auto-node">
              <ClipboardList size={20} />
              <strong>{labels[1]}</strong>
              <Check size={13} />
            </div>
            <div className="scene-auto-node scene-notification">
              <Bell size={20} />
              <strong>{labels[2]}</strong>
              <Check size={13} />
            </div>
          </div>
          <div className="scene-auto-caption">
            <Check size={14} />
            {labels[4]}
          </div>
        </div>
      ) : (
        <div className="service-data-scene">
          <div className="scene-data-header">
            <strong>{labels[0]}</strong>
            <span>
              <SlidersHorizontal size={12} />
              {labels[4]}
            </span>
          </div>
          <div className="scene-data-stats">
            {labels.slice(1, 4).map((label) => (
              <div key={label}>
                <span>{label}</span>
                <i />
                <b />
              </div>
            ))}
          </div>
          <div className="scene-data-charts">
            <div className="scene-data-bars">
              <span>{labels[1]}</span>
              <div>
                {[42, 72, 55, 88, 64, 80].map((height, i) => (
                  <i key={i} style={{ height: `${height}%` }} />
                ))}
              </div>
              <footer>
                <i />
                <i />
                <i />
              </footer>
            </div>
            <div className="scene-data-donut">
              <div>
                <ChartNoAxesCombined size={20} />
              </div>
              <span>{labels[2]}</span>
              <i />
              <i />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LayersArtwork() {
  return (
    <div className="scene-art-layers">
      <span />
      <span />
      <span />
      <Globe2 size={22} />
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
                className={`sme-service-card sme-service-card--${service.id}`}
                key={service.id}
                aria-labelledby={`home-service-${service.id}`}
              >
                <div className="sme-service-top">
                  <div className="sme-service-identity">
                    <span className="sme-service-icon">
                      <Icon size={25} aria-hidden="true" />
                    </span>
                    <span className="sme-service-kicker">{service.kicker}</span>
                  </div>
                  <span className="sme-service-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 id={`home-service-${service.id}`}>{service.title}</h3>
                <p className="sme-service-description">{service.description}</p>
                <ServiceDemo variant={service.id} replay={copy.replay} label={copy.animationLabel}>
                  <ServicePreview service={service.id} labels={copy.previews[service.id]} />
                </ServiceDemo>
                <ol className="sme-service-steps">
                  {service.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
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
                  aria-label={`${service.cta}: ${service.title}`}
                >
                  {service.cta}
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
