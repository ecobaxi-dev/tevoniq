import type { ComponentPropsWithRef, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cx } from './utils.js';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold-accent';
export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leadingIcon,
  trailingIcon,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      className={cx('tv-button', className)}
    >
      {loading ? (
        <LoaderCircle className="tv-spin" aria-hidden="true" size={18} />
      ) : (
        leadingIcon && (
          <span className="tv-button-icon" aria-hidden="true">
            {leadingIcon}
          </span>
        )
      )}
      <span>{children}</span>
      {trailingIcon && (
        <span className="tv-button-icon tv-directional" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  );
}
export function IconButton({
  label,
  children,
  className,
  ...props
}: Omit<ButtonProps, 'leadingIcon' | 'trailingIcon'> & { label: string }) {
  return (
    <Button {...props} aria-label={label} className={cx('tv-icon-button', className)}>
      <span aria-hidden="true">{children}</span>
    </Button>
  );
}
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ComponentPropsWithRef<'a'> & { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <a {...props} data-variant={variant} data-size={size} className={cx('tv-button', className)}>
      {children}
    </a>
  );
}
