import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FileText, Globe2, UsersRound } from 'lucide-react';
import { ButtonLink, Container, CTA, Heading, Section } from '@tevoniq/ui';
import { AdvocasShowcase } from '@/components/advocas-showcase';
import { advocasCopy } from '@/content/advocas';
import { PageBreadcrumbs } from '@/components/seo/structured-data';

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'ar') return {};
  const copy = advocasCopy[locale];
  return {
    title: locale === 'ar' ? 'Advocas | منصات TEVONIQ' : 'Advocas | TEVONIQ platforms',
    description: copy.intro,
    alternates: {
      canonical: `/${locale}/advocas`,
      languages: { en: '/en/advocas', ar: '/ar/advocas' },
    },
  };
}
export default async function AdvocasPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'ar') notFound();
  const copy = advocasCopy[locale];
  const icons = [Globe2, UsersRound, FileText];
  return (
    <>
      <PageBreadcrumbs locale={locale} path="/advocas" />
      <main id="main-content">
        <AdvocasShowcase locale={locale} detail />
        <Section>
          <Container>
            <p className="tv-eyebrow">{copy.portfolio}</p>
            <Heading as="h2">{copy.featuresTitle}</Heading>
            <div className="advocas-features">
              {copy.features.map((feature, index) => {
                const Icon = icons[index]!;
                return (
                  <article className="advocas-feature" key={feature.title}>
                    <Icon size={28} aria-hidden="true" />
                    <Heading as="h3">{feature.title}</Heading>
                    <p>{feature.body}</p>
                  </article>
                );
              })}
            </div>
            <p className="advocas-note">{copy.note}</p>
          </Container>
        </Section>
        <Section tone="muted">
          <Container>
            <CTA
              title={copy.contactTitle}
              description={copy.contactBody}
              actions={<ButtonLink href={`/${locale}/contact`}>{copy.contact}</ButtonLink>}
            />
          </Container>
        </Section>
      </main>
    </>
  );
}
