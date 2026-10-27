import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  Workflow,
  FileInput,
  ListChecks,
  BellRing,
  ShieldCheck,
  Sparkles,
  PlugZap,
  ClipboardCheck,
} from 'lucide-react';
import {
  automationServiceCopy,
  type AutomationServiceLocale,
} from '@/content/intelligent-automation';
import { automationCases } from '@/content/automation-cases';
import { AutomationJourney } from './automation-journey';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './intelligent-automation.css';
export function IntelligentAutomationService({ locale }: { locale: AutomationServiceLocale }) {
  const ar = locale === 'ar',
    c = automationServiceCopy[locale];
  const icons = [PlugZap, BellRing, Sparkles, ShieldCheck];
  return (
    <div className="ia-service" dir={ar ? 'rtl' : 'ltr'}>
      <section className="ia-hero-shell">
        <div className="ia-section ia-hero">
          <div>
            <p className="ia-eyebrow">
              {ar
                ? 'الأتمتة والربط للمنشآت الصغيرة والمتوسطة'
                : 'AUTOMATION & INTEGRATION FOR SMALL AND MEDIUM BUSINESSES'}
            </p>
            <h1>{c.title}</h1>
            <p className="ia-intro">{c.intro}</p>
            <div className="ia-actions">
              <a className="ia-primary" href="#ia-journey">
                {ar ? 'اكتشف رحلة الأتمتة' : 'Explore the journey'}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <Link className="ia-secondary" href={`/${locale}/automation-demos`}>
                {ar ? 'جرّب أمثلة عملية' : 'Try practical demos'}
              </Link>
            </div>
            <p className="ia-hero-note">
              <Check size={17} aria-hidden="true" />
              {ar
                ? 'نطاق واضح · موافقات محددة · تنفيذ على مراحل'
                : 'Clear scope · Explicit approvals · Staged delivery'}
            </p>
          </div>
          <div
            className="ia-flow-art"
            role="img"
            aria-label={
              ar
                ? 'مسار يبدأ بطلب، ثم فحص القواعد والموافقة، ثم إجراء موثق مع معالجة الاستثناءات'
                : 'A request passes through rules and approval to a logged action, with exception handling'
            }
          >
            <div className="ia-art-bar">
              <span />
              <span />
              <span />
              <small>TEVONIQ / WORKFLOW</small>
            </div>
            <div className="ia-art-source">
              <FileInput aria-hidden="true" />
              <span>{ar ? 'طلب جديد' : 'New request'}</span>
              <i />
            </div>
            <div className="ia-art-link" />
            <div className="ia-art-core">
              <Workflow size={35} aria-hidden="true" />
              <strong>{ar ? 'قواعد واضحة. ربط أذكى.' : 'Clear rules. Connected work.'}</strong>
              <span>{ar ? 'تحقق ← موافقة ← إجراء' : 'Validate → Approve → Act'}</span>
            </div>
            <div className="ia-art-branches">
              <div>
                <ClipboardCheck aria-hidden="true" />
                <strong>{ar ? 'إجراء معتمد' : 'Approved action'}</strong>
                <span>{ar ? 'سجل وتابع النتيجة' : 'Log and track the result'}</span>
              </div>
              <div>
                <ShieldCheck aria-hidden="true" />
                <strong>{ar ? 'حالة تحتاج مراجعة' : 'Needs review'}</strong>
                <span>{ar ? 'أوقف وراجع الاستثناء' : 'Pause and review the exception'}</span>
              </div>
            </div>
            <div className="ia-art-footer">
              <span />
              <small>{ar ? 'نموذج توضيحي لمسار العمل' : 'ILLUSTRATIVE WORKFLOW'}</small>
              <Check size={17} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
      <nav className="ia-nav" aria-label={ar ? 'أقسام الأتمتة والربط' : 'Automation page sections'}>
        <div>
          {[
            ['ia-benefits', ar ? 'لماذا الأتمتة؟' : 'Why automate'],
            ['ia-capabilities', ar ? 'ما الذي نربطه؟' : 'Capabilities'],
            ['ia-examples', ar ? 'جرّب النماذج' : 'Try the demos'],
            ['ia-journey', ar ? 'رحلة الأتمتة' : 'Your journey'],
            ['ia-faq', ar ? 'أسئلة شائعة' : 'FAQ'],
          ].map(([id, label]) => (
            <a href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </div>
      </nav>
      <section id="ia-benefits" className="ia-section">
        <header className="ia-heading">
          <p className="ia-eyebrow">{ar ? 'ابدأ من العمل المتكرر' : 'START WITH REPEATED WORK'}</p>
          <h2>
            {ar ? 'وقت أقل بين الخطوة والتي تليها' : 'Less friction between one step and the next'}
          </h2>
          <p>
            {ar
              ? 'عندما تكون المدخلات والقواعد واضحة، يمكن للأتمتة أن تساعدك في تنظيم العمل. نحدد معك ما يمكن تحسينه وكيف نراجع النتيجة.'
              : 'When inputs and rules are clear, automation can help organise work. Together, we define what to improve and how to review the result.'}
          </p>
        </header>
        <div className="ia-benefits">
          {c.benefits.map(([title, body], index) => (
            <article key={title}>
              <span className="ia-mini-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="ia-capabilities" className="ia-tint">
        <div className="ia-section">
          <header className="ia-heading">
            <p className="ia-eyebrow">{ar ? 'ماذا يمكننا تنفيذه؟' : 'WHAT WE CAN BUILD'}</p>
            <h2>{ar ? 'أدواتك تتعاون في مسار أوضح' : 'Your tools, working in a clearer flow'}</h2>
          </header>
          <div className="ia-capabilities">
            {c.capabilities.map(([title, body], index) => {
              const Icon = icons[index] ?? PlugZap;
              return (
                <article key={title}>
                  <Icon size={27} aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="ia-examples" className="ia-section">
        <header className="ia-heading">
          <p className="ia-eyebrow">
            {ar ? 'أمثلة توضيحية ببيانات افتراضية' : 'ILLUSTRATIVE EXAMPLES WITH FICTIONAL DATA'}
          </p>
          <h2>
            {ar
              ? 'كيف تبدو الأتمتة في عملك اليومي؟'
              : 'What could automation look like in your business?'}
          </h2>
          <p>
            {ar
              ? 'جرّب القواعد والموافقات والاستثناءات في المحاكيات التالية. هذه نماذج تفاعلية، وليست أعمال عملاء أو روابط تشغيل فعلية.'
              : 'Try rules, approvals and exceptions in these simulators. These are interactive examples, not client work or live integrations.'}
          </p>
        </header>
        <div className="ia-examples">
          {automationCases.map((item, index) => (
            <Link href={`/${locale}/automation-demos/${item.slug}`} key={item.slug}>
              <div className="ia-example-flow" aria-hidden="true">
                <FileInput size={22} />
                <i />
                <ListChecks size={25} />
                <i />
                {index % 2 ? <BellRing size={22} /> : <ClipboardCheck size={22} />}
              </div>
              <h3>{item[locale].name}</h3>
              <p>{item[locale].benefits[0]}</p>
              <span>
                {ar ? 'استكشف المسار وجربه' : 'Explore and try the flow'}
                <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section id="ia-journey" className="ia-journey-shell">
        <div className="ia-section">
          <header className="ia-heading ia-journey-heading">
            <p className="ia-eyebrow">
              {ar
                ? 'من أول سؤال إلى تشغيل قابل للمراجعة'
                : 'FROM THE FIRST QUESTION TO A REVIEWABLE FLOW'}
            </p>
            <h2>{c.journey}</h2>
            <p>
              {ar
                ? 'خمس مراحل مترابطة، ولكل مرحلة قرار ومخرج واضح. نبدأ بما يناسب عملك الآن، ثم نتوسع خطوة بخطوة.'
                : 'Five connected stages, each with a clear decision and output. Start with what fits your business now, then expand step by step.'}
            </p>
          </header>
          <AutomationJourney locale={locale} />
        </div>
      </section>
      <section className="ia-section">
        <div className="ia-readiness">
          <div>
            <p className="ia-eyebrow">
              {ar ? 'لنبدأ من معلومات بسيطة' : 'START WITH A FEW DETAILS'}
            </p>
            <h2>
              {ar ? 'ما الذي نحتاجه لتقييم الربط؟' : 'What do we need to assess the integration?'}
            </h2>
            <p>
              {ar
                ? 'شاركنا وصف الخطوة والبرامج المستخدمة. نراجع المتطلبات والصلاحيات وطريقة الاختبار قبل اقتراح التنفيذ.'
                : 'Describe the step and tools you use. We review requirements, permissions and testing before proposing implementation.'}
            </p>
            <Link className="ia-primary" href={`/${locale}/contact?intent=quote&journey=discovery`}>
              {ar ? 'أرسل الخطوة التي تريد تحسينها' : 'Tell us which step to improve'}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <ul>
            {(ar
              ? [
                  'أين يبدأ الطلب وأين تنتهي الخطوة؟',
                  'ما البرامج والحقول التي تستخدمها؟',
                  'ما الذي يحتاج موافقة قبل التنفيذ؟',
                  'كيف تتعامل اليوم مع الخطأ أو التكرار؟',
                ]
              : [
                  'Where does the request start and the step end?',
                  'Which tools and fields are involved?',
                  'What needs approval before an action?',
                  'How do you handle errors or duplicates today?',
                ]
            ).map((item) => (
              <li key={item}>
                <Check size={19} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="ia-faq" className="ia-section ia-faq">
        <header className="ia-heading">
          <p className="ia-eyebrow">{ar ? 'قبل أن نبدأ' : 'BEFORE WE START'}</p>
          <h2>{ar ? 'أسئلة عن الأتمتة والربط' : 'Automation and integration questions'}</h2>
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
