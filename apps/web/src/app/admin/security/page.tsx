'use client';
import { useEffect, useState } from 'react';
import { Button } from '@tevoniq/ui';
import { cmsApi } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
type Session = { id: string; createdAt: string; lastSeenAt: string; expiresAt: string; userAgent: string; current: boolean };
export default function Security() {
  const { user, setUser } = useCmsSession();
  const [items, setItems] = useState<Session[]>([]), [error, setError] = useState(''), [busy, setBusy] = useState(false), [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    cmsApi('auth/sessions').then((r) => { if (active) setItems(r.items as Session[]); }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [refresh]);
  async function revoke(id?: string, current = false) {
    setBusy(true); setError('');
    try {
      await cmsApi(id ? `auth/sessions/${id}/revoke` : 'auth/logout-all', 'POST', {});
      if (!id || current) { await cmsApi('auth/logout', 'POST', {}).catch(() => {}); setUser(null); }
      else setRefresh((v) => v + 1);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not revoke session'); }
    finally { setBusy(false); }
  }
  return <main><h1>Account security</h1><p>Last sign in: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Not recorded'}</p>
    <p>Sessions expire after 30 minutes without activity, or eight hours after sign in.</p>
    {error && <p role="alert">{error}</p>}
    <Button disabled={busy} onClick={() => void revoke()}>Sign out all sessions</Button>
    <ul>{items.map((s) => <li key={s.id} className="admin-panel"><h2>{s.current ? 'This session' : 'Other session'}</h2>
      <p>{s.userAgent || 'Client not recorded'}</p><p>Last active: {new Date(s.lastSeenAt).toLocaleString()}</p><p>Expires: {new Date(s.expiresAt).toLocaleString()}</p>
      <Button disabled={busy} variant="secondary" onClick={() => void revoke(s.id, s.current)}>Revoke session</Button>
    </li>)}</ul>
  </main>;
}
