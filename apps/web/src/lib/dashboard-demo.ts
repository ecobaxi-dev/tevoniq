import type { DashboardModel, DashboardRow, DashboardLocale } from '../content/dashboard-models.ts';
export type DashboardFilters = {
  start: string;
  end: string;
  branch: string;
  category: string;
  status: string;
  search: string;
  threshold: number;
};
export const initialDashboardFilters = (): DashboardFilters => ({
  start: '2026-10-01',
  end: '2026-10-26',
  branch: 'all',
  category: 'all',
  status: 'all',
  search: '',
  threshold: 10,
});
export function dashboardRowStatus(model: DashboardModel, row: DashboardRow, threshold: number) {
  return model.slug === 'inventory'
    ? row.quantity === 0
      ? 2
      : row.quantity < threshold
        ? 1
        : 0
    : row.status;
}
export function filterDashboardRows(
  model: DashboardModel,
  rows: DashboardRow[],
  filters: DashboardFilters,
) {
  return rows.filter(
    (row) =>
      (!filters.start || row.date >= filters.start) &&
      (!filters.end || row.date <= filters.end) &&
      (filters.branch === 'all' || row.branch === Number(filters.branch)) &&
      (filters.category === 'all' || row.category === Number(filters.category)) &&
      (filters.status === 'all' ||
        dashboardRowStatus(model, row, filters.threshold) === Number(filters.status)) &&
      `${row.id} ${row.arTitle} ${row.enTitle}`
        .toLocaleLowerCase()
        .includes(filters.search.trim().toLocaleLowerCase()),
  );
}
export function dashboardRowMeasure(model: DashboardModel, row: DashboardRow) {
  switch (model.slug) {
    case 'sales':
    case 'expenses':
      return row.status === 0 ? row.value : 0;
    case 'service-requests':
      return row.status !== 3 ? 1 : 0;
    case 'inventory':
      return row.quantity;
    case 'appointments':
      return row.status !== 2 ? 1 : 0;
    case 'projects':
      return row.status === 0 || row.status === 1 ? 1 : 0;
  }
}
export function dashboardSummary(model: DashboardModel, rows: DashboardRow[], threshold: number) {
  const sum = (predicate: (row: DashboardRow) => number) =>
    rows.reduce((n, row) => n + predicate(row), 0);
  const primary = rows.reduce((n, row) => n + dashboardRowMeasure(model, row), 0);
  let secondary = 0;
  switch (model.slug) {
    case 'sales': {
      const count = rows.filter((row) => row.status === 0).length;
      secondary = count ? primary / count : 0;
      break;
    }
    case 'expenses':
      secondary = sum((row) => (row.status === 1 ? row.value : 0));
      break;
    case 'service-requests':
      secondary = sum((row) => (row.status !== 3 ? row.value : 0));
      break;
    case 'inventory':
      secondary = sum((row) => row.quantity * row.value);
      break;
    case 'appointments':
      secondary = sum((row) => (row.status !== 2 ? row.quantity : 0));
      break;
    case 'projects':
      secondary = sum((row) => (row.status === 0 || row.status === 1 ? row.value : 0));
      break;
  }
  return {
    records: rows.length,
    primary:
      model.slug === 'service-requests'
        ? rows.filter((row) => row.status === 0 || row.status === 1).length
        : model.slug === 'appointments'
          ? rows.filter((row) => row.status === 0).length
          : primary,
    secondary,
    attention: rows.filter((row) =>
      model.slug === 'inventory'
        ? dashboardRowStatus(model, row, threshold) !== 0
        : model.slug === 'sales'
          ? row.status === 1
          : model.slug === 'expenses'
            ? row.status === 1
            : row.status === 2,
    ).length,
  };
}
export function dashboardSeries(model: DashboardModel, rows: DashboardRow[]) {
  const dates = new Map<string, number>();
  for (const row of rows)
    dates.set(row.date, (dates.get(row.date) || 0) + dashboardRowMeasure(model, row));
  return [...dates]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}
export function dashboardBreakdown(model: DashboardModel, rows: DashboardRow[]) {
  return model.ar.categories.map((_, category) => ({
    category,
    value: rows
      .filter((row) => row.category === category)
      .reduce((n, row) => n + dashboardRowMeasure(model, row), 0),
    count: rows.filter((row) => row.category === category).length,
  }));
}
export function validateDashboardRow(model: DashboardModel, row: DashboardRow) {
  return (
    !!row.id &&
    !!row.arTitle.trim() &&
    !!row.enTitle.trim() &&
    row.arTitle.length <= 120 &&
    row.enTitle.length <= 120 &&
    /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
    Number.isFinite(Date.parse(row.date)) &&
    new Date(row.date).toISOString().slice(0, 10) === row.date &&
    [0, 1].includes(row.branch) &&
    Number.isInteger(row.category) &&
    row.category >= 0 &&
    row.category < model.ar.categories.length &&
    Number.isInteger(row.status) &&
    row.status >= 0 &&
    row.status < model.ar.statuses.length &&
    Number.isFinite(row.value) &&
    row.value >= 0 &&
    row.value <= 10000000 &&
    Number.isSafeInteger(row.quantity) &&
    row.quantity >= 0 &&
    row.quantity <= 1000000
  );
}
export function dashboardCsv(
  model: DashboardModel,
  rows: DashboardRow[],
  locale: DashboardLocale,
  threshold: number,
) {
  const ar = locale === 'ar',
    includeQuantity = model.slug === 'inventory' || model.slug === 'appointments';
  const cell = (value: string | number) => {
    const raw = String(value),
      safe = /^[\s]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const header = ar
    ? ['الرقم', 'العنوان', 'التاريخ', 'الفرع', 'الفئة', 'الحالة', model.ar.valueLabel]
    : ['ID', 'Title', 'Date', 'Branch', 'Category', 'Status', model.en.valueLabel];
  if (includeQuantity)
    header.push(
      model.slug === 'appointments'
        ? ar
          ? 'المدة بالدقائق'
          : 'Duration in minutes'
        : ar
          ? 'الرصيد'
          : 'Balance',
    );
  return (
    '\uFEFF' +
    [
      header,
      ...rows.map((row) => {
        const values: (string | number)[] = [
          row.id,
          ar ? row.arTitle : row.enTitle,
          row.date,
          row.branch === 0 ? (ar ? 'فرع ألف' : 'Branch A') : ar ? 'فرع باء' : 'Branch B',
          model[locale].categories[row.category]!,
          model[locale].statuses[dashboardRowStatus(model, row, threshold)]!,
          row.value,
        ];
        if (includeQuantity) values.push(row.quantity);
        return values;
      }),
    ]
      .map((row) => row.map(cell).join(','))
      .join('\r\n')
  );
}
