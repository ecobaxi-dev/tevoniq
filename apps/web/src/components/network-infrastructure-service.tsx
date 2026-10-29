import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  ClipboardCheck,
  FileText,
  Globe,
  Network,
  RadioTower,
  Router,
  Server,
  ShieldCheck,
  Wifi,
  Zap,
} from 'lucide-react';
import {
  networkCopy,
  networkServices,
  networkCases,
  networkEquipment,
  networkStages,
  type NetworkLocale,
} from '@/content/network-infrastructure';
import { NetworkExplorer, NetworkNeedsGuide } from './network-explorer';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './erp-service.css';
import './network-infrastructure-service.css';
export function NetworkInfrastructureService({ locale }: { locale: NetworkLocale }) {
  const ar = locale === 'ar',
    c = networkCopy[locale],
    t = (a: string, e: string) => (ar ? a : e),
    icons = [Network, Wifi, ShieldCheck, Zap, RadioTower, ClipboardCheck];
  return (
    <div className="erp-service net-service" dir={ar ? 'rtl' : 'ltr'}>
      <section className="net-hero-shell">
        <div className="erp-section net-hero">
          <div>
            <p className="erp-kicker">
              {t(
                'الشبكات / تصميم وإعداد ومراقبة وتوثيق',
                'NETWORKS / DESIGN, CONFIGURATION & OPERATIONS',
              )}
            </p>
            <h1>{c.title}</h1>
            <p className="net-subtitle">{c.subtitle}</p>
            <p>{c.intro}</p>
            <div className="erp-actions">
              <Link className="erp-primary" href={`/${locale}/contact?network=review`}>
                {t('لنراجع احتياج شبكتك', 'Review your network needs')}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a className="erp-secondary" href="#net-lab">
                {t('استكشف أمثلة الشبكات', 'Explore network examples')}
              </a>
            </div>
          </div>
          <div className="net-art-wrap">
            <div
              className="net-art"
              role="img"
              aria-label={t(
                'رسم لشبكة يربط الإنترنت ببوابة وسويتش وأجهزة العمل والاتصال اللاسلكي',
                'Illustration connecting internet, gateway, switch, work devices and wireless access',
              )}
            >
              <div className="net-art-bar">
                <span>TEVONIQ / CONNECTED BUSINESS</span>
                <i />
                <i />
                <i />
              </div>
              <div className="net-hero-diagram" aria-hidden="true">
                <span className="net-hero-internet">
                  <Globe size={31} />
                </span>
                <div className="net-hero-flow" />
                <div className="net-rack">
                  {[ShieldCheck, Router, Server].map((Icon, i) => (
                    <div key={i}>
                      <Icon size={25} />
                      <span />
                      <i />
                      <i />
                      <i />
                    </div>
                  ))}
                </div>
                <div className="net-hero-endpoints">
                  <span>
                    <Wifi size={24} />
                  </span>
                  <span>
                    <Network size={24} />
                  </span>
                  <span>
                    <RadioTower size={24} />
                  </span>
                </div>
              </div>
              <div className="net-art-tags">
                {[t('اتصال', 'Connectivity'), t('وصول', 'Access'), t('متابعة', 'Visibility')].map(
                  (item) => (
                    <span key={item}>
                      <Check size={14} aria-hidden="true" />
                      {item}
                    </span>
                  ),
                )}
              </div>
              <p>
                {t('تصوّر توضيحي — وليس حالة شبكة فعلية', 'Illustration — not live network status')}
              </p>
            </div>
          </div>
        </div>
      </section>
      <nav
        className="net-section-nav"
        aria-label={t('أقسام خدمة الشبكات', 'Network service sections')}
      >
        <div className="erp-section">
          {[
            ['services', t('الخدمات', 'Services')],
            ['lab', t('جرّب المخطط', 'Explore')],
            ['equipment', t('الأجهزة والبرمجيات', 'Hardware & software')],
            ['cases', t('سيناريوهات', 'Scenarios')],
            ['guide', t('مرشد الاحتياج', 'Needs guide')],
            ['faq', t('الأسئلة الشائعة', 'FAQ')],
          ].map(([id, title]) => (
            <a href={`#net-${id}`} key={id}>
              {title}
            </a>
          ))}
        </div>
      </nav>
      <section id="net-services" className="erp-section net-services">
        <p className="erp-kicker">
          {t('حل متكامل بنطاق واضح', 'A CONNECTED SOLUTION WITH EXPLICIT SCOPE')}
        </p>
        <h2>{t('من مخطط الشبكة إلى وضوح التشغيل', 'From network plans to visible operations')}</h2>
        <p>
          {t(
            'نبدأ بما يعيق العمل، ونربط الأجهزة بالإعدادات والتوثيق والمتابعة. نحدد ما يمكن تنفيذه عن بُعد وما يحتاج معاينة أو تجهيزًا ميدانيًا.',
            'Start with what interrupts the work, connecting hardware, configuration, documentation and monitoring. Identify remote work and required surveys or field arrangements.',
          )}
        </p>
        <div className="net-services-grid">
          {networkServices.map((item, i) => {
            const Icon = icons[i] ?? Network,
              s = item[locale];
            return (
              <article key={item.id}>
                <div className="net-card-top">
                  <Icon size={28} aria-hidden="true" />
                  <span>0{i + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="net-output">
                  <strong>{t('ما تستلمه', 'Deliverable')}</strong>
                  <span>{s.output}</span>
                </div>
                <Link href={`/${locale}/contact?network=scope-${item.id}`}>
                  {t('ناقش هذا النطاق', 'Discuss this scope')}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
      <section id="net-lab" className="net-lab-shell">
        <div className="erp-section">
          <p className="erp-kicker">{t('مختبر شبكات توضيحي', 'AN ILLUSTRATIVE NETWORK LAB')}</p>
          <h2>{t('شاهد كيف تتصل الأجزاء معًا', 'See how the components connect')}</h2>
          <p>
            {t(
              'اختر مكتبًا أو متجرًا أو عدة مواقع، واضغط على أي عنصر لمعرفة دوره. جرّب تعطل الخط الأساسي وفصل وصول الضيوف.',
              'Choose an office, store or multiple sites, inspect each component and explore link failure and guest isolation.',
            )}
          </p>
          <NetworkExplorer locale={locale} />
        </div>
      </section>
      <section className="erp-section net-software">
        <div>
          <p className="erp-kicker">
            {t('قيمة برمجية فوق الأجهزة', 'SOFTWARE VALUE AROUND THE HARDWARE')}
          </p>
          <h2>{t('حالة أوضح، ومتابعة منظمة', 'Clearer status. Structured follow-up.')}</h2>
          <p>
            {t(
              'يمكن إعداد لوحة عربية تجمع الأجهزة والروابط والتنبيهات وسجل التغييرات، بالاعتماد على أدوات مناسبة وواجهات متاحة. نحدد البيانات التي يمكن جمعها والصلاحيات وقنوات الإشعار قبل الربط.',
              'A tailored dashboard can bring together devices, links, alerts and changes using suitable tools and available interfaces. Agree collectible data, access and notification channels before integration.',
            )}
          </p>
          <Link className="net-inline-link" href={`/${locale}/contact?network=scope-monitoring`}>
            {t('ناقش لوحة متابعة شبكتك', 'Discuss network visibility')}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="net-software-flow">
          {[
            [RadioTower, t('رصد عناصر محددة', 'Monitor selected elements')],
            [FileText, t('تسجيل العطل والتعافي', 'Record failure and recovery')],
            [ClipboardCheck, t('تنبيه ومسؤولية متابعة', 'Notify an accountable owner')],
          ].map(([Icon, title], i) => {
            const I = Icon as typeof RadioTower;
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
              'التنبيه الآلي لا يعني استجابة بشرية على مدار الساعة. تُحدد ساعات المتابعة والتصعيد في الاتفاق.',
              'Automated alerts do not imply round-the-clock human response. Monitoring hours and escalation are agreed explicitly.',
            )}
          </p>
        </div>
      </section>
      <section id="net-equipment" className="net-equipment-shell">
        <div className="erp-section">
          <p className="erp-kicker">
            {t('خيارات تقنية نقيّمها حسب الحاجة', 'TECHNICAL OPTIONS ASSESSED FOR THE NEED')}
          </p>
          <h2>
            {t('المهمة أولًا، ثم الجهاز المناسب', 'The requirement first. Then the equipment.')}
          </h2>
          <p>
            {t(
              'الرسوم توضيحية للفئات والأدوات التي يمكن تقييمها، وليست صور منتجات أو شراكات معلنة أو مخزونًا للبيع. نختار الطراز والدعم والترخيص بعد مراجعة المتطلبات والتوافق والتوفر في بلد المشروع.',
              'Drawings illustrate categories and tools to evaluate, not actual product images, partner claims or stock for sale. Exact models, support and licensing follow requirements, compatibility and local availability checks.',
            )}
          </p>
          <div className="net-equipment-grid">
            {networkEquipment.map((item, i) => {
              const Icon =
                i === 4
                  ? RadioTower
                  : i === 5
                    ? ShieldCheck
                    : i === 0
                      ? Network
                      : i === 1
                        ? Wifi
                        : Router;
              return (
                <article className="net-equipment" key={item.id}>
                  <div className="net-equipment-art" aria-hidden="true">
                    <span>{item.kind}</span>
                    <div className={`net-device${item.id === 'zabbix' ? ' net-monitor' : ''}`}>
                      <Icon size={30} />
                      <div>
                        {[1, 2, 3, 4, 5, 6].map((id) => (
                          <i key={id} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="net-equipment-body">
                    <p className="net-brand-name">{item.name}</p>
                    <h3>{item[locale].title}</h3>
                    <p>{item[locale].use}</p>
                    <details>
                      <summary>
                        {t('ماذا نراجع قبل الاختيار؟', 'What do we check before selection?')}
                      </summary>
                      <p>{item[locale].check}</p>
                    </details>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="net-equipment-note">
            {t(
              'الجدار الناري وسياسات VPN تختلف عن حماية مفاتيح التشفير في HSM. الحلول المتخصصة تحتاج تقييمًا وتنفيذًا محددين، ولا تُدرج تلقائيًا في باقة شبكة مكتب.',
              'Firewall and VPN policies differ from cryptographic key protection in an HSM. Specialist requirements need separate assessment and implementation, not automatic inclusion in an office network package.',
            )}
          </p>
        </div>
      </section>
      <section id="net-cases" className="erp-section net-cases">
        <p className="erp-kicker">
          {t('دراسات سيناريوهات توضيحية', 'ILLUSTRATIVE SCENARIO STUDIES')}
        </p>
        <h2>{t('احتياجات مختلفة، وتصميم يناسبها', 'Different needs. A considered design.')}</h2>
        <p>
          {t(
            'هذه منشآت افتراضية تشرح طريقة التفكير والمخرجات، وليست أعمال عملاء أو مخططات تنفيذ معتمدة.',
            'Fictional businesses illustrate the approach and deliverables, not client work or approved installation designs.',
          )}
        </p>
        <div className="net-case-grid">
          {networkCases.map((item, i) => (
            <article className="net-case" id={`net-case-${item.id}`} key={item.id}>
              <span className="net-case-number">0{i + 1}</span>
              <p className="erp-kicker">{item[locale].sector}</p>
              <h3>{item[locale].title}</h3>
              <p>{item[locale].challenge}</p>
              <details>
                <summary>{t('اقرأ تفاصيل الحل', 'Read the solution scenario')}</summary>
                <div className="net-case-details">
                  {[
                    ['approach', t('نهج الحل', 'Approach')],
                    ['hardware', t('جانب الأجهزة', 'Hardware')],
                    ['software', t('جانب البرمجيات', 'Software')],
                    ['acceptance', t('كيف نختبر القبول؟', 'Acceptance checks')],
                    ['limit', t('النطاق والحدود', 'Scope and boundaries')],
                  ].map(([key, title]) => (
                    <div key={key}>
                      <h4>{title}</h4>
                      <p>
                        {
                          item[locale][
                            key as 'approach' | 'hardware' | 'software' | 'acceptance' | 'limit'
                          ]
                        }
                      </p>
                    </div>
                  ))}
                  <Link href={`/${locale}/contact?network=case-${item.id}`}>
                    {t('ناقش شبكة مشابهة', 'Discuss a similar network')}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </details>
            </article>
          ))}
        </div>
      </section>
      <section className="net-journey-shell">
        <div className="erp-section">
          <p className="erp-kicker">{t('من المراجعة إلى التسليم', 'FROM REVIEW TO HANDOVER')}</p>
          <h2>{t('أربع مراحل، ومسؤوليات واضحة', 'Four stages. Explicit responsibilities.')}</h2>
          <div className="net-stage-grid">
            {networkStages.map((item, i) => (
              <article key={item.id}>
                <span>0{i + 1}</span>
                <h3>{item[locale][0]}</h3>
                <p>{item[locale][1]}</p>
                <div className="net-stage-output">
                  <strong>{t('المخرج', 'Deliverable')}</strong>
                  <p>{item[locale][2]}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="net-guide" className="erp-section net-guide-section">
        <p className="erp-kicker">
          {t('مرشد أولي لتجهيز الشبكة', 'A STARTING GUIDE FOR YOUR NETWORK')}
        </p>
        <h2>{t('حدّد ما تحتاجه قبل شراء الأجهزة', 'Define the need before buying hardware')}</h2>
        <p>
          {t(
            'أربع اختيارات تُجهّز ملخصًا للمراجعة، ثم يمكنك نقله إلى رسالة التواصل دون إرسالها تلقائيًا.',
            'Four choices create a review brief that you can carry into a contact message without automatic submission.',
          )}
        </p>
        <NetworkNeedsGuide locale={locale} />
      </section>
      <section className="net-delivery-shell">
        <div className="erp-section net-delivery">
          <div>
            <p className="erp-kicker">
              {t('اتفاق مفصل قبل التنفيذ', 'AGREE THE DETAILS BEFORE DELIVERY')}
            </p>
            <h2>
              {t('افصل التكلفة، واعرف ما تستلمه', 'Separate the costs. Know the deliverables.')}
            </h2>
            <p>
              {t(
                'نوضح نطاق التصميم والإعداد والتوثيق، ونفصل شراء الأجهزة والتراخيص عن المعاينة والتمديدات والتركيب والمتابعة.',
                'Define design, configuration and documentation, separating hardware and licensing from surveys, cabling, installation and maintenance.',
              )}
            </p>
          </div>
          <ul>
            {[
              t(
                'تأكيد إمكان التوريد والعمل الميداني بحسب البلد.',
                'Confirm procurement and field arrangements for the country.',
              ),
              t(
                'قائمة مواد وطرازات وتراخيص بعد المراجعة.',
                'Review equipment models, bill of materials and licensing.',
              ),
              t(
                'نافذة تغيير ونسخة إعدادات وخطة تراجع.',
                'Agree a change window, configuration copy and rollback plan.',
              ),
              t(
                'فحوص قبول وملكية وصول وساعات متابعة محددة.',
                'Specify acceptance checks, access ownership and support hours.',
              ),
            ].map((item) => (
              <li key={item}>
                <Check size={17} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="net-faq" className="erp-section net-faq">
        <p className="erp-kicker">{t('قبل أن نبدأ', 'BEFORE WE START')}</p>
        <h2>{t('أسئلة تحدد نطاق الشبكة', 'Questions that define the network scope')}</h2>
        <div className="erp-faq">
          {c.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="net-cta">
        <div className="erp-section">
          <h2>{t('ما الذي يعيق اتصال أعمالك؟', 'What is getting in the way of your work?')}</h2>
          <p>
            {t(
              'صف الموقع والأجهزة والمشكلة الحالية، لنحدد المراجعة المناسبة وخطوة تنفيذ واضحة.',
              'Describe the premises, devices and current issue to define a suitable review and a clear next step.',
            )}
          </p>
          <Link className="erp-primary" href={`/${locale}/contact?network=review`}>
            {t('أرسل احتياج شبكتك', 'Share your network needs')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <StructuredData data={faqData(c.faq)} />
    </div>
  );
}
