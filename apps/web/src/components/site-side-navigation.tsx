'use client';
/* eslint-disable @next/next/no-img-element -- Local product marks with intrinsic dimensions. */
import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Layers3,
  Boxes,
  Sparkles,
  MessageCircle,
  Search,
  X,
  Menu,
  PanelRightOpen,
  PanelRightClose,
  ArrowUpRight,
} from 'lucide-react';
import type { NavigationContent, NavigationItem } from '@/config/navigation';
import { flattenNavigation, isActivePath, localizedHref } from '@/config/navigation';
import { headerNavigation } from '@/content/header-navigation';
import { productNavigationMarks } from '@/content/navigation-visuals';

const shortcuts = [
  { href: '/', icon: Home, color: 'cyan' },
  { href: '/services', icon: Layers3, color: 'violet' },
  { href: '/solutions', icon: Boxes, color: 'orange' },
  { href: '/pesto', icon: Sparkles, color: 'pink' },
  { href: '/contact', icon: MessageCircle, color: 'green' },
];

// Prefer the actual product/page label when a section overview shares its destination.
function destinationsFor(items: NavigationItem[]) {
  const entries = items.flatMap((item) => [
    item,
    ...flattenNavigation([
      ...(item.children ?? []),
      ...(item.groups?.flatMap((group) => group.items) ?? []),
    ]),
  ]);
  return [...new Map(entries.map((item) => [item.href, item])).values()];
}

/** Shared public layout: state survives page navigation; page bodies remain server-rendered. */
export function SiteSideNavigation({
  locale,
  content,
  header,
  children,
}: {
  locale: 'ar' | 'en';
  content: NavigationContent;
  header: ReactNode;
  children: ReactNode;
}) {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => (ar ? a : e);
  const pathname = usePathname();
  const nav = headerNavigation(locale, content);
  const contact = flattenNavigation(nav.items).find((item) => item.href === '/contact') ?? {
    id: 'quick-contact',
    href: '/contact',
    label: t('تواصل معنا', 'Contact'),
  };
  const groups = [...nav.items.filter((item) => item.href !== '/contact'), contact];
  const rail = shortcuts.flatMap((shortcut) => {
    const item = groups.find((group) => group.href === shortcut.href);
    return item ? [{ ...shortcut, item }] : [];
  });
  const [compact, setCompact] = useState(true);
  const [groupHref, setGroupHref] = useState('/services');
  const [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const current = groups.find((item) => item.href === groupHref) ?? contact;
  const close = () => dialog.current?.close();
  const open = (href: string) => {
    setGroupHref(href);
    setQuery('');
    dialog.current?.showModal();
  };
  // Search includes secondary destinations from the full header, not just the five shortcuts.
  const destinations = query.trim() ? destinationsFor(groups) : destinationsFor([current]);
  const results = destinations.filter((item) =>
    item.label.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale)),
  );
  const active = (item: NavigationItem) =>
    flattenNavigation([item]).some((entry) =>
      isActivePath(pathname, localizedHref(locale, entry.href), localizedHref(locale, '/')),
    );
  return (
    <div className={`site-navigation-frame ${compact ? 'is-compact' : 'is-expanded'}`}>
      {header}
      <aside className="site-side-rail" aria-label={t('شريط الوصول السريع', 'Quick access rail')}>
        <span className="site-side-mark" aria-hidden="true">
          T<span>●</span>
        </span>
        <nav aria-label={t('الوصول السريع', 'Quick access')}>
          {rail.map(({ item, icon: Icon, color }) => {
            const label = t(`انتقل إلى ${item.label}`, `Go to ${item.label}`);
            const inside = (
              <>
                <span className="site-side-icon">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <span className="site-side-label">{item.label}</span>
                <span className="site-side-tooltip" aria-hidden="true">
                  {item.label}
                </span>
              </>
            );
            const className = `site-side-item tone-${color} ${active(item) ? 'is-active' : ''}`;
            return item.menu ? (
              <button
                key={item.id}
                type="button"
                className={className}
                aria-label={t(`افتح ${item.label}`, `Open ${item.label}`)}
                title={item.label}
                aria-haspopup="dialog"
                aria-current={active(item) ? 'true' : undefined}
                onClick={() => open(item.href)}
              >
                {inside}
              </button>
            ) : (
              <Link
                key={item.id}
                href={localizedHref(locale, item.href)}
                className={className}
                aria-label={label}
                title={item.label}
                aria-current={pathname === localizedHref(locale, item.href) ? 'page' : undefined}
              >
                {inside}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="site-side-collapse"
          aria-label={t(
            compact ? 'توسيع شريط الوصول السريع' : 'طي شريط الوصول السريع',
            compact ? 'Expand quick access rail' : 'Collapse quick access rail',
          )}
          aria-expanded={!compact}
          onClick={() => setCompact(!compact)}
        >
          {compact ? (
            <PanelRightOpen size={21} aria-hidden="true" />
          ) : (
            <PanelRightClose size={21} aria-hidden="true" />
          )}
          <span>{t('طي الشريط', 'Collapse')}</span>
        </button>
      </aside>
      <button
        type="button"
        className="site-side-mobile"
        aria-label={t('فتح الوصول السريع', 'Open quick access')}
        aria-haspopup="dialog"
        onClick={() => open('/services')}
      >
        <Menu size={22} aria-hidden="true" />
        <span>{t('وصول سريع', 'Quick access')}</span>
      </button>
      <div className="site-navigation-body">{children}</div>
      <dialog
        key={pathname}
        ref={dialog}
        className="site-side-dialog"
        aria-labelledby="site-side-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="site-side-panel-head">
          <div>
            <span>TEVONIQ / EXPLORE</span>
            <h2 id="site-side-dialog-title">{current.label}</h2>
          </div>
          <button
            type="button"
            className="site-side-close"
            onClick={close}
            aria-label={t('إغلاق الوصول السريع', 'Close quick access')}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div
          className="site-side-tabs"
          role="group"
          aria-label={t('أقسام الموقع', 'Site sections')}
        >
          {groups.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={current.href === item.href}
              onClick={() => {
                setGroupHref(item.href);
                setQuery('');
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="site-side-search">
          <Search size={20} aria-hidden="true" />
          <span className="site-side-sr">
            {t('ابحث في جميع الوجهات', 'Search all destinations')}
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('ابحث عن خدمة أو منتج…', 'Search services and products…')}
          />
        </label>
        <nav
          className="site-side-results"
          aria-label={t('وجهات الوصول السريع', 'Quick access destinations')}
        >
          {results.map((item) => {
            const mark = productNavigationMarks[item.href as keyof typeof productNavigationMarks];
            return (
              <Link
                key={item.href}
                href={localizedHref(locale, item.href)}
                onClick={close}
                aria-current={pathname === localizedHref(locale, item.href) ? 'page' : undefined}
              >
                {mark && <img src={mark.src} width={mark.width} height={mark.height} alt="" />}
                <span>
                  <strong>{item.label}</strong>
                  {item.description && <small>{item.description}</small>}
                </span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
        {!results.length && (
          <p className="site-side-empty" role="status">
            {t('لا توجد نتائج. جرّب كلمة أخرى.', 'No results. Try another word.')}
          </p>
        )}
      </dialog>
    </div>
  );
}
