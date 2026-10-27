import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  CodeXml,
  FileCheck2,
  MousePointer2,
  GitBranch,
  ClipboardList,
  SearchCheck,
} from 'lucide-react';
import {
  engineeringCopy,
  engineeringCases,
  type EngineeringLocale,
} from '@/content/software-engineering';
import { EngineeringServiceExplorer, EngineeringStages } from './engineering-tools';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './erp-service.css';
import './software-engineering.css';
export function SoftwareEngineeringService({ locale }: { locale: EngineeringLocale }) {
  const ar = locale === 'ar',
    c = engineeringCopy[locale];
  return (
    <div className="erp-service se-service" dir={ar ? 'rtl' : 'ltr'}>
      <section className="se-hero-shell">
        <div className="erp-section se-hero">
          <div>
            <p className="erp-kicker">
              {ar
                ? 'هندسة برمجيات للمنشآت الصغيرة والمتوسطة'
                : 'SOFTWARE ENGINEERING FOR SMALL AND MEDIUM BUSINESSES'}
            </p>
            <h1>{c.title}</h1>
            <p className="se-subtitle">{c.subtitle}</p>
            <p>{c.intro}</p>
            <div className="erp-actions">
              <a className="erp-primary" href="#se-services">
                {ar ? 'استكشف ما يمكن تنفيذه' : 'Explore what we can build'}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a className="erp-secondary" href="#se-cases">
                {ar ? 'تصفّح دراسات السيناريوهات' : 'Explore scenario studies'}
              </a>
            </div>
          </div>
          <div className="se-art-shell">
            <div
              className="se-art"
              role="img"
              aria-label={
                ar
                  ? 'من المتطلبات إلى التصميم والشيفرة ثم الاختبار والتسليم'
                  : 'From requirements through design and code to testing and handover'
              }
            >
              <div className="se-art-top">
                <i />
                <i />
                <i />
                <span>TEVONIQ / ENGINEERING</span>
              </div>
              <div className="se-code-symbol">
                <CodeXml size={106} strokeWidth={1.1} aria-hidden="true" />
                <strong>
                  {ar ? 'فكرة واضحة. بناء مدروس.' : 'Clear ideas. Considered delivery.'}
                </strong>
              </div>
              <div className="se-code-lines" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="se-art-flow">
                {[
                  { icon: ClipboardList, title: ar ? 'متطلبات' : 'Define' },
                  { icon: MousePointer2, title: ar ? 'تصميم' : 'Design' },
                  { icon: GitBranch, title: ar ? 'بناء' : 'Build' },
                  { icon: FileCheck2, title: ar ? 'اختبار' : 'Test' },
                ].map(({ icon: Icon, title }) => (
                  <div key={title}>
                    <Icon size={23} aria-hidden="true" />
                    <span>{title}</span>
                  </div>
                ))}
              </div>
              <small>
                {ar ? 'تصوّر توضيحي لدورة تطوير المنتج' : 'ILLUSTRATIVE PRODUCT DELIVERY FLOW'}
              </small>
            </div>
          </div>
        </div>
      </section>
      <nav
        className="erp-section-nav"
        aria-label={ar ? 'أقسام هندسة البرمجيات' : 'Software engineering page sections'}
      >
        <div>
          {[
            ['se-services', ar ? 'الخدمات' : 'Services'],
            ['se-stages', ar ? 'طريقة العمل' : 'Delivery approach'],
            ['se-cases', ar ? 'دراسات سيناريوهات' : 'Scenario studies'],
            ['se-quality', ar ? 'الجودة والتسليم' : 'Quality and handover'],
            ['se-faq', ar ? 'أسئلة شائعة' : 'FAQ'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>
      <section className="erp-section">
        <header className="erp-heading">
          <p className="erp-kicker">
            {ar ? 'قرار مفهوم في كل مرحلة' : 'A CLEAR DECISION AT EACH STAGE'}
          </p>
          <h2>
            {ar ? 'نبني ما يخدم عملك، خطوة بخطوة' : 'Build what serves your business, step by step'}
          </h2>
          <p>
            {ar
              ? 'نختار نقطة بداية مفيدة ونربط التنفيذ بمخرجات يمكنك مراجعتها، من أول تصور إلى الاستخدام الفعلي.'
              : 'Choose a useful starting point and tie delivery to outputs you can review, from the first outline to everyday use.'}
          </p>
        </header>
        <div className="se-pillars">
          {c.pillars.map(([title, body], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="se-services" className="erp-section">
        <header className="erp-heading">
          <p className="erp-kicker">
            {ar ? 'خدمات مترابطة بنطاق محدد' : 'CONNECTED SERVICES WITH DEFINED SCOPE'}
          </p>
          <h2>{ar ? 'ما الذي يحتاجه منتجك الآن؟' : 'What does your product need now?'}</h2>
          <p>
            {ar
              ? 'اختر الجانب الأقرب إلى احتياجك لتعرف خطواته ومخرجه، ثم استكشف مثالًا أو ناقش متطلباتك.'
              : 'Choose the area closest to your need to explore its steps and output, then try an example or discuss your requirements.'}
          </p>
        </header>
        <EngineeringServiceExplorer locale={locale} />
      </section>
      <section id="se-stages" className="se-stages-shell">
        <div className="erp-section">
          <header className="erp-heading">
            <p className="erp-kicker">
              {ar ? 'أربع مراحل قابلة للمراجعة' : 'FOUR REVIEWABLE STAGES'}
            </p>
            <h2>
              {ar ? 'من الفكرة إلى نسخة يمكن استخدامها' : 'From an idea to a usable first version'}
            </h2>
            <p>
              {ar
                ? 'نتحرك بناءً على وضوح النطاق ونتيجة التجربة والاختبار، ثم نتفق على التوسع. المدد والتكلفة تحددان بحسب المتطلبات.'
                : 'Progress depends on scope clarity, prototype feedback and test results, then an agreement to expand. Timeline and cost depend on requirements.'}
            </p>
          </header>
          <EngineeringStages locale={locale} />
        </div>
      </section>
      <section id="se-cases" className="erp-section">
        <header className="erp-heading">
          <p className="erp-kicker">
            {ar
              ? 'دراسات سيناريوهات توضيحية — ليست أعمال عملاء'
              : 'ILLUSTRATIVE SCENARIO STUDIES — NOT CLIENT ENGAGEMENTS'}
          </p>
          <h2>
            {ar
              ? 'من مشكلة يومية إلى نطاق قابل للتنفيذ'
              : 'From an everyday problem to a deliverable scope'}
          </h2>
          <p>
            {ar
              ? 'ثلاثة أمثلة أصلية تشرح المشكلة، وما يمكن بناؤه أولًا، وكيف نراجعه. بياناتها افتراضية وروابطها تقود إلى نماذجنا التفاعلية.'
              : 'Three original examples explain a problem, a possible first scope and how to review it. They use fictional data and link to our interactive demos.'}
          </p>
        </header>
        <div className="se-case-grid">
          {engineeringCases.map((item, index) => {
            const s = item[locale];
            return (
              <article key={item.id} className={`se-case se-case-${item.theme}`}>
                <div className="se-case-art" aria-hidden="true">
                  <span>0{index + 1}</span>
                  {index === 0 ? (
                    <ClipboardList size={48} />
                  ) : index === 1 ? (
                    <GitBranch size={48} />
                  ) : (
                    <SearchCheck size={48} />
                  )}
                  <div>
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="se-case-body">
                  <p className="erp-kicker">
                    {ar ? 'دراسة سيناريو توضيحي' : 'ILLUSTRATIVE SCENARIO STUDY'}
                  </p>
                  <h3>{s.title}</h3>
                  <p>{s.problem}</p>
                  <details>
                    <summary>
                      {ar ? 'اقرأ تفاصيل الدراسة' : 'Read the scenario study'}
                      <span aria-hidden="true">+</span>
                    </summary>
                    <h4>{ar ? 'نطاق البداية المقترح' : 'Proposed first scope'}</h4>
                    <ul>
                      {s.scope.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <h4>{ar ? 'معايير مراجعة النسخة' : 'Acceptance checks'}</h4>
                    <ul>
                      {s.checks.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <h4>{ar ? 'الربط المحتمل' : 'Potential integration'}</h4>
                    <p>{s.integration}</p>
                    <h4>{ar ? 'ما نؤجله' : 'What can wait'}</h4>
                    <p>{s.defer}</p>
                    <div className="se-output">
                      <Check size={18} aria-hidden="true" />
                      {s.outcome}
                    </div>
                    <Link
                      className="se-case-discuss"
                      href={`/${locale}/contact?intent=quote&engineering=case&id=${item.id}`}
                    >
                      {ar ? 'ناقش سيناريو نشاطك' : 'Discuss your business scenario'}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  </details>
                  <Link className="se-demo-link" href={`/${locale}/${item.model}`}>
                    {ar ? 'جرّب النموذج المرتبط' : 'Try the related demo'}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section id="se-quality" className="se-quality-shell">
        <div className="erp-section">
          <header className="erp-heading">
            <p className="erp-kicker">
              {ar ? 'الجودة تظهر في طريقة العمل' : 'QUALITY SHOWS IN HOW THE WORK IS DONE'}
            </p>
            <h2>{ar ? 'كيف نراجع ما نبنيه؟' : 'How do we review what we build?'}</h2>
          </header>
          <div className="se-quality-grid">
            {c.quality.map(([title, items]) => (
              <article key={title}>
                <FileCheck2 size={29} aria-hidden="true" />
                <h3>{title}</h3>
                <ul>
                  {items.map((line) => (
                    <li key={line}>
                      <Check size={16} aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="se-ai-note">
            <CodeXml size={29} aria-hidden="true" />
            <div>
              <h3>{ar ? 'أدوات ذكية، ومخرجات تُراجع' : 'AI assistance with reviewed outputs'}</h3>
              <p>
                {ar
                  ? 'نستفيد من الذكاء الاصطناعي في التحليل والبناء والاختبارات والتوثيق، مع مراجعة الشيفرة والنتيجة وتحديد ما يجوز مشاركته من بيانات.'
                  : 'Use AI to assist analysis, implementation, tests and documentation, while reviewing code and outcomes and agreeing which data may be shared.'}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="erp-section">
        <div className="erp-ready">
          <div>
            <p className="erp-kicker">
              {ar ? 'ابدأ بما تريد تحسينه' : 'START WITH WHAT YOU WANT TO IMPROVE'}
            </p>
            <h2>
              {ar
                ? 'ما الخطوة التي تريد تحويلها إلى برنامج؟'
                : 'Which step would you turn into software?'}
            </h2>
            <p>
              {ar
                ? 'شاركنا المشكلة والبرامج الحالية والمستخدمين. نراجع البداية المناسبة وما تحتاجه قبل اقتراح التنفيذ.'
                : 'Share the problem, current tools and users. We review a suitable starting point and its requirements before proposing implementation.'}
            </p>
            <Link
              className="erp-primary"
              href={`/${locale}/contact?intent=quote&engineering=service&id=discovery`}
            >
              {ar ? 'لنحدد بداية مشروعك' : 'Define your project’s starting point'}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <ul>
            {(ar
              ? [
                  'المشكلة والخطوة الحالية',
                  'المستخدمون والأدوار',
                  'البيانات والبرامج الموجودة',
                  'أولوية النسخة الأولى ومعيار نجاحها',
                ]
              : [
                  'The problem and current step',
                  'Users and roles',
                  'Existing data and tools',
                  'First-version priority and success criteria',
                ]
            ).map((line) => (
              <li key={line}>
                <Check size={18} aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="se-faq" className="erp-section erp-faq">
        <header className="erp-heading">
          <p className="erp-kicker">{ar ? 'قبل أن نبدأ' : 'BEFORE WE START'}</p>
          <h2>{ar ? 'أسئلة عن تطوير مشروعك' : 'Questions about developing your project'}</h2>
        </header>
        {c.faq.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
      <StructuredData data={faqData(c.faq)} />
    </div>
  );
}
