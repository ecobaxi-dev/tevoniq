import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { routeMetadata } from '@/lib/seo';
import { findWorkSystem } from '@/content/work-systems';
import '@/components/website-designs.css';
import '@/components/work-systems.css';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata(props: Props) {
  const { locale, slug } = await props.params;
  const system = findWorkSystem(slug);
  if (!system || (locale !== 'ar' && locale !== 'en')) notFound();
  return routeMetadata(props, '/work-systems/[slug]', {
    title: `${system[locale].name} | TEVONIQ`,
    description: system[locale].audience,
  });
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const system = findWorkSystem(slug);
  if (!system || (locale !== 'ar' && locale !== 'en')) notFound();
  const ar = locale === 'ar',
    c = system[locale];
  const sections = [
    { title: ar ? 'ماذا يضيف لنشاطك؟' : 'Business value', items: c.benefits },
    { title: ar ? 'ما الذي يمكنك تجربته؟' : 'What can you try?', items: c.modules },
    { title: ar ? 'إمكانات الربط' : 'Integration options', items: c.integrations },
  ];
  return (
    <main id="main-content" className="website-designs work-system-gallery">
      <Link href={`/${locale}/work-systems`}>← {ar ? 'جميع الأنظمة' : 'All systems'}</Link>
      <header className="design-detail-hero">
        <div>
          <p className="design-eyebrow">
            {ar ? 'نظام يبدأ من طريقة عملك' : 'A system shaped around your workflow'}
          </p>
          <h1>{c.name}</h1>
          <p>{c.headline}</p>
          <p>{c.audience}</p>
          <div className="design-actions">
            <a className="design-button" href={`/previews/${locale}/systems/${slug}`}>
              {ar ? 'افتح التجربة التفاعلية' : 'Open interactive demo'} ↗
            </a>
            <Link href={`/${locale}/contact?intent=quote&system=${slug}`}>
              {ar ? 'أريد نظامًا مشابهًا' : 'Discuss a similar system'}
            </Link>
          </div>
        </div>
        <Image
          src={`/brand/work-systems/${locale}-${slug}.webp`}
          alt={c.name}
          width={1440}
          height={960}
          sizes="(max-width:760px) 100vw,50vw"
        />
      </header>
      <p className="design-note">
        {ar
          ? 'المعاينة محلية ببيانات افتراضية: يمكنك الإضافة والتصفية وتحديث الحالة والملاحظات، أو تجربة حركات المخزون. لا تحفظ التغييرات بعد إعادة التحميل. وضع العرض فقط يحاكي الواجهة؛ الحسابات والصلاحيات الحقيقية تُنفذ في النظام المتفق عليه.'
          : 'This is a local demo with fictional data: add, filter, update statuses and notes, or try stock movements. Reloading clears changes. View-only mode simulates the interface; real accounts and permissions belong to the agreed implementation.'}
      </p>
      <div className="design-detail-grid">
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section className="system-workflow">
        <p className="design-eyebrow">WORKFLOW</p>
        <h2>{ar ? 'مسار العمل المقترح' : 'Suggested workflow'}</h2>
        <ol>
          {c.stages.map((stage, i) => (
            <li key={stage}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <strong>{stage}</strong>
            </li>
          ))}
        </ol>
        <p>{c.automation}</p>
      </section>
      <div className="design-process">
        <section>
          <h2>{ar ? 'كيف نخصصه لمنشأتك؟' : 'How do we tailor it?'}</h2>
          <p>
            {ar
              ? 'نحدد الحقول ومراحل العمل وقواعد الانتقال بينها. نتفق على أدوار الإدارة والتشغيل والاطلاع، ثم نختبر السيناريوهات التي تستخدمها يوميًا قبل إضافة مزايا أخرى.'
              : 'We define fields, stages and transition rules, agree on management, operator and viewer access, then test your everyday scenarios before expanding.'}
          </p>
        </section>
        <section>
          <h2>{ar ? 'ماذا يحتاج التشغيل الفعلي؟' : 'What is needed to go live?'}</h2>
          <p>
            {ar
              ? 'حفظ دائم للبيانات، حسابات وصلاحيات فعلية، وسجل تحديثات ونسخ احتياطي وفق النطاق. ربط البرامج والإشعارات يحتاج واجهات موثقة وحسابات مصرحًا بها. في المواعيد نحدد قواعد التوفر والتعارض، وفي المخزون نحدد الوحدات وحدود التنبيه ومصدر الحركات.'
              : 'Persistent data, real accounts and permissions, activity tracking and backups within the agreed scope. Integrations and notifications need documented APIs and authorised accounts. Booking availability and conflicts, stock units, alert thresholds and movement sources are defined explicitly.'}
          </p>
        </section>
      </div>
      <section className="design-bottom">
        <h2>
          {ar
            ? 'نحوّل نموذج العمل إلى نظام مناسب لك.'
            : 'Turn your workflow into a system that fits.'}
        </h2>
        <p>
          {ar
            ? 'أخبرنا بما تتابعه اليوم، ومن يستخدم السجلات، والبرامج التي تعتمد عليها. نحدد نسخة أولى قابلة للتنفيذ والتوسع؛ هذه النماذج لا تعني نظامًا شاملًا لكل أعمال المنشأة ولا استبدال برنامج المحاسبة.'
            : 'Tell us what you track, who uses it and which software you rely on. We scope an achievable first version that can grow. These demos do not imply an all-in-one enterprise platform or a replacement for accounting software.'}
        </p>
        <Link className="design-button" href={`/${locale}/contact?intent=quote&system=${slug}`}>
          {ar ? 'ناقش متطلبات هذا النظام' : 'Discuss this system’s requirements'} ↗
        </Link>
      </section>
    </main>
  );
}
