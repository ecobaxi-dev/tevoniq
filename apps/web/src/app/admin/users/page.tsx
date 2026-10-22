'use client';
import { useEffect, useState } from 'react';
import { Button, Input, Select, Checkbox } from '@tevoniq/ui';
import { cmsApi } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { cmsRoles } from '@tevoniq/validation';
type UserRow = {
  id: string;
  email: string;
  role: string;
  disabled: boolean;
  lastLoginAt?: string | null;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
};
const roles = cmsRoles;
export default function Users() {
  const { user } = useCmsSession();
  const [items, setItems] = useState<UserRow[]>([]),
    [editing, setEditing] = useState<UserRow | null>(null),
    [password, setPassword] = useState(''),
    [q, setQ] = useState(''),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState(''),
    [sort, setSort] = useState('createdAt'),
    [direction, setDirection] = useState('desc'),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [refresh, setRefresh] = useState(0),
    [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    cmsApi(`admin/users?${new URLSearchParams({ q, status, sort, direction, page: String(page) })}`)
      .then((result) => {
        if (active) {
          setItems(result.items as UserRow[]);
          setTotal(result.total as number);
          setMessage('');
        }
      })
      .catch((e: unknown) => {
        if (active) setMessage(e instanceof Error ? e.message : 'Users unavailable');
      });
    return () => {
      active = false;
    };
  }, [q, status, sort, direction, page, refresh]);
  const canEdit = user?.role === 'SUPER_ADMIN';
  async function save() {
    if (!editing) return;
    await cmsApi(`admin/users${editing.id ? `/${editing.id}` : ''}`, editing.id ? 'PUT' : 'POST', {
      email: editing.email,
      role: editing.role,
      disabled: editing.disabled,
      version: editing.version,
      confirmation: 'CONFIRM',
      ...(password ? { password } : {}),
    });
    setEditing(null);
    setPassword('');
    setRefresh((v) => v + 1);
  }
  return (
    <main>
      <div className="admin-page-heading">
        <div>
          <h1>Users</h1>
          <p>Manage access without deleting account history.</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setEditing({ id: '', email: '', role: 'EDITOR', disabled: false, version: 0 });
              setPassword('');
            }}
          >
            New user
          </Button>
        )}
      </div>
      {message && (
        <p role="alert" className="admin-error">
          {message}
        </p>
      )}
      {editing && (
        <section className="admin-panel admin-editor">
          <h2>{editing.id ? 'Edit user' : 'Create user'}</h2>
          <Input
            label="Email"
            type="email"
            value={editing.email}
            onChange={(e) => setEditing({ ...editing, email: e.target.value })}
          />
          <Select
            label="Role"
            value={editing.role}
            onChange={(e) => setEditing({ ...editing, role: e.target.value })}
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
          <Input
            label={
              editing.id
                ? 'New password (leave blank to keep)'
                : 'Initial password (15–128 characters)'
            }
            type="password"
            autoComplete="new-password"
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Checkbox
            label="Disable account"
            checked={editing.disabled}
            onChange={(e) => setEditing({ ...editing, disabled: e.target.checked })}
          />
          <p>
            Updating an existing user revokes their active sessions. You cannot disable or demote
            yourself.
          </p>
          <div className="admin-actions">
            <ConfirmAction
              label="Save user"
              title={`Confirm access for ${editing.email || 'new user'}`}
              description={`Role: ${editing.role}. Account will be ${editing.disabled ? 'disabled' : 'active'}. Existing sessions will be revoked.`}
              onConfirm={save}
            />
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </section>
      )}
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(query);
          setPage(1);
        }}
      >
        <Input label="Search email" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select
          label="Account status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </Select>
        <Select label="Sort users" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt">Created date</option>
          <option value="updatedAt">Updated date</option>
          <option value="title">Email</option>
          <option value="status">Role</option>
        </Select>
        <Select label="Direction" value={direction} onChange={(e) => setDirection(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
        <Button type="submit">Search</Button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last sign in</th>
              <th>Created by / date</th>
              <th>Updated by / date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{r.role}</td>
                <td>{r.disabled ? 'Disabled' : 'Active'}</td>
                <td>{r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : 'Never'}</td>
                <td>
                  {r.createdBy || 'Not recorded'}
                  <small>{r.createdAt && new Date(r.createdAt).toLocaleString()}</small>
                </td>
                <td>
                  {r.updatedBy || 'Not recorded'}
                  <small>{r.updatedAt && new Date(r.updatedAt).toLocaleString()}</small>
                </td>
                <td>
                  {canEdit && <ConfirmAction label="Revoke sessions" title="Revoke all sessions?" description={`Sign ${r.email} out of every session.`} onConfirm={async () => { await cmsApi(`auth/users/${r.id}/revoke`, 'POST', {}); setMessage('Sessions revoked.'); }} />}
                  {canEdit ? (
                    <button
                      onClick={() => {
                        setEditing(r);
                        setPassword('');
                      }}
                    >
                      Edit access
                    </button>
                  ) : (
                    'Read only'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-pagination">
        <span>
          {total} users · Page {page}
        </span>
        <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page * 20 >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </main>
  );
}
