'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Input, Textarea, Select, Button } from '@tevoniq/ui';
import { applicationStatuses } from '@tevoniq/validation';
import { cmsApi, can } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
type Row = { id: string; name: string; email: string; status: string; version: number; createdAt: string; job: { id: string; title: string } };
type Detail = Row & { phone: string; location: string; linkedIn: string; portfolio: string; coverLetter: string; consentAt: string; cv: { name: string; size: number; scanStatus: string } | null };
type History = { id: string; action: string; note: string; actor: string; fromStatus: string | null; toStatus: string | null; createdAt: string };
export function ApplicationManager({ jobId = '' }: { jobId?: string }) {
  const { user } = useCmsSession(), allowed = can(user, 'careers.applications.read'), editable = can(user, 'careers.applications.update');
  const [rows, setRows] = useState<Row[]>([]), [total, setTotal] = useState(0), [page, setPage] = useState(1), [q, setQ] = useState(''), [status, setStatus] = useState(''), [selected, setSelected] = useState(''), [refresh, setRefresh] = useState(0);
  const [detail, setDetail] = useState<Detail | null>(null), [history, setHistory] = useState<History[]>([]), [historyPage, setHistoryPage] = useState(1), [historyTotal, setHistoryTotal] = useState(0), [nextStatus, setNextStatus] = useState('NEW'), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    cmsApi(`careers/applications?${new URLSearchParams({ q, page: String(page), ...(status ? { status } : {}), ...(jobId ? { jobId } : {}) })}`).then((r) => { if (active) { setRows(r.items as Row[]); setTotal(r.total as number); } }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [allowed, q, page, status, jobId, refresh]);
  useEffect(() => {
    if (!allowed || !selected) return;
    let active = true;
    Promise.all([cmsApi(`careers/applications/${selected}`), cmsApi(`careers/applications/${selected}/history?page=${historyPage}`)]).then(([d, h]) => { if (active) { setDetail(d as Detail); setNextStatus(String(d.status)); setHistory(h.items as History[]); setHistoryTotal(h.total as number); } }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [allowed, selected, refresh, historyPage]);
  async function change(kind: 'status' | 'notes') {
    if (!detail) return;
    setBusy(true); setError('');
    try { await cmsApi(`careers/applications/${detail.id}/${kind}`, kind === 'status' ? 'PUT' : 'POST', { version: detail.version, ...(kind === 'status' ? { status: nextStatus } : { note }) }); setNote(''); setHistoryPage(1); setRefresh((v) => v + 1); }
    catch (e) { setError(e instanceof Error ? e.message : 'Update failed'); }
    finally { setBusy(false); }
  }
  if (!allowed) return <main><h1>Job applications</h1><p>You do not have permission to view applicant information.</p></main>;
  return <main><header className="admin-page-heading"><div><h1>Job applications</h1><p>Private hiring records, CVs and internal review history.</p></div><Link href="/admin/careers">Manage openings →</Link>{jobId && <Link href="/admin/job-applications">All applications</Link>}</header>
    {error && <p role="alert" className="admin-error">{error} <Button variant="secondary" onClick={() => { setError(''); setRefresh((v) => v + 1); }}>Reload</Button></p>}
    <div className="admin-toolbar"><Input label="Search applicant name or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /><Select label="Review status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{applicationStatuses.map((s) => <option key={s}>{s}</option>)}</Select></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Applicant</th><th>Job</th><th>Status</th><th>Received</th><th>Review</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.name}<small>{row.email}</small></td><td>{row.job.title}</td><td>{row.status}</td><td>{new Date(row.createdAt).toLocaleString()}</td><td><Button variant="secondary" disabled={busy} onClick={() => { setSelected(row.id); setDetail(null); setHistory([]); setNote(''); setHistoryPage(1); }}>Review</Button></td></tr>)}</tbody></table></div>
    {!rows.length && <p>No matching applications.</p>}<nav className="admin-pagination" aria-label="Applications"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>Previous</Button><span>{total} applications · Page {page}</span><Button variant="secondary" disabled={page * 20 >= total} onClick={() => setPage((v) => v + 1)}>Next</Button></nav>
    {detail && <section className="admin-panel"><h2>{detail.name}</h2><p>{detail.job.title} · {detail.status}</p><dl><dt>Email</dt><dd>{detail.email}</dd><dt>Phone</dt><dd>{detail.phone || 'Not provided'}</dd><dt>Location</dt><dd>{detail.location}</dd><dt>Consent recorded</dt><dd>{new Date(detail.consentAt).toLocaleString()}</dd></dl>
      {detail.linkedIn && <p><a href={detail.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></p>}{detail.portfolio && <p><a href={detail.portfolio} target="_blank" rel="noopener noreferrer">Portfolio ↗</a></p>}
      <h3>Cover letter</h3><p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{detail.coverLetter || 'Not provided'}</p>
      {detail.cv && <p><a href={`/api/cms/careers/applications/${detail.id}/cv`} download>Download CV: {detail.cv.name}</a> · {Math.ceil(detail.cv.size / 1024)} KB · {detail.cv.scanStatus === 'CLEAN' ? 'Security scan passed' : 'Development upload — not scanned'}</p>}
      <fieldset className="admin-editor" disabled={busy || !editable}><Select label="Application status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>{applicationStatuses.map((s) => <option key={s}>{s}</option>)}</Select><Button disabled={nextStatus === detail.status} onClick={() => void change('status')}>Update status</Button><Textarea label="Internal note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={5000} rows={4} /><Button disabled={!note.trim()} onClick={() => void change('notes')}>Add internal note</Button></fieldset>
      <h3>Internal history</h3><ol>{history.map((h) => <li key={h.id} style={{ marginBlock: 16 }}><strong>{h.action.replaceAll('_', ' ')}</strong> · {h.actor} · {new Date(h.createdAt).toLocaleString()}{h.toStatus && <p>{h.fromStatus ? `${h.fromStatus} → ` : ''}{h.toStatus}</p>}{h.note && <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{h.note}</p>}</li>)}</ol>
      <div className="admin-pagination"><Button variant="secondary" disabled={historyPage <= 1} onClick={() => setHistoryPage((v) => v - 1)}>Newer history</Button><Button variant="secondary" disabled={historyPage * 30 >= historyTotal} onClick={() => setHistoryPage((v) => v + 1)}>Older history</Button></div>
    </section>}
  </main>;
}
