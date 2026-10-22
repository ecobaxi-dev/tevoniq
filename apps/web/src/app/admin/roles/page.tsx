'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cmsApi } from '@/lib/cms-client';
type RoleRow = {
  role: string;
  content: string;
  business: string;
  users: string;
  audit: string;
  permissions: string[];
};
export default function Roles() {
  const [items, setItems] = useState<RoleRow[]>([]),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    cmsApi('admin/roles')
      .then((r) => {
        if (active) setItems(r.items as RoleRow[]);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Roles unavailable');
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <main>
      <div className="admin-page-heading">
        <div>
          <h1>Roles</h1>
          <p>Built-in permissions enforced by the API. Assign roles from Users.</p>
        </div>
        <Link href="/admin/users">Manage user assignments →</Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Content</th>
              <th>Business records</th>
              <th>Users</th>
              <th>Audit logs</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.role}>
                {(['role', 'content', 'business', 'users', 'audit'] as const).map((key) => (
                  <td key={key}>{row[key]}</td>
                ))}
                <td>
                  <details>
                    <summary>{row.permissions.length} permissions</summary>
                    <ul>
                      {row.permissions.map((permission) => (
                        <li key={permission}>
                          <code>{permission}</code>
                        </li>
                      ))}
                    </ul>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="admin-panel">
        <h2>Account safeguards</h2>
        <p>
          Only super administrators can change user access. Self-disable and self-demotion are
          blocked. Disabling a user preserves attribution and revokes their sessions.
        </p>
      </section>
    </main>
  );
}
