'use client';
import { useId } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from './utils.js';
type FieldProps = { label: string; hint?: string; error?: string };
function Field({
  id,
  label,
  hint,
  error,
  children,
}: { id: string; children: ReactNode } & FieldProps) {
  return (
    <div className="tv-field" data-invalid={!!error}>
      <label htmlFor={id} className="tv-label">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="tv-field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="tv-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
function descriptions(id: string, hint?: string, error?: string, external?: string) {
  return (
    [hint && `${id}-hint`, error && `${id}-error`, external].filter(Boolean).join(' ') || undefined
  );
}
export function Input({
  label,
  hint,
  error,
  id: provided,
  className,
  leadingIcon,
  ...props
}: ComponentPropsWithRef<'input'> & FieldProps & { leadingIcon?: ReactNode }) {
  const generated = useId();
  const id = provided ?? generated;
  return (
    <Field id={id} label={label} {...(hint ? { hint } : {})} {...(error ? { error } : {})}>
      <div className="tv-input-wrap">
        {leadingIcon && (
          <span className="tv-input-icon" aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          {...props}
          id={id}
          className={cx('tv-input', !!leadingIcon && 'tv-input-with-icon', className)}
          aria-invalid={!!error || props['aria-invalid']}
          aria-describedby={descriptions(id, hint, error, props['aria-describedby'])}
        />
      </div>
    </Field>
  );
}
export function Textarea({
  label,
  hint,
  error,
  id: provided,
  className,
  ...props
}: ComponentPropsWithRef<'textarea'> & FieldProps) {
  const generated = useId();
  const id = provided ?? generated;
  return (
    <Field id={id} label={label} {...(hint ? { hint } : {})} {...(error ? { error } : {})}>
      <textarea
        {...props}
        id={id}
        className={cx('tv-input tv-textarea', className)}
        aria-invalid={!!error || props['aria-invalid']}
        aria-describedby={descriptions(id, hint, error, props['aria-describedby'])}
      />
    </Field>
  );
}
export function Select({
  label,
  hint,
  error,
  id: provided,
  className,
  children,
  ...props
}: ComponentPropsWithRef<'select'> & FieldProps) {
  const generated = useId();
  const id = provided ?? generated;
  return (
    <Field id={id} label={label} {...(hint ? { hint } : {})} {...(error ? { error } : {})}>
      <div className="tv-select-wrap">
        <select
          {...props}
          id={id}
          className={cx('tv-input tv-select', className)}
          aria-invalid={!!error || props['aria-invalid']}
          aria-describedby={descriptions(id, hint, error, props['aria-describedby'])}
        >
          {children}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </div>
    </Field>
  );
}
type ChoiceProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  label: string;
  description?: string;
  error?: string;
};
function Choice({
  kind,
  label,
  description,
  error,
  id: provided,
  className,
  ...props
}: ChoiceProps & { kind: 'checkbox' | 'radio' | 'switch' }) {
  const generated = useId();
  const id = provided ?? generated;
  return (
    <div className="tv-choice-wrap">
      <label
        className={cx('tv-choice', className)}
        htmlFor={id}
        data-disabled={props.disabled || undefined}
      >
        <input
          {...props}
          id={id}
          type={kind === 'radio' ? 'radio' : 'checkbox'}
          {...(kind === 'switch' ? { role: 'switch' } : {})}
          className={`tv-choice-input tv-${kind}`}
          aria-invalid={!!error || props['aria-invalid']}
          aria-describedby={descriptions(id, description, error, props['aria-describedby'])}
        />
        <span>
          <span className="tv-choice-label">{label}</span>
          {description && (
            <span id={`${id}-hint`} className="tv-field-hint">
              {description}
            </span>
          )}
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className="tv-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
export function Checkbox(props: ChoiceProps) {
  return <Choice {...props} kind="checkbox" />;
}
export function Radio(props: ChoiceProps) {
  return <Choice {...props} kind="radio" />;
}
export function Switch(props: ChoiceProps) {
  return <Choice {...props} kind="switch" />;
}
