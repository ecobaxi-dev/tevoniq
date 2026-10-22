'use client';
import type { ReactNode } from 'react';
import { Tabs as TabsPrimitive, Accordion as AccordionPrimitive } from 'radix-ui';
import { Plus } from 'lucide-react';
export type TabItem = { value: string; label: string; content: ReactNode; disabled?: boolean };
export function Tabs({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
}: {
  items: TabItem[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <TabsPrimitive.Root
      className="tv-tabs"
      {...(value !== undefined
        ? { value }
        : { defaultValue: defaultValue ?? items.find((item) => !item.disabled)?.value ?? '' })}
      {...(onValueChange ? { onValueChange } : {})}
    >
      <TabsPrimitive.List className="tv-tab-list" aria-label={label}>
        {items.map((item) => (
          <TabsPrimitive.Trigger
            className="tv-tab"
            key={item.value}
            value={item.value}
            disabled={item.disabled ?? false}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content key={item.value} className="tv-tab-panel" value={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
export function Accordion({
  items,
  multiple = false,
}: {
  items: Array<{ value: string; title: string; content: ReactNode; disabled?: boolean }>;
  multiple?: boolean;
}) {
  const children = items.map((item) => (
    <AccordionPrimitive.Item
      className="tv-accordion-item"
      key={item.value}
      value={item.value}
      disabled={item.disabled ?? false}
    >
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="tv-accordion-trigger">
          {item.title}
          <Plus size={18} aria-hidden="true" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="tv-accordion-content">
        <div>{item.content}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  ));
  return multiple ? (
    <AccordionPrimitive.Root className="tv-accordion" type="multiple">
      {children}
    </AccordionPrimitive.Root>
  ) : (
    <AccordionPrimitive.Root className="tv-accordion" type="single" collapsible>
      {children}
    </AccordionPrimitive.Root>
  );
}
