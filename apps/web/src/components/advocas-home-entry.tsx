import Image from 'next/image';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { ButtonLink, Container, Heading } from '@tevoniq/ui';
import { advocasCopy } from '@/content/advocas';
import './advocas-home-entry.css';

export function AdvocasHomeEntry({ locale }: { locale: 'ar' | 'en' }) {
  const copy = advocasCopy[locale];
  return (
    <section id="advocas" className="advocas-home-entry" aria-labelledby="advocas-entry-title">
      <Container>
        <div className="advocas-entry-layout">
          <div className="advocas-entry-logo">
            <Image
              src="/brand/advocas-logo.png"
              width={1080}
              height={626}
              sizes="(max-width: 640px) 160px, 200px"
              alt={locale === 'ar' ? 'شعار المحامون' : 'Al Muhamoon — Advocas logo'}
            />
          </div>
          <div className="advocas-entry-copy">
            <Heading as="h2" id="advocas-entry-title">
              {copy.entryTitle}
            </Heading>
            <p>{copy.entryBody}</p>
          </div>
          <div className="advocas-entry-actions">
            <ButtonLink href={`/${locale}/advocas`} className="advocas-entry-discover">
              {copy.details}
              <ArrowUpRight size={18} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href={`/${locale}/contact?intent=quote`}
              variant="outline"
              className="advocas-entry-contact"
            >
              {copy.entryContact}
              <MessageCircle size={18} aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
