'use client';
import { rememberPreferredLanguage } from '@/lib/cookie-storage';
/* eslint-disable @next/next/no-img-element -- CMS brand images use validated public URLs. */
import type { PublicSiteSettings } from '@tevoniq/validation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NavigationMenu } from 'radix-ui';
import { ArrowUpRight, ArrowRight, ChevronDown, Search, Menu, Globe2 } from 'lucide-react';
import {
  Accordion,
  Button,
  Drawer,
  IconButton,
  LanguageSwitcher,
  Modal,
  UIProvider,
} from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import { locales } from '@tevoniq/types';
import type { NavigationContent, NavigationItem } from '@/config/navigation';
import { isActivePath, localizedHref } from '@/config/navigation';
import { assetCatalog } from '@/config/assets';
import { ServicesMenu } from '@/components/services-menu';
import { productNavigationMarks, solutionsNavigationVisual } from '@/content/navigation-visuals';
import { headerNavigation } from '@/content/header-navigation';

const GlobalSearch = dynamic(() => import('./global-search').then((module) => module.GlobalSearch));

export function SiteHeader({
  content,
  locale,
  overHero = false,
  enabledLanguages = [...locales],
  siteName = 'TEVONIQ',
}: {
  content: NavigationContent;
  locale: Locale;
  overHero?: boolean;
  enabledLanguages?: Locale[];
  brand?: PublicSiteSettings['brand'];
  siteName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [desktopMenu, setDesktopMenu] = useState('');
  const homeHref = localizedHref(locale, '/');
  const transparent = overHero && pathname === homeHref && !scrolled;
  const cleanDesign = locale !== 'tr';
  const { labels, items } = headerNavigation(locale, content);
  const itemActive = (item: NavigationItem) =>
    [item, ...(item.children ?? [])].some((entry) =>
      isActivePath(pathname, localizedHref(locale, entry.href), homeHref),
    );
  useEffect(() => {
    let frame = 0;
    let previous = window.scrollY > 24;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const next = window.scrollY > 24;
        if (next !== previous) {
          previous = next;
          setScrolled(next);
        }
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);
  const closeMenus = () => {
    setDesktopMenu('');
    setMenuOpen(false);
    setSearchOpen(false);
  };
  const changeLanguage = (next: string) => {
    if (!enabledLanguages.includes(next as Locale)) return;
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) segments[1] = next;
    const suffix = new URLSearchParams(window.location.search).toString();
    closeMenus();
    rememberPreferredLanguage(next);
    router.push(segments.join('/') + (suffix ? '?' + suffix : '') + window.location.hash);
  };

  const itemLink = (item: NavigationItem, mega = false) => {
    const href = localizedHref(locale, item.href);
    const mark =
      cleanDesign && Object.hasOwn(productNavigationMarks, item.href)
        ? productNavigationMarks[item.href as keyof typeof productNavigationMarks]
        : undefined;
    return (
      <Link
        className={`${mega ? 'site-mega-link' : 'site-submenu-link'}${mark ? ' site-product-link' : ''}`}
        href={href}
        onClick={closeMenus}
        aria-current={isActivePath(pathname, href, homeHref) ? 'page' : undefined}
      >
        {mark && (
          <span className="site-product-mark">
            <img
              src={mark.src}
              width={mark.width}
              height={mark.height}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </span>
        )}
        <span>{item.label}</span>
        <ArrowUpRight size={16} className="tv-directional" aria-hidden="true" />
      </Link>
    );
  };
  return (
    <div
      className="site-header-shell"
      data-over-hero={!cleanDesign && overHero && pathname === homeHref}
      data-design={cleanDesign ? 'clean' : undefined}
    >
      <UIProvider
        theme={!cleanDesign && transparent ? 'dark' : 'light'}
        direction={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        <a href="#main-content" className="site-skip">
          {labels.skip}
        </a>
        <header
          className="site-header"
          data-transparent={!cleanDesign && transparent}
          data-scrolled={scrolled}
        >
          <div className="site-header-inner">
            <Link
              href={homeHref}
              onClick={closeMenus}
              aria-label={labels.home}
              className="site-logo"
            >
              <img
                src={assetCatalog.wordmark.src}
                alt={siteName}
                width={assetCatalog.wordmark.width}
                height={assetCatalog.wordmark.height}
              />
            </Link>
            <NavigationMenu.Root
              className="site-desktop-nav"
              aria-label={labels.navigation}
              value={desktopMenu}
              onValueChange={setDesktopMenu}
              delayDuration={120}
            >
              <NavigationMenu.List className="site-nav-list">
                {items.map((item) => {
                  const href = localizedHref(locale, item.href);
                  const active = itemActive(item);
                  return (
                    <NavigationMenu.Item key={item.id} value={item.id} className="site-nav-item">
                      {item.menu ? (
                        <>
                          <NavigationMenu.Trigger className="site-nav-trigger" data-active={active}>
                            {item.label}
                            <ChevronDown size={12} aria-hidden="true" />
                          </NavigationMenu.Trigger>
                          <NavigationMenu.Content
                            className={`site-menu-panel ${item.groups?.length ? 'site-services-panel' : item.menu === 'mega' ? 'site-mega-panel' : 'site-submenu-panel'}${cleanDesign && item.id === 'products' ? ' site-products-panel' : ''}`}
                            data-theme="light"
                          >
                            {item.groups?.length ? (
                              <ServicesMenu
                                groups={item.groups}
                                locale={locale}
                                allLabel={labels.allServices}
                                onNavigate={closeMenus}
                              />
                            ) : item.menu === 'mega' ? (
                              <>
                                <div className="site-mega-intro">
                                  <span className="tv-eyebrow">{item.label}</span>
                                  <Link
                                    href={href}
                                    onClick={closeMenus}
                                    className="site-mega-title"
                                  >
                                    <span>{item.label}</span>
                                    <ArrowUpRight aria-hidden="true" size={22} />
                                  </Link>
                                  <Link
                                    href={localizedHref(locale, '/contact')}
                                    onClick={closeMenus}
                                    className="site-mega-quote"
                                  >
                                    {labels.quote}
                                    <ArrowRight
                                      className="tv-directional"
                                      aria-hidden="true"
                                      size={16}
                                    />
                                  </Link>
                                </div>
                                <div className="site-mega-links">
                                  {item.children?.map((child) => (
                                    <NavigationMenu.Link key={child.id} asChild>
                                      {itemLink(child, true)}
                                    </NavigationMenu.Link>
                                  ))}
                                  {cleanDesign && item.href === '/solutions' && (
                                    <NavigationMenu.Link asChild>
                                      <Link
                                        href={href}
                                        onClick={closeMenus}
                                        className="site-mega-visual-link"
                                        aria-label={
                                          locale === 'ar'
                                            ? 'استكشف حلولنا للأعمال'
                                            : 'Explore our business solutions'
                                        }
                                      >
                                        <img
                                          className="site-mega-solutions-image"
                                          src={solutionsNavigationVisual}
                                          width={560}
                                          height={373}
                                          alt=""
                                          loading="lazy"
                                          decoding="async"
                                        />
                                      </Link>
                                    </NavigationMenu.Link>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                {item.id !== 'products' && (
                                  <NavigationMenu.Link asChild>
                                    {itemLink(item)}
                                  </NavigationMenu.Link>
                                )}
                                {item.children?.map((child) => (
                                  <NavigationMenu.Link key={child.id} asChild>
                                    {itemLink(child)}
                                  </NavigationMenu.Link>
                                ))}
                              </>
                            )}
                          </NavigationMenu.Content>
                        </>
                      ) : (
                        <NavigationMenu.Link asChild>
                          <Link
                            href={href}
                            onClick={closeMenus}
                            className="site-nav-link"
                            aria-current={active ? 'page' : undefined}
                          >
                            {item.label}
                          </Link>
                        </NavigationMenu.Link>
                      )}
                    </NavigationMenu.Item>
                  );
                })}
              </NavigationMenu.List>
            </NavigationMenu.Root>
            <div className="site-header-actions">
              <LanguageSwitcher
                value={locale}
                onValueChange={changeLanguage}
                label={labels.language}
                options={[
                  { value: 'en', label: 'EN', lang: 'en' },
                  { value: 'tr', label: 'TR', lang: 'tr' },
                  { value: 'ar', label: 'العربية', lang: 'ar' },
                ].filter((option) => enabledLanguages.includes(option.value as Locale))}
              />
              <Modal
                open={searchOpen}
                onOpenChange={setSearchOpen}
                title={labels.search}
                description={labels.searchDescription}
                closeLabel={labels.close}
                trigger={
                  <IconButton variant="ghost" label={labels.search}>
                    <Search size={19} />
                  </IconButton>
                }
              >
                {searchOpen && <GlobalSearch locale={locale} onNavigate={closeMenus} />}
              </Modal>
              <Link
                href={localizedHref(locale, '/contact') + '?intent=quote'}
                className="tv-button site-quote"
                data-variant="primary"
                data-size="sm"
                onClick={closeMenus}
              >
                {labels.quote}
                <ArrowUpRight size={15} className="tv-directional" aria-hidden="true" />
              </Link>
              <div className="site-mobile-toggle">
                <Drawer
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                  title={labels.menuDescription}
                  description={labels.navigation}
                  closeLabel={labels.close}
                  trigger={
                    <IconButton variant="ghost" label={labels.menu}>
                      <Menu size={22} />
                    </IconButton>
                  }
                >
                  <nav aria-label={labels.navigation} className="site-mobile-nav">
                    {items.map((item) =>
                      item.menu ? (
                        <Accordion
                          key={item.id}
                          items={[
                            {
                              value: item.id,
                              title: item.label,
                              content: (
                                <div className="site-mobile-children">
                                  {item.id !== 'products' &&
                                    itemLink(
                                      item.groups ? { ...item, label: labels.allServices } : item,
                                    )}
                                  {item.groups && (
                                    <Accordion
                                      items={item.groups.map((group) => ({
                                        value: group.id,
                                        title: group.label,
                                        content: (
                                          <div className="site-mobile-service-links">
                                            {group.items.map((service) => (
                                              <div key={service.id}>{itemLink(service)}</div>
                                            ))}
                                          </div>
                                        ),
                                      }))}
                                    />
                                  )}
                                  {item.children
                                    ?.filter(
                                      (child) => item.id === 'products' || child.href !== item.href,
                                    )
                                    .map((child) => (
                                      <div key={child.id}>{itemLink(child)}</div>
                                    ))}
                                </div>
                              ),
                            },
                          ]}
                        />
                      ) : (
                        <div key={item.id}>{itemLink(item)}</div>
                      ),
                    )}
                  </nav>
                  <Link
                    href={localizedHref(locale, '/contact') + '?intent=quote'}
                    onClick={closeMenus}
                    className="tv-button site-mobile-quote"
                    data-variant="primary"
                  >
                    {labels.quote}
                    <ArrowRight className="tv-directional" size={17} aria-hidden="true" />
                  </Link>
                  <div className="site-mobile-languages">
                    <Globe2 size={16} aria-hidden="true" />
                    {enabledLanguages.map((language) => (
                      <Button
                        key={language}
                        size="sm"
                        variant={locale === language ? 'outline' : 'ghost'}
                        onClick={() => changeLanguage(language)}
                        lang={language}
                        aria-pressed={locale === language}
                      >
                        {language === 'en' ? 'English' : language === 'tr' ? 'Türkçe' : 'العربية'}
                      </Button>
                    ))}
                  </div>
                </Drawer>
              </div>
            </div>
          </div>
        </header>
      </UIProvider>
    </div>
  );
}
