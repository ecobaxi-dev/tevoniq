'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Input, Textarea, Select, Button } from '@tevoniq/ui';
import { employmentTypes, workModes, jobStatuses, jobWriteSchema, type CareerJob, type JobWrite } from '@tevoniq/validation';
import { cmsApi, can } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
import { careerLabel } from '@/content/careers';
const blank = (): JobWrite => ({ title: '', slug: '', department: '', location: '', employmentType: 'FULL_TIME', workMode: 'ONSITE', description: '', responsibilities: [], requirements: [], preferredQualifications: [], status: 'DRAFT', publishedAt: null, closingDate: null, version: 0 });
const writable = (job: CareerJob): JobWrite => Object.fromEntries(Object.keys(blank()).map((key) => [key, job[key as keyof JobWrite]])) as JobWrite;
export function JobManager() {
  const { user } = useCmsSession();
  const [items, setItems] = useState<CareerJob[]>([]), [page, setPage] = useState(1), [total, setTotal] = useState(0), [query, setQuery] = useState(''), [status, setStatus] = useState(''), [refresh, setRefresh] = useState(0);
  const [id, setId] = useState(''), [draft, setDraft] = useState<JobWrite | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    cmsApi(`careers/jobs?${new URLSearchParams({ q: query, page: String(page), ...(status ? { status } : {}) })}`).then((r) => { if (active) { setItems(r.items as CareerJob[]); setTotal(r.total as number); } }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [query, page, status, refresh]);
  function update(patch: Partial<JobWrite>) { if (draft) { setDraft({ ...draft, ...patch }); setNotice(''); } }
  async function save() {
    if (!draft) return;
    const result = jobWriteSchema.safeParse({ ...draft, ...Object.fromEntries(['responsibilities', 'requirements', 'preferredQualifications'].map((key) => [key, draft[key as 'requirements'].map((v) => v.trim()).filter(Boolean)])) });
    if (!result.success) { setError(result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')); return; }
    setBusy(true); setError('');
    try { const saved = await cmsApi(`careers/jobs${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', result.data) as CareerJob; setId(saved.id); setDraft(writable(saved)); setNotice('Job saved.'); setRefresh((v) => v + 1); }
    catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
    finally { setBusy(false); }
  }
  return <main><header className="admin-page-heading"><div><h1>Careers</h1><p>Manage job openings and publication dates.</p></div><Link href="/admin/job-applications">Review applications →</Link>{can(user, 'careers.create') && <Button disabled={busy} onClick={() => { setId(''); setDraft(blank()); setError(''); setNotice(''); }}>New job</Button>}</header>
    {error && <p className="admin-error" role="alert" style={{ whiteSpace: 'pre-line' }}>{error}</p>}{notice && <p role="status">{notice}</p>}
    {draft && <section className="admin-panel"><h2>{id ? 'Edit opening' : 'New opening'}</h2><form onSubmit={(e) => { e.preventDefault(); void save(); }}><fieldset className="admin-editor" disabled={busy || !can(user, id ? 'careers.update' : 'careers.create')}>
      {(['title', 'slug', 'department', 'location'] as const).map((key) => <Input key={key} label={careerLabel(key)} value={draft[key]} onChange={(e) => update({ [key]: e.target.value })} required />)}
      <Select label="Employment type" value={draft.employmentType} onChange={(e) => update({ employmentType: e.target.value as JobWrite['employmentType'] })}>{employmentTypes.map((v) => <option key={v} value={v}>{careerLabel(v)}</option>)}</Select>
      <Select label="Work mode" value={draft.workMode} onChange={(e) => update({ workMode: e.target.value as JobWrite['workMode'] })}>{workModes.map((v) => <option key={v} value={v}>{careerLabel(v)}</option>)}</Select>
      <Textarea label="Description" value={draft.description} rows={6} maxLength={15000} onChange={(e) => update({ description: e.target.value })} />
      {(['responsibilities', 'requirements', 'preferredQualifications'] as const).map((key) => <Textarea key={key} label={key === 'preferredQualifications' ? 'Preferred qualifications — one per line' : `${careerLabel(key)} — one per line`} rows={5} value={draft[key].join('\n')} onChange={(e) => update({ [key]: e.target.value ? e.target.value.split('\n') : [] })} />)}
      <Select label="Status" value={draft.status} onChange={(e) => update({ status: e.target.value as JobWrite['status'], ...(e.target.value === 'PUBLISHED' && !draft.publishedAt ? { publishedAt: new Date().toISOString() } : {}) })}>{jobStatuses.map((v) => <option key={v} value={v} disabled={(v === 'PUBLISHED' || v === 'CLOSED') ? !can(user, 'careers.publish') : v === 'ARCHIVED' ? !can(user, 'careers.delete') : false}>{careerLabel(v)}</option>)}</Select>
      {(['publishedAt', 'closingDate'] as const).map((key) => <Input key={key} label={key === 'publishedAt' ? 'Publication date/time (UTC)' : 'Closing date/time (UTC, optional)'} type="datetime-local" value={draft[key]?.slice(0, 16) || ''} onChange={(e) => update({ [key]: e.target.value ? new Date(`${e.target.value}:00Z`).toISOString() : null })} />)}
      <p>Published jobs appear only after their publication time and before their closing time. Closing or archiving a job keeps its applications and history.</p><Button type="submit" loading={busy}>Save job</Button>
    </fieldset></form><Button variant="secondary" disabled={busy} onClick={() => setDraft(null)}>Close editor</Button>{id && <Link href={`/admin/job-applications?jobId=${id}`}>View applications →</Link>}</section>}
    <div className="admin-toolbar"><Input label="Search jobs" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} /><Select label="Publication status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{jobStatuses.map((v) => <option key={v}>{v}</option>)}</Select></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Job</th><th>Department / location</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((job) => <tr key={job.id}><td>{job.title}<small>{job.slug}</small></td><td>{job.department} · {job.location}</td><td>{job.status}</td><td><Button disabled={busy} variant="secondary" onClick={() => { setId(job.id); setDraft(writable(job)); setError(''); setNotice(''); }}>{can(user, 'careers.update') ? 'Edit job' : 'View job'}</Button>{job.status === 'PUBLISHED' && <a href={`/careers/${job.slug}`} target="_blank" rel="noreferrer">Public page ↗</a>}</td></tr>)}</tbody></table></div>
    {!items.length && <p>No matching jobs. Create an opening to get started.</p>}<nav className="admin-pagination" aria-label="Jobs"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>Previous</Button><span>{total} jobs · Page {page}</span><Button variant="secondary" disabled={page * 20 >= total} onClick={() => setPage((v) => v + 1)}>Next</Button></nav>
  </main>;
}
