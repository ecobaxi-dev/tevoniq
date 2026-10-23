'use client';
import { Heading } from '@tevoniq/ui';

import { useEffect, useRef, useState } from 'react';
const copy = {
  en: {
    confirm: 'Confirm subscription',
    unsubscribe: 'Unsubscribe',
    intro: 'Select the button below to complete your request.',
    done: 'Your request is complete.',
    invalid: 'This link is missing or invalid. Request a new subscription email.',
    failed:
      'Unable to complete this request. The link may have expired. Please try again or subscribe again.',
  },
  tr: {
    confirm: 'Aboneliği onayla',
    unsubscribe: 'Abonelikten çık',
    intro: 'İsteğinizi tamamlamak için aşağıdaki düğmeye basın.',
    done: 'İsteğiniz tamamlandı.',
    invalid: 'Bağlantı eksik veya geçersiz. Yeni bir abonelik e-postası isteyin.',
    failed:
      'İstek tamamlanamadı. Bağlantının süresi dolmuş olabilir. Tekrar deneyin veya yeniden abone olun.',
  },
  ar: {
    confirm: 'تأكيد الاشتراك',
    unsubscribe: 'إلغاء الاشتراك',
    intro: 'اضغط على الزر أدناه لإكمال طلبك.',
    done: 'تم إكمال طلبك.',
    invalid: 'الرابط مفقود أو غير صالح. اطلب رسالة اشتراك جديدة.',
    failed: 'تعذر إكمال الطلب. قد تكون صلاحية الرابط انتهت. حاول مرة أخرى أو اشترك مجددًا.',
  },
};
export function NewsletterTokenAction({
  action,
  locale,
}: {
  action: 'confirm' | 'unsubscribe';
  locale: 'en' | 'tr' | 'ar';
}) {
  const token = useRef(''),
    initialized = useRef(false);
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState('');
  const text = copy[locale];
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    token.current = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
    window.history.replaceState(null, '', window.location.pathname);
    setReady(/^[a-f0-9]{64}$/.test(token.current));
  }, []);
  async function submit() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/newsletter/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.current }),
      });
      if (!response.ok) throw Error();
      token.current = '';
      setDone(true);
    } catch {
      setError(text.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main-content" style={{ maxWidth: 640, margin: '5rem auto', padding: '2rem' }}>
      <Heading as="h1">{text[action]}</Heading>
      {done ? (
        <p role="status">{text.done}</p>
      ) : (
        <>
          <p>{ready ? text.intro : text.invalid}</p>
          <button className="tv-button" disabled={!ready || busy} onClick={() => void submit()}>
            {busy ? '…' : text[action]}
          </button>
          {error && <p role="alert">{error}</p>}
        </>
      )}
    </main>
  );
}
