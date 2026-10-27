import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  SearchCheck,
  GitBranch,
  ClipboardList,
  Layers3,
  Globe2,
  ListChecks,
  Workflow,
  ChartNoAxesCombined,
  FileText,
  Compass,
} from 'lucide-react';
import {
  consultingCopy,
  consultingFaq,
  consultingAlternatives,
  type ConsultingLocale,
} from '@/content/technology-consulting';
import { ConsultingGuide, ConsultingComparison, ConsultingExamples } from './consulting-tools';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './technology-consulting.css';
export function TechnologyConsultingService({ locale }: { locale: ConsultingLocale }) {
  const ar = locale === 'ar',
    c = consultingCopy[locale];
  const services = ar
    ? [
        {
          title: 'فهم الاحتياج والأولوية',
          body: 'نراجع الخطوة الحالية والمستخدمين والبيانات، ونحدد المشكلة التي تستحق البدء بها.',
          output: 'ملخص احتياج وأولوية واضحة',
          icon: SearchCheck,
        },
        {
          title: 'مقارنة الخيارات التقنية',
          body: 'نقارن تحسين الموجود والحل الجاهز والربط والنطاق المخصص وفق متطلباتك.',
          output: 'خيارات مع أسباب وقيود',
          icon: Layers3,
        },
        {
          title: 'تحديد نطاق أولي',
          body: 'نحدد الصفحات أو السجلات أو الحقول ومراحل العمل وما يدخل النسخة الأولى.',
          output: 'نطاق وحدود ومعايير مراجعة',
          icon: ClipboardList,
        },
        {
          title: 'تخطيط الربط والمتابعة',
          body: 'نراجع مصادر البيانات وواجهات البرامج وشروط الموافقة قبل اختيار مسار ربط.',
          output: 'خريطة خطوات واعتماديات',
          icon: GitBranch,
        },
      ]
    : [
        {
          title: 'Clarify need and priority',
          body: 'Review the current step, users and data, and identify a worthwhile starting problem.',
          output: 'A clear need and priority brief',
          icon: SearchCheck,
        },
        {
          title: 'Compare technology options',
          body: 'Compare existing tools, ready-made options, integrations and custom scope against your requirements.',
          output: 'Options with reasons and limits',
          icon: Layers3,
        },
        {
          title: 'Define a first scope',
          body: 'Define pages, records, fields and workflow stages for the first version.',
          output: 'Scope, boundaries and review criteria',
          icon: ClipboardList,
        },
        {
          title: 'Plan integration and follow-up',
          body: 'Review data sources, software interfaces and approvals before selecting a flow.',
          output: 'A flow and dependency map',
          icon: GitBranch,
        },
      ];
  const phases = ar
    ? [
        {
          title: 'نفهم طريقة العمل',
          body: 'نحدد الهدف والمستخدمين والخطوة الحالية وما تحتاج إلى تحسينه.',
        },
        {
          title: 'نقارن ونحدد البداية',
          body: 'نراجع الخيارات والقيود ونختار نطاقًا أوليًا قابلًا للتجربة.',
        },
        {
          title: 'نجرّب ونراجع',
          body: 'نختبر نموذجًا أو خطوة محدودة ونراجعها مقابل النتيجة المطلوبة.',
        },
        {
          title: 'نقرر الخطوة التالية',
          body: 'نتفق على الاستمرار أو التعديل أو الاكتفاء بالحل الأبسط وفق ما ظهر.',
        },
      ]
    : [
        {
          title: 'Understand the workflow',
          body: 'Define the goal, users, current step and need for improvement.',
        },
        {
          title: 'Compare and scope a start',
          body: 'Review options and constraints, and choose a testable first scope.',
        },
        {
          title: 'Try and review',
          body: 'Test a prototype or limited step against the intended outcome.',
        },
        {
          title: 'Decide the next step',
          body: 'Agree whether to continue, adjust or keep the simpler solution based on what was learned.',
        },
      ];
  const galleries = [
    {
      href: 'website-designs',
      icon: Globe2,
      ar: 'مواقع الأعمال',
      en: 'Business websites',
      body: ar ? 'تعريف النشاط واستقبال الاستفسارات.' : 'Business presence and enquiries.',
    },
    {
      href: 'work-systems',
      icon: ListChecks,
      ar: 'أنظمة إدارة العمل',
      en: 'Work management',
      body: ar ? 'الطلبات والسجلات ومراحل الإنجاز.' : 'Requests, records and workflow stages.',
    },
    {
      href: 'automation-demos',
      icon: Workflow,
      ar: 'الأتمتة والربط',
      en: 'Automation & integration',
      body: ar ? 'خطوة متكررة بين أدوات قائمة.' : 'A repeated step between existing tools.',
    },
    {
      href: 'dashboard-demos',
      icon: ChartNoAxesCombined,
      ar: 'لوحات المعلومات',
      en: 'Business dashboards',
      body: ar ? 'مؤشر واضح يمكن تتبعه إلى السجل.' : 'Clear metrics traceable to source records.',
    },
  ];
  const nav = [
    { id: 'tc-guide', label: ar ? 'من أين أبدأ؟' : 'Where to start' },
    { id: 'tc-comparison', label: ar ? 'قارن الخيارات' : 'Compare options' },
    { id: 'tc-outputs', label: ar ? 'مخرجات واضحة' : 'Clear outputs' },
    { id: 'tc-examples', label: ar ? 'أمثلة توضيحية' : 'Illustrative examples' },
    { id: 'tc-process', label: ar ? 'خطوات العمل' : 'Our process' },
    { id: 'tc-faq', label: ar ? 'أسئلة شائعة' : 'FAQ' },
  ];
  return (
    <div className="tc-consulting" dir={ar ? 'rtl' : 'ltr'}>
      <section className="tc-hero-shell">
        <div className="tc-section tc-hero">
          <p className="tc-eyebrow">
            {ar
              ? 'استشارات تقنية للمنشآت الصغيرة والمتوسطة'
              : 'TECHNOLOGY CONSULTING FOR SMALL AND MEDIUM BUSINESSES'}
          </p>
          <h1>{c.title}</h1>
          <div className="tc-hero-grid">
            <div>
              <p className="tc-hero-intro">{c.intro}</p>
              <div className="tc-actions">
                <a className="tc-primary" href="#tc-guide">
                  {ar ? 'حدد من أين تبدأ' : 'Find your starting point'}{' '}
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a className="tc-secondary" href="#tc-comparison">
                  {ar ? 'قارن الخيارات' : 'Compare options'}
                </a>
              </div>
              <ul className="tc-hero-points">
                {(ar
                  ? ['تواصل مباشر', 'خيارات مبررة', 'نطاق وتنفيذ على مراحل']
                  : ['Direct communication', 'Reasoned options', 'Clear scope and stages']
                ).map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="tc-decision-art"
              aria-label={
                ar
                  ? 'ننتقل من الاحتياج إلى مقارنة الخيارات ثم نطاق واضح'
                  : 'From a need through option review to a clear scope'
              }
            >
              <div className="tc-art-heading">
                <span>
                  <Compass size={23} aria-hidden="true" />
                </span>
                <div>
                  <small>{ar ? 'نبدأ من عملك' : 'START WITH YOUR WORK'}</small>
                  <strong>{ar ? 'احتياج واضح' : 'A clear need'}</strong>
                </div>
                <i />
              </div>
              <div className="tc-art-options">
                {consultingAlternatives.map((item, index) => (
                  <div key={item.id}>
                    <span>0{index + 1}</span>
                    <strong>{ar ? item.arTitle : item.enTitle}</strong>
                  </div>
                ))}
              </div>
              <div className="tc-art-result">
                <FileText size={21} aria-hidden="true" />
                <div>
                  <strong>{ar ? 'نطاق أولي يمكن مراجعته' : 'A reviewable first scope'}</strong>
                  <small>
                    {ar
                      ? 'متطلبات · أولويات · خطوات تالية'
                      : 'Requirements · priorities · next steps'}
                  </small>
                </div>
                <Check size={20} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <nav
        className="tc-section-nav"
        aria-label={ar ? 'أقسام الاستشارات التقنية' : 'Technology consulting sections'}
      >
        <div>
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </div>
      </nav>
      <section className="tc-section tc-needs">
        <header className="tc-section-heading">
          <p className="tc-eyebrow">{ar ? 'متى تحتاج إلى هذه الخطوة؟' : 'WHEN THIS HELPS'}</p>
          <h2>
            {ar
              ? 'حين تكون المشكلة واضحة، لكن البداية غير محسومة'
              : 'When the problem is visible, but the next step is not'}
          </h2>
          <p>
            {ar
              ? 'قد تكون أمام برامج متعددة، أو عمل متكرر، أو فكرة مشروع تحتاج إلى تحديد. نساعدك على تحويل ذلك إلى قرار مفهوم ونطاق يمكن مناقشته.'
              : 'You may have several tools, repeated work or a project idea that needs definition. We help turn this into an understandable decision and a scope you can review.'}
          </p>
        </header>
        <div className="tc-service-grid">
          {services.map(({ title, body, output, icon: Icon }) => (
            <article key={title}>
              <span className="tc-tool-icon">
                <Icon size={24} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
              <footer>
                <Check size={15} aria-hidden="true" />
                {output}
              </footer>
            </article>
          ))}
        </div>
      </section>
      <section id="tc-guide" className="tc-section">
        <header className="tc-section-heading">
          <p className="tc-eyebrow">{ar ? 'أداة تمهيدية' : 'STARTING-POINT GUIDE'}</p>
          <h2>
            {ar
              ? 'خطوتك الأولى تبدأ من إجابات بسيطة'
              : 'A first step starts with a few simple answers'}
          </h2>
          <p>
            {ar
              ? 'اختر ما يصف وضعك اليوم. نعرض اتجاهًا أوليًا وسبب اختياره وما يستحق تأجيله، ثم يمكنك نقل الملخص إلى التواصل بإرادتك.'
              : 'Choose what describes your current situation. See an initial direction, why it was suggested and what can wait, then choose whether to pass the brief to contact.'}
          </p>
        </header>
        <ConsultingGuide locale={locale} />
      </section>
      <section id="tc-comparison" className="tc-comparison-shell">
        <div className="tc-section">
          <header className="tc-section-heading">
            <p className="tc-eyebrow">{ar ? 'قرار قبل التنفيذ' : 'DECIDE BEFORE IMPLEMENTING'}</p>
            <h2>
              {ar ? 'ما الخيار الأقرب إلى احتياجك؟' : 'Which option fits the need worth reviewing?'}
            </h2>
            <p>
              {ar
                ? 'نراجع ما يمكن تحسينه أو اختياره أو ربطه قبل تحديد ما يحتاج إلى بناء. تتغير الملاءمة بحسب البرنامج والبيانات وطريقة العمل.'
                : 'Review what can be improved, selected or connected before defining what needs building. Fit depends on your tools, data and workflow.'}
            </p>
          </header>
          <ConsultingComparison locale={locale} />
          <div className="tc-options-overview">
            {consultingAlternatives.map((item) => (
              <article key={item.id}>
                <strong>{ar ? item.arTitle : item.enTitle}</strong>
                <p>{item[locale].fit}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="tc-outputs" className="tc-section">
        <header className="tc-section-heading">
          <p className="tc-eyebrow">{ar ? 'مخرجات قابلة للمراجعة' : 'REVIEWABLE OUTPUTS'}</p>
          <h2>{ar ? 'ماذا ستحصل عليه من الاستشارة؟' : 'What can consulting produce?'}</h2>
          <p>
            {ar
              ? 'نتفق على المخرجات ضمن نطاق الاستشارة؛ ويمكن أن تشمل الوثائق التالية بحسب الحاجة.'
              : 'Outputs are agreed within the consulting scope and may include these documents as needed.'}
          </p>
        </header>
        <div className="tc-output-grid">
          {(ar
            ? [
                {
                  title: 'ملخص الاحتياج',
                  items: [
                    'المشكلة والمستخدمون',
                    'الأدوات والبيانات الحالية',
                    'الأولوية والنتيجة المطلوبة',
                  ],
                },
                {
                  title: 'نطاق أولي وحدود واضحة',
                  items: [
                    'الصفحات أو السجلات والخطوات',
                    'ما يدخل المرحلة الأولى وما يؤجل',
                    'اعتماديات ومعايير مراجعة',
                  ],
                },
                {
                  title: 'خطة مراحل وخيارات',
                  items: [
                    'سبب اختيار المسار',
                    'خطوة تجربة محدودة',
                    'ما نراجعه قبل التوسع والتكلفة',
                  ],
                },
              ]
            : [
                {
                  title: 'A needs brief',
                  items: [
                    'Problem and users',
                    'Current tools and data',
                    'Priority and intended outcome',
                  ],
                },
                {
                  title: 'A first scope with boundaries',
                  items: [
                    'Pages, records and steps',
                    'First-stage inclusions and deferrals',
                    'Dependencies and review criteria',
                  ],
                },
                {
                  title: 'Options and staged next steps',
                  items: [
                    'Reason for the chosen direction',
                    'A limited trial step',
                    'Checks before expansion and costing',
                  ],
                },
              ]
          ).map((item, index) => (
            <article key={item.title}>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <ul>
                {item.items.map((line) => (
                  <li key={line}>
                    <Check size={15} aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section id="tc-examples" className="tc-section">
        <header className="tc-section-heading">
          <p className="tc-eyebrow">{ar ? 'أمثلة ببيانات افتراضية' : 'FICTIONAL EXAMPLES'}</p>
          <h2>
            {ar
              ? 'كيف يبدو القرار في نشاط قريب من عملك؟'
              : 'What could the decision look like for a business like yours?'}
          </h2>
          <p>
            {ar
              ? 'اختر نشاطًا، ثم تصفّح الحاجة واتجاه البداية والنطاق وما نؤجله. هذه أمثلة توضيحية للمخرجات وليست دراسات عملاء.'
              : 'Choose a scenario, then explore its need, starting direction, scope and deferrals. These illustrate outputs and are not client case studies.'}
          </p>
        </header>
        <ConsultingExamples locale={locale} />
      </section>
      <section id="tc-process" className="tc-process-shell">
        <div className="tc-section">
          <header className="tc-section-heading">
            <p className="tc-eyebrow">{ar ? 'طريقة العمل' : 'OUR APPROACH'}</p>
            <h2>
              {ar
                ? 'من فهم المشكلة إلى قرار قابل للتنفيذ'
                : 'From understanding the problem to an actionable decision'}
            </h2>
          </header>
          <ol className="tc-process">
            {phases.map((phase, index) => (
              <li key={phase.title}>
                <span>0{index + 1}</span>
                <h3>{phase.title}</h3>
                <p>{phase.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="tc-section">
        <header className="tc-section-heading">
          <p className="tc-eyebrow">{ar ? 'استكشف ما يمكن تنفيذه' : 'EXPLORE WHAT WE CAN BUILD'}</p>
          <h2>
            {ar
              ? 'جرّب النماذج قبل أن تحدد الاتجاه'
              : 'Explore the demos before choosing a direction'}
          </h2>
          <p>
            {ar
              ? 'نماذج أصلية توضيحية تبيّن شكل الخدمات الأربع. نحدد ما يناسب احتياجك بعد مراجعة التفاصيل.'
              : 'Original illustrative demos showing the four service areas. Fit is determined after reviewing your requirements.'}
          </p>
        </header>
        <div className="tc-gallery-links">
          {galleries.map(({ href, icon: Icon, body, ...item }) => (
            <Link key={href} href={`/${locale}/${href}`}>
              <Icon size={26} aria-hidden="true" />
              <h3>{item[locale]}</h3>
              <p>{body}</p>
              <span>
                {ar ? 'استكشف النماذج' : 'Explore demos'}{' '}
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section id="tc-faq" className="tc-section tc-faq">
        <header className="tc-section-heading">
          <p className="tc-eyebrow">{ar ? 'قبل أن نبدأ' : 'BEFORE WE START'}</p>
          <h2>{ar ? 'أسئلة شائعة عن الاستشارة' : 'Consulting questions'}</h2>
        </header>
        {consultingFaq[locale].map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
      <section className="tc-section">
        <div className="tc-bottom-cta">
          <div>
            <p className="tc-eyebrow">{ar ? 'ابدأ من احتياجك' : 'START WITH YOUR NEED'}</p>
            <h2>
              {ar ? 'ما الخطوة التي تريد تحسينها أولًا؟' : 'Which step would you improve first?'}
            </h2>
            <p>
              {ar
                ? 'شاركنا طريقة العمل والمشكلة والبرامج الحالية. نراجعها معك ونحدد الخطوة المناسبة ونطاقها قبل التنفيذ.'
                : 'Tell us about the workflow, problem and current tools. We review them with you and define a suitable next step and scope before implementation.'}
            </p>
          </div>
          <Link className="tc-primary" href={`/${locale}/contact?intent=quote&consulting=scope`}>
            {ar ? 'لنناقش احتياجك' : 'Discuss your needs'}{' '}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <StructuredData data={faqData(consultingFaq[locale])} />
    </div>
  );
}
