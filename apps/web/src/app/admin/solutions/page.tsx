'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Container,
  UIProvider,
  Input,
  Textarea,
  Select,
  Checkbox,
  Button,
  Card,
  Badge,
} from '@tevoniq/ui';
import { solutionWriteSchema, solutionAreas, publicSolutionSchema } from '@tevoniq/validation';
import type {
  SolutionWrite,
  SolutionBlock,
  PublicSolution,
  ServiceBlock,
} from '@tevoniq/validation';
import { cmsApi, canManageContent } from '@/lib/cms-client';
import { CmsLogin, useCmsSession } from '@/components/cms/session';
import { RecordPicker } from '@/components/cms/record-picker';
import { ServicePicker } from '@/components/cms/service-picker';
import { BlockFields, emptyBlock, resolveBlockFields } from '@/components/cms/block-fields';
import { SolutionBlocks } from '@/components/solution-blocks';
import { solutionSectionLabels } from '@/content/solutions';
import './solutions-cms.css';
type RecordData = SolutionWrite & { id: string; createdAt?: string; updatedAt?: string };
type Catalog = { items: RecordData[]; total: number; page: number; limit: number };
type Locale = 'en' | 'tr' | 'ar';
const newTranslation = (locale: Locale) => ({
  locale,
  name: '',
  shortDescription: '',
  published: false,
  seoTitle: '',
  seoDescription: '',
  blocks: [] as SolutionBlock[],
});
const newRecord = (): RecordData => ({
  id: '',
  slug: '',
  status: 'DRAFT',
  active: false,
  published: false,
  featured: false,
  sortOrder: 0,
  version: 0,
  serviceIds: [],
  industryIds: [],
  projectIds: [],
  translations: [newTranslation('en')],
});
function writable(record: RecordData): SolutionWrite {
  return {
    slug: record.slug,
    status: record.status,
    active: record.active,
    published: record.published,
    featured: record.featured,
    sortOrder: record.sortOrder,
    version: record.version,
    serviceIds: record.serviceIds,
    industryIds: record.industryIds,
    projectIds: record.projectIds,
    translations: record.translations.map(
      ({ locale, name, shortDescription, published, seoTitle, seoDescription, blocks }) => ({
        locale,
        name,
        shortDescription,
        published,
        seoTitle,
        seoDescription,
        blocks,
      }),
    ),
  };
}
function Editor({
  record,
  readOnly,
  onSaved,
  onDeleted,
}: {
  record: RecordData;
  readOnly: boolean;
  onSaved: (record: RecordData) => void;
  onDeleted: () => void;
}) {
  const [value, setValue] = useState(() => writable(record)),
    [locale, setLocale] = useState<Locale>('en');
  const [area, setArea] = useState<keyof typeof solutionAreas>('hero'),
    [raw, setRaw] = useState<Record<string, string>>({});
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState<PublicSolution | null>(null);
  const [audits, setAudits] = useState<{
    items: Array<{ id: string; action: string; actorId: string; createdAt: string }>;
    total: number;
    page: number;
    limit: number;
  } | null>(null);
  const translation = value.translations.find((t) => t.locale === locale);
  const updateTranslation = (patch: Partial<SolutionWrite['translations'][number]>) =>
    setValue((v) => ({
      ...v,
      translations: v.translations.map((t) => (t.locale === locale ? { ...t, ...patch } : t)),
    }));
  function move(index: number, delta: number) {
    const blocks = [...translation!.blocks];
    [blocks[index], blocks[index + delta]] = [blocks[index + delta]!, blocks[index]!];
    updateTranslation({ blocks });
  }
  async function save() {
    setBusy(true);
    setError('');
    setPreview(null);
    try {
      const payload = {
        ...value,
        translations: value.translations.map((t) => ({
          ...t,
          blocks: t.blocks.map((b) => ({ ...b, content: resolveBlockFields(b.content, raw) })),
        })),
      };
      const parsed = solutionWriteSchema.safeParse(payload);
      if (!parsed.success)
        throw new Error(
          parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'),
        );
      onSaved(
        (await cmsApi(
          `solutions${record.id ? `/${record.id}` : ''}`,
          record.id ? 'PUT' : 'POST',
          parsed.data,
        )) as unknown as RecordData,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }
  async function loadAudit(page: number) {
    setBusy(true);
    setError('');
    try {
      setAudits(
        (await cmsApi(`solutions/${record.id}/audit?page=${page}`)) as unknown as NonNullable<
          typeof audits
        >,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load audit history');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="cms-editor" aria-label="Solution editor">
      <h2>{record.id ? 'Edit solution' : 'New solution'}</h2>
      <p>
        Describe a business outcome. Included services reference technical capabilities from the
        Services catalog.
      </p>
      <p>
        <Badge>{value.status}</Badge> · {value.active ? 'Active' : 'Inactive'} ·{' '}
        {value.featured ? 'Featured' : 'Not featured'}
      </p>
      <Select
        label="Translation"
        value={locale}
        onChange={(e) => {
          setLocale(e.target.value as Locale);
          setPreview(null);
        }}
      >
        <option value="en">English</option>
        <option value="tr">Turkish</option>
        <option value="ar">Arabic</option>
      </Select>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <fieldset disabled={readOnly || busy}>
          <Input
            label="Slug"
            value={value.slug}
            onChange={(e) => setValue({ ...value, slug: e.target.value })}
            required
            maxLength={120}
            dir="ltr"
          />
          <Checkbox
            label="Active"
            checked={value.active}
            onChange={(e) => setValue({ ...value, active: e.target.checked })}
          />
          <Checkbox
            label="Publish solution"
            checked={value.published}
            onChange={(e) =>
              setValue({
                ...value,
                published: e.target.checked,
                status: e.target.checked ? 'PUBLISHED' : 'DRAFT',
              })
            }
          />
          <Checkbox
            label="Featured"
            checked={value.featured}
            onChange={(e) => setValue({ ...value, featured: e.target.checked })}
          />
          <Input
            label="Sort order"
            type="number"
            min={0}
            max={2147483647}
            value={value.sortOrder}
            onChange={(e) => setValue({ ...value, sortOrder: Number(e.target.value) })}
          />
          {!translation ? (
            <Button
              onClick={() =>
                setValue({
                  ...value,
                  translations: [...value.translations, newTranslation(locale)],
                })
              }
            >
              Add translation
            </Button>
          ) : (
            <div className="cms-fields" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <Input
                label="Solution name"
                value={translation.name}
                onChange={(e) => updateTranslation({ name: e.target.value })}
                required
                maxLength={500}
              />
              <Textarea
                label="Short description"
                value={translation.shortDescription}
                onChange={(e) => updateTranslation({ shortDescription: e.target.value })}
                maxLength={1000}
              />
              <Checkbox
                label="Publish this translation"
                checked={translation.published}
                onChange={(e) => updateTranslation({ published: e.target.checked })}
              />
              <Input
                label="SEO title"
                value={translation.seoTitle}
                onChange={(e) => updateTranslation({ seoTitle: e.target.value })}
                maxLength={160}
              />
              <Textarea
                label="SEO description"
                value={translation.seoDescription}
                onChange={(e) => updateTranslation({ seoDescription: e.target.value })}
                maxLength={320}
              />
              <h3>Solution sections</h3>
              <p>
                Add only relevant sections. The hero comes first; other sections can be reordered.
              </p>
              {translation.blocks.map(({ area, content }, index) => (
                <Card key={content.id} className="cms-block">
                  <div className="cms-block-bar">
                    <Badge>{solutionSectionLabels[area]}</Badge>
                    <div>
                      <Button
                        variant="ghost"
                        disabled={
                          index === 0 ||
                          area === 'hero' ||
                          translation.blocks[index - 1]?.area === 'hero'
                        }
                        onClick={() => move(index, -1)}
                      >
                        Move up
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={area === 'hero' || index === translation.blocks.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        Move down
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateTranslation({
                            blocks: translation.blocks.filter((b) => b.content.id !== content.id),
                          })
                        }
                      >
                        Remove section
                      </Button>
                    </div>
                  </div>
                  <BlockFields
                    block={content}
                    relationships={false}
                    onRawChange={(text) => setRaw({ ...raw, [content.id]: text })}
                    onChange={(patch) =>
                      updateTranslation({
                        blocks: translation.blocks.map((b) =>
                          b.content.id === content.id
                            ? { ...b, content: { ...b.content, ...patch } as ServiceBlock }
                            : b,
                        ),
                      })
                    }
                  />
                  {['includedServices', 'relatedProjects', 'industries'].includes(area) && (
                    <p>
                      This section resolves the solution’s linked records. Ineligible or missing
                      records are hidden.
                    </p>
                  )}
                </Card>
              ))}
              <div className="cms-add">
                <Select
                  label="Section type"
                  value={area}
                  onChange={(e) => setArea(e.target.value as typeof area)}
                >
                  {Object.keys(solutionAreas).map((key) => (
                    <option
                      key={key}
                      value={key}
                      disabled={translation.blocks.some((b) => b.area === key)}
                    >
                      {solutionSectionLabels[key as typeof area]}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="outline"
                  disabled={translation.blocks.some((b) => b.area === area)}
                  onClick={() => {
                    const block = { area, content: emptyBlock(solutionAreas[area]) };
                    updateTranslation({
                      blocks:
                        area === 'hero'
                          ? [block, ...translation.blocks]
                          : [...translation.blocks, block],
                    });
                  }}
                >
                  Add section
                </Button>
              </div>
            </div>
          )}
          <ServicePicker
            ids={value.serviceIds}
            onChange={(serviceIds) => setValue({ ...value, serviceIds })}
            locale={locale}
            disabled={readOnly || busy}
          />
          <details>
            <summary>Industry and project relationships</summary>
            <p>
              Integration fields for existing CMS records. No industry or project records are
              created here.
            </p>
            <RecordPicker
              collection="industries"
              ids={value.industryIds}
              onChange={(industryIds) => setValue({ ...value, industryIds })}
              locale={locale}
              disabled={readOnly || busy}
            />
            <RecordPicker
              collection="projects"
              ids={value.projectIds}
              onChange={(projectIds) => setValue({ ...value, projectIds })}
              locale={locale}
              disabled={readOnly || busy}
            />
          </details>
          <Button type="submit" loading={busy}>
            Save solution
          </Button>
          {record.id && (
            <Button
              variant="outline"
              onClick={async () => {
                if (
                  !window.confirm(
                    'Archive this solution and its translations? Linked services will be preserved.',
                  )
                )
                  return;
                setBusy(true);
                setError('');
                try {
                  await cmsApi(`solutions/${record.id}`, 'DELETE', { version: value.version });
                  onDeleted();
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : 'Delete failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Archive solution
            </Button>
          )}
        </fieldset>
      </form>
      {record.id && (
        <div className="solution-editor-actions">
          <Button
            variant="outline"
            disabled={busy || !translation}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                setPreview(
                  publicSolutionSchema.parse(
                    await cmsApi(`solutions/${record.id}/preview?locale=${locale}`),
                  ),
                );
              } catch (cause) {
                setError(cause instanceof Error ? cause.message : 'Preview unavailable');
              } finally {
                setBusy(false);
              }
            }}
          >
            Preview saved solution
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => void loadAudit(1)}>
            View audit history
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="cms-error">
          {error}
        </p>
      )}
      {preview && (
        <section
          aria-label="Private solution preview"
          className="solution-preview"
          lang={preview.locale}
          dir={preview.locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <p>Private preview of saved content. This does not publish the solution.</p>
          <SolutionBlocks solution={preview} />
        </section>
      )}
      {audits && (
        <section aria-label="Audit history">
          <h3>Audit history</h3>
          <ol className="solution-audit">
            {audits.items.map((a) => (
              <li key={a.id}>
                <strong>{a.action}</strong>
                <br />
                <time dateTime={a.createdAt}>{new Date(a.createdAt).toLocaleString()}</time>
                <br />
                Actor: {a.actorId}
              </li>
            ))}
          </ol>
          {!audits.items.length && <p>No audit events.</p>}
          <div className="cms-pager">
            <Button
              disabled={busy || audits.page === 1}
              variant="ghost"
              onClick={() => void loadAudit(audits.page - 1)}
            >
              Earlier page
            </Button>
            <span>{audits.page}</span>
            <Button
              disabled={busy || audits.page * audits.limit >= audits.total}
              variant="ghost"
              onClick={() => void loadAudit(audits.page + 1)}
            >
              More history
            </Button>
          </div>
        </section>
      )}
    </section>
  );
}
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
          `solutions?${new URLSearchParams({ page: String(targetPage), limit: '12', q })}`,
        )) as unknown as Catalog,
      );
      setPage(targetPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load solutions');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    void cmsApi('solutions?limit=12')
      .then((data) => {
        if (mounted) setCatalog(data as unknown as Catalog);
      })
      .catch(() => {
        if (mounted) setError('Unable to load solutions');
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
              <h1 className="tv-h1">Solutions</h1>
              <nav className="cms-module-links" aria-label="CMS modules">
                <Link href="/admin/projects">Projects CMS</Link>
                <Link href="/admin/industries">Industries CMS</Link>
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
                    label="Search solutions"
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
                      setSelected(newRecord());
                      setStatus('');
                    }}
                  >
                    New solution
                  </Button>
                )}
              </div>
              <div className="cms-layout">
                <aside aria-label="Solution records">
                  <p>
                    {catalog?.total ?? 0} records · {user.role}
                  </p>
                  {!catalog && !error && <p role="status">Loading solutions…</p>}
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
                            {r.translations.find((t) => t.locale === 'en')?.name ?? r.slug}
                          </strong>
                          <span>
                            {r.status} · {r.active ? 'Active' : 'Inactive'}
                            {r.featured ? ' · Featured' : ''} · v{r.version}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {catalog?.total === 0 && <p>No matching solutions.</p>}
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
                      setStatus('Solution saved.');
                      void load(page);
                    }}
                    onDeleted={() => {
                      setSelected(null);
                      setStatus('Solution archived.');
                      void load(1);
                    }}
                  />
                ) : (
                  <section>
                    <h2>Select a solution</h2>
                    <p>
                      Solutions describe complete business outcomes. Draft and inactive records
                      never appear on the public website.
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
