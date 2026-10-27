import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  Boxes,
  ShoppingCart,
  Users,
  ClipboardList,
  ChartNoAxesCombined,
  PlugZap,
  SearchCheck,
  SlidersHorizontal,
  Database,
  BookOpen,
} from 'lucide-react';
import { erpCopy, type ErpLocale } from '@/content/erp-service';
import { ErpModuleExplorer, ErpComparison } from './erp-tools';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './erp-service.css';
export function ErpService({ locale }: { locale: ErpLocale }) {
  const ar = locale === 'ar',
    c = erpCopy[locale];
  const icons = [SearchCheck, Boxes, SlidersHorizontal, PlugZap, Database, BookOpen];
  return (
    <div className="erp-service" dir={ar ? 'rtl' : 'ltr'}>
      <section className="erp-hero-shell">
        <div className="erp-section erp-hero">
          <div>
            <p className="erp-kicker">
              {ar
                ? 'حلول ERP وإدارة الأعمال للمنشآت الصغيرة والمتوسطة'
                : 'ERP & BUSINESS MANAGEMENT FOR SMALL AND MEDIUM BUSINESSES'}
            </p>
            <h1>{c.title}</h1>
            <p className="erp-intro">{c.intro}</p>
            <div className="erp-actions">
              <a href="#erp-modules" className="erp-primary">
                {ar ? 'استكشف وحدات النظام' : 'Explore the modules'}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a href="#erp-comparison" className="erp-secondary">
                {ar ? 'قارن خيارات التنفيذ' : 'Compare delivery options'}
              </a>
            </div>
            <p className="erp-hero-note">
              {ar
                ? 'احتياج واضح · وحدات مترابطة · تنفيذ على مراحل'
                : 'Clear needs · Connected modules · Staged delivery'}
            </p>
          </div>
          <div className="erp-art-shell">
            <div
              className="erp-art"
              role="img"
              aria-label={
                ar
                  ? 'نظام مركزي يربط المبيعات والمخزون والعمليات والعملاء والتقارير'
                  : 'A central system connecting sales, inventory, operations, customers and reports'
              }
            >
              <div className="erp-art-top">
                <span />
                <span />
                <span />
                <small>TEVONIQ / BUSINESS SYSTEM</small>
              </div>
              <div className="erp-art-orbit" aria-hidden="true" />
              <div className="erp-art-center">
                <Boxes size={35} aria-hidden="true" />
                <strong>{ar ? 'بيانات مترابطة' : 'Connected records'}</strong>
                <span>{ar ? 'أدوار · قواعد · متابعة' : 'Roles · Rules · Follow-up'}</span>
              </div>
              <div className="erp-art-nodes">
                {[
                  { icon: ShoppingCart, title: ar ? 'المبيعات' : 'Sales' },
                  { icon: Boxes, title: ar ? 'المخزون' : 'Inventory' },
                  { icon: ClipboardList, title: ar ? 'التشغيل' : 'Operations' },
                  { icon: Users, title: ar ? 'العملاء' : 'Customers' },
                ].map(({ icon: Icon, title }) => (
                  <div key={title}>
                    <Icon size={22} aria-hidden="true" />
                    <span>{title}</span>
                  </div>
                ))}
              </div>
              <div className="erp-art-report">
                <ChartNoAxesCombined size={23} aria-hidden="true" />
                <strong>{ar ? 'رؤية أوضح لسير العمل' : 'A clearer view of your work'}</strong>
                <i />
                <i />
                <i />
                <i />
              </div>
              <small className="erp-art-note">
                {ar ? 'تصوّر توضيحي لربط وحدات النظام' : 'ILLUSTRATIVE MODULE MAP'}
              </small>
            </div>
          </div>
        </div>
      </section>
      <nav className="erp-section-nav" aria-label={ar ? 'أقسام حلول ERP' : 'ERP service sections'}>
        <div>
          {[
            ['erp-benefits', ar ? 'القيمة لعملك' : 'Business value'],
            ['erp-services', ar ? 'خدماتنا' : 'Services'],
            ['erp-modules', ar ? 'وحدات النظام' : 'Modules'],
            ['erp-comparison', ar ? 'قارن الخيارات' : 'Compare options'],
            ['erp-process', ar ? 'مراحل التنفيذ' : 'Delivery stages'],
            ['erp-faq', ar ? 'أسئلة شائعة' : 'FAQ'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>
      <section id="erp-benefits" className="erp-section">
        <header className="erp-heading">
          <p className="erp-kicker">
            {ar ? 'من سجلات متفرقة إلى عمل مترابط' : 'FROM SCATTERED RECORDS TO CONNECTED WORK'}
          </p>
          <h2>
            {ar
              ? 'ما الذي يمكن أن يضيفه النظام لنشاطك؟'
              : 'What can a connected system add to your business?'}
          </h2>
          <p>
            {ar
              ? 'الفائدة تبدأ من تنظيم الخطوات والبيانات التي تستخدمها فعلًا. نحدد مؤشرات للمراجعة معك، بدل افتراض نتائج قبل التنفيذ.'
              : 'Value starts with the steps and data you actually use. Agree review criteria rather than assuming results before delivery.'}
          </p>
        </header>
        <div className="erp-benefits">
          {c.benefits.map(([title, body]) => (
            <article key={title}>
              <Check size={23} aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="erp-services" className="erp-services-shell">
        <div className="erp-section">
          <header className="erp-heading">
            <p className="erp-kicker">
              {ar ? 'من الاختيار إلى التشغيل' : 'FROM CHOOSING TO USING'}
            </p>
            <h2>
              {ar ? 'خدمات تبني نظامًا يناسب طريقة عملك' : 'Services shaped around your workflow'}
            </h2>
          </header>
          <div className="erp-services-grid">
            {c.services.map(([title, body, output], index) => {
              const Icon = icons[index] ?? Boxes;
              return (
                <article key={title}>
                  <Icon size={29} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <footer>
                    <Check size={16} aria-hidden="true" />
                    {output}
                  </footer>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="erp-modules" className="erp-section">
        <header className="erp-heading">
          <p className="erp-kicker">
            {ar ? 'ابدأ بالوحدة الأكثر فائدة' : 'START WITH THE MOST USEFUL MODULE'}
          </p>
          <h2>{ar ? 'وحدات تتكامل حول احتياجك' : 'Modules that connect around your needs'}</h2>
          <p>
            {ar
              ? 'اختر وحدة لتتعرف على سجلاتها ومخرجها وحدودها، ثم شاهد نموذجًا تفاعليًا قريبًا. هذه تصورات توضيحية؛ نطاق نظامك يحدد بعد مراجعة العمل.'
              : 'Choose a module to explore its records, output and boundaries, then try a related interactive demo. These illustrate possibilities; your scope is defined after reviewing the workflow.'}
          </p>
        </header>
        <ErpModuleExplorer locale={locale} />
      </section>
      <section id="erp-comparison" className="erp-comparison-shell">
        <div className="erp-section">
          <header className="erp-heading erp-centered">
            <p className="erp-kicker">{ar ? 'قرار قبل البناء' : 'DECIDE BEFORE BUILDING'}</p>
            <h2>
              {ar ? 'نظام جاهز أم تطوير مخصص؟' : 'Ready-made software or custom development?'}
            </h2>
            <p>
              {ar
                ? 'الاختيار يعتمد على ملاءمة الوظائف وطريقة العمل والتكلفة الكاملة. نراجع الإعدادات والربط المتاح قبل اقتراح ما يحتاج إلى بناء.'
                : 'Choose based on feature fit, workflow and total ownership cost. Review available configuration and integration before deciding what needs to be built.'}
            </p>
          </header>
          <ErpComparison locale={locale} />
        </div>
      </section>
      <section className="erp-section">
        <header className="erp-heading">
          <p className="erp-kicker">
            {ar ? 'نماذج أصلية ببيانات افتراضية' : 'ORIGINAL DEMOS WITH FICTIONAL DATA'}
          </p>
          <h2>
            {ar ? 'شاهد الفكرة في نشاط قريب من عملك' : 'Explore the idea in a business like yours'}
          </h2>
        </header>
        <div className="erp-example-grid">
          {[
            {
              href: 'work-systems/inventory',
              title: ar ? 'تجارة ومخزون' : 'Trade and inventory',
              body: ar
                ? 'أصناف وحركات ورصيد وتنبيهات يمكن تجربتها.'
                : 'Try items, movements, balances and stock alerts.',
              icon: Boxes,
              lines: ar
                ? ['صنف مسجل', 'حركة معتمدة', 'رصيد محدّث']
                : ['Recorded item', 'Approved movement', 'Updated balance'],
            },
            {
              href: 'work-systems/workshop-orders',
              title: ar ? 'ورش وأوامر عمل' : 'Workshops and work orders',
              body: ar
                ? 'مواصفات وطلبات ومراحل تنفيذ في سجل واضح.'
                : 'Specifications, requests and delivery stages in a clear record.',
              icon: ClipboardList,
              lines: ar
                ? ['طلب جديد', 'مراجعة المواصفات', 'متابعة الإنجاز']
                : ['New request', 'Specification review', 'Track delivery'],
            },
            {
              href: 'work-systems/sales-crm',
              title: ar ? 'خدمات ومتابعة مبيعات' : 'Services and sales follow-up',
              body: ar
                ? 'فرص ومواعيد وملاحظات لخطوة تواصل أوضح.'
                : 'Opportunities, dates and notes for clearer follow-up.',
              icon: Users,
              lines: ar
                ? ['استفسار عميل', 'فرصة متابعة', 'قرار وخطوة تالية']
                : ['Customer enquiry', 'Follow-up opportunity', 'Decision and next step'],
            },
          ].map(({ href, title, body, icon: Icon, lines }) => (
            <Link key={href} href={`/${locale}/${href}`}>
              <div className="erp-example-art">
                <Icon size={32} aria-hidden="true" />
                <div>
                  {lines.map((line, index) => (
                    <span key={line}>
                      <i aria-hidden="true">0{index + 1}</i>
                      {line}
                    </span>
                  ))}
                </div>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
              <span>
                {ar ? 'جرّب النموذج التوضيحي' : 'Try the illustrative demo'}
                <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section id="erp-process" className="erp-process-shell">
        <div className="erp-section">
          <header className="erp-heading">
            <p className="erp-kicker">
              {ar ? 'أربع مراحل ومخرجات واضحة' : 'FOUR STAGES WITH CLEAR OUTPUTS'}
            </p>
            <h2>
              {ar
                ? 'كيف ننتقل من الاحتياج إلى الاستخدام؟'
                : 'How do we move from requirements to use?'}
            </h2>
          </header>
          <ol className="erp-process">
            {c.phases.map(([title, body, output], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <footer>
                  <Check size={16} aria-hidden="true" />
                  {output}
                </footer>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="erp-section">
        <div className="erp-ready">
          <div>
            <p className="erp-kicker">{ar ? 'قبل أن نحدد النطاق' : 'BEFORE DEFINING THE SCOPE'}</p>
            <h2>
              {ar ? 'لنبدأ من طريقة عملك الحالية' : 'Start with how your business works today'}
            </h2>
            <p>
              {ar
                ? 'أخبرنا أين تتكرر الخطوات وما الذي يصعب تتبعه، لنراجع معك أبسط نطاق مفيد وإمكانات تنفيذه.'
                : 'Tell us where steps repeat and what is hard to track. We review the simplest useful scope and how it could be delivered.'}
            </p>
            <Link className="erp-primary" href={`/${locale}/contact?intent=quote&erp=scope`}>
              {ar ? 'ناقش احتياج نظامك' : 'Discuss your system needs'}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <ul>
            {(ar
              ? [
                  'البرامج والملفات المستخدمة الآن',
                  'المستخدمون وأدوارهم',
                  'الوحدة الأكثر إلحاحًا للعمل',
                  'عينة من الحقول دون بيانات حساسة',
                  'الربط المطلوب ومعيار نجاح الخطوة',
                ]
              : [
                  'Current software and files',
                  'Users and their roles',
                  'The most urgent module',
                  'Example fields without sensitive data',
                  'Required integration and success criteria',
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
      <section id="erp-faq" className="erp-section erp-faq">
        <header className="erp-heading">
          <p className="erp-kicker">{ar ? 'قبل أن نبدأ' : 'BEFORE WE START'}</p>
          <h2>{ar ? 'أسئلة عن أنظمة إدارة الأعمال' : 'Business management system questions'}</h2>
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
