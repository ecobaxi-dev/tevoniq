'use client';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Globe2, Menu } from 'lucide-react';
import { IconButton } from './actions.js';
import { Drawer } from './overlays.js';
import { useUI } from './provider.js';
import type { Theme } from './provider.js';
export function Breadcrumb({
  items,
  label,
}: {
  items: Array<{ label: string; href?: string }>;
  label: string;
}) {
  return (
    <nav aria-label={label} className="tv-breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {index > 0 && <ChevronRight className="tv-directional" size={13} aria-hidden="true" />}
            {item.href && index < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Pagination({
  page,
  totalPages,
  onPageChange,
  labels,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  labels: { navigation: string; previous: string; next: string; page: (page: number) => string };
}) {
  if (!Number.isInteger(totalPages) || totalPages < 1) return null;
  const current = Math.min(Math.max(Math.trunc(page) || 1, 1), totalPages);
  const visible = Array.from(
    new Set([
      1,
      ...[current - 1, current, current + 1].filter((n) => n > 1 && n < totalPages),
      totalPages,
    ]),
  ).sort((a, b) => a - b);
  return (
    <nav aria-label={labels.navigation} className="tv-pagination">
      <IconButton
        label={labels.previous}
        variant="outline"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        <ChevronLeft className="tv-directional" size={18} />
      </IconButton>
      {visible.map((number, index) => (
        <span key={number} className="tv-pagination-part">
          {index > 0 && number - (visible[index - 1] ?? 0) > 1 && (
            <span aria-hidden="true" className="tv-pagination-ellipsis">
              …
            </span>
          )}
          <button
            type="button"
            className="tv-page-button"
            aria-label={labels.page(number)}
            aria-current={number === current ? 'page' : undefined}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        </span>
      ))}
      <IconButton
        label={labels.next}
        variant="outline"
        disabled={current === totalPages}
        onClick={() => onPageChange(current + 1)}
      >
        <ChevronRight className="tv-directional" size={18} />
      </IconButton>
    </nav>
  );
}
export function LanguageSwitcher({
  value,
  onValueChange,
  label,
  options,
}: {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  options: Array<{ value: string; label: string; lang: string }>;
}) {
  const id = useId();
  return (
    <div className="tv-language">
      <Globe2 size={16} aria-hidden="true" />
      <label className="tv-sr-only" htmlFor={id}>
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onValueChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value} lang={option.lang}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
export function Logo({
  image,
  href,
  label,
  size = 'md',
}: {
  image: ReactNode;
  href?: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const content = (
    <span className="tv-logo" data-size={size}>
      {image}
    </span>
  );
  return href ? (
    <a href={href} aria-label={label} className="tv-logo-link">
      {content}
    </a>
  ) : (
    content
  );
}
type NavItem = { label: string; href: string; active?: boolean };
export function Navigation({
  logo,
  items,
  actions,
  label,
  menuTitle,
  menuDescription,
  closeLabel,
  theme,
}: {
  logo: ReactNode;
  items: NavItem[];
  actions?: ReactNode;
  label: string;
  menuTitle: string;
  menuDescription: string;
  closeLabel: string;
  theme?: Theme;
}) {
  const ui = useUI();
  const [open, setOpen] = useState(false);
  return (
    <header className="tv-navigation" data-theme={theme ?? ui.theme}>
      <div className="tv-nav-brand">{logo}</div>
      <nav aria-label={label} className="tv-nav-desktop">
        {items.map((item) => (
          <a key={item.href} href={item.href} aria-current={item.active ? 'page' : undefined}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="tv-nav-actions">{actions}</div>
      <div className="tv-nav-mobile">
        <Drawer
          open={open}
          onOpenChange={setOpen}
          trigger={
            <IconButton variant="ghost" label={menuTitle}>
              <Menu size={20} />
            </IconButton>
          }
          title={menuTitle}
          description={menuDescription}
          closeLabel={closeLabel}
        >
          <nav aria-label={label} className="tv-nav-mobile-links">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </Drawer>
      </div>
    </header>
  );
}
