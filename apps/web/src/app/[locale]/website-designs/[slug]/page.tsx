import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findWebsiteDesign, designImage } from '@/content/website-designs';
import { routeMetadata } from '@/lib/seo';
import '@/components/website-designs.css';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata(props: Props) {
  const { locale, slug } = await props.params;
  const d = findWebsiteDesign(slug);
  if (!d || (locale !== 'ar' && locale !== 'en')) notFound();
  return routeMetadata(props, '/website-designs/[slug]', {
    title: `${d[locale].name} | TEVONIQ`,
    description: d[locale].summary,
  });
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const d = findWebsiteDesign(slug);
  if (!d || (locale !== 'ar' && locale !== 'en')) notFound();
  const ar = locale === 'ar',
    c = d[locale];
  return (
    <main id="main-content" className="website-designs">
      <Link href={`/${locale}/website-designs`}>← {ar ? 'جميع التصاميم' : 'All designs'}</Link>
      <header className="design-detail-hero">
        <div>
          <p className="design-eyebrow">
            {ar ? 'تصميم قابل للتخصيص' : 'A customisable starting point'}
          </p>
          <h1>{c.name}</h1>
          <p>{c.summary}</p>
          <p>{c.audience}</p>
          <div className="design-actions">
            <a className="design-button" href={`/previews/${locale}/${slug}`}>
              {ar ? 'افتح المعاينة التفاعلية' : 'Open interactive preview'} ↗
            </a>
            <Link href={`/${locale}/contact?intent=quote&design=${slug}`}>
              {ar ? 'أريد موقعًا بهذا الاتجاه' : 'Choose this direction'}
            </Link>
          </div>
        </div>
        <Image src={designImage(d.image)} alt={c.name} width={1400} height={900} />
      </header>
      <p className="design-note">
        {ar
          ? 'المعاينة توضيحية: التصفية والسلة والنماذج تعمل محليًا للتجربة، ولا ترسل طلبات فعلية أو تستقبل مدفوعات.'
          : 'The preview is illustrative: filters, baskets and forms work locally and do not place real orders or accept payments.'}
      </p>
      <div className="design-detail-grid">
        {[
          [ar ? 'ماذا يضيف لنشاطك؟' : 'Business value', c.benefits],
          [ar ? 'صفحات التصميم' : 'Suggested pages', c.pages],
          [ar ? 'إمكانات الربط' : 'Integration options', c.integrations],
        ].map(([title, items]) => (
          <section key={title as string}>
            <h2>{title as string}</h2>
            <ul>
              {(items as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section className="design-process">
        <div>
          <p className="design-eyebrow">AUTOMATION</p>
          <h2>{ar ? 'رحلة طلب يمكن تنظيمها' : 'An organised request journey'}</h2>
          <p>{c.automation}</p>
        </div>
        <div>
          <p className="design-eyebrow">ONLINE SALES</p>
          <h2>{ar ? 'هل يمكن البيع أونلاين؟' : 'Can it sell online?'}</h2>
          <p>{c.selling}</p>
        </div>
      </section>
      <section className="design-bottom">
        <h2>{ar ? 'من المعاينة إلى موقع يعمل لنشاطك' : 'From preview to your own website'}</h2>
        <p>
          {ar
            ? 'يشمل نطاق الموقع المتفق عليه التصميم المتجاوب والصفحات والمحتوى والنماذج. الربط الفعلي يحتاج واجهة معتمدة من برنامجك، وحسابات التشغيل والصلاحيات المناسبة؛ ونحدد تكلفته ونطاقه قبل التنفيذ. الصور والأسعار والبيانات هنا للعرض وتُستبدل ببيانات نشاطك.'
            : 'The agreed scope covers responsive design, pages, content and forms. Live integrations need supported APIs, operating accounts and permissions; cost and scope are agreed before implementation. Preview images, prices and content are illustrative.'}
        </p>
        <Link className="design-button" href={`/${locale}/contact?intent=quote&design=${slug}`}>
          {ar ? 'أرسل متطلبات هذا التصميم' : 'Send requirements for this design'} ↗
        </Link>
      </section>
    </main>
  );
}
