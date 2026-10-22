'use client';
import { useEffect, useState } from 'react';
import { Input, Select, Button } from '@tevoniq/ui';
import { newsletterStatuses, type NewsletterSubscriber } from '@tevoniq/validation';
import { cmsApi, can } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
export function NewsletterManager() {
  const { user } = useCmsSession();
  const [items, setItems] = useState<NewsletterSubscriber[]>([]), [total, setTotal] = useState(0), [page, setPage] = useState(1), [q, setQ] = useState(''), [status, setStatus] = useState(''), [language, setLanguage] = useState(''), [refresh, setRefresh] = useState(0), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const filters = new URLSearchParams({ q, ...(status ? { status } : {}), ...(language ? { language } : {}) }).toString();
  useEffect(() => {
    let active = true;
    cmsApi(`newsletter?${filters}&page=${page}`).then((result) => { if (active) { setItems(result.items as NewsletterSubscriber[]); setTotal(result.total as number); setError(''); } }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [filters, page, refresh]);
  async function suppress(item: NewsletterSubscriber, next: 'UNSUBSCRIBED' | 'BOUNCED') {
    if (!window.confirm(`Mark ${item.email} as ${next.toLowerCase()}? This revokes their subscription links.`)) return;
    setBusy(true); setError('');
    try { await cmsApi(`newsletter/${item.id}`, 'PUT', { version: item.version, status: next }); setRefresh((v) => v + 1); }
    catch (e) { setError(e instanceof Error ? e.message : 'Update failed'); } finally { setBusy(false); }
  }
  async function exportCsv() {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/cms/newsletter/export?${filters}`, { cache: 'no-store' });
      if (!response.ok) { const data = await response.json(); throw Error(data.message || 'Export failed'); }
      const url = URL.createObjectURL(await response.blob()), anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'newsletter-subscribers.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e instanceof Error ? e.message : 'Export failed'); } finally { setBusy(false); }
  }
  return <main><header className="admin-page-heading"><div><h1>Newsletter subscribers</h1><p>Subscriptions become active only after email confirmation. Exports include all matching records, up to 10,000.</p></div>{can(user, 'newsletter.export') && <Button disabled={busy} onClick={() => void exportCsv()}>Export CSV</Button>}</header>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-toolbar"><Input label="Search email or name" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /><Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{newsletterStatuses.map((v) => <option key={v}>{v}</option>)}</Select><Select label="Language" value={language} onChange={(e) => { setLanguage(e.target.value); setPage(1); }}><option value="">All languages</option>{['en', 'tr', 'ar'].map((v) => <option key={v}>{v}</option>)}</Select></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Subscriber</th><th>Language / source</th><th>Status</th><th>Subscribed / unsubscribed (UTC)</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.email}<small>{item.name}</small></td><td>{item.language}<small>{item.source}</small></td><td>{item.status}</td><td>{item.subscribedAt || '—'}<small>{item.unsubscribedAt || '—'}</small></td><td>{can(user, 'newsletter.update') && <>{['ACTIVE', 'PENDING'].includes(item.status) && <Button variant="secondary" disabled={busy} onClick={() => void suppress(item, 'UNSUBSCRIBED')}>Unsubscribe</Button>}{item.status !== 'BOUNCED' && <Button variant="secondary" disabled={busy} onClick={() => void suppress(item, 'BOUNCED')}>Mark bounced</Button>}</>}</td></tr>)}</tbody></table></div>
    {!items.length && <p>No matching subscribers.</p>}<nav className="admin-pagination" aria-label="Subscribers"><Button disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>Previous</Button><span>{total} subscribers · Page {page}</span><Button disabled={page * 20 >= total} onClick={() => setPage((v) => v + 1)}>Next</Button></nav>
  </main>;
}
