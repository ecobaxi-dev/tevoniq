'use client';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Bot, X, Send, RotateCcw } from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    dialog.current?.showModal();
    return () => request.current?.abort();
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, busy, error]);
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
  }
  return (
    <dialog
      ref={dialog}
      className="site-assistant-dialog"
      dir={ar ? 'rtl' : 'ltr'}
      aria-labelledby={`${id}-title`}
      onClose={onDismiss}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <header className="sa-head">
        <Bot size={30} aria-hidden="true" />
        <div>
          <h2 id={`${id}-title`}>{t('مساعد TEVONIQ الذكي', 'TEVONIQ AI assistant')}</h2>
          <p>
            {t('دليل لخدماتنا وأسئلتك التقنية', 'A guide to our services and technical questions')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label={t('إغلاق المساعد', 'Close assistant')}
        >
          <X size={22} />
        </button>
      </header>
      <div className="sa-content">
        <p className="sa-intro">
          {t(
            'أهلًا بك! أخبرنا بنشاطك وما ترغب في تنظيمه أو تطويره. إجابات هذا المساعد مولّدة آليًا وقد تخطئ؛ تفاصيل التنفيذ تُراجع معنا.',
            'Welcome! Tell us about your business and what you want to organise or build. This AI assistant can make mistakes; delivery details need our review.',
          )}
        </p>
        {!messages.length && (
          <div className="sa-prompts">
            {(ar
              ? [
                  'أحتاج موقعًا لنشاطي، من أين أبدأ؟',
                  'كيف تقلّل الأتمتة العمل المتكرر؟',
                  'ما الفرق بين نظام العمل ولوحة المعلومات؟',
                ]
              : [
                  'I need a business website. Where do I start?',
                  'How can automation reduce repeated work?',
                  'What is the difference between a work system and a dashboard?',
                ]
            ).map((prompt) => (
              <button key={prompt} type="button" onClick={() => setInput(prompt)}>
                {prompt}
              </button>
            ))}
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
                  : t('مساعد TEVONIQ · ذكاء اصطناعي', 'TEVONIQ · AI')}
              </span>
              <p>{message.content}</p>
              {!!message.sources?.length && (
                <nav aria-label={t('صفحات ذات صلة', 'Related pages')}>
                  {message.sources.map((source) => (
                    <Link
                      key={source.href}
                      href={source.href}
                      onClick={() => dialog.current?.close()}
                    >
                      {source.title} ↗
                    </Link>
                  ))}
                </nav>
              )}
            </article>
          ))}
        </div>
        {busy && (
          <p className="sa-status" role="status">
            {t('جارٍ إعداد الإجابة…', 'Preparing an answer…')}
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
              'أوافق على إرسال رسائلي إلى Cloudflare لمعالجتها بالمساعد.',
              'I agree to send my messages to Cloudflare for AI processing.',
            )}{' '}
            <Link href={`/${locale}/privacy-policy`} onClick={() => dialog.current?.close()}>
              {t('الخصوصية', 'Privacy')}
            </Link>
          </span>
        </label>
        <small>
          {t(
            'لا تكتب كلمات مرور أو بيانات مالية أو معلومات حساسة.',
            'Do not share passwords, financial data or sensitive information.',
          )}
        </small>
        <label className="sa-question-label" htmlFor={`${id}-question`}>
          {t('سؤالك', 'Your question')}
        </label>
        <textarea
          id={`${id}-question`}
          maxLength={800}
          rows={2}
          value={input}
          readOnly={busy}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t(
            'اكتب سؤالك عن خدماتنا أو احتياجك التقني…',
            'Ask about our services or your technical needs…',
          )}
        />
        <div className="sa-form-actions">
          <button className="sa-send" type="submit" disabled={busy || !consent || !input.trim()}>
            <Send size={17} aria-hidden="true" />
            {t('إرسال', 'Send')}
          </button>
          <button type="button" className="sa-reset" onClick={reset}>
            <RotateCcw size={16} aria-hidden="true" />
            {t('محادثة جديدة', 'New conversation')}
          </button>
          <Link href={`/${locale}/contact`} onClick={() => dialog.current?.close()}>
            {t('تواصل معنا', 'Contact us')}
          </Link>
        </div>
      </form>
    </dialog>
  );
}
