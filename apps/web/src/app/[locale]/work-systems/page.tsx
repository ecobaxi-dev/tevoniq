import Link from 'next/link';
import { notFound } from 'next/navigation';
import { routeMetadata } from '@/lib/seo';
import { WorkSystemGallery } from '@/components/work-system-gallery';
import '@/components/website-designs.css';
import '@/components/work-systems.css';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  return routeMetadata(props, '/work-systems', {
    title:
      locale === 'ar'
        ? 'نماذج أنظمة إدارة العمل | TEVONIQ'
        : 'Work management system demos | TEVONIQ',
    description:
      locale === 'ar'
        ? 'جرّب أنظمة توضيحية للصيانة والمبيعات والورش والمواعيد والمخزون والمشاريع، واكتشف إمكانات تنظيم العمل والربط والأتمتة.'
        : 'Try sample systems for maintenance, sales, workshops, bookings, inventory and projects.',
  });
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  const ar = locale === 'ar';
  return (
    <main id="main-content" className="website-designs work-system-gallery">
      <header className="design-intro">
        <Link href={`/${locale}#solutions`}>
          {ar ? 'الرئيسية / أنظمة إدارة العمل' : 'Home / Work management systems'}
        </Link>
        <p className="design-eyebrow">TEVONIQ / BUSINESS SYSTEMS</p>
        <h1>
          {ar
            ? 'كل طلب في مكانه. وكل خطوة واضحة.'
            : 'Every request in place. Every next step clear.'}
        </h1>
        <p>
          {ar
            ? 'من طلب صيانة إلى فرصة بيع أو حركة مخزون: جرّب كيف يمكن لنظام بسيط أن يجمع التفاصيل والحالات والملاحظات بدل تشتتها بين الملفات والرسائل.'
            : 'From service requests to sales opportunities and stock movements, explore how a focused system can bring details, statuses and notes into one workspace.'}
        </p>
        <div className="design-note">
          {ar
            ? 'نماذج أصلية توضيحية ببيانات افتراضية، وليست أنظمة عملاء منفذة. التعديلات داخل المعاينات مؤقتة ولا تنشئ طلبات أو مواعيد أو إشعارات فعلية.'
            : 'Original illustrative demos with fictional data, not delivered client systems. Preview changes are temporary and do not create real orders, bookings or notifications.'}
        </div>
      </header>
      <WorkSystemGallery locale={locale} />
      <section className="design-bottom">
        <h2>
          {ar ? 'نبدأ بمسار واحد يحتاج إلى تنظيم.' : 'Start with one workflow that needs clarity.'}
        </h2>
        <p>
          {ar
            ? 'نتفق على السجلات ومراحل العمل ومن يمكنه الاطلاع والتعديل، ثم نبني نسخة محددة النطاق ونختبرها معك. نضيف الربط والتذكيرات والتقارير على مراحل حسب الأولوية.'
            : 'We agree on records, workflow stages and access, then build a focused version and test it with you. Integrations, reminders and reporting follow in prioritised stages.'}
        </p>
        <Link className="design-button" href={`/${locale}/contact?intent=quote`}>
          {ar ? 'اشرح لنا طريقة عملك' : 'Tell us how you work'} ↗
        </Link>
      </section>
    </main>
  );
}
