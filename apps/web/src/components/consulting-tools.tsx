'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  RotateCcw,
  SlidersHorizontal,
  SearchCheck,
  GitBranch,
  FileText,
} from 'lucide-react';
import {
  consultingQuestions,
  consultingResults,
  consultingAlternatives,
  consultingExamples,
  type ConsultingAnswers,
  type ConsultingLocale,
  type ConsultingAlternativeId,
} from '@/content/technology-consulting';
import {
  parseConsultingAnswers,
  recommendConsulting,
  consultingAnswerLines,
  consultingGuideHref,
  consultingBrief,
} from '@/lib/consulting-guide';
function downloadText(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })),
    link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ConsultingGuide({ locale }: { locale: ConsultingLocale }) {
  const ar = locale === 'ar';
  const [answers, setAnswers] = useState<Partial<ConsultingAnswers>>({}),
    [step, setStep] = useState(0),
    [showResult, setShowResult] = useState(false),
    [feedback, setFeedback] = useState('');
  const question = consultingQuestions[step]!,
    validated = parseConsultingAnswers(answers),
    key = validated ? recommendConsulting(validated) : null,
    copy = key ? consultingResults[key][locale] : null,
    gallery = key ? consultingResults[key].gallery : null;
  const reset = () => {
    setAnswers({});
    setStep(0);
    setShowResult(false);
    setFeedback('');
  };
  return (
    <div className="tc-guide">
      <aside className="tc-guide-sidebar">
        <span className="tc-tool-icon">
          <SearchCheck size={25} aria-hidden="true" />
        </span>
        <h3>{ar ? 'من أين أبدأ؟' : 'Where should I start?'}</h3>
        <p>
          {ar
            ? 'خمسة أسئلة قصيرة تساعد على ترتيب الخطوة الأولى. لا تحتاج إلى تسجيل أو إدخال بيانات تواصل.'
            : 'Five short questions to organise a first step. No sign-in or contact details are needed.'}
        </p>
        <ol>
          {consultingQuestions.map((item, index) => (
            <li
              key={item.key}
              data-active={!showResult && index === step}
              data-done={!!answers[item.key]}
            >
              <span>{answers[item.key] ? <Check size={13} aria-hidden="true" /> : index + 1}</span>
              {item[locale]}
            </li>
          ))}
        </ol>
        <p className="tc-tool-note">
          {ar
            ? 'اقتراح بقواعد واضحة من اختياراتك، ويحتاج مراجعة فعلية قبل اعتماد نطاق أو تكلفة.'
            : 'A rule-based suggestion from your choices, requiring a real review before scope or cost is agreed.'}
        </p>
      </aside>
      <div className="tc-guide-main">
        {showResult && validated && copy ? (
          <>
            <div className="tc-guide-result" role="status">
              <p className="tc-eyebrow">
                {ar ? 'اقتراح أولي من إجاباتك' : 'INITIAL SUGGESTION FROM YOUR ANSWERS'}
              </p>
              <h3>{copy.title}</h3>
              <p>{copy.reason}</p>
            </div>
            <h4>{ar ? 'خطوة البداية' : 'A suggested first step'}</h4>
            <ol className="tc-result-steps">
              {copy.steps.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {item}
                </li>
              ))}
            </ol>
            <div className="tc-defer">
              <SlidersHorizontal size={18} aria-hidden="true" />
              <p>{copy.defer}</p>
            </div>
            <details className="tc-answer-summary">
              <summary>{ar ? 'راجع اختياراتك' : 'Review your choices'}</summary>
              <ul>
                {consultingAnswerLines(validated, locale).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
            <div className="tc-actions">
              <Link className="tc-primary" href={consultingGuideHref(validated, locale)}>
                {ar ? 'ناقش هذا الاقتراح' : 'Discuss this suggestion'}{' '}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              {gallery ? (
                <Link className="tc-secondary" href={`/${locale}${gallery}`}>
                  {ar ? 'تصفّح النموذج المناسب' : 'Explore a relevant demo'}
                </Link>
              ) : (
                <a className="tc-secondary" href="#tc-comparison">
                  {ar ? 'قارن الخيارات' : 'Compare options'}
                </a>
              )}
            </div>
            <div className="tc-result-controls">
              <button
                onClick={() => {
                  downloadText(
                    consultingBrief(validated, locale),
                    `tevoniq-consulting-brief-${locale}.txt`,
                  );
                  setFeedback(
                    ar ? 'حُمّل ملخص اختياراتك محليًا.' : 'Your choices were downloaded locally.',
                  );
                }}
              >
                <Download size={15} aria-hidden="true" />
                {ar ? 'تحميل ملخص الاحتياج' : 'Download needs brief'}
              </button>
              <button
                onClick={() => {
                  setShowResult(false);
                  setStep(0);
                  setFeedback('');
                }}
              >
                {ar ? 'تعديل الإجابات' : 'Edit answers'}
              </button>
              <button onClick={reset}>
                <RotateCcw size={14} aria-hidden="true" />
                {ar ? 'البدء من جديد' : 'Start again'}
              </button>
            </div>
            <p className="tc-feedback" role="status">
              {feedback}
            </p>
          </>
        ) : (
          <>
            <div className="tc-question-progress">
              <span>
                {ar ? 'السؤال' : 'Question'} {step + 1} / {consultingQuestions.length}
              </span>
              <span>
                {ar
                  ? 'اختياراتك تبقى في الصفحة حتى تنقل الملخص بنفسك.'
                  : 'Choices stay in this page until you choose to pass on the brief.'}
              </span>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!answers[question.key]) return;
                if (step < consultingQuestions.length - 1) setStep(step + 1);
                else if (validated) setShowResult(true);
              }}
            >
              <fieldset key={question.key}>
                <legend>{question[locale]}</legend>
                <div className="tc-radio-options">
                  {question.options.map((option) => (
                    <label
                      key={option.value}
                      data-selected={answers[question.key] === option.value}
                    >
                      <input
                        type="radio"
                        name={question.key}
                        value={option.value}
                        checked={answers[question.key] === option.value}
                        onChange={() =>
                          setAnswers((current) => ({ ...current, [question.key]: option.value }))
                        }
                      />
                      <span>{option[locale]}</span>
                      <Check size={17} aria-hidden="true" />
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="tc-guide-controls">
                <button type="submit" className="tc-primary" disabled={!answers[question.key]}>
                  {step === consultingQuestions.length - 1
                    ? ar
                      ? 'اعرض اقتراح البداية'
                      : 'Show my starting point'
                    : ar
                      ? 'التالي'
                      : 'Next'}{' '}
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
                {step > 0 && (
                  <button type="button" className="tc-secondary" onClick={() => setStep(step - 1)}>
                    {ar ? 'السابق' : 'Back'}
                  </button>
                )}
              </div>
            </form>
            <p className="tc-guide-hint">
              {ar
                ? 'قد تكون النتيجة تحسين الموجود أو تنظيم البيانات أو تأجيل البناء حتى تتضح الحاجة.'
                : 'The suggestion may be to improve an existing tool, organise data or defer development until the need is clearer.'}
            </p>
          </>
        )}
        <noscript>
          <p>
            {ar
              ? 'الأداة التفاعلية تحتاج JavaScript. يمكنك قراءة الخيارات والأمثلة أدناه أو التواصل معنا مباشرة.'
              : 'The interactive guide needs JavaScript. You can read the options and examples below or contact us directly.'}
          </p>
          <a href={`/${locale}/contact?intent=quote&consulting=scope`}>
            {ar ? 'ناقش احتياجك' : 'Discuss your needs'}
          </a>
        </noscript>
      </div>
    </div>
  );
}
const priorityOptions = [
  {
    id: 'quick',
    ar: 'أقل تغيير في طريقة العمل',
    en: 'Less change to the current workflow',
    route: 'existing',
  },
  {
    id: 'options',
    ar: 'احتياج شائع يحتاج أداة مناسبة',
    en: 'A common need requiring a suitable tool',
    route: 'ready-made',
  },
  {
    id: 'repetition',
    ar: 'نقل متكرر بين أدوات قائمة',
    en: 'Repeated transfer between existing tools',
    route: 'connect',
  },
  {
    id: 'specific',
    ar: 'مسار خاص يحتاج تحققًا من الخيارات',
    en: 'A specific workflow needing option review',
    route: 'custom',
  },
] as const;
export function ConsultingComparison({ locale }: { locale: ConsultingLocale }) {
  const ar = locale === 'ar';
  const [selected, setSelected] = useState<ConsultingAlternativeId>('existing'),
    [priority, setPriority] = useState('quick');
  const current = consultingAlternatives.find((item) => item.id === selected)!,
    copy = current[locale];
  return (
    <div className="tc-comparison">
      <fieldset className="tc-priority">
        <legend>{ar ? 'ما الأقرب لأولويتك؟' : 'Which priority is closest to yours?'}</legend>
        <div>
          {priorityOptions.map((option) => (
            <label key={option.id} data-selected={priority === option.id}>
              <input
                type="radio"
                name="consulting-priority"
                value={option.id}
                checked={priority === option.id}
                onChange={() => {
                  setPriority(option.id);
                  setSelected(option.route);
                }}
              />
              <span>{option[locale]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="tc-comparison-note">
        {ar
          ? 'الاختيار يفتح مسارًا للمقارنة، ولا يحسم ملاءمة برنامج أو تكلفة تنفيذ.'
          : 'Your selection opens an option to review; it does not establish product fit or implementation cost.'}
      </p>
      <div
        className="tc-comparison-tabs"
        role="group"
        aria-label={ar ? 'خيارات الحل' : 'Solution options'}
      >
        {consultingAlternatives.map((alternative, index) => (
          <button
            key={alternative.id}
            aria-pressed={selected === alternative.id}
            onClick={() => setSelected(alternative.id)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {ar ? alternative.arTitle : alternative.enTitle}
          </button>
        ))}
      </div>
      <section className="tc-comparison-detail" aria-live="polite">
        <header>
          <span className="tc-tool-icon">
            <GitBranch size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="tc-eyebrow">{ar ? 'خيار قيد المقارنة' : 'OPTION UNDER REVIEW'}</p>
            <h3>{ar ? current.arTitle : current.enTitle}</h3>
          </div>
        </header>
        <div className="tc-comparison-columns">
          <div>
            <h4>{ar ? 'متى يستحق المراجعة؟' : 'When is it worth reviewing?'}</h4>
            <p>{copy.fit}</p>
            <h4>{ar ? 'ما الذي نراجعه؟' : 'What do we check?'}</h4>
            <p>{copy.review}</p>
          </div>
          <div>
            <h4>{ar ? 'ما المخرج المقترح؟' : 'What is the proposed output?'}</h4>
            <ul>
              {copy.outputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="tc-dependency">{copy.dependency}</p>
          </div>
        </div>
        <Link
          className="tc-primary"
          href={`/${locale}/contact?intent=quote&consulting=comparison&route=${current.id}`}
        >
          {ar ? 'ناقش هذا الخيار' : 'Discuss this option'}{' '}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
export function ConsultingExamples({ locale }: { locale: ConsultingLocale }) {
  const ar = locale === 'ar';
  const [selected, setSelected] = useState('retail'),
    [section, setSection] = useState<'problem' | 'direction' | 'scope' | 'defer'>('scope'),
    [feedback, setFeedback] = useState('');
  const example = consultingExamples.find((item) => item.id === selected)!,
    copy = example[locale],
    gallery = consultingResults[example.result as keyof typeof consultingResults].gallery;
  const sections = [
    { id: 'problem', ar: 'الحاجة', en: 'The need' },
    { id: 'direction', ar: 'اتجاه البداية', en: 'Starting direction' },
    { id: 'scope', ar: 'النطاق الأولي', en: 'Initial scope' },
    { id: 'defer', ar: 'ما نؤجله', en: 'What to defer' },
  ] as const;
  const report = () =>
    [
      ar ? 'مثال توضيحي لمخرجات استشارة — TEVONIQ' : 'Illustrative consultation output — TEVONIQ',
      ar ? example.arTitle : example.enTitle,
      ...sections.flatMap((item) => ['', item[locale], copy[item.id]]),
      '',
      ar
        ? 'هذا مثال افتراضي وليس تقرير عميل أو نطاقًا نهائيًا معتمدًا.'
        : 'This is a fictional example, not a client report or an approved scope.',
    ].join('\n');
  return (
    <div className="tc-examples">
      <div
        className="tc-example-options"
        role="group"
        aria-label={ar ? 'اختيار المثال التوضيحي' : 'Choose an illustrative example'}
      >
        {consultingExamples.map((item, index) => (
          <button
            key={item.id}
            aria-pressed={selected === item.id}
            onClick={() => {
              setSelected(item.id);
              setFeedback('');
            }}
          >
            <span>0{index + 1}</span>
            <strong>{ar ? item.arTitle : item.enTitle}</strong>
            <small>{ar ? 'حالة افتراضية' : 'Fictional scenario'}</small>
          </button>
        ))}
      </div>
      <article className="tc-sample-report">
        <header>
          <div>
            <p className="tc-eyebrow">{ar ? 'نموذج مخرج استشارة' : 'SAMPLE CONSULTATION OUTPUT'}</p>
            <h3>{ar ? example.arTitle : example.enTitle}</h3>
          </div>
          <FileText size={31} aria-hidden="true" />
        </header>
        <div
          className="tc-report-tabs"
          role="group"
          aria-label={ar ? 'أجزاء الملخص' : 'Brief sections'}
        >
          {sections.map((item) => (
            <button
              key={item.id}
              aria-pressed={section === item.id}
              onClick={() => setSection(item.id)}
            >
              {item[locale]}
            </button>
          ))}
        </div>
        <div className="tc-report-section" aria-live="polite">
          <h4>{sections.find((item) => item.id === section)![locale]}</h4>
          <p>{copy[section]}</p>
        </div>
        <p className="tc-sample-note">
          {ar
            ? 'مثال افتراضي يوضح شكل التفكير والمخرجات، وليس عمل عميل أو نتيجة تنفيذ.'
            : 'A fictional example showing the reasoning and outputs, not client work or delivery results.'}
        </p>
        <div className="tc-actions">
          <Link
            className="tc-primary"
            href={`/${locale}/contact?intent=quote&consulting=example&example=${example.id}`}
          >
            {ar ? 'ناقش احتياجًا مشابهًا' : 'Discuss a similar need'}{' '}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          {gallery && (
            <Link className="tc-secondary" href={`/${locale}${gallery}`}>
              {ar ? 'شاهد النموذج التفاعلي' : 'View an interactive demo'}
            </Link>
          )}
          <button
            className="tc-text-button"
            onClick={() => {
              downloadText(report(), `tevoniq-consulting-example-${example.id}-${locale}.txt`);
              setFeedback(
                ar
                  ? 'حُمّل المثال التوضيحي محليًا.'
                  : 'The illustrative example was downloaded locally.',
              );
            }}
          >
            <Download size={15} aria-hidden="true" />
            {ar ? 'تحميل المثال' : 'Download example'}
          </button>
        </div>
        <p className="tc-feedback" role="status">
          {feedback}
        </p>
      </article>
    </div>
  );
}
