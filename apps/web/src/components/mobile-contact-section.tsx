import { Heading } from '@tevoniq/ui';
import { Container } from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import type { ServiceBlock } from '@tevoniq/validation';
import { ArrowRight, MessageSquareText } from 'lucide-react';
import { leadCopy } from '@/content/leads';
import { getLeadOptions } from '@/lib/lead-options';
import { LeadForm } from './lead-form';
import './lead-form.css';

export async function MobileContactSection({
  locale,
  block,
}: {
  locale: Locale;
  block: Extract<ServiceBlock, { type: 'cta' }>;
}) {
  const options = await getLeadOptions(locale).catch(() => null);
  const copy = leadCopy[locale];
  return (
    <section id="mobile-contact" className="mobile-section mobile-contact" data-block-id={block.id}>
      <Container className="mobile-contact__layout">
        <div className="mobile-contact__form">
          <Heading as="h2">{block.title}</Heading>
          <p>{block.body}</p>
          {options ? (
            <LeadForm type="contact" locale={locale} options={options} />
          ) : (
            <div role="status">
              <p>{copy.unavailable}</p>
              <a className="mobile-button" href={`/${locale}${block.href}`}>
                {block.label}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
        <aside className="mobile-contact__aside">
          <MessageSquareText size={40} strokeWidth={1.4} aria-hidden="true" />
          <Heading as="h3">{copy.context}</Heading>
          <p>{copy.contextBody}</p>
          <a href={`/${locale}/request-quote`}>{copy.quoteLink}</a>
          <p className="mobile-contact__privacy">{copy.privacy}</p>
        </aside>
      </Container>
    </section>
  );
}
