import type { HTMLAttributes, ReactNode } from 'react';
import { X, Inbox, CircleAlert } from 'lucide-react';
import { cx } from './utils.js';
export type StatusTone = 'neutral' | 'blue' | 'cyan' | 'gold' | 'success' | 'danger' | 'warning';
export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: StatusTone; dot?: boolean }) {
  return (
    <span {...props} className={cx('tv-badge', className)} data-tone={tone}>
      {dot && <span className="tv-status-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
type TagProps = { label: string; disabled?: boolean } & (
  { onRemove: () => void; removeLabel: string } | { onRemove?: never; removeLabel?: never }
);
export function Tag({ label, onRemove, removeLabel, disabled }: TagProps) {
  return (
    <span className="tv-tag">
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} disabled={disabled} aria-label={removeLabel}>
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
export function Skeleton({
  className,
  label,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { label?: string }) {
  return (
    <span
      {...props}
      className={cx('tv-skeleton', className)}
      {...(label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true })}
    />
  );
}
type StateProps = { title: string; description?: string; action?: ReactNode; icon?: ReactNode };
function State({
  title,
  description,
  action,
  icon,
  error = false,
}: StateProps & { error?: boolean }) {
  return (
    <div className="tv-state" {...(error ? { role: 'alert' } : {})}>
      <span className="tv-state-icon" aria-hidden="true">
        {icon ?? (error ? <CircleAlert /> : <Inbox />)}
      </span>
      <h3 className="tv-h3">{title}</h3>
      {description && <p className="tv-description">{description}</p>}
      {action}
    </div>
  );
}
export function EmptyState(props: StateProps) {
  return <State {...props} />;
}
export function ErrorState(props: StateProps) {
  return <State {...props} error />;
}
