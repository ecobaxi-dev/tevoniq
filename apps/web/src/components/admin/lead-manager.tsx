'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Input, Select, Textarea, Checkbox } from '@tevoniq/ui';
import { leadStatuses } from '@tevoniq/validation';
import { cmsApi, can } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
import { ConfirmAction } from './confirm-action';
type Row = {
  id: string;
  name: string;
  company: string;
  email: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt: string | null;
};
type Detail = Row & {
  createdBy: string;
  updatedBy: string;
  phone: string;
  country: string;
  subject: string;
  message: string;
  preferredContactMethod: string;
  industry: string;
  projectType: string;
  budgetLabel: string;
  timeline: string;
  projectDescription: string;
  sourcePage: string;
  utm: Record<string, string>;
  consentAt: string | null;
  consentVersion: string | null;
  updatedById: string | null;
  servicesInterested: { id: string; title: string }[];
  attachments: { id: string; name: string; size: number }[];
  emails: {
    id: string;
    kind: string;
    status: string;
    attempts: number;
    lastError: string | null;
  }[];
};
type Activity = {
  id: string;
  action: string;
  actor: string;
  note: string | null;
  fromStatus: string | null;
  toStatus: string | null;
  createdAt: string;
};
const date = (value: string) => new Date(value).toLocaleString();
export function LeadManager({
  messages = false,
  initialLead = '',
  initialStatus = '',
}: {
  messages?: boolean;
  initialLead?: string;
  initialStatus?: string;
}) {
  const { user } = useCmsSession();
  const [q, setQ] = useState(''),
    [status, setStatus] = useState(
      leadStatuses.includes(initialStatus as (typeof leadStatuses)[number]) ? initialStatus : '',
    ),
    [type, setType] = useState(messages ? 'contact' : ''),
    [archived, setArchived] = useState('false'),
    [sort, setSort] = useState('createdAt'),
    [direction, setDirection] = useState('desc'),
    [page, setPage] = useState(1),
    [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<Row[]>([]),
    [total, setTotal] = useState(0),
    [selected, setSelected] = useState(initialLead),
    [detail, setDetail] = useState<Detail | null>(null),
    [activity, setActivity] = useState<Activity[]>([]),
    [activityPage, setActivityPage] = useState(1),
    [activityTotal, setActivityTotal] = useState(0),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  const allowed = can(user, 'leads.read');
  const [checked, setChecked] = useState<string[]>([]),
    [bulkStatus, setBulkStatus] = useState('CONTACTED');
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    const query = new URLSearchParams({
      q,
      archived,
      sort,
      direction,
      page: String(page),
      limit: '20',
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    });
    void cmsApi(`leads?${query}`)
      .then((data) => {
        if (active) {
          setRows(data.items as Row[]);
          setTotal(data.total as number);
          setChecked([]);
          setError('');
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [allowed, q, status, type, archived, sort, direction, page, refresh]);
  useEffect(() => {
    if (!allowed || !selected) return;
    let active = true;
    void Promise.all([
      cmsApi(`leads/${selected}`),
      cmsApi(`leads/${selected}/activity?page=${activityPage}`),
    ])
      .then(([record, history]) => {
        if (active) {
          setDetail(record as Detail);
          setActivity(history.items as Activity[]);
          setActivityTotal(history.total as number);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [allowed, selected, refresh, activityPage]);
  async function action(path: string, method: string, body: unknown) {
    setBusy(true);
    setError('');
    try {
      await cmsApi(path, method, body);
      setLoading(true);
      setRefresh((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
      throw e;
    } finally {
      setBusy(false);
    }
  }
  if (!allowed) return <p>You do not have permission to view personal enquiries.</p>;
  return (
    <main className="admin-leads">
      <header className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">RELATIONSHIPS</p>
          <h1>{messages ? 'Website messages' : 'Leads'}</h1>
          <p>Review enquiries, record progress, and keep the conversation in context.</p>
        </div>
        <Link href="/admin/lead-settings">Lead & email settings →</Link>
      </header>
      {error && <p role="alert">{error}</p>}
      <div className="lead-admin-filters">
        <Input
          label="Search enquiries"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
            setLoading(true);
          }}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
            setLoading(true);
          }}
        >
          <option value="">All statuses</option>
          {leadStatuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select
          label="Form"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
            setLoading(true);
          }}
        >
          <option value="">All forms</option>
          <option value="contact">Contact</option>
          <option value="quote">Quote</option>
        </Select>
        <Select
          label="Records"
          value={archived}
          onChange={(e) => {
            setArchived(e.target.value);
            setPage(1);
            setLoading(true);
          }}
        >
          <option value="false">Active</option>
          <option value="true">Archived</option>
        </Select>
        <Select
          label="Sort by"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
            setLoading(true);
          }}
        >
          {Object.entries({
            createdAt: 'Created date',
            updatedAt: 'Updated date',
            name: 'Name',
            status: 'Status',
          }).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          label="Order"
          value={direction}
          onChange={(e) => {
            setDirection(e.target.value);
            setPage(1);
            setLoading(true);
          }}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
      </div>
      <div className="lead-admin-actions">
        <span>{checked.length} selected</span>
        {archived === 'false' && (
          <>
            <Select
              label="Bulk lead status"
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
            >
              {leadStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <ConfirmAction
              label="Update selected"
              title={`Update ${checked.length} selected leads?`}
              description={`Change status to ${bulkStatus}. This applies to the selected records on this page.`}
              disabled={!checked.length || busy || loading}
              onConfirm={() =>
                action('leads/bulk', 'POST', {
                  records: rows
                    .filter((r) => checked.includes(r.id))
                    .map((r) => ({ id: r.id, version: r.version })),
                  action: 'status',
                  status: bulkStatus,
                  confirmation: 'CONFIRM',
                })
              }
            />
          </>
        )}
        <ConfirmAction
          label={archived === 'true' ? 'Restore selected' : 'Archive selected'}
          title={`${archived === 'true' ? 'Restore' : 'Archive'} ${checked.length} selected leads?`}
          description="All lead details and history are retained. Archiving cancels pending emails. Restoring does not resend them."
          disabled={
            !checked.length ||
            busy ||
            loading ||
            !can(user, archived === 'true' ? 'leads.update' : 'leads.delete')
          }
          onConfirm={() =>
            action('leads/bulk', 'POST', {
              records: rows
                .filter((r) => checked.includes(r.id))
                .map((r) => ({ id: r.id, version: r.version })),
              action: archived === 'true' ? 'restore' : 'archive',
              confirmation: 'CONFIRM',
            })
          }
        />
      </div>
      <div className="lead-admin-table">
        <table>
          <thead>
            <tr>
              <th>
                <Checkbox
                  label="Select this page"
                  checked={!!rows.length && checked.length === rows.length}
                  disabled={loading || busy}
                  onChange={(e) => setChecked(e.target.checked ? rows.map((r) => r.id) : [])}
                />
              </th>
              <th>Name / company</th>
              <th>Email</th>
              <th>Form</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Checkbox
                    label="Select"
                    aria-label={`Select ${row.name}`}
                    checked={checked.includes(row.id)}
                    disabled={loading || busy}
                    onChange={(e) =>
                      setChecked(
                        e.target.checked
                          ? [...checked, row.id]
                          : checked.filter((id) => id !== row.id),
                      )
                    }
                  />
                </td>
                <td>
                  {row.name}
                  <small>{row.company}</small>
                </td>
                <td>{row.email}</td>
                <td>{row.type}</td>
                <td>{row.status}</td>
                <td>{date(row.createdAt)}</td>
                <td>{date(row.updatedAt)}</td>
                <td>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelected(row.id);
                      setActivityPage(1);
                    }}
                  >
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading ? (
        <p role="status">Loading enquiries…</p>
      ) : (
        !rows.length && <p>No matching enquiries.</p>
      )}
      <div className="lead-admin-actions">
        <Button
          variant="secondary"
          disabled={page === 1 || loading}
          onClick={() => {
            setPage((p) => p - 1);
            setLoading(true);
          }}
        >
          Previous
        </Button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(total / 20))} · {total} enquiries
        </span>
        <Button
          variant="secondary"
          disabled={page * 20 >= total || loading}
          onClick={() => {
            setPage((p) => p + 1);
            setLoading(true);
          }}
        >
          Next
        </Button>
      </div>
      {selected && detail?.id !== selected && <p role="status">Loading lead…</p>}
      {detail && detail.id === selected && (
        <section className="lead-admin-detail" aria-label="Lead details">
          <header>
            <h2>{detail.name}</h2>
            <p>{detail.id}</p>
            <Button
              variant="secondary"
              onClick={() => {
                setSelected('');
                setDetail(null);
              }}
            >
              Close details
            </Button>
          </header>
          <dl className="lead-admin-facts">
            {Object.entries({
              Company: detail.company,
              Email: detail.email,
              Phone: detail.phone,
              Country: detail.country,
              'Preferred contact': detail.preferredContactMethod,
              Industry: detail.industry,
              'Project type': detail.projectType,
              Budget: detail.budgetLabel,
              Timeline: detail.timeline,
              'Source page': detail.sourcePage,
              Created: date(detail.createdAt),
              Updated: date(detail.updatedAt),
              'Created by': detail.createdBy,
              'Updated by': detail.updatedBy,
              Consent: detail.consentAt
                ? `${date(detail.consentAt)} · ${detail.consentVersion}`
                : 'Not recorded',
            }).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value || '—'}</dd>
              </div>
            ))}
          </dl>
          <h3>{detail.type === 'quote' ? 'Project description' : detail.subject}</h3>
          <p className="lead-admin-message">
            {detail.type === 'quote' ? detail.projectDescription : detail.message}
          </p>
          <h3>Services</h3>
          <p>{detail.servicesInterested.map((s) => s.title).join(', ') || 'None selected'}</p>
          <h3>Campaign attribution</h3>
          <p>
            {Object.entries(detail.utm)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ') || 'No UTM parameters'}
          </p>
          {!!detail.attachments.length && (
            <>
              <h3>Private attachments</h3>
              <ul>
                {detail.attachments.map((file) => (
                  <li key={file.id}>
                    <a href={`/api/cms/leads/${detail.id}/attachments/${file.id}`} download>
                      {file.name}
                    </a>{' '}
                    · {Math.ceil(file.size / 1024)} KB
                  </li>
                ))}
              </ul>
            </>
          )}
          {!detail.deletedAt && (
            <div className="lead-admin-editors">
              <form
                key={`status-${detail.version}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  void action(`leads/${detail.id}`, 'PUT', {
                    status: data.get('status'),
                    version: detail.version,
                  }).catch(() => {});
                }}
              >
                <Select label="Lead status" name="status" defaultValue={detail.status}>
                  {leadStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
                <Button disabled={busy} type="submit">
                  Update status
                </Button>
              </form>
              <form
                key={`note-${detail.version}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  void action(`leads/${detail.id}/notes`, 'POST', {
                    note: data.get('note'),
                    version: detail.version,
                  }).catch(() => {});
                }}
              >
                <Textarea label="Add internal note" name="note" required maxLength={5000} />
                <Button disabled={busy} type="submit">
                  Save note
                </Button>
              </form>
            </div>
          )}
          <h3>Email delivery</h3>
          <ul>
            {detail.emails.map((email) => (
              <li key={email.id}>
                {email.kind}: {email.status} · {email.attempts} attempts{' '}
                {email.lastError && `— ${email.lastError}`}
              </li>
            ))}
          </ul>
          {detail.emails.some((e) => e.status === 'failed') &&
            !detail.deletedAt &&
            detail.status !== 'SPAM' && (
              <Button
                disabled={busy}
                onClick={() =>
                  void action(`leads/${detail.id}/retry-email`, 'POST', {}).catch(() => {})
                }
              >
                Retry failed emails
              </Button>
            )}
          <h3>Activity history</h3>
          <ol className="lead-admin-history">
            {activity.map((item) => (
              <li key={item.id}>
                <strong>{item.action}</strong>{' '}
                {item.fromStatus && `${item.fromStatus} → ${item.toStatus}`}
                <small>
                  {date(item.createdAt)} · {item.actor}
                </small>
                {item.note && <p className="lead-admin-message">{item.note}</p>}
              </li>
            ))}
          </ol>
          <div className="lead-admin-actions">
            <Button
              variant="secondary"
              disabled={activityPage === 1}
              onClick={() => setActivityPage((p) => p - 1)}
            >
              Newer activity
            </Button>
            <span>Page {activityPage}</span>
            <Button
              variant="secondary"
              disabled={activityPage * 30 >= activityTotal}
              onClick={() => setActivityPage((p) => p + 1)}
            >
              Older activity
            </Button>
          </div>
          <ConfirmAction
            label={detail.deletedAt ? 'Restore lead' : 'Archive lead'}
            title={detail.deletedAt ? 'Restore this lead?' : 'Archive this lead?'}
            description="The lead, notes, and attachments are retained. Archiving cancels pending emails; restoring does not resend them."
            disabled={busy || !can(user, 'leads.delete')}
            onConfirm={() =>
              action(`leads/${detail.id}/archive`, 'POST', {
                version: detail.version,
                archived: !detail.deletedAt,
                confirmation: 'CONFIRM',
              })
            }
          />
        </section>
      )}
    </main>
  );
}
