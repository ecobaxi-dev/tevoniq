'use client';
import { useState } from 'react';
import {
  BarChart3,
  LineChart,
  Download,
  RotateCcw,
  SlidersHorizontal,
  Search,
  ArrowUpRight,
  PieChart,
  ListChecks,
  CalendarDays,
  Layers3,
} from 'lucide-react';
import {
  dashboardModels,
  type DashboardModel,
  type DashboardLocale,
  type DashboardRow,
} from '@/content/dashboard-models';
import {
  initialDashboardFilters,
  filterDashboardRows,
  dashboardRowStatus,
  dashboardSummary,
  dashboardSeries,
  dashboardBreakdown,
  validateDashboardRow,
  dashboardCsv,
} from '@/lib/dashboard-demo';
import { PreviewDialog } from './preview-dialog';
import './dashboard-demos.css';
export function DashboardPreview({
  model,
  locale,
}: {
  model: DashboardModel;
  locale: DashboardLocale;
}) {
  const ar = locale === 'ar',
    c = model[locale],
    inventory = model.slug === 'inventory',
    appointments = model.slug === 'appointments';
  const [rows, setRows] = useState(() => model.rows.map((row) => ({ ...row }))),
    [filters, setFilters] = useState(initialDashboardFilters),
    [period, setPeriod] = useState('month'),
    [chart, setChart] = useState(inventory ? 'bars' : 'line'),
    [selected, setSelected] = useState<string | null>(null),
    [resetOpen, setResetOpen] = useState(false),
    [feedback, setFeedback] = useState(''),
    [error, setError] = useState('');
  const filtered = filterDashboardRows(model, rows, filters),
    summary = dashboardSummary(model, filtered, filters.threshold),
    series = dashboardSeries(model, filtered),
    breakdown = dashboardBreakdown(model, filtered),
    active = rows.find((row) => row.id === selected);
  const format = (n: number) =>
      new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n),
    money = ar ? 'ر.س' : 'SAR';
  const title = (row: DashboardRow) => (ar ? row.arTitle : row.enTitle);
  const branch = (value: number) =>
    value === 0 ? (ar ? 'فرع ألف' : 'Branch A') : ar ? 'فرع باء' : 'Branch B';
  const palette = ['sales', 'expenses', 'inventory'].includes(model.slug)
    ? ['#277756', '#a06524', '#a84646']
    : model.slug === 'appointments'
      ? ['#426bc4', '#277756', '#a84646']
      : ['#426bc4', '#a06524', '#277756', '#a84646'];
  const statusCounts = c.statuses.map((label, index) => ({
    label,
    count: filtered.filter((row) => dashboardRowStatus(model, row, filters.threshold) === index)
      .length,
    color: palette[index]!,
  }));
  const segments = statusCounts
    .map((item, index) => {
      const from = filtered.length
        ? (statusCounts.slice(0, index).reduce((sum, entry) => sum + entry.count, 0) /
            filtered.length) *
          100
        : 0;
      const to = from + (filtered.length ? (item.count / filtered.length) * 100 : 0);
      return `${item.color} ${from}% ${to}%`;
    })
    .join(',');
  const max = Math.max(1, ...series.map((item) => item.value));
  const points = series.map((item) => ({
    x:
      series.length === 1
        ? 300
        : 40 +
          ((Date.parse(item.date) - Date.parse(series[0]!.date)) /
            (Date.parse(series.at(-1)!.date) - Date.parse(series[0]!.date))) *
            520,
    y: 190 - (item.value / max) * 150,
    ...item,
  }));
  const line = points.map((point, i) => `${i ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
  function choosePeriod(value: string) {
    setPeriod(value);
    setFilters((current) => ({
      ...current,
      start: value === 'all' ? '' : value === 'week' ? '2026-10-20' : '2026-10-01',
      end: value === 'all' ? '' : '2026-10-26',
    }));
  }
  function exportData() {
    const blob = new Blob([dashboardCsv(model, filtered, locale, filters.threshold)], {
        type: 'text/csv;charset=utf-8',
      }),
      url = URL.createObjectURL(blob),
      link = document.createElement('a');
    link.href = url;
    link.download = `tevoniq-demo-${model.slug}-${locale}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback(
      ar
        ? 'تم تصدير السجلات المعروضة فقط إلى ملف CSV محلي.'
        : 'Only the visible records were exported to a local CSV file.',
    );
  }
  const highlightLabel = inventory
    ? ar
      ? 'أصناف تحتاج متابعة'
      : 'Items needing review'
    : model.slug === 'sales'
      ? ar
        ? 'مبيعات قيد المتابعة'
        : 'Sales being followed up'
      : model.slug === 'expenses'
        ? ar
          ? 'مصروفات بانتظار المراجعة'
          : 'Expenses awaiting review'
        : appointments
          ? ar
            ? 'مواعيد ملغاة'
            : 'Cancelled appointments'
          : ar
            ? 'سجلات مكتملة'
            : 'Completed records';
  const primaryUnit = ['sales', 'expenses'].includes(model.slug)
    ? money
    : inventory
      ? ar
        ? 'وحدة'
        : 'units'
      : '';
  const secondaryUnit =
    model.slug === 'projects'
      ? ar
        ? 'ساعة'
        : 'hours'
      : appointments
        ? ar
          ? 'دقيقة'
          : 'minutes'
        : money;
  const invalidRange = !!filters.start && !!filters.end && filters.start > filters.end;
  return (
    <div className={`dd dd--${model.theme}`}>
      <aside className="dd-demo-banner">
        <span>
          {ar
            ? 'لوحة توضيحية • بيانات افتراضية دون ربط خارجي'
            : 'Illustrative dashboard • fictional data, no external connection'}
        </span>
        <a href={`/${locale}/dashboard-demos/${model.slug}`}>
          {ar ? 'التفاصيل ومصادر البيانات' : 'Details & data sources'} ↗
        </a>
        <a href={`/${locale}/contact?intent=quote&dashboard=${model.slug}`}>
          {ar ? 'أريد لوحة مشابهة' : 'Discuss a similar dashboard'}
        </a>
      </aside>
      <header className="dd-topbar">
        <a className="dd-brand" href={`/${locale}/dashboard-demos`}>
          <span>
            <BarChart3 size={25} aria-hidden="true" />
          </span>
          <strong>
            TEVONIQ<small>{ar ? 'لوحات المعلومات' : 'BUSINESS DASHBOARDS'}</small>
          </strong>
        </a>
        <nav aria-label={ar ? 'نماذج اللوحات' : 'Dashboard examples'}>
          {dashboardModels.map((item) => (
            <a
              key={item.slug}
              aria-current={item.slug === model.slug ? 'page' : undefined}
              href={`/previews/${locale}/dashboards/${item.slug}`}
            >
              {item[locale].name}
            </a>
          ))}
        </nav>
        <button className="dd-secondary" onClick={() => setResetOpen(true)}>
          <RotateCcw size={16} aria-hidden="true" />
          {ar ? 'إعادة التجربة' : 'Reset demo'}
        </button>
      </header>
      <main id="main-content" className="dd-main">
        <header className="dd-heading">
          <div>
            <p className="dd-eyebrow">{c.name}</p>
            <h1>{c.headline}</h1>
            <p>
              {ar
                ? 'مؤشرات محسوبة من السجلات المعروضة، وليست نتائج عملاء. البيانات التوضيحية حتى 26 أكتوبر 2026.'
                : 'Metrics calculated from the visible records, not client results. Sample data through 26 October 2026.'}
            </p>
          </div>
          <button className="dd-primary" onClick={exportData} disabled={!filtered.length}>
            <Download size={17} aria-hidden="true" />
            {ar ? 'تصدير النتائج' : 'Export results'}
          </button>
        </header>
        <section className="dd-filters" aria-label={ar ? 'فلاتر اللوحة' : 'Dashboard filters'}>
          <div className="dd-filter-title">
            <SlidersHorizontal size={19} aria-hidden="true" />
            <strong>{ar ? 'اختر ما تريد متابعته' : 'Choose what to review'}</strong>
          </div>
          <div className="dd-filter-grid">
            <label>
              {ar ? 'الفترة' : 'Period'}
              <select value={period} onChange={(event) => choosePeriod(event.target.value)}>
                <option value="month">{ar ? 'أكتوبر 2026' : 'October 2026'}</option>
                <option value="week">{ar ? '20–26 أكتوبر 2026' : '20–26 October 2026'}</option>
                <option value="all">{ar ? 'كل البيانات' : 'All data'}</option>
                <option value="custom">{ar ? 'فترة مخصصة' : 'Custom period'}</option>
              </select>
            </label>
            <label>
              {ar ? 'من تاريخ' : 'From date'}
              <input
                type="date"
                value={filters.start}
                onChange={(event) => {
                  setPeriod('custom');
                  setFilters((current) => ({ ...current, start: event.target.value }));
                }}
              />
            </label>
            <label>
              {ar ? 'إلى تاريخ' : 'To date'}
              <input
                type="date"
                value={filters.end}
                onChange={(event) => {
                  setPeriod('custom');
                  setFilters((current) => ({ ...current, end: event.target.value }));
                }}
              />
            </label>
            <label>
              {ar ? 'الفرع' : 'Branch'}
              <select
                value={filters.branch}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, branch: event.target.value }))
                }
              >
                <option value="all">{ar ? 'كل الفروع' : 'All branches'}</option>
                <option value="0">{branch(0)}</option>
                <option value="1">{branch(1)}</option>
              </select>
            </label>
            <label>
              {ar ? 'الفئة' : 'Category'}
              <select
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, category: event.target.value }))
                }
              >
                <option value="all">{ar ? 'كل الفئات' : 'All categories'}</option>
                {c.categories.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {ar ? 'الحالة' : 'Status'}
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, status: event.target.value }))
                }
              >
                <option value="all">{ar ? 'كل الحالات' : 'All statuses'}</option>
                {c.statuses.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="dd-search">
            <Search size={16} aria-hidden="true" />
            <span className="dd-sr">{ar ? 'البحث في السجلات' : 'Search records'}</span>
            <input
              type="search"
              value={filters.search}
              placeholder={ar ? 'ابحث بالرقم أو العنوان' : 'Search ID or title'}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
            />
          </label>
          {inventory && (
            <label className="dd-threshold">
              {ar ? 'حد انخفاض المخزون (أقل من)' : 'Low-stock threshold (below)'}
              <input
                type="range"
                min="1"
                max="50"
                value={filters.threshold}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, threshold: Number(event.target.value) }))
                }
              />
              <output>
                {filters.threshold} {ar ? 'وحدة' : 'units'}
              </output>
            </label>
          )}
          {invalidRange && (
            <p role="alert" className="dd-error">
              {ar
                ? 'تاريخ البداية يجب ألا يتجاوز تاريخ النهاية.'
                : 'The start date must not be after the end date.'}
            </p>
          )}
          <p className="dd-filter-note">
            {inventory
              ? ar
                ? 'الفترة تصفي تاريخ مراجعة الصنف، لا تاريخ حركة مخزون.'
                : 'Dates filter item review dates, not stock movement dates.'
              : ar
                ? 'تتغير المؤشرات والرسوم والسجلات والتصدير مع الفلاتر نفسها.'
                : 'Metrics, charts, records and export use the same filters.'}
          </p>
        </section>
        <section
          className="dd-metrics"
          aria-label={ar ? 'المؤشرات التوضيحية' : 'Illustrative metrics'}
        >
          {[
            {
              label: ar ? 'السجلات المعروضة' : 'Visible records',
              value: format(summary.records),
              icon: Layers3,
            },
            {
              label: c.primaryLabel,
              value: `${format(summary.primary)} ${primaryUnit}`,
              icon: BarChart3,
            },
            {
              label: c.secondaryLabel,
              value: `${format(summary.secondary)} ${secondaryUnit}`,
              icon: CalendarDays,
            },
            { label: highlightLabel, value: format(summary.attention), icon: ListChecks },
          ].map(({ label, value, icon: Icon }) => (
            <article key={label}>
              <span className="dd-metric-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>
        {filtered.length ? (
          <>
            <div className="dd-chart-grid">
              <section className="dd-panel dd-trend" aria-labelledby="dd-trend-title">
                <div className="dd-panel-heading">
                  <div>
                    <p className="dd-eyebrow">OVERVIEW</p>
                    <h2 id="dd-trend-title">{c.trendLabel}</h2>
                  </div>
                  <div
                    className="dd-chart-switch"
                    role="group"
                    aria-label={ar ? 'شكل الرسم' : 'Chart style'}
                  >
                    <button
                      aria-label={ar ? 'رسم خطي' : 'Line chart'}
                      aria-pressed={chart === 'line'}
                      onClick={() => setChart('line')}
                    >
                      <LineChart size={17} />
                    </button>
                    <button
                      aria-label={ar ? 'رسم أعمدة' : 'Bar chart'}
                      aria-pressed={chart === 'bars'}
                      onClick={() => setChart('bars')}
                    >
                      <BarChart3 size={17} />
                    </button>
                  </div>
                </div>
                <svg
                  className="dd-svg"
                  viewBox="0 0 600 235"
                  role="img"
                  aria-labelledby="dd-trend-title dd-trend-description"
                >
                  <desc id="dd-trend-description">
                    {series.map((item) => `${item.date}: ${format(item.value)}`).join(' · ')}
                  </desc>
                  <defs>
                    <linearGradient id="dd-trend-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity=".22" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity=".02" />
                    </linearGradient>
                  </defs>
                  {[40, 115, 190].map((y, i) => (
                    <g key={y}>
                      <line x1="40" x2="570" y1={y} y2={y} stroke="#dce5ef" strokeDasharray="4 6" />
                      <text x="15" y={y + 4} fontSize="10" fill="#52637b" textAnchor="middle">
                        {format(max * (1 - i / 2))}
                      </text>
                    </g>
                  ))}
                  {chart === 'line' ? (
                    <>
                      <path
                        d={`${line} L${points.at(-1)!.x},190 L${points[0]!.x},190 Z`}
                        fill="url(#dd-trend-fill)"
                      />
                      <path
                        d={line}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((point) => (
                        <circle
                          key={point.date}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="currentColor"
                        >
                          <title>{`${point.date}: ${format(point.value)}`}</title>
                        </circle>
                      ))}
                    </>
                  ) : (
                    points.map((point) => (
                      <rect
                        key={point.date}
                        x={point.x - 11}
                        y={point.y}
                        width="22"
                        height={190 - point.y}
                        rx="4"
                        fill="currentColor"
                      >
                        <title>{`${point.date}: ${format(point.value)}`}</title>
                      </rect>
                    ))
                  )}
                  <text x="40" y="223" fontSize="11" fill="#52637b" textAnchor="start">
                    {series[0]!.date}
                  </text>
                  <text x="570" y="223" fontSize="11" fill="#52637b" textAnchor="end">
                    {series.at(-1)!.date}
                  </text>
                </svg>
                <p className="dd-chart-note">
                  {ar
                    ? 'مصدر الرسم هو السجلات المعروضة وتعريف المؤشر أعلاه. مرّر المؤشر على النقطة لقراءة قيمتها.'
                    : 'The chart uses the visible records and the measure defined above. Hover a point to read its value.'}
                </p>
              </section>
              <section className="dd-panel dd-categories" aria-labelledby="dd-category-title">
                <div className="dd-panel-heading">
                  <div>
                    <p className="dd-eyebrow">BREAKDOWN</p>
                    <h2 id="dd-category-title">
                      {ar ? 'توزيع مؤشر الرسم حسب الفئة' : 'Chart measure by category'}
                    </h2>
                  </div>
                  <PieChart size={22} aria-hidden="true" />
                </div>
                <p className="dd-chart-note">
                  {ar
                    ? 'اضغط على فئة لتصفية اللوحة كاملة.'
                    : 'Select a category to filter the whole dashboard.'}
                </p>
                <div className="dd-category-bars">
                  {breakdown.map((item) => (
                    <button
                      key={item.category}
                      aria-pressed={filters.category === String(item.category)}
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          category:
                            current.category === String(item.category)
                              ? 'all'
                              : String(item.category),
                        }))
                      }
                    >
                      <span>
                        {c.categories[item.category]}
                        <strong>{format(item.value)}</strong>
                      </span>
                      <i>
                        <b
                          style={{
                            width: `${(item.value / Math.max(1, ...breakdown.map((entry) => entry.value))) * 100}%`,
                          }}
                        />
                      </i>
                      <small>
                        {format(item.count)} {ar ? 'سجلات' : 'records'}
                      </small>
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <div className="dd-bottom-grid">
              <section className="dd-panel dd-records" aria-labelledby="dd-record-title">
                <div className="dd-panel-heading">
                  <div>
                    <p className="dd-eyebrow">SOURCE RECORDS</p>
                    <h2 id="dd-record-title">
                      {ar ? 'من المؤشر إلى السجل' : 'From metric to record'}
                    </h2>
                  </div>
                  <span className="dd-record-count">
                    {format(filtered.length)} {ar ? 'سجلات' : 'records'}
                  </span>
                </div>
                <div
                  className="dd-table-scroll"
                  role="region"
                  aria-label={ar ? 'جدول بيانات اللوحة' : 'Dashboard source table'}
                  tabIndex={0}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>{ar ? 'السجل' : 'Record'}</th>
                        <th>{ar ? 'التاريخ' : 'Date'}</th>
                        <th>{ar ? 'الفئة' : 'Category'}</th>
                        <th>{ar ? 'الحالة' : 'Status'}</th>
                        <th>{inventory ? (ar ? 'الرصيد' : 'Balance') : c.valueLabel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <button
                              onClick={() => {
                                setSelected(row.id);
                                setError('');
                              }}
                            >
                              {title(row)}
                              <ArrowUpRight size={14} aria-hidden="true" />
                            </button>
                            <small>
                              {row.id} · {branch(row.branch)}
                            </small>
                          </td>
                          <td>
                            <time dateTime={row.date}>{row.date}</time>
                          </td>
                          <td>{c.categories[row.category]}</td>
                          <td>
                            <span
                              className={`dd-row-status dd-row-status--${dashboardRowStatus(model, row, filters.threshold)}`}
                            >
                              {c.statuses[dashboardRowStatus(model, row, filters.threshold)]}
                            </span>
                          </td>
                          <td>{format(inventory ? row.quantity : row.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="dd-panel dd-status-panel" aria-labelledby="dd-status-title">
                <p className="dd-eyebrow">STATUS MIX</p>
                <h2 id="dd-status-title">
                  {ar ? 'توزيع حالات السجلات' : 'Record status distribution'}
                </h2>
                <div
                  className="dd-donut"
                  style={{ background: `conic-gradient(${segments})` }}
                  aria-hidden="true"
                >
                  <div>
                    <strong>{format(filtered.length)}</strong>
                    <span>{ar ? 'سجلات' : 'records'}</span>
                  </div>
                </div>
                <ul>
                  {statusCounts.map((item, index) => (
                    <li key={item.label}>
                      <button
                        aria-pressed={filters.status === String(index)}
                        onClick={() =>
                          setFilters((current) => ({
                            ...current,
                            status: current.status === String(index) ? 'all' : String(index),
                          }))
                        }
                      >
                        <i style={{ background: item.color }} />
                        <span>{item.label}</span>
                        <strong>{format(item.count)}</strong>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="dd-chart-note">
                  {ar
                    ? 'اضغط على الحالة لتصفية السجلات والرسوم.'
                    : 'Select a status to filter records and charts.'}
                </p>
              </section>
            </div>
          </>
        ) : (
          <section className="dd-empty">
            <Search size={32} aria-hidden="true" />
            <h2>{ar ? 'لا توجد سجلات ضمن الفلاتر المختارة' : 'No records match these filters'}</h2>
            <p>
              {ar
                ? 'عدّل الفترة أو الفرع أو الحالة، أو ألغِ التصفية.'
                : 'Change the period, branch or status, or clear the filters.'}
            </p>
            <button
              className="dd-secondary"
              onClick={() => {
                setFilters(initialDashboardFilters());
                setPeriod('month');
              }}
            >
              {ar ? 'إلغاء التصفية' : 'Clear filters'}
            </button>
          </section>
        )}
        <p className="dd-feedback" role="status">
          {feedback}
        </p>
        <footer className="dd-footer">
          <p>{c.note}</p>
          <a href={`/${locale}/dashboard-demos/${model.slug}`}>
            {ar ? 'كيف نربطها ببيانات نشاطك؟' : 'How can this connect to your business data?'} ↗
          </a>
        </footer>
      </main>
      {active && (
        <PreviewDialog
          label={ar ? 'تعديل سجل توضيحي' : 'Edit sample record'}
          onClose={() => setSelected(null)}
        >
          <div className="dd-dialog-title">
            <h2>{ar ? 'جرّب أثر تعديل السجل' : 'Try changing the source record'}</h2>
            <button className="dd-secondary" onClick={() => setSelected(null)}>
              {ar ? 'إغلاق' : 'Close'} ×
            </button>
          </div>
          <p>
            {active.id} ·{' '}
            {ar
              ? 'تعديل محلي مؤقت دون حفظ خارجي.'
              : 'Temporary local change, not saved externally.'}
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget),
                text = String(data.get('title') || '').trim();
              const updated: DashboardRow = {
                ...active,
                [ar ? 'arTitle' : 'enTitle']: text,
                date: String(data.get('date')),
                branch: Number(data.get('branch')),
                category: Number(data.get('category')),
                status: Number(data.get('status') ?? active.status),
                value: Number(data.get('value')),
                quantity:
                  inventory || appointments ? Number(data.get('quantity')) : active.quantity,
              };
              if (!validateDashboardRow(model, updated)) {
                setError(
                  ar
                    ? 'راجع البيانات والأعداد والتاريخ قبل الحفظ.'
                    : 'Check values and date before saving.',
                );
                return;
              }
              setRows((current) => current.map((row) => (row.id === active.id ? updated : row)));
              setSelected(null);
              setFeedback(
                ar
                  ? 'حُدّث السجل وأعيد حساب المؤشرات والفلاتر محليًا.'
                  : 'Record updated and metrics recalculated locally.',
              );
            }}
          >
            <label>
              {ar ? 'العنوان' : 'Title'}
              <input name="title" defaultValue={title(active)} required maxLength={120} />
            </label>
            <div className="dd-form-grid">
              <label>
                {ar ? 'التاريخ' : 'Date'}
                <input name="date" type="date" defaultValue={active.date} required />
              </label>
              <label>
                {ar ? 'الفرع' : 'Branch'}
                <select name="branch" defaultValue={active.branch}>
                  <option value="0">{branch(0)}</option>
                  <option value="1">{branch(1)}</option>
                </select>
              </label>
              <label>
                {ar ? 'الفئة' : 'Category'}
                <select name="category" defaultValue={active.category}>
                  {c.categories.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {ar ? 'الحالة' : 'Status'}
                <select name="status" defaultValue={active.status} disabled={inventory}>
                  {c.statuses.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {c.valueLabel}
                <input
                  name="value"
                  type="number"
                  min="0"
                  max="10000000"
                  step="0.01"
                  defaultValue={active.value}
                  required
                />
              </label>
              {(inventory || appointments) && (
                <label>
                  {inventory
                    ? ar
                      ? 'الرصيد'
                      : 'Balance'
                    : ar
                      ? 'المدة بالدقائق'
                      : 'Duration in minutes'}
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1"
                    defaultValue={active.quantity}
                    required
                  />
                </label>
              )}
            </div>
            {inventory && (
              <p className="dd-chart-note">
                {ar
                  ? 'تُحسب حالة الصنف من الرصيد وحد الانخفاض في اللوحة.'
                  : 'Stock status follows the balance and dashboard threshold.'}
              </p>
            )}
            {error && (
              <p role="alert" className="dd-error">
                {error}
              </p>
            )}
            <button className="dd-primary">
              {ar ? 'احفظ وأعد الحساب' : 'Save and recalculate'}
            </button>
          </form>
        </PreviewDialog>
      )}
      {resetOpen && (
        <PreviewDialog
          label={ar ? 'إعادة البيانات التوضيحية' : 'Reset sample data'}
          onClose={() => setResetOpen(false)}
        >
          <h2>{ar ? 'نعود إلى البيانات الأصلية؟' : 'Restore the original sample data?'}</h2>
          <p>
            {ar
              ? 'ستُمسح تعديلات السجلات والفلاتر في هذه المعاينة.'
              : 'Record edits and filters in this preview will be reset.'}
          </p>
          <div className="dd-dialog-actions">
            <button
              className="dd-primary"
              onClick={() => {
                setRows(model.rows.map((row) => ({ ...row })));
                setFilters(initialDashboardFilters());
                setPeriod('month');
                setSelected(null);
                setFeedback(ar ? 'أعيدت البيانات الأصلية.' : 'Sample data restored.');
                setResetOpen(false);
              }}
            >
              {ar ? 'إعادة البيانات الأصلية' : 'Restore sample data'}
            </button>
            <button className="dd-secondary" onClick={() => setResetOpen(false)}>
              {ar ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </PreviewDialog>
      )}
    </div>
  );
}
