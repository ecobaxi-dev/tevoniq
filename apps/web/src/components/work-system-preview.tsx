'use client';
import { useState } from 'react';
import {
  ArrowUpRight,
  LayoutDashboard,
  List,
  Columns3,
  Search,
  Plus,
  RotateCcw,
  Check,
  Clock3,
  Package,
  Wrench,
  Handshake,
  CalendarDays,
  Factory,
  FolderKanban,
} from 'lucide-react';
import type { WorkSystem, SystemLocale } from '@/content/work-systems';
import {
  initialSystemRecords,
  demoSystemSummary,
  moveDemoStock,
  stockStatus,
  type DemoRecord,
} from '@/lib/work-system-demo';
import { PreviewDialog } from './preview-dialog';
import './work-systems.css';
const systemIcons = {
  maintenance: Wrench,
  'sales-crm': Handshake,
  'workshop-orders': Factory,
  appointments: CalendarDays,
  inventory: Package,
  'projects-tasks': FolderKanban,
};
export function WorkSystemPreview({
  system,
  locale,
}: {
  system: WorkSystem;
  locale: SystemLocale;
}) {
  const ar = locale === 'ar',
    copy = system[locale],
    inventory = system.slug === 'inventory',
    appointments = system.slug === 'appointments';
  const Icon = systemIcons[system.slug as keyof typeof systemIcons];
  const [records, setRecords] = useState(() => initialSystemRecords(system, locale));
  const [query, setQuery] = useState(''),
    [filter, setFilter] = useState('all'),
    [view, setView] = useState(system.view),
    [role, setRole] = useState('editor');
  const [selected, setSelected] = useState<number | null>(null),
    [creating, setCreating] = useState(false),
    [resetting, setResetting] = useState(false),
    [feedback, setFeedback] = useState(''),
    [error, setError] = useState('');
  const readonly = role === 'viewer',
    active = records.find((record) => record.id === selected),
    summary = demoSystemSummary(system, records);
  const format = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const unit =
    system.measure === 'money'
      ? ar
        ? 'ر.س'
        : 'SAR'
      : system.measure === 'hours'
        ? ar
          ? 'ساعة'
          : 'hours'
        : ar
          ? 'دقيقة'
          : 'minutes';
  const filtered = records.filter(
    (r) =>
      (filter === 'all' || r.status === Number(filter)) &&
      `${r.title} ${r.contact} ${r.id + 1000}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  const notify = (message: string) => {
    setFeedback(message);
    setError('');
  };
  function updateRecord(id: number, change: (record: DemoRecord) => DemoRecord) {
    if (readonly) return;
    setRecords((current) => current.map((record) => (record.id === id ? change(record) : record)));
  }
  function selectRecord(id: number) {
    setSelected(id);
    setError('');
  }
  const recordButton = (r: DemoRecord) => (
    <button className="ws-record-link" onClick={() => selectRecord(r.id)}>
      {r.title}
      <ArrowUpRight size={15} aria-hidden="true" />
    </button>
  );
  const priority = (r: DemoRecord) => (
    <span className={`ws-priority${r.priority === 'high' ? ' ws-priority--high' : ''}`}>
      {r.priority === 'high' ? (ar ? 'عاجل' : 'High') : ar ? 'عادي' : 'Normal'}
    </span>
  );
  const status = (r: DemoRecord) => (
    <span className={`ws-status ws-status--${r.status}`}>{copy.stages[r.status]}</span>
  );
  return (
    <div className={`ws ws--${system.theme}`}>
      <aside className="ws-demo-banner">
        <span>
          {ar
            ? 'معاينة توضيحية • بيانات افتراضية ومؤقتة'
            : 'Illustrative preview • fictional, temporary data'}
        </span>
        <a href={`/${locale}/work-systems/${system.slug}`}>
          {ar ? 'التفاصيل والإمكانات' : 'Details & capabilities'} ↗
        </a>
        <a href={`/${locale}/contact?intent=quote&system=${system.slug}`}>
          {ar ? 'أريد نظامًا مشابهًا' : 'Discuss a similar system'}
        </a>
      </aside>
      <div className="ws-shell">
        <aside className="ws-sidebar">
          <a className="ws-brand" href={`/${locale}/work-systems`}>
            <span>
              <Icon size={25} aria-hidden="true" />
            </span>
            <strong>
              {copy.brand}
              <small>TEVONIQ / DEMO</small>
            </strong>
          </a>
          <div className="ws-sidebar-active">
            <LayoutDashboard size={18} aria-hidden="true" />
            {ar ? 'مساحة العمل' : 'Workspace'}
          </div>
          <p className="ws-sidebar-label">{ar ? 'داخل هذا النموذج' : 'IN THIS PREVIEW'}</p>
          <ul>
            {copy.modules.map((module, i) => (
              <li key={module}>
                <span>0{i + 1}</span>
                {module}
              </li>
            ))}
          </ul>
          <div className="ws-sidebar-note">
            <Check size={19} aria-hidden="true" />
            <p>
              {ar
                ? 'جرّب مسار العمل قبل أن نحدد نطاق نظامك.'
                : 'Try the workflow before we scope your system.'}
            </p>
            <a href={`/${locale}/work-systems`}>
              {ar ? 'استكشف نماذج أخرى' : 'Explore other systems'} ←
            </a>
          </div>
        </aside>
        <main className="ws-main" id="main-content">
          <header className="ws-topbar">
            <span>{ar ? 'تجربة النظام' : 'SYSTEM EXPERIENCE'}</span>
            <label>
              {ar ? 'دور المعاينة' : 'Preview role'}
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setSelected(null);
                  setCreating(false);
                }}
              >
                <option value="editor">{ar ? 'تجربة التعديل' : 'Try editing'}</option>
                <option value="viewer">{ar ? 'عرض فقط' : 'View only'}</option>
              </select>
            </label>
          </header>
          <section className="ws-heading">
            <div>
              <p className="ws-eyebrow">{copy.name}</p>
              <h1>{copy.headline}</h1>
              <p>
                {ar
                  ? 'أضف سجلًا، غيّر حالته، وراقب ما يتغير في لوحة العمل.'
                  : 'Add a record, update its status and see the workspace respond.'}
              </p>
            </div>
            <div className="ws-heading-actions">
              <button className="ws-reset" onClick={() => setResetting(true)}>
                <RotateCcw size={16} aria-hidden="true" />
                {ar ? 'إعادة التجربة' : 'Reset demo'}
              </button>
              <button
                className="ws-primary"
                disabled={readonly}
                onClick={() => {
                  setCreating(true);
                  setError('');
                }}
              >
                <Plus size={17} aria-hidden="true" />
                {copy.addLabel}
              </button>
            </div>
          </section>
          <div className="ws-notice">
            {readonly
              ? ar
                ? 'وضع العرض فقط: التعديل معطّل في هذه المعاينة. الأدوار هنا لمحاكاة الواجهة وليست نظام صلاحيات فعليًا.'
                : 'View-only mode: editing is disabled. This simulates the interface, not a production permission system.'
              : ar
                ? 'التغييرات تعمل داخل هذه الصفحة فقط وتُمسح عند إعادة التحميل. لا توجد رسائل أو فواتير أو حجوزات فعلية.'
                : 'Changes stay in this page and reset on reload. No real messages, invoices or bookings are created.'}
          </div>
          <section
            className="ws-metrics"
            aria-label={ar ? 'ملخص البيانات التوضيحية' : 'Sample data summary'}
          >
            {[
              {
                label: ar ? 'إجمالي السجلات' : 'Total records',
                value: format(summary.total),
                icon: List,
              },
              {
                label: inventory
                  ? ar
                    ? 'منخفض أو نافد'
                    : 'Low or empty'
                  : ar
                    ? 'قيد المتابعة'
                    : 'Open records',
                value: format(summary.open),
                icon: Clock3,
              },
              {
                label: inventory
                  ? ar
                    ? 'أصناف نافدة'
                    : 'Empty items'
                  : ar
                    ? 'المرحلة الأخيرة'
                    : 'Final stage',
                value: format(summary.done),
                icon: Check,
              },
              { label: copy.totalLabel, value: `${format(summary.value)} ${unit}`, icon: Icon },
            ].map(({ label, value, icon: MetricIcon }) => (
              <article key={label}>
                <MetricIcon size={19} aria-hidden="true" />
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>
          <section className="ws-register" aria-labelledby="ws-register-title">
            <div className="ws-register-top">
              <div>
                <h2 id="ws-register-title">{ar ? 'سجل العمل' : 'Work register'}</h2>
                <p>
                  {ar
                    ? 'بيانات قابلة للتجربة وليست سجلات عملاء'
                    : 'Editable sample data, not customer records'}
                </p>
              </div>
              <div
                className="ws-view-buttons"
                role="group"
                aria-label={ar ? 'طريقة العرض' : 'View mode'}
              >
                <button aria-pressed={view === 'table'} onClick={() => setView('table')}>
                  <List size={16} aria-hidden="true" />
                  {ar ? 'جدول' : 'Table'}
                </button>
                <button
                  aria-pressed={view === (appointments ? 'agenda' : 'board')}
                  onClick={() => setView(appointments ? 'agenda' : 'board')}
                >
                  <Columns3 size={16} aria-hidden="true" />
                  {appointments ? (ar ? 'المواعيد' : 'Agenda') : ar ? 'المراحل' : 'Board'}
                </button>
              </div>
            </div>
            <div className="ws-toolbar">
              <label className="ws-search">
                <Search size={17} aria-hidden="true" />
                <span className="ws-sr">{ar ? 'البحث في السجلات' : 'Search records'}</span>
                <input
                  type="search"
                  placeholder={
                    ar ? 'ابحث بالعنوان أو الوصف أو الرقم' : 'Search title, description or ID'
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label>
                {ar ? 'الحالة' : 'Status'}
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">{ar ? 'جميع الحالات' : 'All statuses'}</option>
                  {copy.stages.map((stage, i) => (
                    <option key={stage} value={i}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
              <span className="ws-results">
                {format(filtered.length)} {ar ? 'نتيجة' : 'results'}
              </span>
            </div>
            {filtered.length === 0 ? (
              <div className="ws-empty">
                <Search size={28} aria-hidden="true" />
                <h3>{ar ? 'لا توجد سجلات مطابقة' : 'No matching records'}</h3>
                <p>
                  {ar
                    ? 'غيّر البحث أو الحالة، أو أضف سجلًا جديدًا.'
                    : 'Change your search or status, or add a new record.'}
                </p>
                <button
                  className="ws-reset"
                  onClick={() => {
                    setQuery('');
                    setFilter('all');
                  }}
                >
                  {ar ? 'إلغاء التصفية' : 'Clear filters'}
                </button>
              </div>
            ) : view === 'table' ? (
              <div
                className="ws-table-scroll"
                role="region"
                aria-label={ar ? 'جدول السجلات' : 'Records table'}
                tabIndex={0}
              >
                <table>
                  <thead>
                    <tr>
                      <th>{ar ? 'السجل' : 'Record'}</th>
                      <th>{ar ? 'الحالة' : 'Status'}</th>
                      <th>
                        {inventory ? (ar ? 'الرصيد' : 'Balance') : ar ? 'الأولوية' : 'Priority'}
                      </th>
                      <th>{ar ? 'التاريخ' : 'Date'}</th>
                      <th>{copy.valueLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <td>
                          {recordButton(r)}
                          <small>
                            #{r.id + 1000} · {r.contact}
                          </small>
                        </td>
                        <td>{status(r)}</td>
                        <td>{inventory ? <strong>{format(r.quantity)}</strong> : priority(r)}</td>
                        <td>
                          <time dateTime={r.date}>{r.date}</time>
                          {appointments && <small>{r.time}</small>}
                        </td>
                        <td>
                          {format(r.value)} {unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : view === 'agenda' ? (
              <div className="ws-agenda">
                {[...filtered]
                  .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
                  .map((r) => (
                    <article key={r.id}>
                      <div className="ws-agenda-date">
                        <CalendarDays size={20} aria-hidden="true" />
                        <time dateTime={`${r.date}T${r.time}`}>
                          {r.date}
                          <strong>{r.time}</strong>
                        </time>
                      </div>
                      <div>
                        {recordButton(r)}
                        <p>
                          {r.contact} · {r.value} {unit}
                        </p>
                      </div>
                      {status(r)}
                    </article>
                  ))}
              </div>
            ) : (
              <div className="ws-board">
                {copy.stages.map((stage, i) => (
                  <section key={stage} className={`ws-board-column ws-board-column--${i}`}>
                    <h3>
                      {stage}
                      <span>{filtered.filter((r) => r.status === i).length}</span>
                    </h3>
                    {filtered
                      .filter((r) => r.status === i)
                      .map((r) => (
                        <article key={r.id}>
                          <small>#{r.id + 1000}</small>
                          {recordButton(r)}
                          <p>{r.contact}</p>
                          <div>
                            {inventory ? (
                              <strong>
                                {format(r.quantity)} {ar ? 'وحدة' : 'units'}
                              </strong>
                            ) : (
                              priority(r)
                            )}
                            <span>
                              {format(r.value)} {unit}
                            </span>
                          </div>
                          <time dateTime={r.date}>{r.date}</time>
                        </article>
                      ))}
                    {!filtered.some((r) => r.status === i) && (
                      <p className="ws-board-empty">
                        {ar ? 'لا توجد سجلات في هذه المرحلة' : 'No records in this stage'}
                      </p>
                    )}
                  </section>
                ))}
              </div>
            )}
          </section>
          <p className="ws-feedback" role="status">
            {feedback}
          </p>
          <footer className="ws-bottom">
            <p>
              {inventory
                ? ar
                  ? 'حد الانخفاض في هذه التجربة: أقل من 10 وحدات. نخصص القواعد حسب نشاطك.'
                  : 'Demo low-stock threshold: fewer than 10 units. Rules are tailored to your business.'
                : ar
                  ? 'المؤشرات محسوبة من السجلات التوضيحية المعروضة، وليست نتائج أعمال فعلية.'
                  : 'Metrics are calculated from the sample records, not real business results.'}
            </p>
            <a href={`/${locale}/work-systems/${system.slug}`}>
              {ar ? 'ماذا يتضمن التنفيذ الفعلي؟' : 'What does a live implementation include?'} ↗
            </a>
          </footer>
        </main>
      </div>
      {creating && (
        <PreviewDialog label={copy.addLabel} onClose={() => setCreating(false)}>
          <div className="ws-dialog-heading">
            <h2>{copy.addLabel}</h2>
            <button className="ws-reset" onClick={() => setCreating(false)}>
              {ar ? 'إغلاق' : 'Close'} ×
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (readonly) return;
              const form = new FormData(e.currentTarget);
              const title = String(form.get('title') || '').trim(),
                contact = String(form.get('contact') || '').trim(),
                value = Number(form.get('value')),
                quantity = inventory ? Number(form.get('quantity')) : 1,
                date = String(form.get('date') || ''),
                time = String(form.get('time') || '09:00');
              if (
                !title ||
                !contact ||
                !Number.isFinite(value) ||
                value < 0 ||
                value > 10000000 ||
                !Number.isSafeInteger(quantity) ||
                quantity < 0 ||
                quantity > 1000000 ||
                !date
              ) {
                setError(ar ? 'راجع البيانات والقيم المدخلة.' : 'Check your details and values.');
                return;
              }
              setRecords((current) => [
                {
                  id: Math.max(0, ...current.map((r) => r.id)) + 1,
                  title,
                  contact,
                  value,
                  quantity,
                  status: inventory ? stockStatus(quantity) : 0,
                  priority: form.get('priority') === 'high' ? 'high' : 'normal',
                  date,
                  time,
                  notes: [],
                  history: [ar ? 'أُنشئ داخل المعاينة' : 'Created in preview'],
                },
                ...current,
              ]);
              setCreating(false);
              notify(ar ? 'أضيف السجل إلى المعاينة.' : 'Record added to the preview.');
            }}
          >
            <label>
              {ar ? 'العنوان' : 'Title'}
              <input name="title" required maxLength={120} placeholder={copy.placeholder} />
            </label>
            <label>
              {inventory
                ? ar
                  ? 'رمز الصنف أو الوصف'
                  : 'SKU or description'
                : ar
                  ? 'الجهة أو الوصف'
                  : 'Contact or description'}
              <input name="contact" required maxLength={160} />
            </label>
            <div className="ws-form-grid">
              <label>
                {copy.valueLabel}
                <input
                  name="value"
                  type="number"
                  min="0"
                  max="10000000"
                  step="0.01"
                  defaultValue={appointments ? 30 : 0}
                  required
                />
              </label>
              {inventory ? (
                <label>
                  {ar ? 'الرصيد الافتتاحي' : 'Opening balance'}
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1"
                    defaultValue="0"
                    required
                  />
                </label>
              ) : (
                <label>
                  {ar ? 'الأولوية' : 'Priority'}
                  <select name="priority">
                    <option value="normal">{ar ? 'عادي' : 'Normal'}</option>
                    <option value="high">{ar ? 'عاجل' : 'High'}</option>
                  </select>
                </label>
              )}
            </div>
            <label>
              {inventory ? (ar ? 'تاريخ المراجعة' : 'Review date') : ar ? 'التاريخ' : 'Date'}
              <input name="date" type="date" required />
            </label>
            {appointments && (
              <label>
                {ar ? 'الوقت' : 'Time'}
                <input name="time" type="time" required />
              </label>
            )}
            <p className="ws-local-note">
              {ar
                ? 'استخدم بيانات افتراضية. لا يُرسل هذا النموذج أي بيانات.'
                : 'Use fictional data. This form does not send any data.'}
            </p>
            {error && (
              <p role="alert" className="ws-error">
                {error}
              </p>
            )}
            <button className="ws-primary">{ar ? 'إضافة إلى المعاينة' : 'Add to preview'}</button>
          </form>
        </PreviewDialog>
      )}
      {active && (
        <PreviewDialog
          label={`${copy.recordLabel}: ${active.title}`}
          onClose={() => setSelected(null)}
        >
          <div className="ws-dialog-heading">
            <span>#{active.id + 1000}</span>
            <button className="ws-reset" onClick={() => setSelected(null)}>
              {ar ? 'إغلاق' : 'Close'} ×
            </button>
          </div>
          <h2>{active.title}</h2>
          <p>{active.contact}</p>
          <div className="ws-detail-status">
            {status(active)}
            {priority(active)}
          </div>
          <p>
            {copy.valueLabel}: {format(active.value)} {unit}
          </p>
          <label>
            {ar ? 'الحالة' : 'Status'}
            <select
              aria-label={ar ? 'تحديث الحالة' : 'Update status'}
              value={active.status}
              disabled={readonly || inventory}
              onChange={(e) => {
                const next = Number(e.target.value);
                updateRecord(active.id, (r) => ({
                  ...r,
                  status: next,
                  history: [
                    `${ar ? 'تغيير الحالة إلى' : 'Status changed to'} ${copy.stages[next]}`,
                    ...r.history,
                  ],
                }));
                notify(ar ? 'حُدثت الحالة داخل المعاينة.' : 'Status updated in preview.');
              }}
            >
              {copy.stages.map((stage, i) => (
                <option key={stage} value={i}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          {inventory ? (
            <section className="ws-dialog-section">
              <h3>{ar ? 'حركة مخزون' : 'Stock movement'}</h3>
              <p>
                {ar ? 'الرصيد الحالي' : 'Current balance'}:{' '}
                <strong>{format(active.quantity)}</strong>
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (readonly) return;
                  const form = e.currentTarget,
                    data = new FormData(form),
                    delta = Number(data.get('delta')),
                    reason = String(data.get('reason') || '').trim();
                  try {
                    const changed = moveDemoStock(active, delta, reason);
                    updateRecord(active.id, () => changed);
                    notify(
                      ar ? 'سُجلت الحركة وحُدث الرصيد.' : 'Movement recorded and balance updated.',
                    );
                    form.reset();
                  } catch {
                    setError(
                      ar
                        ? 'أدخل عددًا صحيحًا غير صفري وسبب الحركة. لا يمكن أن يصبح الرصيد سالبًا أو يتجاوز مليون وحدة.'
                        : 'Enter a non-zero whole number and a reason. Balance must stay between zero and one million.',
                    );
                  }
                }}
              >
                <label>
                  {ar
                    ? 'التغير في الكمية (+ إدخال، − صرف)'
                    : 'Quantity change (+ receipt, − issue)'}
                  <input
                    name="delta"
                    type="number"
                    step="1"
                    min="-1000000"
                    max="1000000"
                    required
                    disabled={readonly}
                  />
                </label>
                <label>
                  {ar ? 'سبب الحركة' : 'Movement reason'}
                  <input name="reason" required maxLength={200} disabled={readonly} />
                </label>
                {error && (
                  <p role="alert" className="ws-error">
                    {error}
                  </p>
                )}
                <button className="ws-primary" disabled={readonly}>
                  {ar ? 'تسجيل الحركة' : 'Record movement'}
                </button>
              </form>
            </section>
          ) : (
            <form
              className="ws-dialog-section"
              onSubmit={(e) => {
                e.preventDefault();
                if (readonly) return;
                const data = new FormData(e.currentTarget);
                updateRecord(active.id, (r) => ({
                  ...r,
                  date: String(data.get('date')),
                  time: String(data.get('time') || r.time),
                  history: [
                    ar ? 'تحديث الموعد داخل المعاينة' : 'Date updated in preview',
                    ...r.history,
                  ],
                }));
                notify(ar ? 'حُدث الموعد داخل المعاينة.' : 'Date updated in preview.');
              }}
            >
              <div className="ws-form-grid">
                <label>
                  {ar ? 'تاريخ المتابعة أو التسليم' : 'Follow-up or due date'}
                  <input
                    name="date"
                    type="date"
                    defaultValue={active.date}
                    required
                    disabled={readonly}
                  />
                </label>
                {appointments && (
                  <label>
                    {ar ? 'الوقت' : 'Time'}
                    <input
                      name="time"
                      type="time"
                      defaultValue={active.time}
                      required
                      disabled={readonly}
                    />
                  </label>
                )}
              </div>
              <button className="ws-reset" disabled={readonly}>
                {ar ? 'حفظ الموعد' : 'Save date'}
              </button>
            </form>
          )}
          <section className="ws-dialog-section">
            <h3>{ar ? 'الملاحظات' : 'Notes'}</h3>
            {active.notes.length ? (
              <ul>
                {active.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="ws-local-note">{ar ? 'لا توجد ملاحظات بعد.' : 'No notes yet.'}</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (readonly) return;
                const form = e.currentTarget,
                  note = String(new FormData(form).get('note') || '').trim();
                if (!note) return;
                updateRecord(active.id, (r) => ({
                  ...r,
                  notes: [...r.notes, note],
                  history: [ar ? 'أضيفت ملاحظة' : 'Note added', ...r.history],
                }));
                form.reset();
                notify(ar ? 'أضيفت الملاحظة.' : 'Note added.');
              }}
            >
              <label>
                {ar ? 'ملاحظة جديدة' : 'New note'}
                <textarea name="note" rows={2} required maxLength={1000} disabled={readonly} />
              </label>
              <button className="ws-reset" disabled={readonly}>
                {ar ? 'إضافة ملاحظة' : 'Add note'}
              </button>
            </form>
          </section>
          <section className="ws-dialog-section">
            <h3>{ar ? 'سجل التحديثات' : 'Activity history'}</h3>
            <ol className="ws-history">
              {active.history.map((entry, i) => (
                <li key={i}>{entry}</li>
              ))}
            </ol>
          </section>
          <details className="ws-delete">
            <summary>{ar ? 'حذف هذا السجل التوضيحي' : 'Delete this sample record'}</summary>
            <p>
              {ar
                ? 'يمكنك استعادة البيانات الأصلية من «إعادة التجربة».'
                : 'Restore the original data using Reset demo.'}
            </p>
            <button
              disabled={readonly}
              onClick={() => {
                if (readonly) return;
                setRecords((current) => current.filter((r) => r.id !== active.id));
                setSelected(null);
                notify(ar ? 'حُذف السجل من المعاينة.' : 'Record removed from preview.');
              }}
            >
              {ar ? 'تأكيد حذف السجل' : 'Confirm deletion'}
            </button>
          </details>
          <p className="ws-feedback" role="status">
            {feedback}
          </p>
        </PreviewDialog>
      )}
      {resetting && (
        <PreviewDialog
          label={ar ? 'إعادة بيانات المعاينة' : 'Reset preview data'}
          onClose={() => setResetting(false)}
        >
          <h2>{ar ? 'نبدأ التجربة من جديد؟' : 'Start the demo again?'}</h2>
          <p>
            {ar
              ? 'ستُحذف تعديلات المعاينة وتعود البيانات التوضيحية الأصلية.'
              : 'Your preview changes will be replaced with the original sample data.'}
          </p>
          <div className="ws-dialog-actions">
            <button
              className="ws-primary"
              onClick={() => {
                setRecords(initialSystemRecords(system, locale));
                setQuery('');
                setFilter('all');
                setSelected(null);
                setResetting(false);
                notify(ar ? 'أعيدت البيانات التوضيحية.' : 'Sample data restored.');
              }}
            >
              {ar ? 'إعادة البيانات الأصلية' : 'Restore sample data'}
            </button>
            <button className="ws-reset" onClick={() => setResetting(false)}>
              {ar ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </PreviewDialog>
      )}
    </div>
  );
}
