import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  Radio,
  FlaskConical,
  Cpu,
  LayoutDashboard,
  BellRing,
  ClipboardCheck,
  Thermometer,
  Droplets,
  Waves,
  Network,
  Database,
} from 'lucide-react';
import { iotCopy, type IotLocale } from '@/content/iot-service';
import { IotSimulator } from './iot-simulator';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './erp-service.css';
import './iot-service.css';
export function IotService({ locale }: { locale: IotLocale }) {
  const ar = locale === 'ar',
    c = iotCopy[locale];
  const icons = [Radio, FlaskConical, Cpu, LayoutDashboard, BellRing, ClipboardCheck],
    layerIcons = [Cpu, Network, Database, LayoutDashboard],
    caseIcons = [Thermometer, Droplets, Waves];
  return (
    <div className="erp-service iot-service" dir={ar ? 'rtl' : 'ltr'}>
      <section className="iot-hero-shell">
        <div className="erp-section iot-hero">
          <div>
            <p className="erp-kicker">
              {ar
                ? 'الأنظمة المدمجة وإنترنت الأشياء للمنشآت الصغيرة والمتوسطة'
                : 'EMBEDDED SYSTEMS & IoT FOR SMALL AND MEDIUM BUSINESSES'}
            </p>
            <h1>{c.title}</h1>
            <p className="iot-intro">{c.intro}</p>
            <div className="erp-actions">
              <a className="erp-primary" href="#iot-simulator">
                {ar ? 'جرّب محاكاة القراءات' : 'Try the reading simulator'}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <Link className="erp-secondary" href={`/${locale}/contact?intent=quote&iot=scope`}>
                {ar ? 'ناقش ربط جهازك' : 'Discuss connecting your device'}
              </Link>
            </div>
            <ul className="iot-hero-points">
              {(ar
                ? ['قراءة محددة', 'توافق يُراجع', 'اختبار قبل التوسع']
                : ['A defined reading', 'Reviewed compatibility', 'Test before expansion']
              ).map((line) => (
                <li key={line}>
                  <Check size={16} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="iot-hero-art">
            <Image
              src="/brand/navigation/iot-v1.webp"
              width={560}
              height={373}
              unoptimized
              alt=""
              loading="eager"
            />
            <div>
              <span>TEVONIQ / CONNECTED DEVICES</span>
              <strong>
                {ar
                  ? 'مستشعر ← اتصال ← تحقق ← متابعة'
                  : 'SENSOR → CONNECTION → VALIDATION → MONITORING'}
              </strong>
            </div>
          </div>
        </div>
      </section>
      <nav
        className="erp-section-nav"
        aria-label={ar ? 'أقسام إنترنت الأشياء' : 'IoT page sections'}
      >
        <div>
          {[
            ['iot-services', ar ? 'خدماتنا' : 'Services'],
            ['iot-architecture', ar ? 'كيف تنتقل البيانات؟' : 'Data flow'],
            ['iot-examples', ar ? 'أمثلة الاستخدام' : 'Use cases'],
            ['iot-simulator', ar ? 'المحاكي' : 'Simulator'],
            ['iot-process', ar ? 'مراحل التنفيذ' : 'Delivery stages'],
            ['iot-faq', ar ? 'أسئلة شائعة' : 'FAQ'],
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
            {ar ? 'ابدأ بما تحتاج إلى معرفته' : 'START WITH WHAT YOU NEED TO KNOW'}
          </p>
          <h2>
            {ar
              ? 'قراءة مفهومة، وخطوة متابعة واضحة'
              : 'An understandable reading and a clear next step'}
          </h2>
          <p>
            {ar
              ? 'قد تبدأ الفائدة من معرفة حالة جهاز أو قيمة مستشعر في مكان واحد. نحدد الاستخدام ومصدر البيانات وما الذي يحتاج إلى مراجعة، ثم نختبر مسارًا محدودًا بدل افتراض منظومة كبيرة من البداية.'
              : 'Value can start with seeing a device status or sensor reading in one place. Define the use, data source and review needs, then test a limited path before considering a larger system.'}
          </p>
        </header>
        <div className="iot-benefits">
          {(ar
            ? [
                ['بيانات لها مصدر', 'قراءة ووحدة ووقت يمكن تتبعها.'],
                ['حالة اتصال واضحة', 'نميز انقطاع المصدر وتقادم البيانات.'],
                ['بداية يمكن مراجعتها', 'نختبر المسار والمتطلبات قبل توسيعه.'],
              ]
            : [
                ['Traceable data', 'A reading, unit and time with a known source.'],
                ['Clear connection status', 'Distinguish offline sources and outdated data.'],
                ['A reviewable start', 'Test the flow and requirements before expanding.'],
              ]
          ).map(([title, body]) => (
            <article key={title}>
              <Check size={23} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="iot-services" className="iot-services-shell">
        <div className="erp-section">
          <header className="erp-heading">
            <p className="erp-kicker">{ar ? 'خدمات بنطاق واضح' : 'SERVICES WITH CLEAR SCOPE'}</p>
            <h2>
              {ar
                ? 'من تقييم الجهاز إلى واجهة المتابعة'
                : 'From assessing a device to a monitoring view'}
            </h2>
          </header>
          <div className="iot-services-grid">
            {c.services.map((service, index) => {
              const Icon = icons[index] ?? Radio;
              return (
                <article key={service.title}>
                  <Icon size={29} aria-hidden="true" />
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                  <ul>
                    {service.items.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <footer>
                    <Check size={16} aria-hidden="true" />
                    {service.output}
                  </footer>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="iot-architecture" className="erp-section">
        <header className="erp-heading">
          <p className="erp-kicker">{ar ? 'أربع طبقات مترابطة' : 'FOUR CONNECTED LAYERS'}</p>
          <h2>{ar ? 'كيف تصل القراءة إلى المستخدم؟' : 'How does a reading reach the user?'}</h2>
          <p>
            {ar
              ? 'نوضح مسؤولية كل طبقة ونقاط فحصها، ونحدد ما يتوفر اليوم وما يحتاج إلى إعداد أو تجربة.'
              : 'Explain each layer and its checks, identifying what is available today and what needs setup or a trial.'}
          </p>
        </header>
        <ol className="iot-layers">
          {c.layers.map(([title, body], index) => {
            const Icon = layerIcons[index] ?? Cpu;
            return (
              <li key={title}>
                <span className="iot-layer-number">0{index + 1}</span>
                <Icon size={28} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            );
          })}
        </ol>
      </section>
      <section id="iot-examples" className="iot-examples-shell">
        <div className="erp-section">
          <header className="erp-heading">
            <p className="erp-kicker">
              {ar ? 'أمثلة توضيحية ببيانات افتراضية' : 'ILLUSTRATIVE USE CASES WITH FICTIONAL DATA'}
            </p>
            <h2>{ar ? 'أين يمكن أن تبدأ في نشاطك؟' : 'Where could your business start?'}</h2>
            <p>
              {ar
                ? 'السيناريوهات التالية لتوضيح الفكرة والنطاق والاختبار، وليست مشاريع عملاء أو أنظمة قياس جاهزة للتشغيل.'
                : 'These scenarios illustrate a possible idea, scope and tests. They are not client projects or measurement systems ready for live operation.'}
            </p>
          </header>
          <div className="iot-case-grid">
            {c.examples.map((item, index) => {
              const Icon = caseIcons[index] ?? Radio;
              return (
                <article key={item.id}>
                  <div className={`iot-case-art iot-case-art-${item.id}`}>
                    <Icon size={45} aria-hidden="true" />
                    <span>{ar ? 'سيناريو توضيحي' : 'ILLUSTRATIVE SCENARIO'}</span>
                  </div>
                  <div className="iot-case-copy">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <details>
                      <summary>
                        {ar ? 'النطاق وطريقة المراجعة' : 'Scope and review'}
                        <span aria-hidden="true">+</span>
                      </summary>
                      <h4>{ar ? 'البداية' : 'Starting scope'}</h4>
                      <p>{item.scope}</p>
                      <h4>{ar ? 'ما نختبره' : 'What we test'}</h4>
                      <p>{item.checks}</p>
                      <h4>{ar ? 'حدود المثال' : 'Example boundaries'}</h4>
                      <p>{item.boundary}</p>
                    </details>
                    <Link href={`/${locale}/contact?intent=quote&iot=${item.id}`}>
                      {ar ? 'ناقش احتياجًا مشابهًا' : 'Discuss a similar need'}
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="iot-simulator" className="erp-section">
        <header className="erp-heading">
          <p className="erp-kicker">
            {ar ? 'تجربة محلية داخل الصفحة' : 'AN IN-PAGE LOCAL SIMULATION'}
          </p>
          <h2>{ar ? 'ماذا يحدث عندما تتغير القراءة؟' : 'What happens when a reading changes?'}</h2>
        </header>
        <IotSimulator locale={locale} />
      </section>
      <section id="iot-process" className="iot-process-shell">
        <div className="erp-section">
          <header className="erp-heading">
            <p className="erp-kicker">
              {ar ? 'ست مراحل ومخرجات محددة' : 'SIX STAGES WITH DEFINED OUTPUTS'}
            </p>
            <h2>
              {ar
                ? 'رحلتك من الفكرة إلى الربط التجريبي'
                : 'Your path from an idea to a trial connection'}
            </h2>
          </header>
          <ol className="iot-process">
            {c.phases.map(([title, body, output], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <footer>
                    <Check size={16} aria-hidden="true" />
                    {output}
                  </footer>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="erp-section">
        <div className="erp-ready">
          <div>
            <p className="erp-kicker">
              {ar ? 'قبل اقتراح التنفيذ' : 'BEFORE PROPOSING IMPLEMENTATION'}
            </p>
            <h2>
              {ar ? 'ما الجهاز وما الذي تريد متابعته؟' : 'Which device and what would you monitor?'}
            </h2>
            <p>
              {ar
                ? 'شاركنا نوع الجهاز والقراءة المطلوبة وطريقة الاتصال المتاحة. نراجع التوافق والمرحلة المناسبة ونوضح مسؤوليات توفير المكونات والتشغيل.'
                : 'Share the device type, required reading and available connection. Review compatibility and a suitable first stage, with clear ownership of components and operation.'}
            </p>
            <Link className="erp-primary" href={`/${locale}/contact?intent=quote&iot=scope`}>
              {ar ? 'أرسل تفاصيل جهازك واحتياجك' : 'Tell us about your device and need'}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <ul>
            {(ar
              ? [
                  'نوع الجهاز وواجهاته المتاحة',
                  'القيمة والوحدة ودورية القراءة',
                  'الشبكة والطاقة ومكان الاستخدام',
                  'المستخدم ومن يراجع التنبيه',
                  'معيار نجاح التجربة الأولى',
                ]
              : [
                  'Device type and available interfaces',
                  'Value, unit and reading frequency',
                  'Network, power and usage location',
                  'User and alert-review ownership',
                  'First-trial success criteria',
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
      <section id="iot-faq" className="erp-section erp-faq">
        <header className="erp-heading">
          <p className="erp-kicker">{ar ? 'قبل أن نبدأ' : 'BEFORE WE START'}</p>
          <h2>
            {ar ? 'أسئلة عن ربط الأجهزة والمستشعرات' : 'Device and sensor integration questions'}
          </h2>
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
