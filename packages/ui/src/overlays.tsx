'use client';
import type { ReactElement, ReactNode } from 'react';
import {
  Dialog,
  DropdownMenu,
  Tooltip as TooltipPrimitive,
  Toast as ToastPrimitive,
} from 'radix-ui';
import { X, CheckCircle2, CircleAlert, Info } from 'lucide-react';
import { IconButton } from './actions.js';
import { useUI } from './provider.js';
type DialogProps = {
  trigger: ReactElement;
  title: string;
  description: string;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
function DialogShell({
  trigger,
  title,
  description,
  closeLabel,
  children,
  footer,
  open,
  onOpenChange,
  kind,
}: DialogProps & { kind: 'modal' | 'drawer' }) {
  const { theme, direction } = useUI();
  return (
    <Dialog.Root
      {...(open !== undefined ? { open } : {})}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="tv-overlay" />
        <Dialog.Content className={`tv-dialog tv-${kind}`} data-theme={theme} dir={direction}>
          <div className="tv-dialog-header">
            <div>
              <Dialog.Title className="tv-h3">{title}</Dialog.Title>
              <Dialog.Description className="tv-description">{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <IconButton variant="ghost" label={closeLabel}>
                <X size={20} />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className="tv-dialog-body">{children}</div>
          {footer && <div className="tv-dialog-footer">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Modal(props: DialogProps) {
  return <DialogShell {...props} kind="modal" />;
}
export function Drawer(props: DialogProps) {
  return <DialogShell {...props} kind="drawer" />;
}
export function Dropdown({
  trigger,
  label,
  items,
}: {
  trigger: ReactElement;
  label: string;
  items: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
    danger?: boolean;
    onSelect: () => void;
  }>;
}) {
  const { theme, direction } = useUI();
  return (
    <DropdownMenu.Root dir={direction}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="tv-dropdown"
          data-theme={theme}
          sideOffset={8}
          align="end"
          aria-label={label}
        >
          <DropdownMenu.Label className="tv-menu-label">{label}</DropdownMenu.Label>
          <DropdownMenu.Separator className="tv-menu-separator" />
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.id}
              className="tv-menu-item"
              data-danger={item.danger || undefined}
              disabled={item.disabled ?? false}
              onSelect={item.onSelect}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
export function Tooltip({ children, content }: { children: ReactElement; content: string }) {
  const { theme, direction } = useUI();
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className="tv-tooltip"
          data-theme={theme}
          dir={direction}
          sideOffset={8}
        >
          {content}
          <TooltipPrimitive.Arrow className="tv-tooltip-arrow" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
export function ToastProvider({ children, label }: { children: ReactNode; label: string }) {
  const { direction } = useUI();
  return (
    <ToastPrimitive.Provider
      swipeDirection={direction === 'rtl' ? 'left' : 'right'}
      duration={6000}
    >
      {children}
      <ToastPrimitive.Viewport className="tv-toast-viewport" dir={direction} label={label} />
    </ToastPrimitive.Provider>
  );
}
export function Toast({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  tone = 'success',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  closeLabel: string;
  tone?: 'success' | 'danger' | 'info';
}) {
  const { theme, direction } = useUI();
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'danger' ? CircleAlert : Info;
  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      className="tv-toast"
      data-theme={theme}
      data-tone={tone}
      dir={direction}
    >
      <Icon size={20} aria-hidden="true" />
      <div>
        <ToastPrimitive.Title className="tv-toast-title">{title}</ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="tv-description">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close asChild>
        <IconButton variant="ghost" label={closeLabel}>
          <X size={16} />
        </IconButton>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}
