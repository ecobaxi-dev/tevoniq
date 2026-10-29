import Link from 'next/link';
import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  CircleDot,
  ClipboardCheck,
  FileText,
  GitBranch,
  Layers3,
  MessagesSquare,
  PlugZap,
  ScanSearch,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  mlBenefits,
  mlCapabilities,
  mlCases,
  mlCopy,
  mlStages,
  type MlLocale,
} from '@/content/machine-learning';
import { MlStartGuide } from './ml-start-guide';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './erp-service.css';
import './machine-learning-service.css';
export function MachineLearningService({ locale }: { locale: MlLocale }) {
  const ar = locale === 'ar',
    c = mlCopy[locale],
    t = (a: string, e: string) => (ar ? a : e);
  const icons = [ScanSearch, MessagesSquare, FileText, TrendingUp, PlugZap, ClipboardCheck];
  return (
    <div className="erp-service ml-service" dir={ar ? 'rtl' : 'ltr'}>
      <section className="ml-hero-shell">
        <div className="erp-section ml-hero">
          <div>
            <p className="erp-kicker">
              {t(
                'الذكاء الاصطناعي وتعلّم الآلة / للمنشآت الصغيرة والمتوسطة',
                'AI & MACHINE LEARNING / FOR SMALL AND MEDIUM BUSINESSES',
              )}
            </p>
            <h1>{c.title}</h1>
            <p className="ml-subtitle">{c.subtitle}</p>
            <p>{c.intro}</p>
            <div className="erp-actions">
              <Link className="erp-primary" href={`/${locale}/contact?ml=review`}>
                {t('لنناقش فكرتك', 'Discuss your idea')}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a className="erp-secondary" href="#ml-guide">
                {t('اختر نقطة البداية', 'Find a starting point')}
              </a>
            </div>
          </div>
          <div className="ml-art-wrap">
            <div
              className="ml-art"
              role="img"
              aria-label={t(
                'تصوّر يربط بيانات مصرحًا بها بنموذج ثم مراجعة بشرية ومخرج قابل للاستخدام',
                'An illustration connecting authorised data, a model, human review and a useful output',
              )}
            >
              <div className="ml-art-top">
                <span>TEVONIQ / APPLIED AI</span>
                <i />
                <i />
                <i />
              </div>
              <div className="ml-stream" aria-hidden="true">
                <svg viewBox="0 0 460 230" fill="none">
                  <path d="M0 35C120 35 110 165 230 115S330 35 460 35" />
                  <path d="M0 80C120 80 120 165 230 115S330 80 460 80" />
                  <path d="M0 150C120 150 120 65 230 115S330 150 460 150" />
                  <path d="M0 195C120 195 120 65 230 115S330 195 460 195" />
                </svg>
                <div className="ml-core">
                  <BrainCircuit size={52} />
                  <span>AI + HUMAN REVIEW</span>
                </div>
                <span className="ml-stream-node ml-node-doc">
                  <FileText size={24} />
                </span>
                <span className="ml-stream-node ml-node-check">
                  <ClipboardCheck size={24} />
                </span>
              </div>
              <div className="ml-art-steps">
                {[
                  t('بيانات معتمدة', 'Approved data'),
                  t('تجربة محددة', 'Focused pilot'),
                  t('مراجعة بشرية', 'Human review'),
                ].map((item) => (
                  <span key={item}>
                    <CircleDot size={12} aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
              <p>
                {t(
                  'رسم توضيحي لمسار العمل، وليس نموذجًا يعمل هنا',
                  'Workflow illustration — not a model running here',
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
      <nav
        className="ml-section-nav"
        aria-label={t('أقسام الذكاء الاصطناعي وتعلّم الآلة', 'AI and machine learning sections')}
      >
        <div className="erp-section">
          {[
            ['cases', t('دراسات توضيحية', 'Scenarios')],
            ['journey', t('مراحل التنفيذ', 'Journey')],
            ['scope', t('ما نبنيه', 'Capabilities')],
            ['guide', t('مرشد البداية', 'Starting guide')],
            ['faq', t('الأسئلة الشائعة', 'FAQ')],
          ].map(([id, title]) => (
            <a key={id} href={`#ml-${id}`}>
              {title}
            </a>
          ))}
        </div>
      </nav>
      <section className="erp-section ml-benefits">
        <p className="erp-kicker">{t('الفائدة قبل الأداة', 'START WITH THE VALUE')}</p>
        <h2>
          {t('استخدام صغير يعالج احتياجًا واضحًا', 'A focused use case. A clear business need.')}
        </h2>
        <div className="ml-benefit-grid">
          {mlBenefits.map((item, i) => (
            <article key={i}>
              <span className="ml-number">0{i + 1}</span>
              <h3>{item[locale][0]}</h3>
              <p>{item[locale][1]}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="ml-cases" className="ml-cases-shell">
        <div className="erp-section">
          <p className="erp-kicker">
            {t('دراسات سيناريوهات توضيحية', 'ILLUSTRATIVE SCENARIO STUDIES')}
          </p>
          <h2>{t('كيف يمكن أن يفيد نشاطك؟', 'What could it do for your business?')}</h2>
          <p>
            {t(
              'منشآت افتراضية ومشكلات واقعية لفهم النطاق، وليست نتائج عملاء. النماذج المرتبطة تعرض سير العمل الأساسي ولا تنفّذ الذكاء الاصطناعي المقترح.',
              'Fictional businesses illustrate practical scopes, not client results. Related demos show the underlying workflow and do not run the proposed AI features.',
            )}
          </p>
          <div className="ml-case-grid">
            {mlCases.map((item, i) => {
              const s = item[locale];
              return (
                <article className={`ml-case ml-case-${item.id}`} key={item.id}>
                  <div className="ml-case-art" aria-hidden="true">
                    <span>APPLIED AI / 0{i + 1}</span>
                    {i === 0 ? (
                      <div className="ml-knowledge-art">
                        <FileText size={30} />
                        <div>
                          <span />
                          <span />
                          <span />
                        </div>
                        <MessagesSquare size={27} />
                        <small>{t('إجابة + مرجع', 'ANSWER + SOURCE')}</small>
                      </div>
                    ) : i === 1 ? (
                      <div className="ml-triage-art">
                        <MessagesSquare size={28} />
                        <GitBranch size={35} />
                        <div>
                          {[
                            t('استفسار', 'Enquiry'),
                            t('دعم', 'Support'),
                            t('مراجعة', 'Review'),
                          ].map((title) => (
                            <span key={title}>{title}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="ml-demand-art">
                        <div>
                          {[35, 55, 42, 72, 60, 85, 69].map((height, j) => (
                            <i key={j} style={{ height: `${height}px` }} />
                          ))}
                        </div>
                        <span>{t('سجل ← مقارنة ← مراجعة', 'HISTORY → COMPARE → REVIEW')}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-case-body">
                    <p className="erp-kicker">{s.sector}</p>
                    <h3>{s.title}</h3>
                    <p>{s.challenge}</p>
                    <details>
                      <summary>{t('اقرأ دراسة السيناريو', 'Read the scenario study')}</summary>
                      <div className="ml-case-details">
                        {[
                          ['approach', t('النهج المقترح', 'Proposed approach')],
                          ['data', t('البيانات المطلوبة', 'Required data')],
                          ['measure', t('كيف نقيس الفائدة؟', 'Evaluation criteria')],
                          ['limit', t('النطاق والحدود', 'Scope and boundaries')],
                        ].map(([key, title]) => (
                          <div key={key}>
                            <h4>{title}</h4>
                            <p>{s[key as 'approach' | 'data' | 'measure' | 'limit']}</p>
                          </div>
                        ))}
                        <Link href={`/${locale}/contact?ml=case-${item.id}`}>
                          {t('ناقش تطبيقًا مشابهًا', 'Discuss a similar application')}
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    </details>
                    <Link className="ml-demo-link" href={`/${locale}${item.demo}`}>
                      {t('استكشف نموذج سير العمل', 'Explore the workflow demo')}
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="ml-journey" className="erp-section ml-journey">
        <p className="erp-kicker">
          {t('رحلة واضحة للتبنّي التدريجي', 'A STAGED ADOPTION JOURNEY')}
        </p>
        <h2>
          {t('من سؤال مفيد إلى استخدام مدروس', 'From a useful question to a considered rollout')}
        </h2>
        <p>
          {t(
            'اختر مرحلة لمعرفة العمل الذي نقوم به والمخرج الذي يساعدك على اتخاذ قرار المرحلة التالية.',
            'Choose a stage to see the work and the evidence for deciding the next step.',
          )}
        </p>
        <div className="ml-journey-picker">
          <fieldset className="ml-stage-options">
            <legend className="ml-sr-only">
              {t('اختر مرحلة التنفيذ', 'Choose a delivery stage')}
            </legend>
            {mlStages.map((item, i) => (
              <label key={item.id}>
                <input type="radio" name="ml-stage" value={item.id} defaultChecked={i === 0} />
                <span className="ml-stage-number">0{i + 1}</span>
                <strong>{item[locale].title}</strong>
                <ArrowUpRight size={17} aria-hidden="true" />
              </label>
            ))}
          </fieldset>
          <div className="ml-stage-panels">
            {mlStages.map((item) => (
              <article key={item.id} data-stage={item.id}>
                <p className="ml-mini-label">{t('ما نقوم به', 'WHAT WE DO')}</p>
                <h3>{item[locale].title}</h3>
                <p>{item[locale].text}</p>
                <ul>
                  {item[locale].actions.map((action) => (
                    <li key={action}>
                      <Check size={16} aria-hidden="true" />
                      {action}
                    </li>
                  ))}
                </ul>
                <div className="ml-stage-output">
                  <strong>{t('ما تستلمه', 'WHAT YOU RECEIVE')}</strong>
                  <p>{item[locale].output}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="ml-strategy-shell">
        <div className="erp-section">
          <p className="erp-kicker">{t('ابدأ بما يناسب وضعك', 'START FROM WHERE YOU ARE')}</p>
          <h2>{t('فكرة جديدة أم حل يحتاج مراجعة؟', 'A new idea or an existing solution?')}</h2>
          <div className="ml-strategy-grid">
            <article>
              <Sparkles size={29} aria-hidden="true" />
              <h3>{t('لديك فكرة تريد اختبارها', 'You have an idea to test')}</h3>
              <p>
                {t(
                  'نحوّل المهمة إلى تجربة قصيرة النطاق: بيانات متاحة، مخرج متوقع، أمثلة تقييم وحدود تكلفة واستخدام.',
                  'Shape the task into a focused pilot with available data, expected output, evaluation examples and usage limits.',
                )}
              </p>
              <a href="#ml-guide">
                {t('اختر بداية للفكرة', 'Find a starting point')}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </article>
            <article>
              <SlidersHorizontal size={29} aria-hidden="true" />
              <h3>{t('لديك حل لا تثق بنتائجه', 'You need to review an existing solution')}</h3>
              <p>
                {t(
                  'نراجع عينات الأخطاء ومصادر المعرفة والاختبارات والصلاحيات، ثم نحدد ما يمكن تحسينه وما يحتاج تغيير النهج.',
                  'Review sample errors, knowledge sources, evaluation and permissions, then identify improvements or a different approach.',
                )}
              </p>
              <Link href={`/${locale}/contact?ml=review`}>
                {t('أرسل وصف المشكلة', 'Describe the problem')}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>
      <section id="ml-scope" className="ml-scope-shell">
        <div className="erp-section">
          <p className="erp-kicker">
            {t('قدرات نختار منها بحسب المهمة', 'CAPABILITIES SELECTED FOR THE TASK')}
          </p>
          <h2>
            {t(
              'نبني حول حاجتك، لا حول اسم التقنية',
              'Build around the need, then choose the technology',
            )}
          </h2>
          <div className="ml-scope-grid">
            {mlCapabilities.map((item, i) => {
              const Icon = icons[i] ?? Layers3,
                s = item[locale];
              return (
                <article key={item.id}>
                  <div className="ml-scope-top">
                    <Icon size={28} aria-hidden="true" />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <div className="ml-output">
                    <strong>{t('المخرج', 'Deliverable')}</strong>
                    <span>{s.output}</span>
                  </div>
                  <Link href={`/${locale}/contact?ml=scope-${item.id}`}>
                    {t('ناقش هذا التطبيق', 'Discuss this application')}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="ml-guide" className="erp-section ml-guide-section">
        <p className="erp-kicker">{t('مرشد تفاعلي للبداية', 'AN INTERACTIVE STARTING GUIDE')}</p>
        <h2>{t('ما البداية الأنسب لفكرتك؟', 'Where should your idea start?')}</h2>
        <p>
          {t(
            'ثلاثة اختيارات تساعدك على فهم الخطوة التالية، قبل مناقشة الأدوات أو بناء نموذج.',
            'Three choices to clarify a next step before choosing tools or building a model.',
          )}
        </p>
        <MlStartGuide locale={locale} />
      </section>
      <section className="ml-boundaries-shell">
        <div className="erp-section ml-boundaries">
          <div>
            <p className="erp-kicker">
              {t('حدود واضحة من البداية', 'CLEAR BOUNDARIES FROM THE START')}
            </p>
            <h2>{t('المراجعة جزء من الحل', 'Review is part of the solution')}</h2>
            <p>
              {t(
                'يمكن للنموذج أن يخطئ أو يسيء فهم سؤال. نحدد أين يساعد، ومتى يتوقف أو يحيل إلى شخص، وكيف تُراجع التكلفة والنتائج.',
                'A model can be wrong or misunderstand a question. Define where it helps, when it stops or refers to a person, and how cost and results are reviewed.',
              )}
            </p>
          </div>
          <ul>
            {[
              t('مصادر مصرح بها وصلاحيات محددة.', 'Authorised sources and defined permissions.'),
              t(
                'اختبارات مستقلة وحالات خارج النطاق.',
                'Independent evaluation and out-of-scope cases.',
              ),
              t('اعتماد بشري للإجراءات المؤثرة.', 'Human approval for consequential actions.'),
              t(
                'حدود استخدام وتكلفة ومسؤولية تحديث.',
                'Usage and cost limits, with update ownership.',
              ),
            ].map((item) => (
              <li key={item}>
                <Check size={18} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="ml-faq" className="erp-section ml-faq">
        <p className="erp-kicker">{t('قبل أن نبدأ', 'BEFORE WE START')}</p>
        <h2>{t('أسئلة تساعد على اختيار واعٍ', 'Questions for an informed starting point')}</h2>
        <div className="erp-faq">
          {c.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="ml-cta">
        <div className="erp-section">
          <h2>{t('لنبدأ بمهمة تستحق التجربة', 'Start with a task worth testing')}</h2>
          <p>
            {t(
              'صف لنا العمل المتكرر والبرامج التي تستخدمها. نراجع معك بداية محددة ومعايير قبول قبل التوسع.',
              'Describe the repeated task and the tools you use. Agree a focused start and acceptance criteria before expanding.',
            )}
          </p>
          <Link className="erp-primary" href={`/${locale}/contact?ml=review`}>
            {t('أرسل فكرتك ومتطلباتك', 'Share your idea and requirements')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <StructuredData data={faqData(c.faq)} />
    </div>
  );
}
