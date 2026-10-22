'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Input, Textarea, Select } from '@tevoniq/ui';
import {
  adminDefinitions,
  adminWriteSchema,
  moduleResource,
  type AdminModule,
  type AdminRecordWrite,
} from '@tevoniq/validation';
import { cmsApi, can } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
import { ConfirmAction } from './confirm-action';
type Row = AdminRecordWrite & {
  id: string;
  module?: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  referenceCount?: number;
  href?: string;
  email?: string;
  role?: string;
  disabled?: boolean;
  action?: string;
  entityId?: string;
};
type Reference = { id: string; title: string; module: string };
const date = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value),
      )
    : 'Not recorded';
export function RecordManager({
  section,
  initialQuery = '',
  initialStatus = '',
}: {
  section: string;
  initialQuery?: string;
  initialStatus?: string;
}) {
  const definition = adminDefinitions[section as AdminModule],
    recordModule = section as AdminModule;
  const session = useCmsSession(),
    editable = can(session.user, `${moduleResource(section)}.update`);
  const canPublish = can(session.user, `${moduleResource(section)}.publish`);
  const [query, setQuery] = useState(initialQuery),
    [q, setQ] = useState(initialQuery),
    [status, setStatus] = useState(initialStatus),
    [trash, setTrash] = useState('active'),
    [language, setLanguage] = useState(''),
    [sort, setSort] = useState('updatedAt'),
    [direction, setDirection] = useState('desc'),
    [page, setPage] = useState(1),
    [limit, setLimit] = useState(20);
  const [items, setItems] = useState<Row[]>([]),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true),
    [message, setMessage] = useState(''),
    [refresh, setRefresh] = useState(0),
    [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<AdminRecordWrite | null>(null),
    [editingArchived, setEditingArchived] = useState(false),
    [id, setId] = useState(''),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(false),
    [bulkStatus, setBulkStatus] = useState('');
  const [references, setReferences] = useState<Reference[]>([]),
    [referenceQuery, setReferenceQuery] = useState('');
  const endpoint = definition ? `records/${section}` : section === 'audit-logs' ? 'audit' : section;
  useEffect(() => {
    let active = true;
    cmsApi(
      `admin/${endpoint}?${new URLSearchParams({ q, status, trash, sort, direction, page: String(page), limit: String(limit), ...(language ? { language } : {}) })}`,
    )
      .then((result) => {
        if (active) {
          setItems(result.items as Row[]);
          setTotal(result.total as number);
          setMessage('');
          setSelected([]);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : 'Unable to load records');
          setItems([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint, q, status, trash, sort, direction, page, limit, language, refresh]);
  const reload = () => {
    setLoading(true);
    setRefresh((r) => r + 1);
  };
  const resetPage = () => {
    setPage(1);
    setLoading(true);
    setSelected([]);
  };
  const update = (patch: Partial<AdminRecordWrite>) => {
    setEditing((v) => v && { ...v, ...patch });
    setPreview(false);
  };
  const statuses =
    definition?.statuses ||
    (section === 'users'
      ? ['active', 'disabled']
      : ['draft', 'published', 'scheduled', 'archived']);
  async function save() {
    setBusy(true);
    setMessage('');
    try {
      await cmsApi(
        `admin/records/${recordModule}${id ? `/${id}` : ''}`,
        id ? 'PUT' : 'POST',
        adminWriteSchema(recordModule).parse(editing),
      );
      setEditing(null);
      setId('');
      reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }
  async function bulk(action: 'archive' | 'restore' | 'status') {
    await cmsApi(`admin/records/${recordModule}/bulk`, 'POST', {
      action,
      ...(action === 'status' ? { status: bulkStatus } : {}),
      records: items
        .filter((r) => selected.includes(r.id))
        .map((r) => ({ id: r.id, version: r.version })),
      confirmation: 'CONFIRM',
    });
    reload();
  }
  const heading =
    definition?.title ||
    (
      {
        'audit-logs': 'Audit Logs',
        search: 'Workspace Search',
        trash: 'Archived Catalog Records',
      } as Record<string, string>
    )[section] ||
    section;
  return (
    <main>
      <div className="admin-page-heading">
        <div>
          <h1>{heading}</h1>
          <p>{definition?.description || 'Search, review, and manage workspace records.'}</p>
        </div>
        {definition && can(session.user, `${moduleResource(section)}.create`) && (
          <Button
            disabled={!!editing}
            onClick={() => {
              setId('');
              setEditingArchived(false);
              setEditing({
                title: '',
                language: 'en',
                status: definition.statuses[0]!,
                data: {},
                referenceIds: [],
                version: 0,
              });
            }}
          >
            New record
          </Button>
        )}
      </div>
      {section === 'pages' && (
        <div className="admin-panel">
          <Link href="/admin/company">Edit Company pages →</Link>
        </div>
      )}
      {section === 'site-settings' && (
        <div className="admin-panel">
          <Link href="/admin/lead-settings">
            Contact forms, budget choices & email recipients →
          </Link>
        </div>
      )}
      {section === 'leads' && (
        <div className="admin-panel">
          <Link href="/admin/messages">Website messages →</Link>
        </div>
      )}
      {message && (
        <p role="alert" className="admin-error">
          {message}
        </p>
      )}
      {editing && definition && (
        <section className="admin-panel">
          <h2>{id ? 'Edit record' : 'New record'}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <fieldset
              className="admin-editor"
              disabled={
                busy ||
                !editable ||
                editingArchived ||
                (editing.status === 'published' && !canPublish)
              }
            >
              <Input
                label="Title / name"
                value={editing.title}
                required
                onChange={(e) => update({ title: e.target.value })}
              />
              <div className="admin-editor-grid">
                <Select
                  label="Status"
                  value={editing.status}
                  onChange={(e) => update({ status: e.target.value })}
                >
                  {statuses
                    .filter((s) => s !== 'published' || canPublish || editing.status === s)
                    .map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                </Select>
                <Select
                  label="Language"
                  value={editing.language}
                  onChange={(e) =>
                    update({ language: e.target.value as AdminRecordWrite['language'] })
                  }
                >
                  {['en', 'tr', 'ar'].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </Select>
              </div>
              {definition.fields.map((field) => {
                if (field.type === 'checkbox')
                  return (
                    <label key={field.key}>
                      <input
                        type="checkbox"
                        checked={editing.data[field.key] === 'true'}
                        onChange={(e) =>
                          update({
                            data: { ...editing.data, [field.key]: String(e.target.checked) },
                          })
                        }
                      />
                      {field.label}
                    </label>
                  );
                const Field = field.type === 'textarea' ? Textarea : Input;
                return (
                  <Field
                    key={field.key}
                    label={field.label}
                    value={editing.data[field.key] || ''}
                    required={field.required}
                    {...(field.type && field.type !== 'textarea' ? { type: field.type } : {})}
                    onChange={(e) =>
                      update({ data: { ...editing.data, [field.key]: e.target.value } })
                    }
                  />
                );
              })}
              <fieldset>
                <legend>Referenced records</legend>
                <p>
                  Link assets, positions, or other records used by this entry. Linked records are
                  protected from archiving.
                </p>
                <div className="admin-actions">
                  <Input
                    label="Find a reference"
                    value={referenceQuery}
                    onChange={(e) => setReferenceQuery(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        const result = await cmsApi(
                          `admin/references?q=${encodeURIComponent(referenceQuery)}`,
                        );
                        setReferences(result.items as Reference[]);
                      } catch (e) {
                        setMessage(e instanceof Error ? e.message : 'References unavailable');
                      }
                    }}
                  >
                    Find records
                  </Button>
                </div>
                {editing.referenceIds.map((ref) => (
                  <div key={ref}>
                    {references.find((r) => r.id === ref)?.title || ref}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        update({ referenceIds: editing.referenceIds.filter((r) => r !== ref) })
                      }
                    >
                      Remove reference
                    </Button>
                  </div>
                ))}
                <Select
                  label="Add reference"
                  value=""
                  onChange={(e) => {
                    if (e.target.value)
                      update({ referenceIds: [...editing.referenceIds, e.target.value] });
                  }}
                >
                  <option value="">Select a record</option>
                  {references
                    .filter((r) => r.id !== id && !editing.referenceIds.includes(r.id))
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.module}: {r.title}
                      </option>
                    ))}
                </Select>
              </fieldset>
              <Button type="submit" loading={busy}>
                Save record
              </Button>
            </fieldset>
          </form>
          <div className="admin-actions">
            <Button variant="secondary" onClick={() => setPreview(!preview)}>
              Preview
            </Button>
            <ConfirmAction
              label="Close editor"
              title="Discard unsaved edits?"
              description="The saved record will remain unchanged. Unsaved edits in this form will be lost."
              onConfirm={async () => {
                setEditing(null);
                setPreview(false);
              }}
            />
          </div>
          {preview && (
            <article
              className="admin-preview"
              lang={editing.language}
              dir={editing.language === 'ar' ? 'rtl' : 'ltr'}
            >
              <h2>{editing.title}</h2>
              <p>{editing.status}</p>
              {definition.fields.map((f) => (
                <div key={f.key}>
                  <strong>{f.label}</strong>
                  <p>{editing.data[f.key]}</p>
                </div>
              ))}
            </article>
          )}
        </section>
      )}
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(query);
          resetPage();
          setRefresh((r) => r + 1);
        }}
      >
        <Input label="Search records" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select
          label="Status filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetPage();
          }}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        {definition && (
          <>
            <Select
              label="Record visibility"
              value={trash}
              onChange={(e) => {
                setTrash(e.target.value);
                resetPage();
              }}
            >
              <option value="active">Active records</option>
              <option value="deleted">Archived records</option>
              <option value="all">All records</option>
            </Select>
            <Select
              label="Language filter"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                resetPage();
              }}
            >
              <option value="">All languages</option>
              {['en', 'tr', 'ar'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          </>
        )}
        <Select
          label="Sort by"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            resetPage();
          }}
        >
          <option value="updatedAt">Updated date</option>
          <option value="createdAt">Created date</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
        </Select>
        <Select
          label="Sort direction"
          value={direction}
          onChange={(e) => {
            setDirection(e.target.value);
            resetPage();
          }}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
        <Button type="submit">Search</Button>
        <Button type="button" variant="secondary" onClick={reload}>
          Refresh
        </Button>
      </form>
      {definition && editable && (
        <div className="admin-actions">
          <span>{selected.length} selected</span>
          <ConfirmAction
            label="Archive selected"
            title={`Archive ${selected.length} records?`}
            description="Records will be retained and can be restored. Referenced records cannot be archived. This action applies only to the selected records on this page."
            disabled={
              !can(session.user, `${moduleResource(section)}.delete`) ||
              !selected.length ||
              items.some((r) => selected.includes(r.id) && !!r.deletedAt)
            }
            onConfirm={() => bulk('archive')}
          >
            <ul>
              {items
                .filter((r) => selected.includes(r.id))
                .map((r) => (
                  <li key={r.id}>{r.title}</li>
                ))}
            </ul>
          </ConfirmAction>
          <ConfirmAction
            label="Restore selected"
            title="Restore selected records?"
            description="Content records return as drafts. Business records retain their workflow status."
            disabled={
              !selected.length || items.some((r) => selected.includes(r.id) && !r.deletedAt)
            }
            onConfirm={() => bulk('restore')}
          />
          <Select
            label="Bulk status"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
          >
            <option value="">Choose status</option>
            {statuses
              .filter((s) => s !== 'published' || canPublish)
              .map((s) => (
                <option key={s}>{s}</option>
              ))}
          </Select>
          <ConfirmAction
            label="Apply status"
            title={`Set status to ${bulkStatus}?`}
            description="All selected records must pass validation. The whole update is cancelled if any record has changed."
            disabled={
              !selected.length ||
              !bulkStatus ||
              items.some((r) => selected.includes(r.id) && !!r.deletedAt)
            }
            onConfirm={() => bulk('status')}
          />
        </div>
      )}
      {loading ? (
        <p role="status">Loading records…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {definition && editable && (
                  <th>
                    <input
                      type="checkbox"
                      aria-label="Select all records on this page"
                      checked={!!items.length && selected.length === items.length}
                      onChange={(e) => setSelected(e.target.checked ? items.map((r) => r.id) : [])}
                    />
                  </th>
                )}
                <th>{section === 'audit-logs' ? 'Action / record' : 'Title'}</th>
                <th>Status / section</th>
                <th>Created by / date</th>
                <th>Updated by / date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  {definition && editable && (
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.title}`}
                        checked={selected.includes(row.id)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, row.id]
                              : selected.filter((id) => id !== row.id),
                          )
                        }
                      />
                    </td>
                  )}
                  <td>
                    <strong>{row.title || row.action}</strong>
                    {row.entityId && <small>{row.entityId}</small>}
                    {row.referenceCount ? (
                      <small>{row.referenceCount} incoming references</small>
                    ) : null}
                  </td>
                  <td>
                    <span className="admin-status">
                      {row.deletedAt ? 'archived' : row.status || 'recorded'}
                    </span>
                    <small>{row.module || row.language}</small>
                  </td>
                  <td>
                    {row.createdBy || 'Not recorded'}
                    <small>{date(row.createdAt)}</small>
                  </td>
                  <td>
                    {row.updatedBy || 'Not recorded'}
                    <small>{date(row.updatedAt)}</small>
                  </td>
                  <td>
                    {definition ? (
                      <button
                        disabled={!!editing}
                        onClick={() => {
                          setId(row.id);
                          setEditingArchived(!!row.deletedAt);
                          setEditing({
                            title: row.title,
                            language: row.language,
                            status: row.status,
                            data: row.data,
                            referenceIds: row.referenceIds || [],
                            version: row.version,
                          });
                          setPreview(!editable || !!row.deletedAt);
                        }}
                      >
                        {row.deletedAt || !editable ? 'Preview' : 'Edit / preview'}
                      </button>
                    ) : row.href ? (
                      <Link href={row.href}>Open editor</Link>
                    ) : section === 'trash' && editable ? (
                      <ConfirmAction
                        label="Restore"
                        title={`Restore ${row.title}?`}
                        description="The record will return as a draft and will not be published automatically."
                        onConfirm={async () => {
                          await cmsApi(`admin/restore/${row.module}/${row.id}`, 'POST', {
                            version: row.version,
                            confirmation: 'CONFIRM',
                          });
                          reload();
                        }}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={6}>No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="admin-pagination">
        <span>
          {total} records · Page {page} of {Math.max(1, Math.ceil(total / limit))}
        </span>
        <Select
          label="Rows per page"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            resetPage();
          }}
        >
          {[20, 50, 100].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </Select>
        <div className="admin-actions">
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
          <Button
            variant="secondary"
            disabled={page * limit >= total || loading}
            onClick={() => {
              setPage((p) => p + 1);
              setLoading(true);
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}
