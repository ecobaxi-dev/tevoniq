import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dashboardModels } from '../apps/web/src/content/dashboard-models.ts';
import {
  initialDashboardFilters,
  filterDashboardRows,
  dashboardRowStatus,
  dashboardSummary,
  dashboardSeries,
  dashboardBreakdown,
  dashboardRowMeasure,
  validateDashboardRow,
  dashboardCsv,
} from '../apps/web/src/lib/dashboard-demo.ts';
const model = (slug) => dashboardModels.find((item) => item.slug === slug);
const base = {
  id: 'A',
  arTitle: 'سجل أ',
  enTitle: 'Record A',
  date: '2026-10-01',
  branch: 0,
  category: 0,
  status: 0,
  value: 100,
  quantity: 5,
};
const rows = [
  base,
  {
    ...base,
    id: 'B',
    arTitle: 'سجل ب',
    enTitle: 'Record B',
    branch: 1,
    category: 1,
    status: 1,
    value: 200,
    quantity: 10,
  },
  {
    ...base,
    id: 'C',
    arTitle: 'سجل ج',
    enTitle: 'Record C',
    date: '2026-10-26',
    category: 2,
    status: 2,
    value: 300,
    quantity: 0,
  },
];
test('date, branch, category, status and text filters combine on the same records', () => {
  const source = [
      ...rows,
      { ...base, id: 'D', date: '2026-09-30' },
      { ...base, id: 'E', date: '2026-11-01' },
    ],
    filters = initialDashboardFilters();
  assert.equal(filterDashboardRows(model('sales'), source, filters).length, 3);
  assert.deepEqual(
    filterDashboardRows(model('sales'), source, {
      ...filters,
      branch: '1',
      category: '1',
      status: '1',
      search: 'record b',
    }).map((row) => row.id),
    ['B'],
  );
  assert.deepEqual(
    filterDashboardRows(model('sales'), source, {
      ...filters,
      start: '2026-11-01',
      end: '2026-10-01',
    }),
    [],
  );
});
test('sales and expense measures exclude uncompleted or unpaid values and cancelled records', () => {
  assert.deepEqual(dashboardSummary(model('sales'), rows, 10), {
    records: 3,
    primary: 100,
    secondary: 100,
    attention: 1,
  });
  assert.deepEqual(dashboardSummary(model('expenses'), rows, 10), {
    records: 3,
    primary: 100,
    secondary: 200,
    attention: 1,
  });
  const changed = rows.map((row) => (row.id === 'B' ? { ...row, status: 0 } : row));
  assert.equal(dashboardSummary(model('sales'), changed, 10).primary, 300);
  assert.equal(dashboardSummary(model('sales'), changed, 10).secondary, 150);
});
test('inventory values and status filters follow the editable low-stock threshold', () => {
  const inventory = model('inventory');
  assert.deepEqual(dashboardSummary(inventory, rows, 10), {
    records: 3,
    primary: 15,
    secondary: 2500,
    attention: 2,
  });
  assert.equal(dashboardRowStatus(inventory, rows[1], 10), 0);
  assert.equal(dashboardRowStatus(inventory, rows[1], 11), 1);
  assert.equal(dashboardRowStatus(inventory, rows[2], 1), 2);
  const filters = { ...initialDashboardFilters(), status: '1', threshold: 11 };
  assert.deepEqual(
    filterDashboardRows(inventory, rows, filters).map((row) => row.id),
    ['A', 'B'],
  );
});
test('appointment durations, open work and completed counts use their documented definitions', () => {
  assert.deepEqual(dashboardSummary(model('appointments'), rows, 10), {
    records: 3,
    primary: 1,
    secondary: 15,
    attention: 1,
  });
  const requests = [...rows, { ...base, id: 'D', status: 3, value: 400 }];
  assert.deepEqual(dashboardSummary(model('service-requests'), requests, 10), {
    records: 4,
    primary: 2,
    secondary: 600,
    attention: 1,
  });
  assert.deepEqual(dashboardSummary(model('projects'), requests, 10), {
    records: 4,
    primary: 2,
    secondary: 300,
    attention: 1,
  });
});
test('time series and category breakdowns reconcile to the same record measure without mutating data', () => {
  for (const dashboard of dashboardModels) {
    const source = structuredClone(dashboard.rows),
      selected = filterDashboardRows(dashboard, source, initialDashboardFilters()),
      expected = selected.reduce((sum, row) => sum + dashboardRowMeasure(dashboard, row), 0);
    assert.equal(
      dashboardSeries(dashboard, selected).reduce((sum, point) => sum + point.value, 0),
      expected,
    );
    assert.equal(
      dashboardBreakdown(dashboard, selected).reduce((sum, category) => sum + category.value, 0),
      expected,
    );
    assert.deepEqual(source, dashboard.rows);
    assert.ok(
      dashboardSeries(dashboard, selected).every(
        (point, i, array) => i === 0 || point.date >= array[i - 1].date,
      ),
    );
  }
});
test('invalid source edits are rejected and empty dashboards contain finite zero metrics', () => {
  for (const change of [
    { value: -1 },
    { value: Infinity },
    { quantity: 1.5 },
    { quantity: -1 },
    { date: '2026-02-30' },
    { branch: 2 },
    { category: 99 },
    { status: 99 },
    { arTitle: ' ' },
  ])
    assert.equal(validateDashboardRow(model('sales'), { ...base, ...change }), false);
  assert.equal(validateDashboardRow(model('sales'), base), true);
  for (const dashboard of dashboardModels)
    assert.deepEqual(dashboardSummary(dashboard, [], 10), {
      records: 0,
      primary: 0,
      secondary: 0,
      attention: 0,
    });
});
test('CSV exports only the supplied subset, escapes quotes and neutralises formula-like titles', () => {
  const csv = dashboardCsv(
    model('sales'),
    [{ ...base, enTitle: '=HYPERLINK("https://example.invalid")' }],
    'en',
    10,
  );
  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(csv, /'=HYPERLINK\(""https:\/\/example.invalid""\)/);
  assert.equal(csv.split('\r\n').length, 2);
  assert.ok(!csv.includes('Record B'));
  assert.ok(!csv.includes('Quantity'));
  const appointments = dashboardCsv(model('appointments'), rows, 'ar', 10);
  assert.ok(appointments.includes('المدة بالدقائق'));
  assert.ok(appointments.includes('سجل أ'));
});
