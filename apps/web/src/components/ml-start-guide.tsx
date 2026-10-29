'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Compass, RotateCcw } from 'lucide-react';
import {
  mlGoals,
  mlDataStates,
  mlAccessStates,
  mlGuideLabels,
  mlRecommendations,
  recommendMlStart,
  mlGuideContactHref,
  type MlGuideInput,
} from '@/lib/ml-guide';
import type { MlLocale } from '@/content/machine-learning';
export function MlStartGuide({ locale }: { locale: MlLocale }) {
  const ar = locale === 'ar',
    t = (a: string, e: string) => (ar ? a : e);
  const initial: MlGuideInput = { goal: 'knowledge', data: 'sample', access: 'approved' };
  const [input, setInput] = useState<MlGuideInput>(initial);
  const [result, setResult] = useState<MlGuideInput | null>(null);
  const labels = mlGuideLabels[locale];
  const fields = [
    {
      key: 'goal' as const,
      title: t('ما المهمة التي تريد تحسينها؟', 'Which task do you want to improve?'),
      options: mlGoals,
    },
    {
      key: 'data' as const,
      title: t('ما حالة البيانات؟', 'What data is available?'),
      options: mlDataStates,
    },
    {
      key: 'access' as const,
      title: t('هل حُسم إذن استخدام البيانات؟', 'Is data use authorised?'),
      options: mlAccessStates,
    },
  ];
  const recommendation = result ? mlRecommendations[locale][recommendMlStart(result)] : null;
  return (
    <div className="ml-guide">
      <form
        className="ml-guide-form"
        onSubmit={(event) => {
          event.preventDefault();
          setResult({ ...input });
        }}
      >
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={`ml-${field.key}`}>{field.title}</label>
            <select
              id={`ml-${field.key}`}
              value={input[field.key]}
              onChange={(event) => {
                setInput({ ...input, [field.key]: event.target.value });
                setResult(null);
              }}
            >
              {field.options.map((id) => (
                <option key={id} value={id}>
                  {labels[id]}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button className="erp-primary" type="submit">
          <Compass size={18} aria-hidden="true" />
          {t('اعرض نقطة البداية', 'Find a starting point')}
        </button>
        <button
          className="ml-reset"
          type="button"
          onClick={() => {
            setInput(initial);
            setResult(null);
          }}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {t('ابدأ من جديد', 'Start again')}
        </button>
      </form>
      <div className="ml-guide-result" aria-live="polite" aria-atomic="true">
        <p className="ml-mini-label">
          {t('اقتراح أولي حسب اختياراتك', 'INITIAL GUIDANCE BASED ON YOUR CHOICES')}
        </p>
        {recommendation && result ? (
          <>
            <h3>{recommendation.title}</h3>
            <p>{recommendation.text}</p>
            <div className="ml-guide-output">
              <strong>{t('مخرج البداية', 'Starting deliverable')}</strong>
              <p>{recommendation.output}</p>
            </div>
            <Link className="erp-primary" href={mlGuideContactHref(locale, result)}>
              {t('ناقش هذه البداية', 'Discuss this starting point')}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <Compass size={40} className="ml-guide-compass" aria-hidden="true" />
            <h3>
              {t('تجربة مناسبة تبدأ بسؤال واضح', 'A useful pilot starts with a clear question')}
            </h3>
            <p>
              {t(
                'اختر المهمة وحالة البيانات والإذن، ثم اعرض اقتراح البداية. لا تحتاج إلى إدخال بيانات أو رفع ملفات.',
                'Choose the task, data readiness and permission, then view suggested next steps. No records or files are needed.',
              )}
            </p>
          </>
        )}
        <p className="ml-guide-limit">
          {t(
            'مرشد بقواعد ثابتة، وليس تقييمًا من نموذج ذكاء اصطناعي أو عرض سعر. تُراجع التوصية بعد فحص المتطلبات والبيانات. لا تُحفظ الاختيارات ولا تُرسل تلقائيًا.',
            'A rule-based guide, not a model evaluation or quotation. Recommendations need a requirements and data review. Choices are not saved or sent automatically.',
          )}
        </p>
        <noscript>
          <p>
            {t(
              'يحتاج المرشد إلى JavaScript. يمكنك قراءة دراسات السيناريوهات والمراحل والتواصل معنا مباشرة بدونه.',
              'The guide needs JavaScript. Scenarios, stages and direct contact remain available without it.',
            )}
          </p>
        </noscript>
      </div>
    </div>
  );
}
