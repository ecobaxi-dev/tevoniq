'use client';
import Image from 'next/image';
import { useState } from 'react';
import { PreviewDialog } from './preview-dialog';
import { designImage, type WebsiteDesign, type DesignLocale } from '@/content/website-designs';
export function WebsitePreview({
  design: d,
  locale,
}: {
  design: WebsiteDesign;
  locale: DesignLocale;
}) {
  const ar = locale === 'ar',
    c = d[locale],
    shop = ['furniture', 'retail', 'agriculture'].includes(d.sector);
  const [category, setCategory] = useState(0),
    [slide, setSlide] = useState(0),
    [cart, setCart] = useState<Record<number, number>>({}),
    [cartOpen, setCartOpen] = useState(false),
    [request, setRequest] = useState(''),
    [done, setDone] = useState(false),
    [favorites, setFavorites] = useState<number[]>([]);
  const prices = [450, 780, 1250],
    count = Object.values(cart).reduce((a, b) => a + b, 0),
    total = Object.entries(cart).reduce((a, [id, n]) => a + prices[Number(id)]! * n, 0);
  const photos =
    d.sector === 'furniture'
      ? ['furniture', 'interior', 'furniture']
      : d.sector === 'agriculture'
        ? ['produce', 'farm', 'produce']
        : [d.image, d.image, d.image];
  const openRequest = (value: string) => {
    setRequest(value);
    setDone(false);
  };
  const image = slide === 1 && d.sector === 'furniture' ? 'interior' : d.image;
  return (
    <div className={`wp wp--${d.sector}`}>
      <aside className="wp-preview-bar">
        <span>{ar ? 'نموذج توضيحي تفاعلي' : 'Interactive design preview'}</span>
        <a href={`/${locale}/website-designs/${d.slug}`}>
          {ar ? 'التفاصيل والإمكانات' : 'Details & capabilities'}
        </a>
        <a href={`/${locale}/contact?intent=quote&design=${d.slug}`}>
          {ar ? 'اختر هذا التصميم' : 'Choose this design'} ↗
        </a>
      </aside>
      {d.sector === 'furniture' && (
        <div className="wp-ribbon">
          {ar
            ? 'تفاصيل تُصنع على مقاس مساحتك ✦ اكتشف مجموعاتنا'
            : 'Made for your space ✦ Explore our collections'}
        </div>
      )}
      <header className="wp-nav">
        <a className="wp-brand" href="#home">
          {c.brand}
          <small>{ar ? 'نموذج من TEVONIQ' : 'A TEVONIQ design'}</small>
        </a>
        <nav aria-label={ar ? 'أقسام النموذج' : 'Preview navigation'}>
          <a href="#collection">{ar ? 'استكشف' : 'Explore'}</a>
          <a href="#process">{ar ? 'كيف نعمل' : 'Our approach'}</a>
          <a href="#enquire">{ar ? 'تواصل معنا' : 'Get in touch'}</a>
        </nav>
        <button onClick={() => (shop ? setCartOpen(true) : openRequest(c.name))}>
          {shop
            ? `${ar ? 'السلة' : 'Basket'} (${count})`
            : ar
              ? 'اطلب استشارة'
              : 'Request a consultation'}
        </button>
      </header>
      {d.sector === 'furniture' && (
        <div className="wp-collection-nav">
          {c.categories.map((cat, i) => (
            <a key={cat} href="#collection" onClick={() => setCategory(i)}>
              {cat}
            </a>
          ))}
          <a href="#custom">{ar ? 'أثاث حسب المقاس' : 'Made to measure'}</a>
        </div>
      )}
      <main id="home">
        <section className="wp-hero">
          <Image
            key={image}
            src={designImage(image)}
            alt={ar ? 'صورة توضيحية للنشاط' : 'Illustrative business photograph'}
            width={1400}
            height={900}
            fetchPriority="high"
            sizes="100vw"
          />
          <div className="wp-hero-copy">
            <span className="wp-eyebrow">
              {d.sector === 'industrial'
                ? 'PRECISION / PURPOSE'
                : d.sector === 'property'
                  ? 'SPACES / POSSIBILITIES'
                  : d.sector === 'agriculture'
                    ? 'GROW / CONNECT'
                    : 'DESIGNED FOR EVERYDAY'}
            </span>
            <h1>
              {slide === 1 && d.sector === 'furniture'
                ? ar
                  ? 'كل تفصيلة، أقرب إليك.'
                  : 'Every detail, closer to you.'
                : c.headline}
            </h1>
            <p>{c.summary}</p>
            <a className="wp-primary" href="#collection">
              {ar ? 'اكتشف الاختيارات' : 'Explore the collection'} ↗
            </a>
            {d.sector === 'furniture' && (
              <div className="wp-slides">
                <button
                  aria-label={ar ? 'الصورة السابقة' : 'Previous slide'}
                  onClick={() => setSlide(slide === 0 ? 1 : 0)}
                >
                  ←
                </button>
                <span dir="ltr">{slide + 1} / 2</span>
                <button
                  aria-label={ar ? 'الصورة التالية' : 'Next slide'}
                  onClick={() => setSlide(slide === 0 ? 1 : 0)}
                >
                  →
                </button>
              </div>
            )}
          </div>
          <span className="wp-hero-index">
            {d.sector === 'industrial'
              ? 'ENGINEERED TO FIT'
              : d.sector === 'property'
                ? 'YOUR NEXT ADDRESS'
                : '01 — A NEW PERSPECTIVE'}
          </span>
        </section>
        <div className="wp-values">
          {c.benefits.map((v, i) => (
            <div key={v}>
              <span>0{i + 1}</span>
              <p>{v}</p>
            </div>
          ))}
        </div>
        <section id="collection" className="wp-section">
          <div className="wp-section-heading">
            <div>
              <p className="wp-eyebrow">{ar ? 'اختياراتنا' : 'OUR SELECTION'}</p>
              <h2>
                {d.sector === 'property'
                  ? ar
                    ? 'مساحات تستحق الاكتشاف'
                    : 'Spaces worth discovering'
                  : d.sector === 'industrial'
                    ? ar
                      ? 'حلول من قلب الصناعة'
                      : 'Built around your needs'
                    : d.sector === 'services'
                      ? ar
                        ? 'كيف يمكننا مساعدتك؟'
                        : 'How can we help?'
                      : ar
                        ? 'تصفّح ما يناسبك'
                        : 'Find your fit'}
              </h2>
            </div>
            <div
              className="wp-filters"
              role="group"
              aria-label={ar ? 'تصفية المعروض' : 'Filter selection'}
            >
              {c.categories.map((cat, i) => (
                <button key={cat} aria-pressed={category === i} onClick={() => setCategory(i)}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="wp-products">
            {c.items.map((item, i) =>
              category !== 0 && (i % 2) + 1 !== category ? null : (
                <article key={item} className="wp-product">
                  <div className="wp-product-photo">
                    <Image
                      src={designImage(photos[i]!)}
                      alt={item}
                      width={700}
                      height={600}
                      loading="lazy"
                      sizes="(max-width: 760px) 100vw, 50vw"
                    />
                    {d.sector === 'property' && (
                      <button
                        className="wp-favorite"
                        aria-label={`${ar ? 'حفظ' : 'Save'} ${item}`}
                        aria-pressed={favorites.includes(i)}
                        onClick={() =>
                          setFavorites(
                            favorites.includes(i)
                              ? favorites.filter((n) => n !== i)
                              : [...favorites, i],
                          )
                        }
                      >
                        {favorites.includes(i) ? '♥' : '♡'}
                      </button>
                    )}
                    <span>0{i + 1}</span>
                  </div>
                  <small>{c.categories[(i % 2) + 1]}</small>
                  <h3>{item}</h3>
                  <p>
                    {shop
                      ? `${prices[i]} ${ar ? 'ر.س — سعر توضيحي' : 'SAR — sample price'}`
                      : d.sector === 'property'
                        ? ar
                          ? 'تفاصيل ومساحات توضيحية • السعر عند الاستفسار'
                          : 'Illustrative listing • Price on enquiry'
                        : c.benefits[i]}
                  </p>
                  <button
                    className="wp-item-action"
                    onClick={() =>
                      shop ? setCart({ ...cart, [i]: (cart[i] || 0) + 1 }) : openRequest(item)
                    }
                  >
                    {shop
                      ? ar
                        ? 'أضف للسلة'
                        : 'Add to basket'
                      : d.sector === 'property'
                        ? ar
                          ? 'اطلب معاينة'
                          : 'Request a viewing'
                        : ar
                          ? 'ناقش هذا الاحتياج'
                          : 'Discuss this requirement'}{' '}
                    <span>↗</span>
                  </button>
                </article>
              ),
            )}
          </div>
          <p className="wp-status" role="status">
            {shop && count > 0
              ? ar
                ? `في سلتك الآن ${count} قطعة. افتح السلة لمراجعتها.`
                : `Your basket contains ${count} items. Open it to review.`
              : d.sector === 'property' && favorites.length > 0
                ? ar
                  ? `عقارات محفوظة: ${favorites.length}`
                  : `Saved properties: ${favorites.length}`
                : ''}
          </p>
        </section>
        {d.sector === 'furniture' && (
          <section id="custom" className="wp-custom">
            <Image
              src={designImage('interior')}
              alt={ar ? 'مساحة داخلية توضيحية' : 'Illustrative interior'}
              width={1400}
              height={900}
              loading="lazy"
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <div>
              <p className="wp-eyebrow">MADE FOR YOU</p>
              <h2>
                {ar ? 'لا تبحث عن المقاس المناسب. صمّمه.' : 'Don’t find the right fit. Create it.'}
              </h2>
              <p>
                {ar
                  ? 'جرّب اختيار الخامة والمقاس، ثم أرسل طلبًا مبدئيًا للتصميم.'
                  : 'Try selecting a material and dimensions for a bespoke enquiry.'}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  openRequest(
                    `${ar ? 'تصميم خاص' : 'Bespoke'}: ${data.get('material')} / ${data.get('width')} cm`,
                  );
                }}
              >
                <label>
                  {ar ? 'الخامة' : 'Material'}
                  <select name="material">
                    <option>{ar ? 'خشب طبيعي' : 'Natural wood'}</option>
                    <option>{ar ? 'خشب مطلي' : 'Painted wood'}</option>
                  </select>
                </label>
                <label>
                  {ar ? 'العرض بالسنتيمتر' : 'Width in cm'}
                  <input
                    name="width"
                    type="number"
                    min="40"
                    max="500"
                    defaultValue="180"
                    required
                  />
                </label>
                <button className="wp-primary">
                  {ar ? 'جهّز طلب التصميم' : 'Prepare design request'} ↗
                </button>
              </form>
            </div>
          </section>
        )}
        <section id="process" className="wp-section wp-process">
          <div>
            <p className="wp-eyebrow">THE NEXT STEP</p>
            <h2>{ar ? 'من اختيارك، تبدأ الحكاية.' : 'It starts with your choice.'}</h2>
            <p>{c.automation}</p>
          </div>
          <ol>
            {[
              ar ? 'اختر ما يناسبك' : 'Choose your direction',
              ar ? 'شاركنا التفاصيل' : 'Share your requirements',
              ar ? 'نراجع الخطوة التالية' : 'Review the next step',
            ].map((s, i) => (
              <li key={s}>
                <span>0{i + 1}</span>
                <h3>{s}</h3>
              </li>
            ))}
          </ol>
        </section>
        <section id="enquire" className="wp-enquire">
          <p className="wp-eyebrow">LET’S MAKE IT HAPPEN</p>
          <h2>{ar ? 'لنتحدث عن احتياجك.' : 'Let’s talk about your needs.'}</h2>
          <button className="wp-primary" onClick={() => openRequest(c.name)}>
            {ar ? 'ابدأ طلبًا توضيحيًا' : 'Try an enquiry'} ↗
          </button>
          <p>
            {ar
              ? 'البيانات والمنتجات والأسعار توضيحية. لا تُرسل هذه المعاينة طلبات فعلية.'
              : 'Products, prices and content are illustrative. This preview does not send real requests.'}
          </p>
        </section>
      </main>
      <footer className="wp-footer">
        <strong>{c.brand}</strong>
        <a href={`/${locale}/website-designs/${d.slug}`}>
          {ar ? 'اكتشف إمكانات هذا التصميم' : 'Explore this design’s capabilities'} ↗
        </a>
        <span>TEVONIQ / CONCEPT DESIGN</span>
      </footer>
      {cartOpen && (
        <PreviewDialog
          label={ar ? 'السلة التوضيحية' : 'Demo basket'}
          onClose={() => setCartOpen(false)}
        >
          <button autoFocus className="wp-close" onClick={() => setCartOpen(false)}>
            {ar ? 'إغلاق' : 'Close'} ×
          </button>
          <h2>{ar ? 'سلتك التوضيحية' : 'Your demo basket'}</h2>
          {count === 0 ? (
            <p>
              {ar
                ? 'السلة فارغة. أضف منتجًا لتجربة المسار.'
                : 'Your basket is empty. Add an item to try it.'}
            </p>
          ) : (
            <>
              {Object.entries(cart)
                .filter(([, n]) => n > 0)
                .map(([id, n]) => (
                  <div className="wp-cart-row" key={id}>
                    <strong>{c.items[Number(id)]}</strong>
                    <label>
                      {ar ? 'الكمية' : 'Quantity'}
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={n}
                        onChange={(e) =>
                          setCart({
                            ...cart,
                            [id]: Math.max(1, Math.min(99, Number(e.target.value) || 1)),
                          })
                        }
                      />
                    </label>
                    <button
                      onClick={() => {
                        const next = { ...cart };
                        delete next[Number(id)];
                        setCart(next);
                      }}
                    >
                      {ar ? 'حذف' : 'Remove'}
                    </button>
                  </div>
                ))}
              <p>
                {ar ? 'المجموع التوضيحي' : 'Sample total'}: {total} {ar ? 'ر.س' : 'SAR'}
              </p>
              <p>
                {ar
                  ? 'لا يوجد دفع فعلي. الضرائب والشحن تُحدد عند تنفيذ متجرك.'
                  : 'No real payment. Taxes and delivery are configured for your store.'}
              </p>
              <button
                className="wp-primary"
                onClick={() => {
                  setCartOpen(false);
                  openRequest(c.items.filter((_, i) => cart[i]).join('، '));
                }}
              >
                {ar ? 'تجربة طلب هذه المنتجات' : 'Try requesting these products'}
              </button>
            </>
          )}
        </PreviewDialog>
      )}
      {request && (
        <PreviewDialog label={ar ? 'طلب توضيحي' : 'Demo request'} onClose={() => setRequest('')}>
          <button autoFocus className="wp-close" onClick={() => setRequest('')}>
            {ar ? 'إغلاق' : 'Close'} ×
          </button>
          <h2>{ar ? 'جرّب مسار الطلب' : 'Try the enquiry journey'}</h2>
          <p>{request}</p>
          {done ? (
            <p role="status">
              {ar
                ? 'تمت تجربة الطلب بنجاح. لم تُرسل بياناتك أو يُحجز موعد فعلي.'
                : 'Demo completed. Your data was not sent and no real appointment was booked.'}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
            >
              <label>
                {ar ? 'الاسم' : 'Name'}
                <input required maxLength={100} autoComplete="off" />
              </label>
              <label>
                {ar ? 'البريد الإلكتروني' : 'Email'}
                <input type="email" required autoComplete="off" />
              </label>
              {!shop && (
                <label>
                  {ar ? 'الموعد المفضل' : 'Preferred date'}
                  <input type="date" required min={new Date().toISOString().slice(0, 10)} />
                </label>
              )}
              <label>
                {ar ? 'تفاصيل الاحتياج' : 'Requirements'}
                <textarea rows={3} maxLength={2000} />
              </label>
              <p>
                {ar
                  ? 'تجربة محلية فقط؛ يمكنك استخدام بيانات افتراضية.'
                  : 'Local demonstration only; you may use fictional details.'}
              </p>
              <button className="wp-primary">
                {ar ? 'تجربة تأكيد الطلب' : 'Try confirming the request'}
              </button>
            </form>
          )}
        </PreviewDialog>
      )}
    </div>
  );
}
