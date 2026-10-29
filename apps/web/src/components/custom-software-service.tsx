import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  CodeXml,
  Layers3,
  PlugZap,
  ShieldCheck,
  FileCheck2,
  ClipboardList,
  Rocket,
  RefreshCw,
  SearchCheck,
  Boxes,
  Users,
  BookOpen,
} from 'lucide-react';
import {
  customCopy,
  customStarts,
  customCases,
  customStages,
  type CustomLocale,
} from '@/content/custom-software';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './erp-service.css';
import './custom-software-service.css';
export function CustomSoftwareService({ locale }: { locale: CustomLocale }) {
  const ar = locale === 'ar',
    c = customCopy[locale];
  const t = (a: string, e: string) => (ar ? a : e);
  const startIcons = [Rocket, ClipboardList, RefreshCw, SearchCheck];
  return (
    <div className="erp-service cs-service" dir={ar ? 'rtl' : 'ltr'}>
      <section className="cs-hero-shell">
        <div className="erp-section cs-hero">
          <div>
            <p className="erp-kicker">
              {t(
                'حلول مخصّصة للمنشآت الصغيرة والمتوسطة',
                'CUSTOM SOLUTIONS FOR SMALL AND MEDIUM BUSINESSES',
              )}
            </p>
            <h1>{c.title}</h1>
            <p className="cs-subtitle">{c.subtitle}</p>
            <p>{c.intro}</p>
            <div className="erp-actions">
              <Link className="erp-primary" href={`/${locale}/contact?custom=launch`}>
                {t('لنناقش فكرتك', 'Discuss your idea')}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a className="erp-secondary" href="#cs-cases">
                {t('شاهد أمثلة الحلول', 'Explore solution examples')}
              </a>
            </div>
          </div>
          <div className="cs-art-wrap">
            <div
              className="cs-art"
              role="img"
              aria-label={t(
                'تصور لحل برمجي يربط واجهة المستخدم بقواعد العمل والبيانات ثم يعرض حالة الطلب',
                'An illustrative software solution connecting user screens, business rules and records to request tracking',
              )}
            >
              <div className="cs-art-bar">
                <i />
                <i />
                <i />
                <span>TEVONIQ / CUSTOM SOFTWARE</span>
              </div>
              <div className="cs-art-main">
                <div className="cs-art-menu" aria-hidden="true">
                  <Boxes />
                  <Users />
                  <ClipboardList />
                  <FileCheck2 />
                </div>
                <div className="cs-art-content">
                  <span className="cs-art-label">
                    {t('مساحة عملك، بطريقتك', 'YOUR WORKSPACE, YOUR WAY')}
                  </span>
                  <strong>{t('من طلب إلى إجراء واضح', 'From request to clear action')}</strong>
                  <div className="cs-art-records">
                    <span>
                      <b>01</b>
                      {t('استلام الطلب', 'Request')}
                    </span>
                    <span>
                      <b>02</b>
                      {t('مراجعة واعتماد', 'Review')}
                    </span>
                    <span>
                      <b>03</b>
                      {t('تنفيذ ومتابعة', 'Delivery')}
                    </span>
                  </div>
                  <svg viewBox="0 0 400 60" aria-hidden="true">
                    <path d="M20 30H380" />
                    <circle cx="35" cy="30" r="7" />
                    <circle cx="200" cy="30" r="7" />
                    <circle cx="365" cy="30" r="7" />
                  </svg>
                  <div className="cs-art-layers">
                    {[t('واجهة', 'Interface'), t('قواعد', 'Rules'), t('بيانات', 'Records')].map(
                      (label) => (
                        <span key={label}>{label}</span>
                      ),
                    )}
                  </div>
                </div>
              </div>
              <small>
                {t(
                  'رسم توضيحي لبنية الحل، ببيانات افتراضية',
                  'ILLUSTRATIVE SOLUTION STRUCTURE · FICTIONAL DATA',
                )}
              </small>
            </div>
          </div>
        </div>
      </section>
      <nav
        className="erp-section-nav"
        aria-label={t('أقسام تطوير الحلول المخصصة', 'Custom software page sections')}
      >
        <div>
          {[
            ['cs-start', t('نقطة البداية', 'Starting point')],
            ['cs-expertise', t('مكونات الحل', 'Solution capabilities')],
            ['cs-cases', t('دراسات توضيحية', 'Scenario studies')],
            ['cs-journey', t('مراحل التنفيذ', 'Delivery journey')],
            ['cs-faq', t('أسئلة شائعة', 'FAQ')],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>
      <section
        className="cs-principles erp-section"
        aria-label={t('ما نركز عليه في المشروع', 'Project principles')}
      >
        {[
          t('مشكلة محددة', 'A defined problem'),
          t('نطاق قابل للمراجعة', 'Reviewable scope'),
          t('اختبار قبل التوسع', 'Test before expanding'),
          t('تسليم ومسؤوليات واضحة', 'Clear handover and ownership'),
        ].map((text, i) => (
          <div key={text}>
            <span>0{i + 1}</span>
            <strong>{text}</strong>
          </div>
        ))}
      </section>
      <section id="cs-start" className="cs-start-shell">
        <div className="erp-section">
          <p className="cs-eyebrow">{t('اختر ما يصف احتياجك', 'CHOOSE YOUR STARTING POINT')}</p>
          <h2>{c.serviceHeading}</h2>
          <p className="cs-light-intro">{c.serviceIntro}</p>
          <fieldset className="cs-start">
            <legend>
              {t('حدد البداية لعرض مخرجاتها', 'Choose a starting point to see its outputs')}
            </legend>
            <div className="cs-start-options">
              {customStarts.map((item, index) => {
                const copy = item[locale],
                  Icon = startIcons[index] ?? CodeXml;
                return (
                  <article className={`cs-start-card cs-start-${item.id}`} key={item.id}>
                    <input
                      type="radio"
                      name="custom-start"
                      id={`cs-start-${item.id}`}
                      value={item.id}
                      defaultChecked={index === 0}
                    />
                    <div className="cs-card-heading">
                      <Icon size={29} aria-hidden="true" />
                      <span>0{index + 1}</span>
                    </div>
                    <h3>
                      <label htmlFor={`cs-start-${item.id}`}>{copy.title}</label>
                    </h3>
                    <p>{copy.body}</p>
                    <ul>
                      {copy.items.map((text) => (
                        <li key={text}>{text}</li>
                      ))}
                    </ul>
                    <span className="cs-select-note">
                      {t('اختر هذه البداية', 'Select this starting point')}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </article>
                );
              })}
            </div>
            <div className="cs-start-panels">
              {customStarts.map((item) => (
                <article key={item.id} data-start={item.id}>
                  <div>
                    <span>{t('المخرج المقترح', 'PROPOSED OUTPUT')}</span>
                    <h3>{item[locale].title}</h3>
                    <p>{item[locale].output}</p>
                  </div>
                  <div>
                    <strong>{t('قبل أن نبدأ', 'Before we start')}</strong>
                    <p>{item[locale].prepare}</p>
                    <Link href={`/${locale}/contact?custom=${item.id}`}>
                      {t('أرسل متطلبات هذه البداية', 'Share requirements for this starting point')}
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </fieldset>
        </div>
      </section>
      <section id="cs-expertise" className="erp-section">
        <p className="erp-kicker">
          {t('بنية عملية، لا قائمة تقنيات', 'PRACTICAL CAPABILITIES, NOT A TOOL LIST')}
        </p>
        <h2>{c.expertiseHeading}</h2>
        <div className="cs-expertise-grid">
          {[
            {
              icon: Layers3,
              title: t('تجربة وواجهات واضحة', 'Clear journeys and interfaces'),
              body: t(
                'شاشات عربية متجاوبة، ومسارات تُراجع مع المستخدم قبل التوسع.',
                'Responsive Arabic-ready screens and journeys reviewed before expansion.',
              ),
            },
            {
              icon: Boxes,
              title: t('سجلات وقواعد عمل', 'Records and business rules'),
              body: t(
                'نماذج بيانات مفهومة، وحالات واستثناءات تناسب المهمة.',
                'Understandable records, statuses and exceptions shaped around the task.',
              ),
            },
            {
              icon: PlugZap,
              title: t('ربط الأدوات', 'Tool integration'),
              body: t(
                'واجهات API ونقل بيانات مضبوط بعد فحص التوافق والصلاحيات.',
                'Controlled API exchanges after checking compatibility and permissions.',
              ),
            },
            {
              icon: ShieldCheck,
              title: t('أدوار وصلاحيات', 'Roles and permissions'),
              body: t(
                'تحديد ما يمكن لكل مستخدم رؤيته أو تعديله ضمن نطاق المشروع.',
                'Define what each user can view or change within the project scope.',
              ),
            },
            {
              icon: FileCheck2,
              title: t('اختبار وقبول', 'Testing and acceptance'),
              body: t(
                'حالات نجاح وفشل وتحقق من المدخلات ومراجعة للجوال والعربية.',
                'Success and failure cases, input validation and mobile/Arabic checks.',
              ),
            },
            {
              icon: BookOpen,
              title: t('تشغيل وتسليم', 'Operation and handover'),
              body: t(
                'توثيق وإعدادات ومسؤوليات ونسخ احتياطي بحسب ما يُتفق عليه.',
                'Documentation, configuration, responsibilities and scoped backups.',
              ),
            },
          ].map(({ icon: Icon, title, body }) => (
            <article key={title}>
              <Icon size={29} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="cs-cases" className="cs-cases-shell">
        <div className="erp-section">
          <p className="erp-kicker">
            {t('أمثلة تساعدك على تصور مشروعك', 'EXAMPLES TO HELP SHAPE YOUR PROJECT')}
          </p>
          <h2>{c.caseHeading}</h2>
          <p className="cs-case-intro">{c.caseIntro}</p>
          <div className="cs-case-grid">
            {customCases.map((item, index) => {
              const copy = item[locale];
              return (
                <article className={`cs-case cs-case-${item.theme}`} key={item.id}>
                  <div
                    className="cs-case-art"
                    role="img"
                    aria-label={t('تصور توضيحي: ', 'Illustrative concept: ') + copy.title}
                  >
                    <div className="cs-case-art-bar">
                      <span>TEVONIQ / {String(index + 1).padStart(2, '0')}</span>
                      <CodeXml size={18} aria-hidden="true" />
                    </div>
                    <div className="cs-case-flow">
                      {copy.labels.map((label, i) => (
                        <div key={label}>
                          <span>{String(i + 1).padStart(2, '0')}</span>
                          <strong>{label}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="cs-case-traces" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                    <small>{t('تصور وبيانات توضيحية', 'ILLUSTRATIVE CONCEPT AND DATA')}</small>
                  </div>
                  <div className="cs-case-content">
                    <span className="cs-sector">{copy.sector}</span>
                    <h3>{copy.title}</h3>
                    <p>{copy.intro}</p>
                    <details>
                      <summary>{t('استكشف دراسة السيناريو', 'Explore the scenario study')}</summary>
                      <div className="cs-case-details">
                        {[
                          [t('التحدي', 'Challenge'), copy.challenge],
                          [t('الحل المقترح', 'Proposed approach'), copy.approach],
                          [t('نطاق البداية', 'Initial scope'), copy.scope],
                          [t('التكاملات الممكنة', 'Integration review'), copy.integration],
                          [t('كيف نقيس الفائدة؟', 'How to assess value'), copy.measure],
                        ].map(([title, text]) => (
                          <div key={title}>
                            <h4>{title}</h4>
                            <p>{text}</p>
                          </div>
                        ))}
                        <p className="cs-case-limit">{copy.limit}</p>
                        <Link href={`/${locale}/contact?custom=case-${item.id}`}>
                          {t('ناقش حلًا مشابهًا لنشاطك', 'Discuss a similar business need')}
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    </details>
                    <Link className="cs-demo-link" href={`/${locale}${item.demo}`}>
                      {t('جرّب النموذج المرتبط', 'Try the related model')}
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="cs-journey" className="erp-section">
        <p className="erp-kicker">
          {t('تسليم يمكن مراجعته مرحلةً بمرحلة', 'REVIEW DELIVERY ONE STAGE AT A TIME')}
        </p>
        <h2>{c.journeyHeading}</h2>
        <fieldset className="cs-journey">
          <legend>
            {t('اختر مرحلة لمراجعة مخرجاتها', 'Choose a stage to review its outputs')}
          </legend>
          <div className="cs-stage-options">
            {customStages.map((stage, index) => (
              <label key={stage.id}>
                <input
                  type="radio"
                  name="custom-stage"
                  value={stage.id}
                  defaultChecked={index === 0}
                />
                <span className="cs-stage-number">0{index + 1}</span>
                <strong>{stage[locale].title}</strong>
              </label>
            ))}
          </div>
          <div className="cs-stage-panels">
            {customStages.map((stage) => (
              <article key={stage.id} data-stage={stage.id}>
                <div>
                  <span>{t('ما الذي نفعله؟', 'WHAT HAPPENS')}</span>
                  <h3>{stage[locale].title}</h3>
                  <p>{stage[locale].body}</p>
                </div>
                <div>
                  <h4>{t('ما الذي تستلمه؟', 'What you review')}</h4>
                  <p>{stage[locale].output}</p>
                  <div className="cs-gate">
                    <Check size={20} aria-hidden="true" />
                    <p>{stage[locale].gate}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </fieldset>
      </section>
      <section className="cs-ai-shell">
        <div className="erp-section cs-ai">
          <div>
            <p className="cs-eyebrow">
              {t('تقنيات حديثة، ومراجعة مسؤولة', 'MODERN TOOLS, RESPONSIBLE REVIEW')}
            </p>
            <h2>{t('مساعدة ذكية، وقرار مدروس', 'AI assistance. Considered decisions.')}</h2>
            <p>
              {t(
                'نستخدم أدوات الذكاء الاصطناعي عندما تخدم المهمة، ونراجع الشيفرة والاختبارات والتوثيق قبل الاعتماد. لا نعد بنسبة تسريع أو نتيجة لم تُقَس على مشروعك.',
                'We use AI tools where they serve the task and review code, tests and documentation before acceptance. Speed or outcome claims need evidence from your project.',
              )}
            </p>
          </div>
          <div className="cs-ai-flow">
            {[
              t('اقتراح مناسب', 'Relevant suggestion'),
              t('مراجعة بشرية', 'Human review'),
              t('اختبار واعتماد', 'Test and accept'),
            ].map((label, index) => (
              <div key={label}>
                <span>0{index + 1}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="cs-faq" className="erp-section">
        <h2>{t('أسئلة قبل أن نبدأ', 'Questions before we start')}</h2>
        <div className="erp-faq">
          {c.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="cs-contact">
          <div>
            <h3>{t('أخبرنا بما يعطّل عملك', 'Tell us what slows your work down')}</h3>
            <p>
              {t(
                'نراجع معك هل تحتاج حلًا جديدًا، أو تعديلًا، أو ربط الأدوات الموجودة.',
                'We can review whether a new solution, a change or connecting existing tools is the right starting point.',
              )}
            </p>
          </div>
          <Link className="erp-primary" href={`/${locale}/contact?custom=operations`}>
            {t('لنحدد البداية المناسبة', 'Find your starting point')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <StructuredData data={faqData(c.faq)} />
    </div>
  );
}
