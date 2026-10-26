'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Play,
  RotateCcw,
  Check,
  X,
  Clock3,
  GitBranch,
  Zap,
  FileCheck2,
  Link2,
  ShieldCheck,
  CircleDot,
} from 'lucide-react';
import {
  automationCases,
  defaultAutomationInput,
  type AutomationCase,
  type AutomationInput,
  type AutomationLocale,
} from '@/content/automation-cases';
import {
  appendAutomationReceipt,
  runAutomationDemo,
  type AutomationReceipt,
  type AutomationResult,
  type StepStatus,
} from '@/lib/automation-demo';
import { PreviewDialog } from './preview-dialog';
import './automation-demos.css';
const nodeIcons = [Zap, ShieldCheck, GitBranch, Link2, FileCheck2];
export function AutomationPreview({
  model,
  locale,
}: {
  model: AutomationCase;
  locale: AutomationLocale;
}) {
  const ar = locale === 'ar',
    c = model[locale],
    initial = () => ({
      ...defaultAutomationInput(model.slug),
      description: ar
        ? 'أرغب في معرفة تفاصيل الخدمة.'
        : 'I would like to know more about the service.',
    });
  const [input, setInput] = useState<AutomationInput>(initial),
    [ledger, setLedger] = useState<AutomationReceipt[]>([]),
    [result, setResult] = useState<AutomationResult | null>(null),
    [steps, setSteps] = useState<StepStatus[]>(() => c.steps.map(() => 'idle')),
    [activeStep, setActiveStep] = useState(-1),
    [running, setRunning] = useState(false),
    [failure, setFailure] = useState(false),
    [resetOpen, setResetOpen] = useState(false),
    [attempts, setAttempts] = useState<{ eventId: string; outcome: string }[]>([]);
  const operation = useRef(0),
    output = useRef<HTMLElement>(null);
  useEffect(
    () => () => {
      operation.current++;
    },
    [],
  );
  const labels: Record<keyof AutomationInput, string> = {
    eventId: ar ? 'رقم الحدث' : 'Event ID',
    email: ar ? 'بريد تجريبي' : 'Sample email',
    description: ar ? 'وصف الاستفسار' : 'Enquiry description',
    amount: ar ? 'القيمة التوضيحية (ر.س)' : 'Sample amount (SAR)',
    quantity: ar ? 'كمية الطلب' : 'Order quantity',
    stock: ar ? 'الرصيد المتاح' : 'Available stock',
    threshold:
      model.slug === 'stock-alerts'
        ? ar
          ? 'حد التنبيه (وحدات)'
          : 'Alert threshold (units)'
        : ar
          ? 'حد المراجعة (ر.س)'
          : 'Review threshold (SAR)',
    approved: ar ? 'موافقة تجريبية على المتابعة' : 'Demo approval to proceed',
    consent: ar ? 'التواصل مفعّل في السيناريو' : 'Contact enabled in this scenario',
    paid: ar ? 'الفاتورة مدفوعة' : 'Invoice paid',
    dueDate: ar ? 'تاريخ الاستحقاق' : 'Due date',
    referenceDate:
      model.slug === 'daily-summary'
        ? ar
          ? 'تاريخ التقرير'
          : 'Report date'
        : ar
          ? 'التاريخ المرجعي للتجربة'
          : 'Reference date',
    appointmentDate: ar ? 'تاريخ الموعد' : 'Appointment date',
    orders: ar ? 'الطلبات (رقم الطلب، القيمة)' : 'Orders (ID, amount)',
  };
  const outcomes: Record<string, string> = {
    completed: ar ? 'اكتملت المحاكاة' : 'Simulation completed',
    waiting: ar ? 'بانتظار المراجعة' : 'Awaiting review',
    skipped: ar ? 'تم التجاوز حسب الشرط' : 'Skipped by condition',
    failed: ar ? 'توقف المسار' : 'Flow stopped',
    duplicate: ar ? 'حدث سبق معالجته' : 'Already processed',
    conflict: ar ? 'تعارض رقم الحدث' : 'Event ID conflict',
  };
  const stateLabels: Record<StepStatus, string> = {
    idle: ar ? 'لم تبدأ' : 'Not started',
    completed: ar ? 'اكتملت' : 'Completed',
    waiting: ar ? 'بانتظار الموافقة' : 'Awaiting approval',
    skipped: ar ? 'تم تجاوزها' : 'Skipped',
    failed: ar ? 'توقفت' : 'Stopped',
  };
  function field(key: keyof AutomationInput) {
    const value = input[key],
      boolean = typeof value === 'boolean';
    const id = `automation-${key}`;
    return (
      <label key={key} htmlFor={id} className={boolean ? 'ad-toggle' : undefined}>
        {boolean ? (
          <>
            <input
              id={id}
              type="checkbox"
              checked={value}
              disabled={running}
              onChange={(e) => setInput((current) => ({ ...current, [key]: e.target.checked }))}
            />
            <span>{labels[key]}</span>
          </>
        ) : (
          <>
            <span>{labels[key]}</span>
            {key === 'orders' || key === 'description' ? (
              <textarea
                id={id}
                value={String(value)}
                rows={key === 'orders' ? 4 : 2}
                maxLength={key === 'orders' ? 3000 : 1000}
                disabled={running}
                onChange={(e) => setInput((current) => ({ ...current, [key]: e.target.value }))}
              />
            ) : (
              <input
                id={id}
                type={
                  typeof value === 'number'
                    ? 'number'
                    : key === 'email'
                      ? 'email'
                      : key.toLowerCase().includes('date')
                        ? 'date'
                        : 'text'
                }
                value={String(value)}
                required
                min={typeof value === 'number' ? 0 : undefined}
                max={
                  typeof value === 'number'
                    ? ['stock', 'quantity'].includes(key) ||
                      (key === 'threshold' && model.slug === 'stock-alerts')
                      ? 1000000
                      : 10000000
                    : undefined
                }
                step={
                  typeof value === 'number'
                    ? ['stock', 'quantity'].includes(key) ||
                      (key === 'threshold' && model.slug === 'stock-alerts')
                      ? 1
                      : 0.01
                    : undefined
                }
                maxLength={key === 'eventId' ? 60 : 200}
                disabled={running}
                onChange={(e) =>
                  setInput((current) => ({
                    ...current,
                    [key]: typeof value === 'number' ? Number(e.target.value) : e.target.value,
                  }))
                }
              />
            )}
          </>
        )}
      </label>
    );
  }
  async function run() {
    if (running) return;
    const token = ++operation.current;
    setRunning(true);
    setActiveStep(-1);
    setResult(null);
    setSteps(c.steps.map(() => 'idle'));
    const next = runAutomationDemo(model, input, ledger, locale, failure);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && next.outcome !== 'duplicate' && next.outcome !== 'conflict') {
      for (let i = 0; i < next.steps.length; i++) {
        const status = next.steps[i]!;
        if (status === 'idle') break;
        if (token !== operation.current) return;
        setActiveStep(i);
        await new Promise((resolve) => setTimeout(resolve, 220));
        if (token !== operation.current) return;
        setSteps((current) => current.map((old, index) => (index === i ? status : old)));
      }
    }
    if (token !== operation.current) return;
    setSteps(next.steps);
    setActiveStep(-1);
    setResult(next);
    setLedger((current) => appendAutomationReceipt(current, input.eventId, next));
    setAttempts((current) =>
      [{ eventId: input.eventId.trim(), outcome: next.outcome }, ...current].slice(0, 30),
    );
    setRunning(false);
    if (window.matchMedia('(max-width: 800px)').matches)
      output.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  function reset() {
    operation.current++;
    setInput(initial());
    setLedger([]);
    setResult(null);
    setSteps(c.steps.map(() => 'idle'));
    setActiveStep(-1);
    setFailure(false);
    setAttempts([]);
    setRunning(false);
    setResetOpen(false);
  }
  return (
    <div className={`ad ad--${model.theme}`}>
      <aside className="ad-demo-banner">
        <span>
          {ar
            ? 'محاكاة محلية • لا رسائل ولا عمليات خارجية'
            : 'Local simulation • no messages or external actions'}
        </span>
        <a href={`/${locale}/automation-demos/${model.slug}`}>
          {ar ? 'التفاصيل والإمكانات' : 'Details & capabilities'} ↗
        </a>
        <a href={`/${locale}/contact?intent=quote&automation=${model.slug}`}>
          {ar ? 'أريد ربطًا مشابهًا' : 'Discuss a similar integration'}
        </a>
      </aside>
      <header className="ad-topbar">
        <a className="ad-brand" href={`/${locale}/automation-demos`}>
          <span>
            <GitBranch size={24} aria-hidden="true" />
          </span>
          <strong>
            TEVONIQ<small>{ar ? 'الأتمتة والربط' : 'AUTOMATION & INTEGRATION'}</small>
          </strong>
        </a>
        <div className="ad-mode">
          <CircleDot size={15} aria-hidden="true" />
          {ar ? 'بيئة توضيحية' : 'DEMO ENVIRONMENT'}
        </div>
        <button className="ad-secondary" onClick={() => setResetOpen(true)} disabled={running}>
          <RotateCcw size={16} aria-hidden="true" />
          {ar ? 'إعادة التجربة' : 'Reset demo'}
        </button>
      </header>
      <main id="main-content" className="ad-main">
        <header className="ad-heading">
          <div>
            <p className="ad-eyebrow">{c.name}</p>
            <h1>{c.headline}</h1>
            <p>{c.demoNote}</p>
          </div>
          <div className="ad-stats">
            <div>
              <strong>
                {ledger.filter((receipt) => receipt.result.outcome === 'completed').length}
              </strong>
              <span>{ar ? 'أحداث اكتملت مرة واحدة' : 'Events completed once'}</span>
            </div>
            <div>
              <strong>{attempts.length}</strong>
              <span>{ar ? 'محاولات في آخر 30 تشغيلًا' : 'Attempts in the last 30 runs'}</span>
            </div>
          </div>
        </header>
        <nav className="ad-examples" aria-label={ar ? 'نماذج الأتمتة' : 'Automation examples'}>
          {automationCases.map((item) => (
            <a
              key={item.slug}
              aria-current={item.slug === model.slug ? 'page' : undefined}
              href={`/previews/${locale}/automation/${item.slug}`}
            >
              {item[locale].name}
            </a>
          ))}
        </nav>
        <div className="ad-workbench">
          <section className="ad-panel ad-inputs" aria-labelledby="ad-input-title">
            <div className="ad-panel-title">
              <span>01</span>
              <h2 id="ad-input-title">{ar ? 'بيانات التجربة' : 'Demo input'}</h2>
            </div>
            <p className="ad-muted">
              {ar
                ? 'غيّر البيانات ثم شغّل المسار. استخدم معلومات افتراضية.'
                : 'Change the data, then run the flow. Use fictional details.'}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run();
              }}
            >
              {field('eventId')}
              {model.fields.map((key) => field(key))}
              {model.slug === 'daily-summary' && (
                <p className="ad-field-note">
                  {ar
                    ? 'مثال: ORD-101,125 — استخدم فاصلة إنجليزية، وسجلًا في كل سطر.'
                    : 'Example: ORD-101,125 — use a comma and one record per line.'}
                </p>
              )}
              <label className="ad-toggle ad-failure">
                <input
                  type="checkbox"
                  checked={failure}
                  disabled={running}
                  onChange={(e) => setFailure(e.target.checked)}
                />
                <span>{ar ? 'محاكاة تعطل وجهة الربط' : 'Simulate destination failure'}</span>
              </label>
              <button className="ad-primary" disabled={running}>
                <Play size={17} aria-hidden="true" />
                {running
                  ? ar
                    ? 'تشغيل المحاكاة…'
                    : 'Running simulation…'
                  : result?.outcome === 'failed' || result?.outcome === 'waiting'
                    ? ar
                      ? 'إعادة المحاولة'
                      : 'Retry simulation'
                    : ar
                      ? 'شغّل المسار'
                      : 'Run the flow'}
              </button>
              <p className="ad-field-note">
                {ar
                  ? 'لا يلزم إدخال مفاتيح API أو بيانات دخول. هذه ليست بيئة ربط فعلية.'
                  : 'No API keys or credentials are needed. This is not a live integration environment.'}
              </p>
            </form>
          </section>
          <section className="ad-canvas" aria-labelledby="ad-canvas-title">
            <div className="ad-canvas-heading">
              <div>
                <p className="ad-eyebrow">WORKFLOW</p>
                <h2 id="ad-canvas-title">
                  {ar ? 'من الحدث إلى النتيجة' : 'From event to outcome'}
                </h2>
              </div>
              <span className="ad-local-pill">{ar ? 'محاكاة' : 'SIMULATION'}</span>
            </div>
            <ol className="ad-nodes">
              {c.steps.map((step, i) => {
                const NodeIcon = nodeIcons[i]!,
                  status = steps[i]!,
                  active = activeStep === i;
                return (
                  <li
                    key={step}
                    className={`ad-node ad-node--${status}${active ? ' ad-node--active' : ''}`}
                  >
                    <div className="ad-node-icon">
                      <NodeIcon size={22} aria-hidden="true" />
                    </div>
                    <div>
                      <small>
                        {String(i + 1).padStart(2, '0')} / {ar ? 'خطوة' : 'STEP'}
                      </small>
                      <h3>{step}</h3>
                      <p>{active ? (ar ? 'قيد المحاكاة' : 'Simulating') : stateLabels[status]}</p>
                    </div>
                    <span className="ad-node-state" aria-hidden="true">
                      {status === 'completed' ? (
                        <Check size={17} />
                      ) : status === 'failed' ? (
                        <X size={17} />
                      ) : status === 'waiting' ? (
                        <Clock3 size={17} />
                      ) : (
                        <CircleDot size={15} />
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="ad-canvas-note">
              <ShieldCheck size={19} aria-hidden="true" />
              <p>
                {ar
                  ? 'رقم الحدث يمنع تكرار النتيجة. الموافقة تُراجع قبل تجهيز الإجراء.'
                  : 'The event ID prevents duplicate output. Approval is checked before the action is prepared.'}
              </p>
            </div>
          </section>
          <section className="ad-panel ad-output" ref={output} aria-labelledby="ad-output-title">
            <div className="ad-panel-title">
              <span>03</span>
              <h2 id="ad-output-title">{ar ? 'النتيجة وسجل التشغيل' : 'Output & run history'}</h2>
            </div>
            <div className="ad-result" role="status" aria-live="polite">
              {running ? (
                <p>{ar ? 'تجري محاكاة المسار محليًا…' : 'Simulating the flow locally…'}</p>
              ) : result ? (
                <>
                  <span className={`ad-outcome ad-outcome--${result.outcome}`}>
                    {outcomes[result.outcome]}
                  </span>
                  <p>{result.message}</p>
                </>
              ) : (
                <div className="ad-empty">
                  <GitBranch size={34} aria-hidden="true" />
                  <h3>{ar ? 'جرّب المسار لتظهر النتيجة' : 'Run the flow to see the outcome'}</h3>
                  <p>
                    {ar
                      ? 'يمكنك تجربة البيانات الصحيحة أو تعطل الربط أو غياب الموافقة.'
                      : 'Try valid data, a failed connection or a missing approval.'}
                  </p>
                </div>
              )}
            </div>
            {result && result.effects.length > 0 && (
              <dl className="ad-effect-list">
                {result.effects.map((effect) => (
                  <div key={effect.label}>
                    <dt>{effect.label}</dt>
                    <dd>{effect.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {result?.draft && (
              <section className="ad-draft">
                <h3>{ar ? 'مسودة توضيحية — لم تُرسل' : 'Illustrative draft — not sent'}</h3>
                <p>{result.draft}</p>
              </section>
            )}
            <section className="ad-run-log">
              <h3>{ar ? 'آخر المحاولات' : 'Recent attempts'}</h3>
              {attempts.length ? (
                <ol>
                  {attempts.map((attempt, i) => (
                    <li key={`${attempt.eventId}-${attempts.length - i}`}>
                      <span>{attempt.eventId}</span>
                      <strong>{outcomes[attempt.outcome]}</strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="ad-muted">{ar ? 'لم تُنفذ محاولات بعد.' : 'No attempts yet.'}</p>
              )}
            </section>
            <p className="ad-field-note">
              {ar
                ? 'النتائج في ذاكرة الصفحة فقط وتُمسح بإعادة التحميل.'
                : 'Results stay in this page and reset on reload.'}
            </p>
          </section>
        </div>
        <footer className="ad-footer">
          <p>
            {ar
              ? 'عند التنفيذ الفعلي نتفق على البرامج والصلاحيات وشروط الموافقة والمراقبة وإعادة المحاولة.'
              : 'A live implementation requires agreed applications, permissions, approval rules, monitoring and retries.'}
          </p>
          <a href={`/${locale}/automation-demos/${model.slug}`}>
            {ar ? 'اكتشف نطاق التنفيذ' : 'Explore implementation scope'}{' '}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </footer>
      </main>
      {resetOpen && (
        <PreviewDialog
          label={ar ? 'إعادة بيانات المحاكاة' : 'Reset simulation data'}
          onClose={() => setResetOpen(false)}
        >
          <h2>{ar ? 'إعادة التجربة من البداية؟' : 'Reset the simulation?'}</h2>
          <p>
            {ar
              ? 'ستُمسح نتائج المحاكاة وسجل الأحداث وتعود البيانات الافتراضية.'
              : 'Simulation results and event history will be cleared and default inputs restored.'}
          </p>
          <div className="ad-dialog-actions">
            <button className="ad-primary" onClick={reset}>
              {ar ? 'إعادة البيانات الأصلية' : 'Restore demo data'}
            </button>
            <button className="ad-secondary" onClick={() => setResetOpen(false)}>
              {ar ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </PreviewDialog>
      )}
    </div>
  );
}
