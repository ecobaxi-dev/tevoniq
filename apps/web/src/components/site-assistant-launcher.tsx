'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Bot } from 'lucide-react';
const Assistant = dynamic(() => import('./site-assistant').then((module) => module.SiteAssistant), {
  ssr: false,
});
export function SiteAssistantLauncher({
  locale,
  inline = false,
}: {
  locale: 'ar' | 'en';
  inline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const label = locale === 'ar' ? 'مساعد TEVONIQ الذكي' : 'TEVONIQ AI assistant';
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={inline ? 'site-assistant-inline' : 'site-side-item tone-assistant'}
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        title={label}
      >
        <span className="site-side-icon">
          <Bot size={23} aria-hidden="true" />
        </span>
        <span className={inline ? '' : 'site-side-label'}>
          {locale === 'ar' ? 'المساعد الذكي' : 'AI assistant'}
        </span>
        {!inline && (
          <span className="site-side-tooltip" aria-hidden="true">
            {label}
          </span>
        )}
      </button>
      {open && (
        <Assistant
          locale={locale}
          onDismiss={() => {
            setOpen(false);
            requestAnimationFrame(() => trigger.current?.focus());
          }}
        />
      )}
    </>
  );
}
