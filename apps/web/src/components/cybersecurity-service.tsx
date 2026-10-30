import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  ClipboardCheck,
  FileKey2,
  FileText,
  KeyRound,
  LockKeyhole,
  Mail,
  Monitor,
  ScanSearch,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import {
  cyberCopy,
  cyberBenefits,
  cyberServices,
  cyberCases,
  cyberStages,
  type CyberLocale,
} from '@/content/cybersecurity';
import { CyberPriorityGuide } from './cyber-priority-guide';
import { StructuredData } from './seo/json-ld';
import { faqData } from '@/lib/seo-core';
import './erp-service.css';
import './cybersecurity-service.css';
export function CybersecurityService({ locale }: { locale: CyberLocale }) {
  const ar = locale === 'ar',
    c = cyberCopy[locale],
    t = (a: string, e: string) => (ar ? a : e),
    icons = [ScanSearch, UserRoundCheck, Mail, Monitor, FileKey2, ClipboardCheck];
  return (
    <div className="erp-service cyber-service" dir={ar ? 'rtl' : 'ltr'}>
      <section className="cyber-hero-shell">
        <div className="erp-section cyber-hero">
          <div>
            <p className="erp-kicker">
              {t(
                'الأمن السيبراني / للمنشآت الصغيرة والمتوسطة',
                'CYBERSECURITY / FOR SMALL AND MEDIUM BUSINESSES',
              )}
            </p>
            <h1>{c.title}</h1>
            <p className="cyber-subtitle">{c.subtitle}</p>
            <p>{c.intro}</p>
            <div className="erp-actions">
              <Link className="erp-primary" href={`/${locale}/contact?cyber=review`}>
                {t('لنحدد أولويات الحماية', 'Discuss security priorities')}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a className="erp-secondary" href="#cyber-guide">
                {t('اختر نقطة البداية', 'Find a starting point')}
              </a>
            </div>
          </div>
          <div className="cyber-art-wrap">
            <div
              className="cyber-art"
              role="img"
              aria-label={t(
                'رسم لحماية متعددة الجوانب: حسابات وبريد وملفات مع مراجعة وتوثيق',
                'Illustration of accounts, email and files connected to review and documentation',
              )}
            >
              <div className="cyber-art-bar">
                <span>TEVONIQ / SECURITY FOUNDATIONS</span>
                <i />
                <i />
                <i />
              </div>
              <div className="cyber-shield-art" aria-hidden="true">
                <div className="cyber-orbit" />
                <div className="cyber-shield-core">
                  <ShieldCheck size={63} />
                  <span>REVIEW · CONFIGURE · VERIFY</span>
                </div>
                <span className="cyber-art-node cyber-art-key">
                  <KeyRound size={25} />
                </span>
                <span className="cyber-art-node cyber-art-mail">
                  <Mail size={25} />
                </span>
                <span className="cyber-art-node cyber-art-files">
                  <FileKey2 size={25} />
                </span>
              </div>
              <div className="cyber-art-tags">
                {[
                  t('نطاق مصرح', 'Authorised scope'),
                  t('إعداد موثق', 'Documented settings'),
                  t('دليل تحقق', 'Verification evidence'),
                ].map((item) => (
                  <span key={item}>
                    <Check size={13} aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
              <p>
                {t(
                  'رسم توضيحي — لا يعرض فحصًا أو حماية مباشرة',
                  'Illustration — not a live review or protection service',
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
      <nav className="cyber-nav" aria-label={t('أقسام الأمن السيبراني', 'Cybersecurity sections')}>
        <div className="erp-section">
          {[
            ['benefits', t('القيمة', 'Value')],
            ['services', t('الخدمات', 'Services')],
            ['cases', t('دراسات توضيحية', 'Scenarios')],
            ['journey', t('مراحل العمل', 'Process')],
            ['guide', t('مرشد الأولويات', 'Priority guide')],
            ['faq', t('الأسئلة الشائعة', 'FAQ')],
          ].map(([id, title]) => (
            <a key={id} href={`#cyber-${id}`}>
              {title}
            </a>
          ))}
        </div>
      </nav>
      <section id="cyber-benefits" className="erp-section cyber-benefits">
        <p className="erp-kicker">{t('الفائدة قبل الأدوات', 'VALUE BEFORE TOOLS')}</p>
        <h2>{t('أولويات تناسب طريقة عملك', 'Priorities that fit the way you work')}</h2>
        <div className="cyber-benefit-grid">
          {cyberBenefits.map((item, i) => (
            <article key={i}>
              <span>0{i + 1}</span>
              <h3>{item[locale][0]}</h3>
              <p>{item[locale][1]}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="cyber-services" className="cyber-services-shell">
        <div className="erp-section">
          <p className="erp-kicker">
            {t('خدمات محددة بمخرجات واضحة', 'FOCUSED SERVICES. EXPLICIT DELIVERABLES.')}
          </p>
          <h2>{t('نراجع ما تعتمد عليه يوميًا', 'Review what you rely on every day')}</h2>
          <p className="cyber-scope-intro">
            {t(
              'نختار المحاور حسب الاحتياج والصلاحيات والأدوات المتاحة، ونحدد ما يشمله العمل قبل البدء.',
              'Choose areas according to need, permissions and available tools, with agreed scope before work begins.',
            )}
          </p>
          <div className="cyber-service-grid">
            {cyberServices.map((item, i) => {
              const Icon = icons[i] ?? ShieldCheck,
                s = item[locale];
              return (
                <article key={item.id}>
                  <div className="cyber-card-top">
                    <Icon size={28} aria-hidden="true" />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <div className="cyber-output">
                    <strong>{t('المخرج', 'Deliverable')}</strong>
                    <span>{s.output}</span>
                  </div>
                  <Link href={`/${locale}/contact?cyber=scope-${item.id}`}>
                    {t('ناقش هذا النطاق', 'Discuss this scope')}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="cyber-cases" className="erp-section cyber-cases">
        <p className="erp-kicker">
          {t('دراسات سيناريوهات توضيحية', 'ILLUSTRATIVE SCENARIO STUDIES')}
        </p>
        <h2>{t('من ملاحظة يومية إلى إجراء واضح', 'From a daily concern to an actionable step')}</h2>
        <p>
          {t(
            'أمثلة لمنشآت افتراضية تشرح النهج والأدلة وحدود العمل. ليست أعمال عملاء أو نتائج مراجعات فعلية.',
            'Fictional businesses illustrate the approach, evidence and boundaries. These are not client engagements or actual review results.',
          )}
        </p>
        <div className="cyber-case-grid">
          {cyberCases.map((item, i) => {
            const Icon = [UserRoundCheck, Mail, FileKey2][i] ?? ShieldCheck;
            return (
              <article className={`cyber-case cyber-case-${item.id}`} key={item.id}>
                <div className="cyber-case-art" aria-hidden="true">
                  <span>SECURITY / 0{i + 1}</span>
                  <div className="cyber-case-diagram">
                    <Icon size={39} />
                    <div>
                      <i />
                      <i />
                      <i />
                    </div>
                    <ShieldCheck size={32} />
                  </div>
                  <small>
                    {i === 0
                      ? t('مالك ← صلاحية ← مراجعة', 'OWNER → ACCESS → REVIEW')
                      : i === 1
                        ? t('مرسل ← إعداد ← تحقق', 'SENDER → SETTINGS → VERIFY')
                        : t('ملف ← مستلم ← اعتماد', 'FILE → RECIPIENT → APPROVAL')}
                  </small>
                </div>
                <div className="cyber-case-body">
                  <p className="erp-kicker">{item[locale].sector}</p>
                  <h3>{item[locale].title}</h3>
                  <p>{item[locale].challenge}</p>
                  <details>
                    <summary>{t('اقرأ دراسة السيناريو', 'Read the scenario study')}</summary>
                    <div className="cyber-case-details">
                      {[
                        ['approach', t('نهج المراجعة', 'Review approach')],
                        ['evidence', t('الأدلة المطلوبة', 'Required evidence')],
                        ['deliverable', t('ما تستلمه', 'What you receive')],
                        ['limit', t('النطاق والحدود', 'Scope and boundaries')],
                      ].map(([key, title]) => (
                        <div key={key}>
                          <h4>{title}</h4>
                          <p>
                            {item[locale][key as 'approach' | 'evidence' | 'deliverable' | 'limit']}
                          </p>
                        </div>
                      ))}
                      <Link href={`/${locale}/contact?cyber=case-${item.id}`}>
                        {t('ناقش حالة مشابهة', 'Discuss a similar case')}
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </Link>
                    </div>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="cyber-deliverables-shell">
        <div className="erp-section cyber-deliverables">
          <div>
            <p className="erp-kicker">{t('دليل يمكن الرجوع إليه', 'EVIDENCE YOU CAN REFER TO')}</p>
            <h2>{t('المخرج أكثر من قائمة نصائح', 'More than a list of tips')}</h2>
            <p>
              {t(
                'نربط كل إجراء بسبب وصاحب مسؤولية ودليل تحقق. نوضح ما لم يدخل في النطاق وما يحتاج قرارًا منك، مع سجل للتغييرات المعتمدة.',
                'Connect each action to a reason, an owner and verification evidence. Show what remains outside scope and what needs your decision, with a record of approved changes.',
              )}
            </p>
          </div>
          <div className="cyber-document">
            <div className="cyber-document-bar">
              <FileText size={19} aria-hidden="true" />
              <span>TEVONIQ / REVIEW BRIEF</span>
            </div>
            <ol>
              {[
                t('المورد ومالكه وحدود الوصول', 'Resource, owner and access boundaries'),
                t('الملاحظة والمعلومات غير المؤكدة', 'Finding and unverified information'),
                t('الإجراء المعتمد وأثره والتراجع', 'Approved action, impact and rollback'),
                t('دليل التحقق والمسؤول والمتابعة', 'Verification evidence, owner and follow-up'),
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p>
              {t(
                'هيكل توضيحي للمخرج، وليس تقريرًا عن منشأتك.',
                'Illustrative deliverable structure, not a report about your business.',
              )}
            </p>
          </div>
        </div>
      </section>
      <section id="cyber-journey" className="erp-section cyber-journey">
        <p className="erp-kicker">
          {t('مسار يمكن مراجعته في كل مرحلة', 'A REVIEWABLE PATH THROUGH DELIVERY')}
        </p>
        <h2>{t('من تحديد الإذن إلى تسليم الأدلة', 'From authorisation to documented evidence')}</h2>
        <div className="cyber-journey-picker">
          <fieldset className="cyber-stage-options">
            <legend className="cyber-sr-only">
              {t('اختر مرحلة العمل', 'Choose a delivery stage')}
            </legend>
            {cyberStages.map((item, i) => (
              <label key={item.id}>
                <input type="radio" name="cyber-stage" value={item.id} defaultChecked={i === 0} />
                <span>0{i + 1}</span>
                <strong>{item[locale][0]}</strong>
              </label>
            ))}
          </fieldset>
          <div className="cyber-stage-panels">
            {cyberStages.map((item) => (
              <article key={item.id} data-stage={item.id}>
                <h3>{item[locale][0]}</h3>
                <p>{item[locale][1]}</p>
                <div>
                  <strong>{t('المخرج', 'Deliverable')}</strong>
                  <p>{item[locale][2]}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="cyber-guide" className="cyber-guide-shell">
        <div className="erp-section">
          <p className="erp-kicker">
            {t('مرشد أولي دون بيانات حساسة', 'INITIAL GUIDANCE WITHOUT SENSITIVE DATA')}
          </p>
          <h2>{t('ما الخطوة المناسبة الآن؟', 'What is a useful next step?')}</h2>
          <p>
            {t(
              'ثلاثة اختيارات تساعد على ترتيب بداية النقاش، دون إجراء فحص أو إعطاء درجة لحماية منشأتك.',
              'Three choices help organise a starting discussion without inspecting systems or scoring your security.',
            )}
          </p>
          <CyberPriorityGuide locale={locale} />
        </div>
      </section>
      <section className="erp-section cyber-related">
        <p className="erp-kicker">{t('نطاقات مكملة عند الحاجة', 'RELATED SCOPES WHERE NEEDED')}</p>
        <h2>{t('اربط الإجراء بالبيئة التي يعمل فيها', 'Connect the action to its environment')}</h2>
        <div>
          {[
            [
              `/${locale}/services/network-infrastructure`,
              t('تصميم وإعداد الشبكات', 'Network design and configuration'),
            ],
            [`/${locale}/services/qa-automation`, t('أتمتة ضمان الجودة', 'QA automation')],
            [
              `/${locale}/services/custom-software-development`,
              t('حلول برمجية مخصصة', 'Custom software solutions'),
            ],
          ].map(([href, title]) => (
            <Link key={href} href={href!}>
              {title}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
      <section id="cyber-faq" className="erp-section cyber-faq">
        <p className="erp-kicker">{t('قبل أن نبدأ', 'BEFORE WE START')}</p>
        <h2>{t('أسئلة تحدد النطاق والتوقعات', 'Questions to set scope and expectations')}</h2>
        <div className="erp-faq">
          {c.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="cyber-cta">
        <div className="erp-section">
          <LockKeyhole size={30} aria-hidden="true" />
          <h2>{t('لنحدد أولوية قابلة للتنفيذ', 'Agree an actionable priority')}</h2>
          <p>
            {t(
              'صف احتياجك والأدوات المستخدمة بعبارات عامة. لا ترسل كلمات مرور أو رموز تحقق أو مستندات حساسة.',
              'Describe the need and tools in general terms. Do not send passwords, verification codes or sensitive documents.',
            )}
          </p>
          <Link className="erp-primary" href={`/${locale}/contact?cyber=review`}>
            {t('ناقش احتياج الحماية', 'Discuss your security needs')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <StructuredData data={faqData(c.faq)} />
    </div>
  );
}
