'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ListChecks, RotateCcw } from 'lucide-react';
import {
  cyberTopics,
  cyberStates,
  cyberPermissions,
  cyberLabels,
  cyberGuidance,
  cyberStartingPoint,
  cyberContactHref,
  type CyberInput,
} from '@/lib/cyber-guide';
import type { CyberLocale } from '@/content/cybersecurity';
export function CyberPriorityGuide({ locale }: { locale: CyberLocale }) {
  const ar = locale === 'ar',
    t = (a: string, e: string) => (ar ? a : e),
    initial: CyberInput = { topic: 'accounts', state: 'unknown', permission: 'pending' };
  const [input, setInput] = useState<CyberInput>(initial),
    [result, setResult] = useState<CyberInput | null>(null);
  const fields = [
    {
      key: 'topic' as const,
      title: t('ما الأولوية؟', 'What is the priority?'),
      values: cyberTopics,
    },
    {
      key: 'state' as const,
      title: t('ما الذي نعرفه عن الوضع؟', 'What do you know about the current setup?'),
      values: cyberStates,
    },
    {
      key: 'permission' as const,
      title: t('من يعتمد نطاق الوصول؟', 'Who can authorise access?'),
      values: cyberPermissions,
    },
  ];
  const guidance = result ? cyberGuidance[locale][cyberStartingPoint(result)] : null;
  return (
    <div className="cyber-guide">
      <form
        className="cyber-guide-form"
        onSubmit={(e) => {
          e.preventDefault();
          setResult({ ...input });
        }}
      >
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={`cyber-${field.key}`}>{field.title}</label>
            <select
              id={`cyber-${field.key}`}
              value={input[field.key]}
              onChange={(e) => {
                setInput({ ...input, [field.key]: e.target.value });
                setResult(null);
              }}
            >
              {field.values.map((value) => (
                <option key={value} value={value}>
                  {cyberLabels[locale][value]}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="submit" className="erp-primary">
          <ListChecks size={18} aria-hidden="true" />
          {t('اعرض الخطوة المقترحة', 'See a suggested next step')}
        </button>
        <button
          type="button"
          className="cyber-reset"
          onClick={() => {
            setInput(initial);
            setResult(null);
          }}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {t('ابدأ من جديد', 'Start again')}
        </button>
      </form>
      <div className="cyber-guide-result" aria-live="polite" aria-atomic="true">
        <p className="cyber-mini-label">{t('مرشد أولي للأولوية', 'INITIAL PRIORITY GUIDANCE')}</p>
        {guidance && result ? (
          <>
            <h3>{guidance[0]}</h3>
            <p>{guidance[1]}</p>
            <div className="cyber-guide-topic">
              <strong>{t('محور المراجعة', 'Review topic')}</strong>
              <p>{cyberLabels[locale][result.topic]}</p>
            </div>
            <Link className="erp-primary" href={cyberContactHref(locale, result)}>
              {t('ناقش هذه الخطوة', 'Discuss this next step')}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <ListChecks size={40} className="cyber-guide-icon" aria-hidden="true" />
            <h3>{t('ابدأ بوضع يمكن فهمه', 'Start with a setup you can understand')}</h3>
            <p>
              {t(
                'اختر المحور والمعلومات المتاحة والإذن. لا نطلب رابط نظام أو كلمة مرور أو ملفًا لتشغيل هذا المرشد.',
                'Choose a topic, current knowledge and permission. This guide asks for no system URL, password or file.',
              )}
            </p>
          </>
        )}
        <p className="cyber-guide-note">
          {t(
            'قواعد توضيحية محلية، لا تفحص جهازًا أو حسابًا ولا تمنح تقييم حماية أو شهادة امتثال. لا تُحفظ الاختيارات ولا تُرسل تلقائيًا.',
            'Local illustrative rules. This does not inspect a device or account, assign a security rating or certify compliance. Choices are not saved or sent automatically.',
          )}
        </p>
        <noscript>
          <p>
            {t(
              'يحتاج المرشد إلى JavaScript. تبقى الخدمات والدراسات والمراحل وروابط التواصل متاحة بدونه.',
              'The guide needs JavaScript. Services, scenarios, stages and contact links remain available without it.',
            )}
          </p>
        </noscript>
      </div>
    </div>
  );
}
