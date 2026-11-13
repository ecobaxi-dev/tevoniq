import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowUpRight,
  Globe2,
  Workflow,
  ChartNoAxesCombined,
  PanelsTopLeft,
  Check,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { homeServices } from '@/content/home-services';
import { LeadForm } from '@/components/lead-form';
import { BrandLogo } from '@/components/brand-image';
import { getLeadOptions } from '@/lib/lead-options';
import { getSiteSettings } from '@/lib/site-settings';
import { routeMetadata } from '@/lib/seo';
import '@/components/lead-form.css';
import './start.css';
import './start-ar.css';

const icons = [Globe2, PanelsTopLeft, Workflow, ChartNoAxesCombined];
const demos = ['website-designs', 'work-systems', 'automation-demos', 'dashboard-demos'];
export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  return routeMetadata(props, '/start', {
    title:
      locale === 'ar'
        ? 'موقعك ونظام عملك، بخطوة واضحة | TEVONIQ'
        : 'Your website. Your workflow. A clear next step. | TEVONIQ',
    description:
      locale === 'ar'
        ? 'مواقع أعمال وأنظمة لإدارة الطلبات وأتمتة ولوحات معلومات للمنشآت الصغيرة والمتوسطة. أخبرنا باحتياجك لنناقش النطاق والتكلفة والخطوة التالية.'
        : 'Websites, work management systems, automation and dashboards for small and medium businesses. Tell us what you need to discuss scope, cost and next steps.',
    alternates: { canonical: `/${locale}/start` },
  });
}
export default async function CampaignPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  const ar = locale === 'ar';
  const t = (a: string, e: string) => (ar ? a : e);
  const [options, settings] = await Promise.all([
    getLeadOptions(locale).catch(() => null),
    getSiteSettings(),
  ]);
  const services = homeServices[locale];
  return (
    <main id="main-content" className={`campaign-page${ar ? ' campaign-ar' : ''}`}>
      <nav className="campaign-nav" aria-label={t('تنقل الصفحة', 'Page navigation')}>
        <Link
          href={`/${locale}`}
          className="campaign-wordmark"
          aria-label={t('TEVONIQ — الرئيسية', 'TEVONIQ — Home')}
        >
          {ar ? (
            <BrandLogo variant="horizontal" eager />
          ) : (
            <>
              TEVONIQ<span aria-hidden="true">●</span>
            </>
          )}
        </Link>
        <a href="#services">{t('ما الذي نقدّمه؟', 'What we build')}</a>
        <a href="#process">{t('كيف نبدأ؟', 'How it works')}</a>
        <a href="#enquiry" className="campaign-nav-cta">
          {t('لنتحدث عن مشروعك', 'Let’s talk')} <ArrowUpRight size={17} />
        </a>
      </nav>
      <section className="campaign-hero">
        <div className="campaign-hero-copy">
          <p className="campaign-eyebrow">
            <span /> {t('حلول رقمية لأصحاب الأعمال', 'DIGITAL SOLUTIONS FOR BUSINESS OWNERS')}
          </p>
          <h1>
            {t('مشروعك يستحق', 'Your business deserves')}
            <br />
            <em>{t('خطوة رقمية أوضح.', 'a clearer digital future.')}</em>
          </h1>
          <p className="campaign-intro">
            {t(
              'موقع يعرّف بخدماتك. نظام يرتّب طلباتك. وأدوات تختصر العمل المتكرر. نساعدك على بناء ما يحتاجه نشاطك، بنطاق واضح وتنفيذ على مراحل.',
              'A website that explains your services. A system that organises requests. Tools that simplify routine work. We build around your needs, with a clear scope and delivery in stages.',
            )}
          </p>
          <div className="campaign-actions">
            <a className="campaign-primary" href="#enquiry" data-campaign-cta="hero">
              {t('ناقش احتياجك معنا', 'Discuss your project')} <ArrowUpRight size={20} />
            </a>
            <a className="campaign-secondary" href="#services">
              {t('اكتشف الخدمات', 'Explore services')} <ArrowLeft size={18} />
            </a>
          </div>
          <p className="campaign-hero-note">
            <ShieldCheck size={17} />
            {t(
              'تواصل مباشر · نطاق متفق عليه · دون التزام بالتعاقد',
              'Direct communication · Agreed scope · No obligation to proceed',
            )}
          </p>
        </div>
        <div
          className="campaign-visual"
          aria-label={t(
            'تصوّر توضيحي لنظام إدارة طلبات، وليس نتيجة لعميل',
            'Illustrative request management concept, not client results',
          )}
        >
          <div className="campaign-orbit" />
          <div className="campaign-app">
            <div className="campaign-app-bar">
              <b>
                TEVONIQ <span>/ WORKSPACE</span>
              </b>
              <span className="campaign-dots">● ● ●</span>
            </div>
            <div className="campaign-app-title">
              <div>
                <small>{t('صورة أوضح ليوم عملك', 'A clearer working day')}</small>
                <h2>{t('كل شيء، في مكانه.', 'Everything in its place.')}</h2>
              </div>
              <span className="campaign-live">{t('تصوّر توضيحي', 'ILLUSTRATIVE CONCEPT')}</span>
            </div>
            <div className="campaign-metrics">
              {[
                t('طلبات منظّمة', 'Organised requests'),
                t('متابعة واضحة', 'Clear progress'),
                t('قرارات مدروسة', 'Informed decisions'),
              ].map((label, i) => (
                <div key={label}>
                  <span>0{i + 1}</span>
                  <p>{label}</p>
                  <div className="campaign-spark">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ))}
            </div>
            <div className="campaign-board">
              {[
                t('طلب جديد', 'New request'),
                t('قيد التنفيذ', 'In progress'),
                t('مكتمل', 'Complete'),
              ].map((label, i) => (
                <div key={label}>
                  <span className={`campaign-status status-${i}`} />
                  <b>{label}</b>
                  <span>
                    {t(
                      ['مراجعة التفاصيل', 'متابعة الخطوات', 'جاهز للمراجعة'][i]!,
                      ['Review details', 'Track next steps', 'Ready to review'][i]!,
                    )}
                  </span>
                  <Check size={16} />
                </div>
              ))}
            </div>
            <div className="campaign-flow">
              <span>{t('موقعك', 'Your website')}</span>
              <i>←</i>
              <span>{t('طلباتك', 'Your requests')}</span>
              <i>←</i>
              <span>{t('متابعتك', 'Your overview')}</span>
            </div>
          </div>
          <div className="campaign-floating">
            <Check size={18} />
            <div>
              <b>{t('من الفكرة إلى طريقة عمل', 'From idea to workflow')}</b>
              <small>{t('تصميم وتطوير حول احتياجك', 'Designed around your needs')}</small>
            </div>
          </div>
        </div>
      </section>
      <div className="campaign-principles">
        <span>{t('مصمّم لاحتياج منشأتك', 'Built around your business')}</span>
        <span>{t('العربية والإنجليزية', 'Arabic & English')}</span>
        <span>{t('الهاتف والكمبيوتر', 'Mobile & desktop')}</span>
        <span>{t('تسليم وتوثيق واضحان', 'Clear delivery & documentation')}</span>
      </div>
      <section id="services" className="campaign-section">
        <div className="campaign-section-head">
          <div>
            <p className="campaign-eyebrow">
              {t('ما الذي تحتاجه اليوم؟', 'WHAT DOES YOUR BUSINESS NEED?')}
            </p>
            <h2>
              {t('ابدأ بالتحدّي. نبني له الحل.', 'Start with the challenge. Build the solution.')}
            </h2>
          </div>
          <p>{services.introduction}</p>
        </div>
        <div className="campaign-services">
          {services.services.map((service, i) => {
            const Icon = icons[i]!;
            return (
              <article key={service.id} className="campaign-service">
                <div className="campaign-service-top">
                  <Icon size={28} />
                  <span>0{i + 1}</span>
                </div>
                <p className="campaign-kicker">{service.kicker}</p>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>
                  {service.deliverables.map((item) => (
                    <li key={item}>
                      <Check size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={`/${locale}/${demos[i]}`}>
                  {t('استكشف نماذج توضيحية', 'Explore illustrative demos')}{' '}
                  <ArrowUpRight size={18} />
                </Link>
              </article>
            );
          })}
        </div>
        <p className="campaign-scope">
          {services.scope}{' '}
          {t(
            'النماذج المعروضة للتوضيح، وليست أعمالًا منفّذة لعملاء.',
            'The demos are illustrative concepts, not delivered client work.',
          )}
        </p>
      </section>
      <section id="process" className="campaign-process campaign-section">
        <div>
          <p className="campaign-eyebrow">
            {t('طريق واضح من البداية', 'A CLEAR PATH FROM DAY ONE')}
          </p>
          <h2>
            {t(
              'لا تحتاج إلى معرفة تقنية. فقط أخبرنا بما تريد تحسينه.',
              'No technical brief needed. Tell us what you want to improve.',
            )}
          </h2>
          <a href="#enquiry" className="campaign-text-link">
            {t('لنحدّد الخطوة الأولى', 'Find your first step')} <ArrowUpRight size={20} />
          </a>
        </div>
        <ol>
          {[
            [
              t('نفهم طريقة عملك', 'Understand your workflow'),
              t(
                'نناقش نشاطك والوضع الحالي والمشكلة التي تريد حلّها.',
                'We discuss your business, your current tools and the problem to solve.',
              ),
            ],
            [
              t('نحدّد ما سنبنيه', 'Agree what to build'),
              t(
                'نوضّح الوظائف والمخرجات والمدة والتكلفة قبل البدء.',
                'We define features, deliverables, timing and cost before work begins.',
              ),
            ],
            [
              t('ننفّذ ونراجع معك', 'Build and review together'),
              t(
                'نطوّر على مراحل، ونختبر ما اتفقنا عليه، ثم نسلّم مع التوثيق.',
                'We build in stages, test the agreed scope and deliver with documentation.',
              ),
            ],
          ].map(([title, body], i) => (
            <li key={title}>
              <span>0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section id="enquiry" className="campaign-enquiry campaign-section">
        <div className="campaign-enquiry-copy">
          <p className="campaign-eyebrow">
            {t('الخطوة التالية تبدأ هنا', 'YOUR NEXT STEP STARTS HERE')}
          </p>
          <h2>
            {t('ما الذي تريد', 'What would you like')}
            <br />
            {t('تسهيله في عملك؟', 'to simplify?')}
          </h2>
          <p>
            {t(
              'صف نشاطك وما تحتاجه، حتى لو كانت الفكرة أولية. سنراجع التفاصيل ونتواصل معك لمناقشة الخيارات والخطوة التالية.',
              'Tell us about your business and what you need, even if the idea is still taking shape. We will review the details and contact you to discuss options and next steps.',
            )}
          </p>
          <ul>
            <li>
              <Check size={18} />
              {t('لا حاجة لمستند متطلبات جاهز', 'No prepared technical specification required')}
            </li>
            <li>
              <Check size={18} />
              {t('توضيح النطاق قبل الاتفاق', 'Understand the scope before agreeing')}
            </li>
            <li>
              <Check size={18} />
              {t('بياناتك للتواصل بشأن طلبك', 'Your details are used to respond to your enquiry')}
            </li>
          </ul>
          {settings.contact.email && (
            <a href={`mailto:${settings.contact.email}`} className="campaign-contact">
              <span>{t('تفضّل البريد؟', 'Prefer email?')}</span>
              <bdi>{settings.contact.email}</bdi>
            </a>
          )}
          {settings.contact.phone && (
            <a
              href={`tel:${settings.contact.phone.replace(/[^+\d]/g, '')}`}
              className="campaign-contact"
            >
              <span>{t('تواصل هاتفي', 'Call us')}</span>
              <bdi>{settings.contact.phone}</bdi>
            </a>
          )}
          <Link href={`/${locale}/privacy-policy`} className="campaign-privacy-link">
            {t('سياسة الخصوصية', 'Privacy policy')}
          </Link>
        </div>
        <div className="campaign-form" data-clarity-mask="true">
          <div className="campaign-form-heading">
            <span>↗</span>
            <div>
              <h3>{t('لنتحدث عن مشروعك', 'Let’s talk about your project')}</h3>
              <p>
                {t(
                  'املأ التفاصيل وسنتواصل عبر الوسيلة التي تختارها.',
                  'Share the details and choose how we should contact you.',
                )}
              </p>
            </div>
          </div>
          {options ? (
            <LeadForm type="contact" locale={locale} options={options} campaign />
          ) : (
            <div role="alert">
              <p>
                {t(
                  'النموذج غير متاح مؤقتًا. يمكنك التواصل عبر بيانات الاتصال الموضّحة أو المحاولة لاحقًا.',
                  'The form is temporarily unavailable. Please use the contact details shown or try again later.',
                )}
              </p>
              <a href={`/${locale}/contact`}>{t('صفحة التواصل', 'Contact page')}</a>
            </div>
          )}
        </div>
      </section>
      <section className="campaign-faq campaign-section">
        <p className="campaign-eyebrow">{t('قبل أن نبدأ', 'BEFORE WE START')}</p>
        <h2>{t('أسئلة قد تدور في بالك', 'A few things you might be wondering')}</h2>
        {[
          [
            t('كم تبلغ تكلفة المشروع؟', 'How much will it cost?'),
            t(
              'تختلف بحسب الوظائف وحجم العمل والتكاملات المطلوبة. نناقش احتياجك أولًا، ثم نحدّد عرضًا واضحًا بالنطاق والتكلفة.',
              'Cost depends on the features, scope and integrations. We discuss your needs first, then provide a clear scope and price.',
            ),
          ],
          [
            t('هل يمكن البدء بجزء صغير؟', 'Can we start small?'),
            t(
              'نعم، يمكن الاتفاق على مرحلة أولى تركّز على أولوية محددة، ثم تطويرها لاحقًا حسب الحاجة.',
              'Yes. We can agree on a first phase focused on one priority and extend it as needed.',
            ),
          ],
          [
            t('هل يشمل العمل الاستضافة والصيانة؟', 'Are hosting and maintenance included?'),
            t(
              'نوضّح تكاليف الاستضافة والخدمات الخارجية وما يشمله الدعم والصيانة في العرض قبل الاتفاق.',
              'We clarify hosting, third-party costs, support and maintenance in the proposal before you commit.',
            ),
          ],
          [
            t(
              'هل إرسال النموذج يلزمني بالتعاقد؟',
              'Does sending an enquiry commit me to anything?',
            ),
            t(
              'لا. إرسال الطلب يبدأ نقاشًا لفهم احتياجك، ولا يُعد موافقة على تنفيذ أو دفع.',
              'No. It starts a conversation about your needs and does not authorise work or payment.',
            ),
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <div className="campaign-mobile-cta">
        <a href="#enquiry" className="campaign-primary" data-campaign-cta="mobile">
          {t('لنتحدث عن مشروعك', 'Let’s discuss your project')} <ArrowUpRight size={18} />
        </a>
      </div>
    </main>
  );
}
