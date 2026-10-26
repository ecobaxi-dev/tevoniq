import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findDashboardModel } from '@/content/dashboard-models';
import { routeMetadata } from '@/lib/seo';
import '@/components/website-designs.css';
import '@/components/dashboard-demos.css';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata(props: Props) {
  const { locale, slug } = await props.params;
  const model = findDashboardModel(slug);
  if (!model || (locale !== 'ar' && locale !== 'en')) notFound();
  return routeMetadata(props, '/dashboard-demos/[slug]', {
    title: `${model[locale].name} | TEVONIQ`,
    description: model[locale].audience,
  });
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const model = findDashboardModel(slug);
  if (!model || (locale !== 'ar' && locale !== 'en')) notFound();
  const ar = locale === 'ar',
    c = model[locale];
  return (
    <main id="main-content" className="website-designs dashboard-gallery">
      <Link href={`/${locale}/dashboard-demos`}>← {ar ? 'جميع اللوحات' : 'All dashboards'}</Link>
      <header className="design-detail-hero">
        <div>
          <p className="design-eyebrow">
            {ar ? 'لوحة تبدأ من سؤال واضح' : 'A dashboard built around a clear question'}
          </p>
          <h1>{c.name}</h1>
          <p>{c.headline}</p>
          <p>{c.audience}</p>
          <div className="design-actions">
            <a className="design-button" href={`/previews/${locale}/dashboards/${slug}`}>
              {ar ? 'افتح التجربة التفاعلية' : 'Open interactive demo'} ↗
            </a>
            <Link href={`/${locale}/contact?intent=quote&dashboard=${slug}`}>
              {ar ? 'أريد لوحة مشابهة' : 'Discuss a similar dashboard'}
            </Link>
          </div>
        </div>
        <Image
          unoptimized
          src={`/brand/dashboard-demos/${locale}-${slug}.webp`}
          alt={c.name}
          width={1440}
          height={960}
        />
      </header>
      <p className="design-note">
        {c.note}{' '}
        {ar
          ? 'البيانات افتراضية، والتعديل والتصدير محليان دون حفظ خارجي.'
          : 'Data is fictional; editing and export are local, with no external storage.'}
      </p>
      <div className="design-detail-grid">
        <section>
          <h2>{ar ? 'ماذا تضيف لنشاطك؟' : 'Business value'}</h2>
          <ul>
            {c.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{ar ? 'مصادر يمكن ربطها' : 'Possible data sources'}</h2>
          <ul>
            {c.sources.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{ar ? 'ما الذي يمكنك تجربته؟' : 'What can you try?'}</h2>
          <ul>
            <li>
              {ar
                ? 'فترة وفرع وفئة وحالة تتبعها كل المؤشرات.'
                : 'Period, branch, category and status filters shared by the metrics.'}
            </li>
            <li>
              {ar
                ? 'الضغط على الفئة أو الحالة لتصفية البيانات.'
                : 'Select a category or status to filter records.'}
            </li>
            <li>
              {ar
                ? 'تعديل سجل توضيحي وتصدير النتائج المعروضة.'
                : 'Edit a sample record and export the visible results.'}
            </li>
          </ul>
        </section>
      </div>
      <section className="dashboard-definition">
        <p className="design-eyebrow">MEASURES & DEFINITIONS</p>
        <h2>{ar ? 'ما الذي نعرضه في هذه اللوحة؟' : 'What does this dashboard show?'}</h2>
        <div>
          <article>
            <span>{ar ? 'المؤشر الرئيسي' : 'Primary measure'}</span>
            <strong>{c.primaryLabel}</strong>
          </article>
          <article>
            <span>{ar ? 'المؤشر المساند' : 'Supporting measure'}</span>
            <strong>{c.secondaryLabel}</strong>
          </article>
          <article>
            <span>{ar ? 'تعريف الرسم' : 'Chart definition'}</span>
            <strong>{c.trendLabel}</strong>
          </article>
        </div>
        <p>
          {ar
            ? 'تتغير الحسابات مع الفلاتر نفسها. عند التنفيذ نتفق على الحقول والحالات المستبعدة ووحدات القياس، ونراجع النتيجة مقابل السجلات الأصلية.'
            : 'Calculations use the same filters. In a live implementation we agree on fields, excluded statuses and units, and verify results against source records.'}
        </p>
      </section>
      <div className="design-process">
        <section>
          <h2>{ar ? 'كيف نربط بيانات نشاطك؟' : 'How do we connect your data?'}</h2>
          <p>
            {ar
              ? 'نراجع برنامجك أو ملفاتك وحقولها وطريقة تحديثها. قد نستخدم واجهة موثقة أو ملف تصدير منظم، ثم نتفق على التحديث اليدوي أو المجدول وإظهار وقت آخر تحديث.'
              : 'We review your software or files, fields and update process. A documented API or structured export may be used, with agreed manual or scheduled refresh and a visible last-update time.'}
          </p>
        </section>
        <section>
          <h2>{ar ? 'ماذا يحتاج التشغيل الفعلي؟' : 'What is needed to go live?'}</h2>
          <p>
            {ar
              ? 'تعريفات متفق عليها للمؤشرات، بيانات قابلة للتحقق، حسابات وصلاحيات معتمدة، ومراجعة جودة وتكرار السجلات. نحدد من يرى كل لوحة وكيف تعالج أخطاء التحديث قبل نشرها.'
              : 'Agreed metric definitions, verifiable data, authorised accounts and access, and checks for data quality and duplicates. We define who can view each dashboard and how refresh failures are handled before release.'}
          </p>
        </section>
      </div>
      <section className="design-bottom">
        <h2>
          {ar ? 'لنحوّل بياناتك إلى متابعة مفهومة.' : 'Turn your records into a clearer view.'}
        </h2>
        <p>
          {ar
            ? 'اذكر ما تريد متابعته، والبرنامج أو الملف الذي تعتمد عليه، ومن يحتاج إلى الاطلاع. نبدأ بلوحة محددة النطاق ونوسعها بعد التحقق من الحسابات.'
            : 'Tell us what you want to monitor, the software or file you use and who needs access. We start with a focused dashboard and expand after validating the calculations.'}
        </p>
        <Link className="design-button" href={`/${locale}/contact?intent=quote&dashboard=${slug}`}>
          {ar ? 'ناقش متطلبات هذه اللوحة' : 'Discuss this dashboard’s requirements'} ↗
        </Link>
      </section>
    </main>
  );
}
