import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cx } from './utils.js';
export function Card({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <article {...props} className={cx('tv-card', className)}>
      {children}
    </article>
  );
}
type ContentCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  eyebrow?: string;
};
function ContentCard({
  title,
  description,
  icon,
  action,
  eyebrow,
  kind,
}: { kind: string } & ContentCardProps) {
  return (
    <Card className={`tv-content-card tv-${kind}-card`}>
      <div className="tv-card-top">
        {icon && (
          <span className="tv-icon-tile" aria-hidden="true">
            {icon}
          </span>
        )}
        {eyebrow && <span className="tv-eyebrow">{eyebrow}</span>}
      </div>
      <h3 className="tv-h3">{title}</h3>
      <p className="tv-description">{description}</p>
      {action && <div className="tv-card-action">{action}</div>}
    </Card>
  );
}
export function FeatureCard(props: ContentCardProps) {
  return <ContentCard {...props} kind="feature" />;
}
export function ServiceCard(props: ContentCardProps) {
  return <ContentCard {...props} kind="service" />;
}
export function IndustryCard({
  title,
  description,
  icon,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <ContentCard
      title={title}
      description={description}
      {...(icon ? { icon } : {})}
      kind="industry"
      {...(href && linkLabel
        ? {
            action: (
              <a className="tv-text-link" href={href}>
                {linkLabel}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            ),
          }
        : {})}
    />
  );
}
export function StatCard({
  value,
  label,
  detail,
  verified = false,
  development = false,
  developmentLabel,
}: {
  value?: string | number | null;
  label: string;
  detail?: string;
  verified?: boolean;
  development?: boolean;
  developmentLabel?: string;
}) {
  if (value == null || (!verified && !(development && developmentLabel))) return null;
  return (
    <Card className="tv-stat-card">
      {development && <span className="tv-eyebrow">{developmentLabel}</span>}
      <p className="tv-stat-value">{value}</p>
      <h3>{label}</h3>
      {detail && <p className="tv-description">{detail}</p>}
    </Card>
  );
}
export function CTA({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions: ReactNode;
}) {
  return (
    <section className="tv-cta" data-theme="dark">
      <div>
        {eyebrow && <p className="tv-eyebrow">{eyebrow}</p>}
        <h2 className="tv-h2">{title}</h2>
        {description && <p className="tv-description">{description}</p>}
      </div>
      <div className="tv-cta-actions">{actions}</div>
    </section>
  );
}
