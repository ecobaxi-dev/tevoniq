import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WebsiteGallery } from '@/components/website-gallery';
import { routeMetadata } from '@/lib/seo';
import '@/components/website-designs.css';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  return routeMetadata(props, '/website-designs', {
    title:
      locale === 'ar' ? 'تصاميم مواقع الأعمال | TEVONIQ' : 'Business website designs | TEVONIQ',
    description:
      locale === 'ar'
        ? 'نماذج مواقع للأثاث والتجارة والصناعة والعقارات والزراعة والخدمات، مع شرح البيع والربط والأتمتة.'
        : 'Explore website designs for retail, industry, property, agriculture and services.',
  });
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  const ar = locale === 'ar';
  return (
    <main id="main-content" className="website-designs">
      <header className="design-intro">
        <Link href={`/${locale}#solutions`}>
          {ar ? 'الرئيسية / مواقع الأعمال' : 'Home / Business websites'}
        </Link>
        <p className="design-eyebrow">TEVONIQ / WEB DESIGN</p>
        <h1>{ar ? 'موقع يشبه نشاطك. ويخدم عملك.' : 'A website that fits your business.'}</h1>
        <p>
          {ar
            ? 'اختر نقطة بداية، تصفّح التصميم، واكتشف كيف يتحول الموقع من واجهة جميلة إلى قناة للطلبات والبيع وتنظيم العمل.'
            : 'Choose a starting point, explore a live design and see how your website can support enquiries, sales and everyday work.'}
        </p>
        <div className="design-note">
          {ar
            ? 'نماذج توضيحية بهويات افتراضية، وليست أعمالًا منفذة لعملاء. نخصص المحتوى والتصميم والتكاملات حسب احتياجك.'
            : 'Illustrative designs with fictional brands, not delivered client projects. Content, design and integrations are tailored to your needs.'}
        </div>
      </header>
      <WebsiteGallery locale={locale} />
      <section className="design-bottom">
        <h2>
          {ar
            ? 'التصميم نقطة البداية، والتشغيل هو القيمة.'
            : 'Design starts it. Operation makes it useful.'}
        </h2>
        <p>
          {ar
            ? 'نحدد الصفحات والمحتوى ومسار الطلب، ثم نتفق على ما يحتاجه نشاطك من إدارة محتوى أو دفع أو مخزون أو أتمتة، وننفذه على مراحل واضحة.'
            : 'We define pages, content and the enquiry journey, then scope content management, payments, stock and automation in clear stages.'}
        </p>
        <Link className="design-button" href={`/${locale}/contact?intent=quote`}>
          {ar ? 'لنناقش موقع نشاطك' : 'Discuss your website'} ↗
        </Link>
      </section>
    </main>
  );
}
