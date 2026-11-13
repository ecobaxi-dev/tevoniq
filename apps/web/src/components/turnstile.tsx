'use client';
import { useNonce } from '@/components/nonce-provider';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
type Widget = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
export function Turnstile({
  siteKey,
  action,
  onToken,
  resetKey,
}: {
  siteKey: string;
  action: string;
  onToken: (token: string) => void;
  resetKey: number;
}) {
  const nonce = useNonce();
  const container = useRef<HTMLDivElement>(null),
    [ready, setReady] = useState(false),
    [started, setStarted] = useState(false);
  useEffect(() => {
    const form = container.current?.closest('form');
    if (!form) return;
    // Each widget waits for activity in its own form, including paste and autofill.
    const start = (event: Event) => {
      const field = event.target;
      if (
        (field instanceof HTMLInputElement ||
          field instanceof HTMLSelectElement ||
          field instanceof HTMLTextAreaElement) &&
        field.name !== 'website' &&
        field.name !== 'cf-turnstile-response' &&
        field.type !== 'hidden'
      )
        setStarted(true);
    };
    form.addEventListener('input', start);
    form.addEventListener('change', start);
    return () => {
      form.removeEventListener('input', start);
      form.removeEventListener('change', start);
    };
  }, []);
  useEffect(() => {
    const api = (window as Window & { turnstile?: Widget }).turnstile;
    if (!started || !ready || !container.current || !api) return;
    const id = api.render(container.current, {
      sitekey: siteKey,
      action,
      size: 'flexible',
      appearance: 'interaction-only',
      callback: onToken,
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
    });
    return () => api.remove(id);
  }, [started, ready, siteKey, action, onToken, resetKey]);
  return (
    <>
      {started && (
        <Script
          nonce={nonce}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          onReady={() => setReady(true)}
          onError={() => onToken('')}
        />
      )}
      <div ref={container} />
    </>
  );
}
