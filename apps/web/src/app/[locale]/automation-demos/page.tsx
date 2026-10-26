import Link from 'next/link';
import { notFound } from 'next/navigation';
import { routeMetadata } from '@/lib/seo';
import { AutomationGallery } from '@/components/automation-gallery';
import '@/components/website-designs.css';
import '@/components/automation-demos.css';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  return routeMetadata(props, '/automation-demos', {
    title:
      locale === 'ar'
        ? 'نماذج الأتمتة والربط | TEVONIQ'
        : 'Automation & integration demos | TEVONIQ',
    description:
      locale === 'ar'
        ? 'جرّب مسارات توضيحية للاستفسارات والطلبات والمواعيد والفواتير والمخزون والملخصات، مع شروط وموافقات ومنع تكرار الأحداث.'
        : 'Explore sample flows for enquiries, orders, reminders, invoice follow-up, stock alerts and daily summaries.',
  });
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  const ar = locale === 'ar';
  return (
    <main id="main-content" className="website-designs automation-gallery">
      <header className="design-intro">
        <Link href={`/${locale}#solutions`}>
          {ar ? 'الرئيسية / الأتمتة والربط' : 'Home / Automation & integration'}
        </Link>
        <p className="design-eyebrow">TEVONIQ / CONNECTED WORKFLOWS</p>
        <h1>
          {ar ? 'خطوات أقل. وعمل يمضي بوضوح.' : 'Fewer repeat steps. Clearer connected work.'}
        </h1>
        <p>
          {ar
            ? 'جرّب كيف ينتقل الاستفسار أو الطلب من برنامج إلى آخر وفق شروط واضحة. نبدأ بمهمة متكررة، ونحدد ما يمكن أتمتته وما يحتاج إلى مراجعتك.'
            : 'Explore how an enquiry or order can move between applications under clear rules. We start with a repeated task and define what can run automatically and what needs your review.'}
        </p>
        <div className="design-note">
          {ar
            ? 'نماذج أصلية ببيانات افتراضية ومحاكاة محلية. لا ترسل رسائل أو تنشئ حجوزات أو فواتير أو أوامر شراء فعلية، ولا تتصل بحسابات خارجية.'
            : 'Original demos with fictional data and local simulation. They do not send messages, create real bookings, invoices or purchase orders, or connect to external accounts.'}
        </div>
      </header>
      <AutomationGallery locale={locale} />
      <section className="design-bottom">
        <h2>
          {ar ? 'نربط خطوة مفيدة أولًا، ثم نتوسع.' : 'Connect one useful step first, then grow.'}
        </h2>
        <p>
          {ar
            ? 'أخبرنا أين تكرر إدخال البيانات، وما البرامج التي تستخدمها، وما الذي يجب أن يمر بموافقتك. نحدد مسارًا قابلًا للاختبار، ثم نتفق على الربط والتشغيل والمراقبة.'
            : 'Tell us where you re-enter data, which applications you use and what needs approval. We define a testable flow, then scope integration, operation and monitoring.'}
        </p>
        <Link className="design-button" href={`/${locale}/contact?intent=quote`}>
          {ar ? 'اشرح الخطوة التي تريد اختصارها' : 'Describe the step you want to simplify'} ↗
        </Link>
      </section>
    </main>
  );
}
