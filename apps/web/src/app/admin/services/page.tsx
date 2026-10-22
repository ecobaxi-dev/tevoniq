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
import { serviceWriteSchema } from '@tevoniq/validation';
import type { ServiceWrite, ServiceBlock } from '@tevoniq/validation';
import './cms.css';
import { CmsLogin, useCmsSession } from '@/components/cms/session';
import { cmsApi as api, canManageContent } from '@/lib/cms-client';
import { BlockFields, emptyBlock, resolveBlockFields } from '@/components/cms/block-fields';
type RecordData = ServiceWrite & { id: string };
type Catalog = { items: RecordData[]; total: number; page: number; limit: number };
const newTranslation = (locale: 'en' | 'tr' | 'ar') => ({
  locale,
  title: '',
  summary: '',
  published: false,
  seoTitle: '',
  seoDescription: '',
  blocks: [] as ServiceBlock[],
});
function Editor({
  record,
  onSaved,
  onDeleted,
  readOnly,
}: {
  record: RecordData;
  onSaved: (record: RecordData) => void;
  onDeleted: () => void;
  readOnly: boolean;
}) {
  const [value, setValue] = useState<ServiceWrite>({
    slug: record.slug,
    active: record.active,
    sortOrder: record.sortOrder,
    version: record.version,
    translations: record.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      summary: t.summary,
      published: t.published,
      seoTitle: t.seoTitle,
      seoDescription: t.seoDescription,
      blocks: t.blocks,
    })),
  });
  const [locale, setLocale] = useState<'en' | 'tr' | 'ar'>('en');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [blockType, setBlockType] = useState<ServiceBlock['type']>('overview');
  const [rawFields, setRawFields] = useState<Record<string, string>>({});
  const translation = value.translations.find((t) => t.locale === locale);
  const updateTranslation = (patch: Partial<ServiceWrite['translations'][number]>) =>
    setValue((current) => ({
      ...current,
      translations: current.translations.map((t) => (t.locale === locale ? { ...t, ...patch } : t)),
    }));
  const updateBlock = (id: string, patch: Record<string, unknown>) =>
    updateTranslation({
      blocks: translation!.blocks.map((block) =>
        block.id === id ? ({ ...block, ...patch } as ServiceBlock) : block,
      ),
    });
  function addBlock() {
    updateTranslation({ blocks: [...translation!.blocks, emptyBlock(blockType)] });
  }
  async function save() {
    setBusy(true);
    setError('');
    try {
      const updated = {
        ...value,
        translations: value.translations.map((t) => ({
          ...t,
          blocks: t.blocks.map((block) => resolveBlockFields(block, rawFields)),
        })),
      };
      const parsed = serviceWriteSchema.safeParse(updated);
      if (!parsed.success)
        throw new Error(
          parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'),
        );
      const saved = await api(
        `services${record.id ? `/${record.id}` : ''}`,
        record.id ? 'PUT' : 'POST',
        parsed.data,
      );
      onSaved(saved as unknown as RecordData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="cms-editor" aria-label="Service editor">
      <h2>{record.id ? 'Edit service' : 'New service'}</h2>
      <p>
        Activation confirms that this service is commercially offered. Only published translations
        are visible publicly.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <Select
          label="Translation"
          value={locale}
          onChange={(event) => setLocale(event.target.value as typeof locale)}
        >
          <option value="en">English</option>
          <option value="tr">Turkish</option>
          <option value="ar">Arabic</option>
        </Select>
        <fieldset disabled={readOnly || busy}>
          <Input
            label="Slug"
            value={value.slug}
            onChange={(event) => setValue({ ...value, slug: event.target.value })}
            required
            maxLength={120}
          />
          <Checkbox
            label="Active — commercially offered"
            checked={value.active}
            onChange={(event) => setValue({ ...value, active: event.target.checked })}
          />
          <Input
            label="Sort order"
            type="number"
            min={0}
            max={2147483647}
            value={value.sortOrder}
            onChange={(event) => setValue({ ...value, sortOrder: Number(event.target.value) })}
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
                label="Service title"
                value={translation.title}
                onChange={(event) => updateTranslation({ title: event.target.value })}
                required
              />
              <Textarea
                label="Catalog summary"
                value={translation.summary}
                onChange={(event) => updateTranslation({ summary: event.target.value })}
              />
              <Checkbox
                label="Publish this translation"
                checked={translation.published}
                onChange={(event) => updateTranslation({ published: event.target.checked })}
              />
              <Input
                label="SEO title"
                value={translation.seoTitle}
                onChange={(event) => updateTranslation({ seoTitle: event.target.value })}
                maxLength={160}
              />
              <Textarea
                label="SEO description"
                value={translation.seoDescription}
                onChange={(event) => updateTranslation({ seoDescription: event.target.value })}
                maxLength={320}
              />
              <h3>Content blocks</h3>
              <p>
                Blocks render in this order. Use a single hero as the first block. Text is plain
                text; HTML is never executed.
              </p>
              {translation.blocks.map((block, index) => (
                <Card key={block.id} className="cms-block">
                  <div className="cms-block-bar">
                    <Badge>{block.type}</Badge>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => {
                          const blocks = [...translation.blocks];
                          [blocks[index - 1], blocks[index]] = [blocks[index]!, blocks[index - 1]!];
                          updateTranslation({ blocks });
                        }}
                      >
                        Move up
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === translation.blocks.length - 1}
                        onClick={() => {
                          const blocks = [...translation.blocks];
                          [blocks[index], blocks[index + 1]] = [blocks[index + 1]!, blocks[index]!];
                          updateTranslation({ blocks });
                        }}
                      >
                        Move down
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateTranslation({
                            blocks: translation.blocks.filter((item) => item.id !== block.id),
                          })
                        }
                      >
                        Remove block
                      </Button>
                    </div>
                  </div>
                  <BlockFields
                    block={block}
                    onChange={(patch) => updateBlock(block.id, patch)}
                    onRawChange={(text) => setRawFields({ ...rawFields, [block.id]: text })}
                  />
                </Card>
              ))}
              <div className="cms-add">
                <Select
                  label="Block type"
                  value={blockType}
                  onChange={(event) => setBlockType(event.target.value as ServiceBlock['type'])}
                >
                  {[
                    'hero',
                    'overview',
                    'benefits',
                    'capabilities',
                    'features',
                    'use-cases',
                    'industries',
                    'technology-stack',
                    'faq',
                    'related-projects',
                    'related-services',
                    'cta',
                  ].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </Select>
                <Button variant="outline" onClick={addBlock}>
                  Add block
                </Button>
              </div>
            </div>
          )}
          <Button type="submit" loading={busy}>
            Save service
          </Button>
          {record.id && (
            <Button
              variant="outline"
              onClick={async () => {
                if (
                  !window.confirm('Archive this service and retain its translations for recovery?')
                )
                  return;
                setBusy(true);
                try {
                  await api(`services/${record.id}`, 'DELETE', { version: value.version });
                  onDeleted();
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : 'Delete failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Archive service
            </Button>
          )}
        </fieldset>
        {error && (
          <p role="alert" className="cms-error">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
export default function Page() {
  const { user, setUser, checking, sessionError, retrySession } = useCmsSession();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [selected, setSelected] = useState<RecordData | null>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  async function load(targetPage = 1, search = q) {
    try {
      setCatalog(
        (await api(
          `services?${new URLSearchParams({ page: String(targetPage), q: search, limit: '12' })}`,
        )) as unknown as Catalog,
      );
      setPage(targetPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load services');
    }
  }
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    void api('services?limit=12')
      .then((data) => {
        if (mounted) setCatalog(data as unknown as Catalog);
      })
      .catch(() => {
        if (mounted) setError('Unable to load services');
      });
    return () => {
      mounted = false;
    };
  }, [user]);
  if (checking)
    return (
      <UIProvider>
        <Container>
          <p role="status">Loading CMS…</p>
        </Container>
      </UIProvider>
    );
  return (
    <UIProvider>
      <main className="cms-shell">
        <Container>
          <header className="cms-heading">
            <div>
              <p className="tv-eyebrow">TEVONIQ · CONTENT MANAGEMENT</p>
              <h1 className="tv-h1">Services</h1>
              <nav className="cms-module-links" aria-label="CMS modules">
                <Link href="/admin/projects">Projects CMS</Link>
                <Link href="/admin/company">Company CMS</Link>
                <Link href="/admin/insights">Insights CMS</Link>
                <Link href="/admin/industries">Industries CMS</Link>
                <Link href="/admin/solutions">Solutions CMS</Link>
              </nav>
            </div>
            {user && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await api('auth/logout', 'POST', {});
                    setUser(null);
                    setCatalog(null);
                    setSelected(null);
                  } catch {
                    setError('Sign out failed. Please try again.');
                  }
                }}
              >
                Sign out
              </Button>
            )}
          </header>
          {sessionError ? (
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
                  onSubmit={(event) => {
                    event.preventDefault();
                    void load(1);
                  }}
                >
                  <Input
                    label="Search services"
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    maxLength={120}
                  />
                  <Button type="submit" variant="outline">
                    Search
                  </Button>
                </form>
                {canManageContent(user.role) && (
                  <Button
                    onClick={() => {
                      setStatus('');
                      setSelected({
                        id: '',
                        slug: '',
                        active: false,
                        sortOrder: 0,
                        version: 0,
                        translations: [newTranslation('en')],
                      });
                    }}
                  >
                    New service
                  </Button>
                )}
              </div>
              <div className="cms-layout">
                <aside aria-label="Service records">
                  <p>
                    {catalog?.total ?? 0} records · {user.role}
                  </p>
                  <ul className="cms-catalog">
                    {catalog?.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setSelected(item);
                            setStatus('');
                          }}
                          aria-current={selected?.id === item.id ? 'true' : undefined}
                        >
                          <strong>
                            {item.translations.find((t) => t.locale === 'en')?.title ?? item.slug}
                          </strong>
                          <span>
                            {item.active ? 'Active' : 'Inactive'} · v{item.version}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {catalog?.total === 0 && <p>No matching records.</p>}
                  <div className="cms-pager">
                    <Button
                      variant="ghost"
                      disabled={page === 1}
                      onClick={() => void load(page - 1)}
                    >
                      Previous
                    </Button>
                    <span>{page}</span>
                    <Button
                      variant="ghost"
                      disabled={!catalog || page * catalog.limit >= catalog.total}
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
                    onDeleted={() => {
                      setSelected(null);
                      setStatus('Service archived.');
                      void load(1);
                    }}
                    onSaved={(saved) => {
                      setSelected(saved);
                      setStatus('Service saved.');
                      void load(page);
                    }}
                  />
                ) : (
                  <section>
                    <h2>Select a service</h2>
                    <p>
                      Draft and inactive services are never advertised by the public catalog. Create
                      records as needed; the catalog has no fixed service count.
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
