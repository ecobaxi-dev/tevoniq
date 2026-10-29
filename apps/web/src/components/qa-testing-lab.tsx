'use client';
import { useState } from 'react';
import { Play, RotateCcw, Check, X } from 'lucide-react';
import { qaScenarioIds, runQaExample, type QaScenario, type QaMode } from '@/lib/qa-lab';
import type { QaLocale } from '@/content/qa-automation';
const labels = {
  ar: {
    checkout: 'سلة المتجر',
    booking: 'حجز المواعيد',
    permissions: 'صلاحيات الاعتماد',
    total: 'كمية ٢ × سعر ٥٠ = ١٠٠',
    zero: 'رفض الكمية صفر',
    fraction: 'رفض الكمية الكسرية',
    limit: 'رفض تجاوز الحد ١٠',
    available: 'قبول الوقت المتاح 11:00',
    occupied: 'رفض الوقت المحجوز 10:00',
    empty: 'رفض الوقت الفارغ',
    supervisor: 'السماح للمشرف',
    employee: 'المنع للموظف',
    unknown: 'المنع للدور غير المعروف',
  },
  en: {
    checkout: 'Store basket',
    booking: 'Appointment booking',
    permissions: 'Approval permissions',
    total: 'Quantity 2 × price 50 = 100',
    zero: 'Reject zero quantity',
    fraction: 'Reject fractional quantity',
    limit: 'Reject quantity above 10',
    available: 'Accept available slot 11:00',
    occupied: 'Reject occupied slot 10:00',
    empty: 'Reject empty time',
    supervisor: 'Allow the supervisor',
    employee: 'Deny the employee',
    unknown: 'Deny an unknown role',
  },
};
export function QaTestingLab({ locale }: { locale: QaLocale }) {
  const ar = locale === 'ar',
    t = (a: string, e: string) => (ar ? a : e);
  const [scenario, setScenario] = useState<QaScenario>('checkout');
  const [mode, setMode] = useState<QaMode>('before');
  const [results, setResults] = useState<ReturnType<typeof runQaExample> | null>(null);
  const reset = () => setResults(null);
  const display = (value: number | boolean | null) =>
    value === null
      ? t('مرفوض', 'Rejected')
      : typeof value === 'boolean'
        ? value
          ? t('مسموح', 'Allowed')
          : t('ممنوع', 'Denied')
        : String(value);
  return (
    <div className="qa-lab">
      <div className="qa-lab-controls">
        <label htmlFor="qa-scenario">{t('اختر السيناريو', 'Choose a scenario')}</label>
        <select
          id="qa-scenario"
          value={scenario}
          onChange={(e) => {
            setScenario(e.target.value as QaScenario);
            reset();
          }}
        >
          {qaScenarioIds.map((id) => (
            <option key={id} value={id}>
              {labels[locale][id]}
            </option>
          ))}
        </select>
        <fieldset>
          <legend>{t('نسخة المثال', 'Example version')}</legend>
          {(['before', 'after'] as const).map((value) => (
            <label className="qa-mode" key={value}>
              <input
                type="radio"
                name="qa-mode"
                value={value}
                checked={mode === value}
                onChange={() => {
                  setMode(value);
                  reset();
                }}
              />
              {value === 'before'
                ? t('قبل التصحيح', 'Before the fix')
                : t('بعد التصحيح', 'After the fix')}
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          className="erp-primary"
          onClick={() => setResults(runQaExample(scenario, mode))}
        >
          <Play size={17} aria-hidden="true" />
          {t('شغّل الاختبارات', 'Run the checks')}
        </button>
        <button type="button" className="qa-reset" onClick={reset}>
          <RotateCcw size={16} aria-hidden="true" />
          {t('مسح النتائج', 'Clear results')}
        </button>
      </div>
      <div className="qa-lab-report">
        <div className="qa-report-bar">
          <span>TEVONIQ / QA LAB</span>
          <span>{t('مثال محلي', 'LOCAL EXAMPLE')}</span>
        </div>
        <div role="status" aria-live="polite" aria-atomic="true" className="qa-lab-status">
          {results
            ? t(
                `نجح ${results.filter((r) => r.passed).length} من ${results.length} اختبارات — ${mode === 'before' ? 'قبل التصحيح' : 'بعد التصحيح'}`,
                `${results.filter((r) => r.passed).length} of ${results.length} checks passed — ${mode === 'before' ? 'before' : 'after'} the fix`,
              )
            : t(
                'اختر نسخة المثال وشغّل الاختبارات لعرض النتائج.',
                'Choose a version and run the checks to see the results.',
              )}
        </div>
        {results && (
          <ul className="qa-results">
            {results.map((result) => (
              <li key={result.id} className={result.passed ? 'is-pass' : 'is-fail'}>
                <div>
                  {result.passed ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    <X size={18} aria-hidden="true" />
                  )}
                  <strong>{labels[locale][result.id as keyof typeof labels.ar]}</strong>
                  <span>{result.passed ? t('نجح', 'Passed') : t('فشل', 'Failed')}</span>
                </div>
                <p>
                  {t('المتوقع: ', 'Expected: ')}
                  {display(result.expected)}
                  <span aria-hidden="true"> · </span>
                  {t('الفعلي: ', 'Actual: ')}
                  {display(result.actual)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="qa-lab-boundary">
          {t(
            'تُنفّذ هذه الفحوص على قواعد برمجية تجريبية داخل متصفحك، دون اتصال بمتجر أو نظام فعلي أو إرسال بيانات. نجاحها لا يثبت جودة أي نموذج أو مشروع آخر.',
            'These checks run against sample rules in your browser. They do not contact a store or live system or send data. Passing them does not establish the quality of any other demo or project.',
          )}
        </p>
        <noscript>
          <p>
            {t(
              'المختبر يحتاج JavaScript لتشغيل الأمثلة. يمكنك قراءة الحالات والمراحل وبقية الصفحة بدونه.',
              'The lab needs JavaScript to run examples. Cases, stages and the rest of the page remain available without it.',
            )}
          </p>
        </noscript>
      </div>
    </div>
  );
}
