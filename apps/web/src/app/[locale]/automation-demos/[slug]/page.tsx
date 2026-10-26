import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findAutomationCase } from '@/content/automation-cases';
import { routeMetadata } from '@/lib/seo';
import '@/components/website-designs.css';
import '@/components/automation-demos.css';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata(props: Props) {
  const { locale, slug } = await props.params;
  const model = findAutomationCase(slug);
  if (!model || (locale !== 'ar' && locale !== 'en')) notFound();
  return routeMetadata(props, '/automation-demos/[slug]', {
    title: `${model[locale].name} | TEVONIQ`,
    description: model[locale].audience,
  });
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const model = findAutomationCase(slug);
  if (!model || (locale !== 'ar' && locale !== 'en')) notFound();
  const ar = locale === 'ar',
    c = model[locale];
  return (
    <main id="main-content" className="website-designs automation-gallery">
      <Link href={`/${locale}/automation-demos`}>← {ar ? 'جميع النماذج' : 'All demos'}</Link>
      <header className="design-detail-hero">
        <div>
          <p className="design-eyebrow">
            {ar ? 'مسار يبدأ من احتياجك' : 'A flow shaped around your needs'}
          </p>
          <h1>{c.name}</h1>
          <p>{c.headline}</p>
          <p>{c.audience}</p>
          <div className="design-actions">
            <a className="design-button" href={`/previews/${locale}/automation/${slug}`}>
              {ar ? 'افتح المحاكاة التفاعلية' : 'Open interactive simulation'} ↗
            </a>
            <Link href={`/${locale}/contact?intent=quote&automation=${slug}`}>
              {ar ? 'أريد مسارًا مشابهًا' : 'Discuss a similar flow'}
            </Link>
          </div>
        </div>
        <Image
          unoptimized
          src={`/brand/automation-demos/${locale}-${slug}.webp`}
          alt={c.name}
          width={1440}
          height={960}
        />
      </header>
      <p className="design-note">
        {c.demoNote}{' '}
        {ar
          ? 'نتائج المحاكاة مؤقتة وتُمسح عند إعادة التحميل.'
          : 'Simulation results are temporary and reset on reload.'}
      </p>
      <div className="design-detail-grid">
        <section>
          <h2>{ar ? 'ماذا يضيف لنشاطك؟' : 'Business value'}</h2>
          <ul>
            {c.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{ar ? 'البرامج التي يمكن ربطها' : 'Applications we can connect'}</h2>
          <ul>
            {c.integrations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{ar ? 'ما الذي يمكنك تجربته؟' : 'What can you try?'}</h2>
          <ul>
            <li>
              {ar ? 'تغيير البيانات وفحص النتيجة.' : 'Change input data and inspect the outcome.'}
            </li>
            <li>
              {ar
                ? 'توقف الربط وإعادة المحاولة دون تكرار النتيجة.'
                : 'Connection failure and retry without duplicate output.'}
            </li>
            <li>
              {ar
                ? 'تجاوز الأحداث حسب الشروط، ومراجعة الموافقات حيث تنطبق.'
                : 'Conditional skips and approval review where applicable.'}
            </li>
          </ul>
        </section>
      </div>
      <section className="automation-detail-flow">
        <p className="design-eyebrow">WORKFLOW</p>
        <h2>{ar ? 'من الحدث إلى النتيجة' : 'From event to outcome'}</h2>
        <ol>
          {c.steps.map((step, i) => (
            <li key={step}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>
      <div className="design-process">
        <section>
          <h2>{ar ? 'كيف نخصص الربط؟' : 'How do we tailor the integration?'}</h2>
          <p>
            {ar
              ? 'نحدد الحدث الذي يبدأ المسار، والحقول المنقولة، وشروط التجاوز، وما يحتاج إلى موافقة. نتفق على التعامل مع الأحداث المكررة والأخطاء وسجل التشغيل قبل ربط برامجك.'
              : 'We define triggers, mapped fields, skip conditions and approval requirements. Duplicate handling, failures and run history are agreed before connecting your applications.'}
          </p>
        </section>
        <section>
          <h2>{ar ? 'ماذا يحتاج التشغيل الفعلي؟' : 'What is needed to go live?'}</h2>
          <p>
            {ar
              ? 'واجهات ربط مدعومة، حسابات وصلاحيات معتمدة، وبيئة تجربة منفصلة حيث تتوفر. نتفق على حفظ السجلات وجدولة التشغيل ومراقبته وحدود الاستخدام وإعادة المحاولة. لا نفترض أن كل برنامج يسمح بكل أنواع الربط؛ نراجع إمكاناته أولًا.'
              : 'Supported APIs, authorised accounts and permissions, and a separate test environment where available. We agree on durable records, scheduling, monitoring, usage limits and retries. Each application’s supported integration capabilities are reviewed first.'}
          </p>
        </section>
      </div>
      <section className="design-bottom">
        <h2>{ar ? 'لنبدأ بخطوة تكررها كل يوم.' : 'Start with a step you repeat every day.'}</h2>
        <p>
          {ar
            ? 'اذكر البرنامجين أو السجلين اللذين تريد ربطهما، والبيانات التي تنقلها، والاستثناءات التي تواجهها. نحدد نطاقًا واضحًا ونختبره قبل التشغيل الفعلي.'
            : 'Tell us which applications or records you want to connect, which data you move and the exceptions you encounter. We scope a clear flow and test it before going live.'}
        </p>
        <Link className="design-button" href={`/${locale}/contact?intent=quote&automation=${slug}`}>
          {ar ? 'ناقش متطلبات هذا الربط' : 'Discuss this integration’s requirements'} ↗
        </Link>
      </section>
    </main>
  );
}
