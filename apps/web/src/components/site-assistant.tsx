'use client';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Bot, X, Send, RotateCcw, ArrowUpRight, ChevronDown, ShieldCheck } from 'lucide-react';
import './site-assistant.css';
type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; href: string }[];
};
export function SiteAssistant({
  locale,
  onDismiss,
}: {
  locale: 'ar' | 'en';
  onDismiss: () => void;
}) {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => (ar ? a : e);
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const request = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const question = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    dialog.current?.showModal();
    title.current?.focus({ preventScroll: true });
    return () => request.current?.abort();
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, busy, error]);
  useEffect(() => {
    const field = question.current;
    if (!field) return;
    field.style.height = 'auto';
    field.style.height = `${Math.min(field.scrollHeight, 112)}px`;
  }, [input]);
  function choosePrompt(prompt: string) {
    setInput(prompt);
    question.current?.focus();
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    if (busy || !consent || !input.trim()) return;
    const controller = new AbortController();
    request.current = controller;
    const message = input.trim();
    const history = messages
      .slice(-6)
      .map(({ role, content }) => ({ role, content: content.slice(0, 900) }));
    setMessages((previous) => [...previous.slice(-11), { role: 'user', content: message }]);
    setInput('');
    setError('');
    setBusy(true);
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, message, consent: true, history }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) {
        setError(
          response.status === 429
            ? t(
                'بلغ المساعد حد الاستخدام المؤقت. حاول لاحقًا أو تواصل معنا مباشرة.',
                'The assistant is temporarily at its usage limit. Try later or contact us directly.',
              )
            : t(
                'تعذّرت الإجابة الآن. يمكنك المحاولة لاحقًا أو التواصل معنا.',
                'An answer is unavailable right now. Please try later or contact us.',
              ),
        );
        return;
      }
      if (typeof data.answer !== 'string' || !data.answer.trim() || data.answer.length > 4000)
        throw new Error('Invalid reply');
      const sources = Array.isArray(data.sources)
        ? data.sources
            .filter((source: unknown): source is { title: string; href: string } => {
              if (!source || typeof source !== 'object') return false;
              const value = source as Record<string, unknown>;
              return (
                typeof value.title === 'string' &&
                value.title.length < 200 &&
                typeof value.href === 'string' &&
                new RegExp(`^/${locale}/[a-z0-9/-]+$`).test(value.href)
              );
            })
            .slice(0, 4)
        : [];
      setMessages((previous) => [
        ...previous.slice(-11),
        { role: 'assistant', content: data.answer, sources },
      ]);
    } catch {
      if (!controller.signal.aborted)
        setError(
          t(
            'تعذّر الاتصال بالمساعد. حاول مجددًا أو استخدم صفحة التواصل.',
            'Could not reach the assistant. Try again or use our contact page.',
          ),
        );
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  function reset() {
    request.current?.abort();
    request.current = null;
    setMessages([]);
    setInput('');
    setError('');
    setBusy(false);
    question.current?.focus();
  }
  return createPortal(
    <dialog
      ref={dialog}
      className="site-assistant-dialog"
      dir={ar ? 'rtl' : 'ltr'}
      lang={locale}
      aria-labelledby={`${id}-title`}
      onClose={onDismiss}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <header className="sa-head">
        <span className="sa-brand-icon">
          <Bot size={23} aria-hidden="true" />
        </span>
        <div className="sa-heading">
          <h2 ref={title} tabIndex={-1} id={`${id}-title`}>
            {t('مساعد TEVONIQ', 'TEVONIQ assistant')}
          </h2>
          <p>{t('دليلك الذكي لخدماتنا', 'AI guide to our services')}</p>
        </div>
        {(messages.length > 0 || error) && (
          <button
            type="button"
            className="sa-head-action"
            onClick={reset}
            title={t('محادثة جديدة', 'New conversation')}
            aria-label={t('محادثة جديدة', 'New conversation')}
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className="sa-head-action"
          onClick={() => dialog.current?.close()}
          aria-label={t('إغلاق المساعد', 'Close assistant')}
        >
          <X size={21} aria-hidden="true" />
        </button>
      </header>
      <div className={`sa-content${!messages.length ? ' is-empty' : ''}`}>
        {!messages.length && (
          <div className="sa-welcome">
            <span className="sa-welcome-icon" aria-hidden="true">
              <Bot size={32} strokeWidth={1.5} />
            </span>
            <h3>{t('كيف نساعدك اليوم؟', 'How can we help?')}</h3>
            <p>
              {t(
                'أخبرنا بما تريد تسهيله في عملك.',
                'Tell us what you want to make easier at work.',
              )}
            </p>
            <div className="sa-prompts" aria-label={t('أسئلة مقترحة', 'Suggested questions')}>
              {(ar
                ? [
                    ['موقع أعمال', 'أحتاج موقعًا لنشاطي، من أين أبدأ؟'],
                    ['نظام متابعة', 'كيف يساعدني نظام في تنظيم الطلبات ومتابعة العمل؟'],
                    ['أتمتة مهمة', 'كيف تقلّل الأتمتة العمل المتكرر؟'],
                  ]
                : [
                    ['Business website', 'I need a business website. Where do I start?'],
                    ['Work system', 'How can a system organise my requests and daily work?'],
                    ['Task automation', 'How can automation reduce repeated work?'],
                  ]
              ).map(([label, prompt]) => (
                <button key={label} type="button" onClick={() => choosePrompt(prompt!)}>
                  {label}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}
        <div
          className="sa-log"
          role="log"
          aria-label={t('المحادثة مع المساعد', 'Assistant conversation')}
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((message, index) => (
            <article key={index} className={`sa-message sa-${message.role}`}>
              <span className="sa-speaker">
                {message.role === 'user'
                  ? t('أنت', 'You')
                  : t('مساعد TEVONIQ', 'TEVONIQ assistant')}
              </span>
              <p dir="auto">{message.content}</p>
              {!!message.sources?.length && (
                <details className="sa-sources">
                  <summary>
                    {t('روابط قد تفيدك', 'Helpful pages')}
                    <span>{message.sources.length}</span>
                    <ChevronDown size={14} aria-hidden="true" />
                  </summary>
                  <nav aria-label={t('صفحات ذات صلة', 'Related pages')}>
                    {message.sources.map((source) => (
                      <Link
                        key={source.href}
                        href={source.href}
                        onClick={() => dialog.current?.close()}
                      >
                        {source.title}
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    ))}
                  </nav>
                </details>
              )}
            </article>
          ))}
        </div>
        {busy && (
          <p className="sa-status" role="status">
            <span aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {t('يكتب المساعد…', 'The assistant is typing…')}
          </p>
        )}
        {error && (
          <p className="sa-error" role="alert">
            {error}
          </p>
        )}
        <div ref={end} />
      </div>
      <form className="sa-form" onSubmit={send}>
        <label className="sa-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            disabled={busy}
          />
          <span>
            {t(
              'أوافق على معالجة رسائلي عبر Cloudflare.',
              'I agree to AI processing of my messages via Cloudflare.',
            )}
          </span>
        </label>
        <div className="sa-composer">
          <label className="sa-visually-hidden" htmlFor={`${id}-question`}>
            {t('سؤالك', 'Your question')}
          </label>
          <textarea
            ref={question}
            id={`${id}-question`}
            maxLength={800}
            rows={1}
            value={input}
            readOnly={busy}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('اكتب سؤالك هنا…', 'Type your question…')}
            enterKeyHint="send"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            className="sa-send"
            type="submit"
            disabled={busy || !consent || !input.trim()}
            aria-label={t('إرسال السؤال', 'Send question')}
            title={t('إرسال', 'Send')}
          >
            <Send size={19} aria-hidden="true" />
          </button>
        </div>
        <div className="sa-footer">
          <details className="sa-privacy">
            <summary>
              <ShieldCheck size={13} aria-hidden="true" />
              {t('الخصوصية وحدود المساعد', 'Privacy and AI limits')}
              <ChevronDown size={13} aria-hidden="true" />
            </summary>
            <div>
              <p>
                {t(
                  'تعالج Cloudflare الرسائل لإعداد الإجابة. لا تشارك كلمات مرور أو معلومات مالية أو حساسة. الإجابات مولّدة آليًا وقد تخطئ؛ نراجع تفاصيل التنفيذ معك.',
                  'Cloudflare processes messages to prepare a reply. Do not share passwords, financial or sensitive information. AI replies may be inaccurate; delivery details need our review.',
                )}
              </p>
              <Link href={`/${locale}/privacy-policy`} onClick={() => dialog.current?.close()}>
                {t('سياسة الخصوصية', 'Privacy policy')}
                <ArrowUpRight size={12} aria-hidden="true" />
              </Link>
            </div>
          </details>
          <Link
            className="sa-contact"
            href={`/${locale}/contact`}
            onClick={() => dialog.current?.close()}
          >
            {t('تواصل معنا', 'Contact us')}
            <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
