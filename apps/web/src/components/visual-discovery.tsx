import type { Locale } from '@tevoniq/types';
import { Container, Section, ButtonLink } from '@tevoniq/ui';
import { getServices } from '@/lib/services';
import { getSolutions } from '@/lib/solutions';
import { CatalogVisual } from './concept-visual';
import { visualLabels } from '@/config/concept-art';

type LinkedService = { id: string; slug: string; title: string; summary: string };
export async function VisualDiscovery({
  locale,
  serviceSlug,
  services = [],
}: {
  locale: Locale;
  serviceSlug?: string;
  services?: LinkedService[];
}) {
  // Discovery is optional: a catalog outage must not hide an otherwise healthy detail page.
  const [serviceResult, solutionResult] = await Promise.all([
    services.length ? Promise.resolve(null) : getServices(locale, 1, '').catch(() => null),
    serviceSlug
      ? getSolutions({ locale, page: 1, q: '', service: serviceSlug }).catch(() => null)
      : Promise.resolve(null),
  ]);
  const serviceItems = (services.length ? services : (serviceResult?.items ?? [])).filter(
    (s) => s.slug !== serviceSlug,
  );
  const records = serviceSlug
    ? (solutionResult?.items ?? [])
        .slice(0, 3)
        .map((s) => ({ ...s, title: s.name, summary: s.shortDescription, kind: 'solutions' }))
    : serviceItems.slice(0, 3).map((s) => ({ ...s, kind: 'services' }));
  const fallback = records.length
    ? records
    : serviceItems.slice(0, 3).map((s) => ({ ...s, kind: 'services' }));
  const l = visualLabels[locale];
  return (
    <Section className="visual-discovery" spacing="generous">
      <Container>
        <div className="visual-discovery-heading">
          <div>
            <h2 className="tv-h2">{l.explore}</h2>
            <p className="tv-description">{l.intro}</p>
          </div>
          <div className="visual-discovery-links">
            <ButtonLink variant="outline" href={`/${locale}/services`}>
              {l.services}
            </ButtonLink>
            <ButtonLink variant="outline" href={`/${locale}/solutions`}>
              {l.solutions}
            </ButtonLink>
          </div>
        </div>
        {fallback.length > 0 && (
          <div className="visual-discovery-grid">
            {fallback.map((item) => (
              <a
                className="visual-discovery-card"
                key={`${item.kind}-${item.id}`}
                href={`/${locale}/${item.kind}/${item.slug}`}
              >
                <CatalogVisual slug={item.slug} locale={locale} />
                <h3 className="tv-h3">{item.title}</h3>
                <p className="tv-description">{item.summary}</p>
                <span>
                  {l.view} <span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
                </span>
              </a>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
