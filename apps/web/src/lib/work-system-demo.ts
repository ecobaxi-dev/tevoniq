import type { WorkSystem, SystemLocale } from '../content/work-systems.ts';
export type DemoRecord = {
  id: number;
  title: string;
  contact: string;
  value: number;
  quantity: number;
  status: number;
  priority: 'normal' | 'high';
  date: string;
  time: string;
  notes: string[];
  history: string[];
};
export function initialSystemRecords(system: WorkSystem, locale: SystemLocale): DemoRecord[] {
  return system.records.map((record) => ({
    id: record.id,
    ...record[locale],
    value: record.value,
    quantity: record.quantity,
    status: record.status,
    priority: record.priority,
    date: record.date,
    time: record.time,
    notes: [],
    history: [locale === 'ar' ? 'سجل توضيحي عند بدء المعاينة' : 'Sample record at preview start'],
  }));
}
export function stockStatus(quantity: number) {
  return quantity === 0 ? 2 : quantity < 10 ? 1 : 0;
}
export function moveDemoStock(record: DemoRecord, delta: number, reason: string): DemoRecord {
  if (
    !Number.isSafeInteger(delta) ||
    delta === 0 ||
    !reason.trim() ||
    !Number.isSafeInteger(record.quantity + delta) ||
    record.quantity + delta < 0 ||
    record.quantity + delta > 1000000
  )
    throw new Error('Invalid stock movement');
  const quantity = record.quantity + delta;
  return {
    ...record,
    quantity,
    status: stockStatus(quantity),
    history: [`${delta > 0 ? '+' : ''}${delta} · ${reason.trim()}`, ...record.history],
  };
}
export function demoSystemSummary(system: WorkSystem, records: DemoRecord[]) {
  const inventory = system.slug === 'inventory',
    last = system.ar.stages.length - 1;
  return {
    total: records.length,
    open: records.filter((r) => (inventory ? r.quantity < 10 : r.status !== last)).length,
    done: records.filter((r) => (inventory ? r.quantity === 0 : r.status === last)).length,
    value: records.reduce(
      (sum, r) =>
        sum +
        (inventory
          ? r.quantity * r.value
          : ['sales-crm', 'projects-tasks', 'appointments'].includes(system.slug)
            ? r.status === last || (system.slug === 'appointments' && r.status === 0)
              ? 0
              : r.value
            : r.value),
      0,
    ),
  };
}
