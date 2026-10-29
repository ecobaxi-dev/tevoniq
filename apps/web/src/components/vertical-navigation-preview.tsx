'use client';
/* eslint-disable @next/next/no-img-element -- Lightweight existing local navigation artwork. */
import { useRef, useState, type ReactNode } from 'react';
import {
  Home,
  Layers3,
  Boxes,
  Sparkles,
  MessageCircle,
  Search,
  X,
  PanelRightClose,
  PanelRightOpen,
  ArrowUpLeft,
  Menu,
  Check,
} from 'lucide-react';
import { headerNavigation } from '@/content/header-navigation';
import type { NavigationContent, NavigationItem } from '@/config/navigation';
import { localizedHref } from '@/config/navigation';
import { productNavigationMarks } from '@/content/navigation-visuals';
const icons = [Home, Layers3, Boxes, Sparkles, MessageCircle];
const colors = ['cyan', 'violet', 'orange', 'pink', 'blue', 'green'];
export function VerticalNavigationPreview({
  locale,
  content,
  header,
}: {
  locale: 'ar' | 'en';
  content: NavigationContent;
  header: ReactNode;
}) {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => (ar ? a : e);
  const nav = headerNavigation(locale, content);
  const items = [
    ...nav.items.filter((item) => item.href !== '/company'),
    ...(!nav.items.some((i) => i.href === '/contact')
      ? [{ id: 'contact-preview', label: t('تواصل معنا', 'Contact'), href: '/contact' }]
      : []),
  ];
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<NavigationItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = items[active] ?? { id: 'home-preview', label: t('الرئيسية', 'Home'), href: '/' };
  const open = (index: number) => {
    setActive(index);
    setQuery('');
    dialog.current?.showModal();
  };
  const all = (item: NavigationItem) => [
    item,
    ...(item.children ?? []),
    ...(item.groups?.flatMap((g) => g.items) ?? []),
  ];
  const choices = query.trim() ? items.flatMap(all) : all(current);
  const unique = [...new Map(choices.map((i) => [i.href, i])).values()].filter((i) =>
    i.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  return (
    <div className={`vnp ${compact ? 'vnp-compact' : ''}`} dir={ar ? 'rtl' : 'ltr'}>
      <a className="vnp-skip" href="#main-content">
        {t('انتقل للمحتوى', 'Skip to content')}
      </a>
      {header}
      <div className="vnp-preview-banner">
        <span>
          {t(
            'معاينة: التنقّل العلوي الكامل + شريط جانبي للوصول السريع',
            'Preview: full top navigation + a quick-access side rail',
          )}
        </span>
        <a href={`/previews/${ar ? 'en' : 'ar'}/navigation`}>{ar ? 'English' : 'العربية'}</a>
      </div>
      <aside className="vnp-rail" aria-label={t('التنقل التجريبي', 'Preview navigation')}>
        <span className="vnp-rail-mark" aria-hidden="true">
          T<span>●</span>
        </span>
        <nav aria-label={t('الوصول السريع', 'Quick access')}>
          {items.map((item, index) => {
            const Icon = icons[index % icons.length] ?? Home;
            return (
              <button
                key={item.id}
                className={`vnp-rail-item vnp-${colors[index % colors.length]} ${active === index ? 'is-active' : ''}`}
                aria-label={item.label}
                title={item.label}
                aria-current={active === index ? 'true' : undefined}
                aria-haspopup="dialog"
                onClick={() => open(index)}
              >
                <span className="vnp-icon">
                  <Icon size={23} />
                </span>
                <span className="vnp-item-label">{item.label}</span>
                <span className="vnp-tooltip" aria-hidden="true">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        <button
          className="vnp-collapse"
          onClick={() => setCompact(!compact)}
          aria-label={t(
            compact ? 'توسيع الشريط' : 'طي الشريط',
            compact ? 'Expand navigation' : 'Collapse navigation',
          )}
          aria-pressed={compact}
        >
          {compact ? <PanelRightOpen /> : <PanelRightClose />}
          <span>{t('طي الشريط', 'Collapse')}</span>
        </button>
      </aside>
      <button className="vnp-mobile-toggle" onClick={() => open(active)} aria-haspopup="dialog">
        <Menu />
        {t('تصفّح الموقع', 'Explore')}
      </button>
      <main id="main-content" className="vnp-main">
        <div className="vnp-eyebrow">
          <span />
          {t('تنقّل يرافقك. تجربة تُلهمك.', 'Always within reach. Designed to inspire.')}
        </div>
        <h1>
          {t('كل وجهة،', 'Every destination,')}
          <br />
          <em>{t('على بُعد لمسة.', 'one touch away.')}</em>
        </h1>
        <p className="vnp-intro">
          {t(
            'القائمة العلوية للتصفّح الكامل، والشريط الجانبي للوصول السريع. افتح إحدى الأيقونات أو جرّب طيّ الشريط وتوسيعه أثناء التمرير.',
            'Use the top menu to browse the full site and the side rail for quick access. Try an icon, or expand and collapse the rail as you scroll.',
          )}
        </p>
        <div className="vnp-actions">
          <button onClick={() => open(1)}>
            {t('جرّب قائمة الخدمات', 'Explore services')}
            <ArrowUpLeft size={20} />
          </button>
          <button onClick={() => setCompact(!compact)}>
            {t(
              compact ? 'وسّع الشريط' : 'جرّب الوضع المصغّر',
              compact ? 'Expand the rail' : 'Try compact mode',
            )}
          </button>
        </div>
        <section className="vnp-stage" aria-labelledby="stage-title">
          <div>
            <span className="vnp-eyebrow">
              {t('تجربة الوجهة المختارة', 'Selected destination preview')}
            </span>
            <h2 id="stage-title" aria-live="polite">
              {selected?.label ??
                t('حلول رقمية تنظّم أعمالك', 'Digital solutions for your business')}
            </h2>
            <p>
              {selected?.description ??
                t(
                  'اختر أي رابط في اللوحة لعرض وجهته هنا مع بقاء الشريط حاضرًا. هذه معاينة للتنقّل وليست بديلًا عن محتوى الصفحات الفعلي.',
                  'Choose a destination in the panel to preview it here while the rail stays in place. This is a navigation prototype, not the actual page content.',
                )}
            </p>
            {selected && (
              <a
                className="vnp-live-link"
                href={localizedHref(locale, selected.href)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('افتح الصفحة الفعلية ↗ (تبويب جديد)', 'Open actual page ↗ (new tab)')}
              </a>
            )}
          </div>
          <img src="/brand/navigation/solutions-v1.webp" alt="" width="560" height="373" />
        </section>
        <section className="vnp-features" aria-label={t('خصائص المعاينة', 'Preview features')}>
          {[
            [
              t('ألوان لها معنى', 'Purposeful color'),
              t('لكل مجموعة بصمتها البصرية.', 'A distinct identity for each category.'),
            ],
            [
              t('مساحة تناسبك', 'Space that adapts'),
              t('شريط قابل للطي ولوحة مرنة للهاتف.', 'A collapsible rail and mobile panel.'),
            ],
            [
              t('وصول واضح', 'Clear access'),
              t('بحث وروابط فرعية في مكان واحد.', 'Search and nested destinations together.'),
            ],
          ].map(([title, desc], i) => (
            <article key={title}>
              <span>0{i + 1}</span>
              <h2>{title}</h2>
              <p>{desc}</p>
            </article>
          ))}
        </section>
        <p className="vnp-footnote">
          {t(
            'مرّر الصفحة لتجربة ثبات الشريط. التصميم الحالي للموقع لم يتغيّر.',
            'Scroll to test the fixed rail. The current site navigation is unchanged.',
          )}
        </p>
      </main>
      <dialog
        ref={dialog}
        className="vnp-dialog"
        aria-labelledby="vnp-panel-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="vnp-panel-top">
          <div>
            <span className="vnp-eyebrow">TEVONIQ / EXPLORE</span>
            <h2 id="vnp-panel-title">{current.label}</h2>
          </div>
          <button
            className="vnp-close"
            onClick={() => dialog.current?.close()}
            aria-label={t('إغلاق القائمة', 'Close navigation')}
          >
            <X />
          </button>
        </div>
        <div className="vnp-tabs">
          {items.map((item, i) => (
            <button
              key={item.id}
              aria-pressed={active === i}
              onClick={() => {
                setActive(i);
                setQuery('');
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="vnp-search">
          <Search size={20} />
          <span className="vnp-sr">{t('ابحث في جميع الوجهات', 'Search all destinations')}</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ابحث عن خدمة أو منتج…', 'Search services and products…')}
          />
        </label>
        <div className="vnp-results">
          {unique.map((item) => {
            const mark = productNavigationMarks[item.href as keyof typeof productNavigationMarks];
            return (
              <button
                key={item.href}
                onClick={() => {
                  setSelected(item);
                  dialog.current?.close();
                }}
              >
                {mark && <img src={mark.src} width="100" height="45" alt="" />}
                <span>
                  <strong>{item.label}</strong>
                  {item.description && <small>{item.description}</small>}
                </span>
                {selected?.href === item.href ? <Check size={19} /> : <ArrowUpLeft size={19} />}
              </button>
            );
          })}
          {!unique.length && (
            <p>{t('لا توجد نتائج. جرّب كلمة أخرى.', 'No results. Try another word.')}</p>
          )}
        </div>
        <p className="vnp-panel-note">
          {t(
            'اختيار الوجهة يعرضها داخل المعاينة. يمكنك بعدها فتح صفحتها الفعلية.',
            'Selecting a destination previews it here. You can then open its actual page.',
          )}
        </p>
      </dialog>
    </div>
  );
}
