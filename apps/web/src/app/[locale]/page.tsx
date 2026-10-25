import { Heading } from '@tevoniq/ui';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { ReferenceHero } from '@/components/reference-hero';
import { PestoHomeEntry } from '@/components/pesto-page';
import { notFound } from 'next/navigation';
import { localeSchema } from '@tevoniq/validation';
import {
  ArrowUpRight,
  ArrowRight,
  BrainCircuit,
  Cloud,
  ShieldCheck,
  Layers3,
  Code2,
  Network,
  Cpu,
} from 'lucide-react';
import { Container, Section, SectionHeader, ButtonLink, ServiceCard, Card, CTA } from '@tevoniq/ui';
import { HomeEntrances } from '@/components/home-entrances';
import { ConnectedThinking } from '@/components/connected-thinking';
import { SolutionsVisual } from '@/components/solutions-visual';
import { TechnologyEcosystem } from '@/components/technology-ecosystem';
import { WhyTevoniq } from '@/components/why-tevoniq';
import { AdvocasShowcase } from '@/components/advocas-showcase';
import { DeliveryApproach } from '@/components/delivery-approach';
import { HomeServices } from '@/components/home-services';

import { getHomeContent } from '@/lib/home';
import { localizedHref } from '@/config/navigation';
import './home.css';
const solutionIcons = [BrainCircuit, Cloud, ShieldCheck, Layers3, Code2, Network];
type PageProps = { params: Promise<{ locale: string }> };
async function baseMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) return {};
  const { copy } = await getHomeContent(locale.data);
  return {
    title: `TEVONIQ | ${copy.headline}`,
    description: copy.introduction,
    alternates: { canonical: `/${locale.data}`, languages: { en: '/en', tr: '/tr', ar: '/ar' } },
  };
}
async function PublicPage({ params }: PageProps) {
  const parsed = localeSchema.safeParse((await params).locale);
  if (!parsed.success) notFound();
  const locale = parsed.data;
  const { copy, hero, collections } = await getHomeContent(locale);
  const href = (path: string) => localizedHref(locale, path);

  return (
    <div className="home-page" data-theme="light">
      <main id="main-content">
        <ReferenceHero locale={locale} copy={hero} />
        {locale !== 'tr' && <HomeServices locale={locale} />}
        <PestoHomeEntry locale={locale} />
        <HomeEntrances>
          {locale === 'tr' && (
            <Section
              id="solutions"
              tone="muted"
              spacing="compact"
              className="home-solutions-section"
            >
              <Container className="home-solutions-layout">
                <div data-entrance className="home-solutions-intro">
                  <SectionHeader eyebrow={copy.solutionsLabel} title={copy.solutionsTitle} />
                  <p className="tv-description">{copy.introduction}</p>
                  <a className="home-section-link" href={href('/solutions')}>
                    {copy.explore}
                    <ArrowRight size={18} aria-hidden="true" />
                  </a>
                  <SolutionsVisual />
                </div>
                <div className="home-solutions">
                  {copy.solutions.map((solution, index) => {
                    const Icon = solutionIcons[index] ?? Cpu;
                    return (
                      <div data-entrance key={solution.title}>
                        <ServiceCard {...solution} icon={<Icon size={26} />} />
                      </div>
                    );
                  })}
                </div>
              </Container>
            </Section>
          )}
          <DeliveryApproach locale={locale} />
          <TechnologyEcosystem locale={locale} copy={copy} />
          <WhyTevoniq locale={locale} copy={copy} />
          <ConnectedThinking locale={locale} copy={copy} />
          {locale === 'en' && <AdvocasShowcase locale="en" />}
          {(['industries', 'projects', 'partners', 'insights'] as const).map(
            (key) =>
              collections[key].length > 0 && (
                <Section key={key} id={key} spacing="generous">
                  <Container>
                    <div data-entrance>
                      <div className="home-collection-heading">
                        <SectionHeader title={copy[key]} />
                        <a
                          className="home-section-link"
                          href={href(key === 'partners' ? '/company/partners' : `/${key}`)}
                        >
                          {locale === 'ar'
                            ? 'عرض الكل'
                            : locale === 'tr'
                              ? 'Tümünü gör'
                              : 'View all'}
                          <ArrowRight size={18} aria-hidden="true" />
                        </a>
                      </div>
                      <div className="home-records">
                        {collections[key].map((record) => (
                          <Card key={record.id}>
                            <Heading as="h3" className="tv-h3">
                              <a href={href(record.href)}>{record.title}</a>
                            </Heading>
                            <p className="tv-description">{record.description}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </Container>
                </Section>
              ),
          )}
          <Section spacing="compact" className="home-closing">
            <Container>
              <div data-entrance>
                <CTA
                  title={copy.cta}
                  description={copy.ctaBody}
                  actions={
                    <>
                      <ButtonLink href={href('/contact')} size="lg">
                        {copy.contact}
                        <ArrowUpRight size={20} aria-hidden="true" />
                      </ButtonLink>
                      <ButtonLink href={href('/solutions')} variant="outline">
                        {copy.explore}
                      </ButtonLink>
                    </>
                  }
                />
              </div>
            </Container>
          </Section>
        </HomeEntrances>
      </main>
    </div>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/'.replace('[slug]', Array.isArray(slug) ? slug.join('/') : String(slug));
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
