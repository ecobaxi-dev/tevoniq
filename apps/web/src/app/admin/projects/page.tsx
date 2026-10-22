'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Container, UIProvider, Input, Button } from '@tevoniq/ui';
import { cmsApi, canManageContent } from '@/lib/cms-client';
import { CmsLogin, useCmsSession } from '@/components/cms/session';
import { ProjectEditor as Editor, newProjectRecord } from '@/components/cms/project-editor';
import type { ProjectRecord as RecordData } from '@/components/cms/project-editor';
import './projects-cms.css';
type Catalog = { items: RecordData[]; total: number; page: number; limit: number };
export default function Page() {
  const { user, setUser, checking, sessionError, retrySession } = useCmsSession();
  const [catalog, setCatalog] = useState<Catalog | null>(null),
    [selected, setSelected] = useState<RecordData | null>(null);
  const [q, setQ] = useState(''),
    [page, setPage] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [status, setStatus] = useState('');
  async function load(targetPage = 1) {
    setBusy(true);
    setError('');
    try {
      setCatalog(
        (await cmsApi(
          `projects?${new URLSearchParams({ page: String(targetPage), limit: '12', q })}`,
        )) as unknown as Catalog,
      );
      setPage(targetPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load projects');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    void cmsApi('projects?limit=12')
      .then((data) => {
        if (mounted) setCatalog(data as unknown as Catalog);
      })
      .catch(() => {
        if (mounted) setError('Unable to load projects');
      });
    return () => {
      mounted = false;
    };
  }, [user]);
  return (
    <UIProvider>
      <main className="cms-shell">
        <Container>
          <header className="cms-heading">
            <div>
              <p className="tv-eyebrow">TEVONIQ · CONTENT MANAGEMENT</p>
              <h1 className="tv-h1">Projects</h1>
              <nav className="cms-module-links" aria-label="CMS modules">
                <Link href="/admin/industries">Industries CMS</Link>
                <Link href="/admin/solutions">Solutions CMS</Link>
                <Link href="/admin/services">Services CMS</Link>
              </nav>
            </div>
            {user && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await cmsApi('auth/logout', 'POST', {});
                    setUser(null);
                    setSelected(null);
                    setCatalog(null);
                  } catch {
                    setError('Sign out failed');
                  }
                }}
              >
                Sign out
              </Button>
            )}
          </header>
          {checking ? (
            <p role="status">Loading CMS…</p>
          ) : sessionError ? (
            <div>
              <p role="alert">{sessionError}</p>
              <Button onClick={retrySession}>Retry</Button>
            </div>
          ) : !user ? (
            <CmsLogin onSignedIn={setUser} />
          ) : (
            <>
              <div className="cms-toolbar">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void load();
                  }}
                >
                  <Input
                    label="Search projects"
                    value={q}
                    maxLength={120}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <Button type="submit" variant="outline" loading={busy}>
                    Search
                  </Button>
                </form>
                {canManageContent(user.role) && (
                  <Button
                    onClick={() => {
                      setSelected(newProjectRecord());
                      setStatus('');
                    }}
                  >
                    New project
                  </Button>
                )}
              </div>
              <div className="cms-layout">
                <aside aria-label="Project records">
                  <p>
                    {catalog?.total ?? 0} records · {user.role}
                  </p>
                  {!catalog && !error && <p role="status">Loading projects…</p>}
                  <ul className="cms-catalog">
                    {catalog?.items.map((r) => (
                      <li key={r.id}>
                        <button
                          aria-current={selected?.id === r.id ? 'true' : undefined}
                          onClick={() => {
                            setSelected(r);
                            setStatus('');
                          }}
                        >
                          <strong>
                            {r.translations.find((t) => t.locale === 'en')?.title ?? r.slug}
                          </strong>
                          <span>
                            {r.published ? 'Published' : 'Draft'} · {r.clientVisibility}
                            {r.featured ? ' · Featured' : ''} · v{r.version}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {catalog?.total === 0 && <p>No matching projects.</p>}
                  <div className="cms-pager">
                    <Button
                      variant="ghost"
                      disabled={busy || page === 1}
                      onClick={() => void load(page - 1)}
                    >
                      Previous
                    </Button>
                    <span>{page}</span>
                    <Button
                      variant="ghost"
                      disabled={busy || !catalog || page * catalog.limit >= catalog.total}
                      onClick={() => void load(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </aside>
                {selected ? (
                  <Editor
                    key={`${selected.id}:${selected.version}`}
                    record={selected}
                    readOnly={!canManageContent(user.role)}
                    onSaved={(saved) => {
                      setSelected(saved);
                      setStatus('Project saved.');
                      void load(page);
                    }}
                    onDeleted={() => {
                      setSelected(null);
                      setStatus('Project archived.');
                      void load(1);
                    }}
                  />
                ) : (
                  <section>
                    <h2>Select a project</h2>
                    <p>
                      Create a reviewed case study. Client identity stays private unless explicitly
                      approved for public display.
                    </p>
                  </section>
                )}
              </div>
            </>
          )}
          {status && <p role="status">{status}</p>}
          {error && (
            <p role="alert" className="cms-error">
              {error}
            </p>
          )}
        </Container>
      </main>
    </UIProvider>
  );
}
