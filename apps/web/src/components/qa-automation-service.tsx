import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  CircleCheck,
  ClipboardCheck,
  CodeXml,
  FileSearch,
  GitPullRequest,
  ListChecks,
  MonitorSmartphone,
  PlugZap,
  ScanSearch,
  Sparkles,
} from 'lucide-react';
import {
  qaBenefits,
  qaCases,
  qaCopy,
  qaScope,
  qaStages,
  type QaLocale,
} from '@/content/qa-automation';
import { QaTestingLab } from './qa-testing-lab';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './erp-service.css';
import './qa-automation-service.css';
export function QaAutomationService({ locale }: { locale: QaLocale }) {
  const ar = locale === 'ar',
    c = qaCopy[locale],
    t = (a: string, e: string) => (ar ? a : e);
  const icons = [ListChecks, PlugZap, GitPullRequest, MonitorSmartphone, CodeXml, ScanSearch];
  return (
    <div className="erp-service qa-service" dir={ar ? 'rtl' : 'ltr'}>
      <section className="qa-hero-shell">
        <div className="erp-section qa-hero">
          <div>
            <p className="erp-kicker">
              {t(
                'أتمتة ضمان الجودة / للمواقع وأنظمة الأعمال',
                'QA AUTOMATION / WEBSITES & BUSINESS SYSTEMS',
              )}
            </p>
            <h1>{c.title}</h1>
            <p className="qa-subtitle">{c.subtitle}</p>
            <p>{c.intro}</p>
            <div className="erp-actions">
              <Link className="erp-primary" href={`/${locale}/contact?qa=review`}>
                {t('لنراجع اختبارات مشروعك', 'Review your testing needs')}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a className="erp-secondary" href="#qa-lab">
                {t('جرّب مختبر الاختبارات', 'Try the testing lab')}
              </a>
            </div>
          </div>
          <div className="qa-art-wrap">
            <div
              className="qa-art"
              role="img"
              aria-label={t(
                'رسم توضيحي لدورة اختبار: تحديث، فحص، نتيجة ومراجعة قبل الإصدار',
                'Illustration of an update, checks, results and review before release',
              )}
            >
              <div className="qa-art-bar">
                <span>TEVONIQ / QUALITY CHECK</span>
                <i />
                <i />
                <i />
              </div>
              <div className="qa-orbit" aria-hidden="true">
                <div className="qa-orbit-ring" />
                <div className="qa-orbit-core">
                  <CircleCheck size={49} />
                  <span>CHECK · REVIEW · REPEAT</span>
                </div>
                <span className="qa-orbit-node qa-node-code">
                  <CodeXml />
                </span>
                <span className="qa-orbit-node qa-node-test">
                  <ListChecks />
                </span>
                <span className="qa-orbit-node qa-node-review">
                  <FileSearch />
                </span>
              </div>
              <div className="qa-art-checks">
                {[
                  t('المسار الأساسي', 'Core journey'),
                  t('حالات غير صالحة', 'Invalid inputs'),
                  t('تقرير للمراجعة', 'Review report'),
                ].map((item) => (
                  <span key={item}>
                    <Check size={16} aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
              <p>
                {t(
                  'تصوّر توضيحي — ليس تقرير فحص فعليًا',
                  'Illustration — not an actual test report',
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
      <nav
        className="qa-section-nav"
        aria-label={t('أقسام أتمتة ضمان الجودة', 'QA automation sections')}
      >
        <div className="erp-section">
          {[
            ['scope', t('نطاق الفحص', 'Scope')],
            ['lab', t('جرّب بنفسك', 'Try it')],
            ['journey', t('مراحل العمل', 'Process')],
            ['cases', t('دراسات توضيحية', 'Scenarios')],
            ['faq', t('الأسئلة الشائعة', 'FAQ')],
          ].map(([id, title]) => (
            <a key={id} href={`#qa-${id}`}>
              {title}
            </a>
          ))}
        </div>
      </nav>
      <section className="erp-section qa-benefits">
        <div className="qa-section-heading">
          <p className="erp-kicker">{t('لماذا نختبر؟', 'WHY TEST?')}</p>
          <h2>
            {t('اعرف ما تغيّر قبل أن يراه عميلك', 'See the change before your customer does')}
          </h2>
          <p>
            {t(
              'نقيس الفائدة بالتغطية والنتائج القابلة للإعادة، ونبدأ بما يستحق الأتمتة في حجم مشروعك.',
              'Start with checks worth automating for your project, using clear coverage and reproducible results.',
            )}
          </p>
        </div>
        <div className="qa-benefit-grid">
          {qaBenefits.map((item, i) => (
            <article key={i}>
              <span className="qa-number">0{i + 1}</span>
              <h3>{item[locale][0]}</h3>
              <p>{item[locale][1]}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="qa-scope" className="qa-scope-shell">
        <div className="erp-section">
          <p className="erp-kicker">{t('نطاق واضح من البداية', 'A CLEAR STARTING SCOPE')}</p>
          <h2>{t('نختبر ما تعتمد عليه أعمالك', 'Test what your business relies on')}</h2>
          <p className="qa-scope-intro">
            {t(
              'نختار من هذه المحاور بحسب المنتج وإمكان الوصول. لا تحتاج كل منشأة إلى جميع أنواع الاختبارات.',
              'Select the areas your product and available access justify. Every business does not need every type of check.',
            )}
          </p>
          <div className="qa-scope-grid">
            {qaScope.map((item, i) => {
              const Icon = icons[i] ?? ListChecks,
                s = item[locale];
              return (
                <article key={item.id}>
                  <div className="qa-scope-top">
                    <Icon size={28} aria-hidden="true" />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <div className="qa-output">
                    <strong>{t('المخرج', 'Deliverable')}</strong>
                    <span>{s.output}</span>
                  </div>
                  <Link href={`/${locale}/contact?qa=${item.id}`}>
                    {t('ناقش هذا النطاق', 'Discuss this scope')}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="erp-section qa-ai">
        <div>
          <p className="erp-kicker">AI + HUMAN REVIEW</p>
          <h2>{t('اقتراح ذكي، ونتيجة قابلة للتحقق', 'AI suggestions. Verifiable evidence.')}</h2>
          <p>
            {t(
              'تساعد الأدوات الذكية في اقتراح الحالات وتجهيز البيانات التجريبية والتوثيق. نراجع التوقعات والشيفرة والنتائج بشريًا؛ الاختبار المفيد يتحقق من سلوك محدد ولا يكتفي بتشغيل الأداة.',
              'AI tools can help propose cases, sample data and documentation. We review expectations, code and results: useful tests verify specific behaviour rather than simply running a tool.',
            )}
          </p>
          <Link
            className="qa-inline-link"
            href={`/${locale}/services/software-product-engineering`}
          >
            {t('تعرّف على هندسة المنتجات البرمجية', 'Explore software product engineering')}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="qa-ai-flow">
          {[
            [Sparkles, t('اقتراح حالات', 'Propose cases')],
            [ClipboardCheck, t('مراجعة التوقعات', 'Review expectations')],
            [CircleCheck, t('تشغيل وتوثيق الأدلة', 'Run and record evidence')],
          ].map(([Icon, title], i) => {
            const I = Icon as typeof Sparkles;
            return (
              <div key={i}>
                <I size={25} aria-hidden="true" />
                <strong>{title as string}</strong>
                <span>0{i + 1}</span>
              </div>
            );
          })}
          <p>
            {t(
              'Playwright · اختبارات API · GitHub Actions — نختار الأدوات بحسب ملاءمتها للمشروع.',
              'Playwright · API checks · GitHub Actions — tools selected to fit the project.',
            )}
          </p>
        </div>
      </section>
      <section id="qa-lab" className="qa-lab-shell">
        <div className="erp-section">
          <p className="erp-kicker">{t('من الفكرة إلى تجربة مفهومة', 'SEE HOW A CHECK WORKS')}</p>
          <h2>{t('شاهد الخطأ، ثم أعد الاختبار', 'See the defect. Run the check again.')}</h2>
          <p>
            {t(
              'اختر «قبل التصحيح» وشغّل الاختبارات، ثم بدّل إلى «بعد التصحيح» وأعد التشغيل. النتائج من مثال برمجي محلي، وليست فحصًا لموقعك.',
              'Run the before-fix version, switch to after the fix, and run again. Results come from a local code example, not a scan of your website.',
            )}
          </p>
          <QaTestingLab locale={locale} />
        </div>
      </section>
      <section id="qa-journey" className="erp-section qa-journey">
        <p className="erp-kicker">
          {t('من تحديد المخاطر إلى تسليم الأدلة', 'FROM PRIORITIES TO EVIDENCE')}
        </p>
        <h2>{t('أربع مراحل لاختبارات قابلة للإعادة', 'Four stages for repeatable checks')}</h2>
        <p>
          {t(
            'اختر مرحلة لعرض ما نقوم به، وما نستلمه منك، وما تحصل عليه.',
            'Choose a stage to see the work, the inputs and the deliverables.',
          )}
        </p>
        <div className="qa-journey-picker">
          <fieldset className="qa-stage-options">
            <legend className="qa-sr-only">
              {t('اختر مرحلة العمل', 'Choose a delivery stage')}
            </legend>
            {qaStages.map((item, i) => (
              <label key={item.id}>
                <input type="radio" name="qa-stage" value={item.id} defaultChecked={i === 0} />
                <span className="qa-stage-number">0{i + 1}</span>
                <strong>{item[locale].title}</strong>
              </label>
            ))}
          </fieldset>
          <div className="qa-stage-panels">
            {qaStages.map((item) => (
              <article key={item.id} data-stage={item.id}>
                <div>
                  <h3>{item[locale].title}</h3>
                  <p>{item[locale].text}</p>
                </div>
                <div className="qa-stage-output">
                  <h4>{t('ما تستلمه', 'What you receive')}</h4>
                  <p>{item[locale].output}</p>
                  <h4>{t('ما نحتاجه منك', 'What we need')}</h4>
                  <p>{item[locale].needs}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="qa-cases" className="qa-cases-shell">
        <div className="erp-section">
          <p className="erp-kicker">
            {t('دراسات سيناريوهات توضيحية', 'ILLUSTRATIVE SCENARIO STUDIES')}
          </p>
          <h2>{t('كيف يتحول الخطأ إلى اختبار مفيد؟', 'Turn a defect into a useful check')}</h2>
          <p>
            {t(
              'أمثلة لمنشآت افتراضية تشرح التفكير في الفحص. ليست أعمالًا منفذة لعملاء؛ يمكنك تشغيل قواعدها المصغرة في المختبر وتجربة نماذج العرض المرتبطة.',
              'Fictional business scenarios explaining a testing approach, not delivered client work. Run their sample rules in the lab and explore the related visual demos.',
            )}
          </p>
          <div className="qa-case-grid">
            {qaCases.map((item, i) => {
              const s = item[locale];
              return (
                <article className={`qa-case qa-case-${item.id}`} key={item.id}>
                  <div className="qa-case-art" aria-hidden="true">
                    <span>QA / 0{i + 1}</span>
                    {i === 0 ? (
                      <div className="qa-basket">
                        <span>2 × 50</span>
                        <strong>= 100</strong>
                        <i />
                        <i />
                        <i />
                      </div>
                    ) : i === 1 ? (
                      <div className="qa-calendar">
                        {['09:00', '10:00', '11:00', '12:00'].map((slot, j) => (
                          <span key={slot} className={j === 1 ? 'qa-slot-used' : ''}>
                            {slot}
                            {j === 1 ? <XIcon /> : <Check size={14} />}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="qa-role-art">
                        <span>
                          <ClipboardCheck />
                          {t('مشرف', 'Supervisor')}
                          <Check />
                        </span>
                        <span>
                          <FileSearch />
                          {t('موظف', 'Employee')}
                          <XIcon />
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="qa-case-body">
                    <p className="erp-kicker">{s.sector}</p>
                    <h3>{s.title}</h3>
                    <p>{s.challenge}</p>
                    <details>
                      <summary>{t('اقرأ دراسة السيناريو', 'Read the scenario study')}</summary>
                      <div className="qa-case-details">
                        {[
                          ['approach', t('نهج الفحص', 'Testing approach')],
                          ['scope', t('نطاق البداية', 'Initial scope')],
                          ['measure', t('كيف نقيم النتيجة؟', 'Evaluation criteria')],
                          ['limit', t('حدود المثال', 'Example boundaries')],
                        ].map(([key, title]) => (
                          <div key={key}>
                            <h4>{title}</h4>
                            <p>{s[key as 'approach' | 'scope' | 'measure' | 'limit']}</p>
                          </div>
                        ))}
                        <Link href={`/${locale}/contact?qa=case-${item.id}`}>
                          {t('ناقش حالة مشابهة', 'Discuss a similar case')}
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    </details>
                    <Link className="qa-demo-link" href={`/${locale}${item.demo}`}>
                      {t('استكشف نموذج العرض', 'Explore the visual demo')}
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="qa-faq" className="erp-section qa-faq">
        <p className="erp-kicker">{t('قبل أن نبدأ', 'BEFORE WE START')}</p>
        <h2>{t('أسئلة تساعدك على تحديد النطاق', 'Questions to define the scope')}</h2>
        <div className="erp-faq">
          {c.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="qa-cta">
        <div className="erp-section">
          <h2>{t('ما المسار الذي لا تريد أن يتعطّل؟', 'Which journey must keep working?')}</h2>
          <p>
            {t(
              'أرسل رابط المشروع ووصف الخطوات المهمة، لنحدد بداية عملية للفحص ومعايير واضحة للنتيجة.',
              'Share your project URL and important workflows to define a practical starting scope and clear acceptance criteria.',
            )}
          </p>
          <Link className="erp-primary" href={`/${locale}/contact?qa=review`}>
            {t('أرسل تفاصيل مشروعك', 'Send your project details')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <StructuredData data={faqData(c.faq)} />
    </div>
  );
}
function XIcon() {
  return (
    <span className="qa-cross" aria-hidden="true">
      ×
    </span>
  );
}
