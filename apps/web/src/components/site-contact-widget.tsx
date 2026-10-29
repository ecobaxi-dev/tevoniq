'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, X, Send, ArrowUpRight } from 'lucide-react';
import { localizedHref } from '@/config/navigation';

export type SideContactDetails = { phone: string; whatsApp: string };
function WhatsAppMark() {
  return (
    <span className="sc-wa-mark" aria-hidden="true">
      <MessageCircle size={30} />
      <Phone size={14} />
    </span>
  );
}
export function SiteContactWidget({
  locale,
  details,
  children,
  className = '',
  inline = false,
}: {
  locale: 'ar' | 'en';
  details: SideContactDetails;
  children?: ReactNode;
  className?: string;
  inline?: boolean;
}) {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => (ar ? a : e);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const chat = useRef<HTMLDialogElement>(null);
  const normalized = details.phone.replace(/[\s().-]/g, '');
  const phone = /^\+?[1-9]\d{5,14}$/.test(normalized) ? normalized : '';
  const whatsapp = /^\+[1-9]\d{6,14}$/.test(details.whatsApp) ? details.whatsApp.slice(1) : '';
  const text =
    message.trim() ||
    t(
      'مرحبًا TEVONIQ، أود الاستفسار عن خدماتكم.',
      'Hello TEVONIQ, I would like to ask about your services.',
    );
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}` : '';
  useEffect(() => {
    if (!expanded) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setExpanded(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpanded(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [expanded]);
  const actions = (
    <div className="sc-actions" role="group" aria-label={t('خيارات التواصل', 'Contact options')}>
      {whatsapp && (
        <button
          type="button"
          className="sc-choice sc-whatsapp"
          ref={inline ? trigger : undefined}
          onClick={() => {
            setExpanded(false);
            chat.current?.showModal();
          }}
        >
          <WhatsAppMark />
          <span>{t('واتساب', 'WhatsApp')}</span>
        </button>
      )}
      {phone && (
        <a className="sc-choice sc-phone" href={`tel:${phone}`} onClick={() => setExpanded(false)}>
          <Phone size={27} aria-hidden="true" />
          <span>{t('اتصال مباشر', 'Call us')}</span>
        </a>
      )}
      {!phone && !whatsapp && (
        <p className="sc-unavailable">
          {t('يمكنك التواصل معنا عبر نموذج الموقع.', 'Please use our contact form.')}
        </p>
      )}
      <Link
        className="sc-contact-page"
        href={localizedHref(locale, '/contact')}
        onClick={() => setExpanded(false)}
      >
        {t('نموذج التواصل', 'Contact form')}
        <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
  return (
    <div ref={root} className={`site-contact-widget ${inline ? 'sc-inline' : ''}`}>
      {!inline && (
        <button
          ref={trigger}
          type="button"
          className={`${className} ${expanded ? 'sc-is-open' : ''}`}
          aria-label={t('خيارات التواصل', 'Contact options')}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          title={t('اتصل بنا', 'Contact us')}
        >
          {expanded ? <X size={24} aria-hidden="true" /> : children}
        </button>
      )}
      {(expanded || inline) && actions}
      <dialog
        ref={chat}
        className="sc-chat"
        aria-labelledby={inline ? 'sc-inline-title' : 'sc-chat-title'}
        onClose={() => trigger.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) chat.current?.close();
        }}
      >
        <header className="sc-chat-head">
          <WhatsAppMark />
          <div>
            <strong id={inline ? 'sc-inline-title' : 'sc-chat-title'}>
              {t('تواصل معنا عبر واتساب', 'Chat with us on WhatsApp')}
            </strong>
            <span>TEVONIQ</span>
          </div>
          <button
            type="button"
            aria-label={t('إغلاق نافذة واتساب', 'Close WhatsApp window')}
            onClick={() => chat.current?.close()}
          >
            <X size={21} />
          </button>
        </header>
        <div className="sc-chat-body">
          <div className="sc-greeting">
            {t(
              'مرحبًا بك في TEVONIQ 👋 كيف يمكننا مساعدتك؟',
              'Welcome to TEVONIQ 👋 How can we help you?',
            )}
          </div>
          <p>
            {t(
              'اكتب رسالتك، ثم تابع إلى واتساب لبدء المحادثة معنا.',
              'Write your message, then continue to WhatsApp to start the conversation.',
            )}
          </p>
        </div>
        <div className="sc-compose">
          <label htmlFor={inline ? 'sc-inline-message' : 'sc-message'}>
            {t('رسالتك', 'Your message')}
          </label>
          <textarea
            id={inline ? 'sc-inline-message' : 'sc-message'}
            value={message}
            maxLength={2000}
            rows={3}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t('كيف يمكننا مساعدتك؟', 'How can we help you?')}
          />
          {whatsappHref && (
            <a className="sc-start" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Send size={18} aria-hidden="true" />
              {t('متابعة في واتساب', 'Continue to WhatsApp')}
            </a>
          )}
          <small>
            {t(
              'تُفتح المحادثة في التطبيق أو واتساب ويب. لا تُرسل الرسالة تلقائيًا.',
              'Opens in the app or WhatsApp Web. Your message is not sent automatically.',
            )}
          </small>
        </div>
      </dialog>
    </div>
  );
}
