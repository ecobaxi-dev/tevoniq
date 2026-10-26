import Link from 'next/link';
import { notFound } from 'next/navigation';
import { routeMetadata } from '@/lib/seo';
import { DashboardGallery } from '@/components/dashboard-gallery';
import '@/components/website-designs.css';
import '@/components/dashboard-demos.css';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  return routeMetadata(props, '/dashboard-demos', {
    title:
      locale === 'ar' ? 'نماذج لوحات المعلومات | TEVONIQ' : 'Business dashboard demos | TEVONIQ',
    description:
      locale === 'ar'
        ? 'جرّب لوحات للمبيعات والطلبات والمخزون والمواعيد والمشاريع والمصروفات، مع فلاتر ورسوم وتفاصيل وتصدير.'
        : 'Explore dashboards for sales, requests, inventory, appointments, projects and expenses, with filters, charts, source records and export.',
  });
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  const ar = locale === 'ar';
  return (
    <main id="main-content" className="website-designs dashboard-gallery">
      <header className="design-intro">
        <Link href={`/${locale}#solutions`}>
          {ar ? 'الرئيسية / لوحات المعلومات' : 'Home / Business dashboards'}
        </Link>
        <p className="design-eyebrow">TEVONIQ / BUSINESS VISIBILITY</p>
        <h1>
          {ar
            ? 'أرقام مفهومة. ومتابعة أقرب لعملك.'
            : 'Clear numbers. A closer view of your business.'}
        </h1>
        <p>
          {ar
            ? 'تصفّح أمثلة تربط المؤشر بالسجل الذي كوّنه. جرّب الفترة والفرع والحالة، ثم عدّل بيانات توضيحية لترى كيف تتغير الصورة.'
            : 'Explore examples that connect each metric to its source records. Try period, branch and status filters, then change sample records to see the picture update.'}
        </p>
        <div className="design-note">
          {ar
            ? 'نماذج أصلية ببيانات افتراضية، وليست نتائج عملاء أو تقارير فعلية. لا تتصل ببرامج خارجية، والتعديلات مؤقتة داخل الصفحة.'
            : 'Original models with fictional data, not client results or real reports. There are no external software connections, and changes remain temporary in the page.'}
        </div>
      </header>
      <DashboardGallery locale={locale} />
      <section className="design-bottom">
        <h2>
          {ar ? 'نبدأ بالسؤال الذي تريد إجابته.' : 'Start with the question you need answered.'}
        </h2>
        <p>
          {ar
            ? 'ما الذي تريد متابعته؟ وأين تحفظ بياناته اليوم؟ نحدد المؤشر ومصدره وطريقة حسابه، ثم نبني لوحة واضحة ونختبر الأرقام معك قبل التشغيل.'
            : 'What do you want to monitor, and where is the data kept today? We define the measure, source and calculation, then build a clear dashboard and verify its numbers with you.'}
        </p>
        <Link className="design-button" href={`/${locale}/contact?intent=quote`}>
          {ar ? 'أخبرنا بما تريد متابعته' : 'Tell us what you want to monitor'} ↗
        </Link>
      </section>
    </main>
  );
}
