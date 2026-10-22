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
    [ready, setReady] = useState(false);
  useEffect(() => {
    const api = (window as Window & { turnstile?: Widget }).turnstile;
    if (!ready || !container.current || !api) return;
    const id = api.render(container.current, {
      sitekey: siteKey,
      action,
      size: 'compact',
      callback: onToken,
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
    });
    return () => api.remove(id);
  }, [ready, siteKey, action, onToken, resetKey]);
  return (
    <>
      <Script
        nonce={nonce}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
        onError={() => onToken('')}
      />
      <div ref={container} />
    </>
  );
}
