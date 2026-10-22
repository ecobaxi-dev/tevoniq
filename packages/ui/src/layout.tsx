import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils.js';

export function Container({
  width = 'content',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { width?: 'narrow' | 'content' | 'wide' }) {
  return <div {...props} data-width={width} className={cx('tv-container', className)} />;
}
export function Section({
  tone = 'default',
  spacing = 'normal',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  tone?: 'default' | 'muted' | 'navy';
  spacing?: 'compact' | 'normal' | 'generous';
}) {
  return (
    <section
      {...props}
      data-tone={tone}
      data-spacing={spacing}
      {...(tone === 'navy' ? { 'data-theme': 'dark' } : {})}
      className={cx('tv-section', className)}
    />
  );
}
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: 'start' | 'center';
}) {
  return (
    <div className="tv-section-header" data-align={align}>
      <div>
        {eyebrow && <p className="tv-eyebrow">{eyebrow}</p>}
        <h2 className="tv-h2">{title}</h2>
        {description && <p className="tv-description">{description}</p>}
      </div>
      {action && <div className="tv-section-action">{action}</div>}
    </div>
  );
}
export function Surface({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={cx('tv-surface', className)} />;
}
