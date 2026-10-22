'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Select, Textarea, Checkbox } from '@tevoniq/ui';
import {
  builderLocales,
  sectionTypes,
  sectionThemes,
  sectionBackgrounds,
  sectionSpacings,
  emptySectionCopy,
  pageDocumentSchema,
  pageWriteSchema,
  normalizeSectionOrder,
  type PageDocument,
  type BuilderSection,
  type BuilderLocale,
  type BuilderCard,
  type SectionType,
} from '@tevoniq/validation';
import { cmsApi, can } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { SectionEditor } from './section-editor';
import { PageRenderer } from './page-renderer';
import './page-editor.css';
type PageRow = {
  id: string;
  path: string;
  title: string;
  status: string;
  version: number;
  hasChanges: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};
type RecordPage = PageRow & { draft: PageDocument; published: PageDocument | null };
const blank = (): PageDocument => ({
  schemaVersion: 1,
  path: '/new-page',
  translations: { en: { title: 'Untitled page', seoTitle: '', seoDescription: '', ogImage: '' } },
  sections: [],
});
const label = (type: string) => type.replace(/([a-z])([A-Z])/g, '$1 $2');
export function PageManager({ initialId = '' }: { initialId?: string }) {
  const { user } = useCmsSession(),
    editable = can(user, 'pages.update');
  const [id, setId] = useState(initialId),
    [doc, setDoc] = useState<PageDocument | null>(null),
    [record, setRecord] = useState<RecordPage | null>(null),
    [version, setVersion] = useState(0),
    [dirty, setDirty] = useState(false),
    [locale, setLocale] = useState<BuilderLocale>('en'),
    [selected, setSelected] = useState(''),
    [addType, setAddType] = useState<SectionType>('Hero'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [refresh, setRefresh] = useState(0),
    [preview, setPreview] = useState(true),
    [mobile, setMobile] = useState(false);
  const [q, setQ] = useState(''),
    [status, setStatus] = useState(''),
    [archived, setArchived] = useState('false'),
    [sort, setSort] = useState('updatedAt'),
    [direction, setDirection] = useState('desc'),
    [page, setPage] = useState(1),
    [rows, setRows] = useState<PageRow[]>([]),
    [total, setTotal] = useState(0);
  const [cards, setCards] = useState<Record<string, BuilderCard[]>>({}),
    [previewError, setPreviewError] = useState('');
  const parsed = useMemo(() => (doc ? pageDocumentSchema.safeParse(doc) : null), [doc]);
  useEffect(() => {
    let active = true;
    void cmsApi(
      `page-builder?${new URLSearchParams({ q, archived, sort, direction, page: String(page), ...(status ? { status } : {}) })}`,
    )
      .then((r) => {
        if (active) {
          setRows(r.items as PageRow[]);
          setTotal(r.total as number);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [q, status, archived, sort, direction, page, refresh]);
  useEffect(() => {
    if (!id) return;
    let active = true;
    void cmsApi(`page-builder/${id}`)
      .then((r) => {
        if (active) {
          const value = r as RecordPage;
          setRecord(value);
          const draft = normalizeSectionOrder(value.draft);
          setDoc(draft);
          setVersion(value.version);
          setSelected((previous) =>
            draft.sections.some((s) => s.id === previous) ? previous : draft.sections[0]?.id || '',
          );
          setDirty(false);
          setLocale((previous) =>
            value.draft.translations[previous]
              ? previous
              : builderLocales.find((l) => value.draft.translations[l]) || 'en',
          );
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id, refresh]);
  useEffect(() => {
    if (!parsed?.success || !preview) return;
    let active = true;
    const timer = setTimeout(() => {
      void cmsApi('page-builder/preview', 'POST', { document: parsed.data, locale })
        .then((r) => {
          if (active) {
            setCards(r.cards as Record<string, BuilderCard[]>);
            setPreviewError('');
          }
        })
        .catch((e) => {
          if (active) setPreviewError(e.message);
        });
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [parsed, locale, preview]);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', prevent);
    const guard = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (
        !link ||
        link.target === '_blank' ||
        link.closest('.pb-preview-panel') ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      if (!window.confirm('Leave this page and discard unsaved changes?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('click', guard, true);
    return () => {
      window.removeEventListener('beforeunload', prevent);
      document.removeEventListener('click', guard, true);
    };
  }, [dirty]);
  const change = (value: PageDocument) => {
    setDoc(value);
    setDirty(true);
    setNotice('');
  };
  async function save(action: 'save' | 'publish') {
    if (!doc) return;
    const value = pageWriteSchema.safeParse({ document: doc, version, action });
    setError('');
    setNotice('');
    if (!value.success) {
      setError(value.error.issues.map((i) => `${i.path.join(' › ')}: ${i.message}`).join('\n'));
      return;
    }
    setBusy(true);
    try {
      const saved = (await cmsApi(
        `page-builder${id ? `/${id}` : ''}`,
        id ? 'PUT' : 'POST',
        value.data,
      )) as RecordPage;
      setId(saved.id);
      setVersion(saved.version);
      setDoc(saved.draft);
      setRecord(saved);
      setDirty(false);
      setNotice(
        action === 'publish' ? 'Page published.' : 'Draft saved. The published page is unchanged.',
      );
      setRefresh((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }
  function open(row: PageRow) {
    setDoc(null);
    setRecord(null);
    setError('');
    setNotice('');
    setId(row.id);
    setDirty(false);
  }
  async function state(action: 'unpublish' | 'archive' | 'restore') {
    if (!id) return;
    await cmsApi(`page-builder/${id}/state`, 'POST', { version, action, confirmation: 'CONFIRM' });
    setRefresh((n) => n + 1);
    setNotice(
      action === 'restore'
        ? 'Page restored as a draft.'
        : action === 'archive'
          ? 'Page archived.'
          : 'Page unpublished.',
    );
  }
  function close() {
    setDoc(null);
    setRecord(null);
    setId('');
    setDirty(false);
    setNotice('');
    setError('');
  }
  const current = doc?.sections.find((s) => s.id === selected);
  const updateSection = (value: BuilderSection) => {
    if (doc) change({ ...doc, sections: doc.sections.map((s) => (s.id === value.id ? value : s)) });
  };
  function moveSection(to: number) {
    if (!doc || !current) return;
    const items = [...doc.sections].sort((a, b) => a.order - b.order);
    const index = items.findIndex((s) => s.id === current.id);
    items.splice(index, 1);
    items.splice(to, 0, current);
    change({ ...doc, sections: items.map((s, i) => ({ ...s, order: i })) });
  }
  return (
    <main className="pb-manager">
      <header className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CONTENT WORKSPACE</p>
          <h1>Pages</h1>
          <p>Compose, preview, and publish pages from reusable sections.</p>
        </div>
        <div className="pb-editor-actions">
          <Link href="/admin/company">Company editor →</Link>
          <Link href="/admin/page-records">Legacy page records →</Link>
          {!doc && can(user, 'pages.create') && (
            <Button
              onClick={() => {
                setId('');
                setRecord(null);
                setDoc(blank());
                setVersion(0);
                setSelected('');
                setDirty(false);
                setError('');
              }}
            >
              New page
            </Button>
          )}
        </div>
      </header>
      {error && (
        <p className="pb-editor-error" role="alert">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {!doc ? (
        <>
          <div className="pb-list-filters">
            <Input
              label="Search pages"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
            <Select
              label="Publication"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
            <Select
              label="Page visibility"
              value={archived}
              onChange={(e) => {
                setArchived(e.target.value);
                setPage(1);
              }}
            >
              <option value="false">Active</option>
              <option value="true">Archived</option>
            </Select>
            <Select label="Sort pages" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="updatedAt">Updated date</option>
              <option value="createdAt">Created date</option>
              <option value="path">Path</option>
            </Select>
            <Select
              label="Sort direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>
          <div className="pb-list-table">
            <table>
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Status</th>
                  <th>Created by / date</th>
                  <th>Updated by / date</th>
                  <th>Editor</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.title}
                      <small>{row.path}</small>
                    </td>
                    <td>
                      {row.status}
                      {row.status === 'published' && row.hasChanges && (
                        <small>Unpublished changes</small>
                      )}
                    </td>
                    <td>
                      {row.createdBy}
                      <small>{new Date(row.createdAt).toLocaleString()}</small>
                    </td>
                    <td>
                      {row.updatedBy}
                      <small>{new Date(row.updatedAt).toLocaleString()}</small>
                    </td>
                    <td>
                      <Button variant="secondary" onClick={() => open(row)}>
                        {editable ? 'Edit / preview' : 'Preview'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <p>No pages yet. Create a page to begin.</p>}
          <div className="pb-editor-actions">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((n) => n - 1)}>
              Previous
            </Button>
            <span>
              Page {page} · {total} pages
            </span>
            <Button
              variant="secondary"
              disabled={page * 20 >= total}
              onClick={() => setPage((n) => n + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="pb-editor-toolbar">
            <span>
              {record?.published ? 'Published' : 'Draft'}
              {dirty ? ' · Unsaved changes' : record?.hasChanges ? ' · Unpublished changes' : ''}
            </span>
            <Select
              label="Editing language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as BuilderLocale)}
            >
              {builderLocales.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </Select>
            <Button variant="secondary" onClick={() => setPreview(!preview)}>
              {preview ? 'Hide preview' : 'Show preview'}
            </Button>
            {dirty ? (
              <ConfirmAction
                label="Close editor"
                title="Discard unsaved changes?"
                description="Your last saved draft and published page are retained."
                onConfirm={async () => close()}
              />
            ) : (
              <Button variant="secondary" onClick={close}>
                Close editor
              </Button>
            )}
            {editable && !record?.deletedAt && (
              <>
                <Button variant="secondary" loading={busy} onClick={() => void save('save')}>
                  Save draft
                </Button>
                <Button
                  disabled={!can(user, 'pages.publish')}
                  loading={busy}
                  onClick={() => void save('publish')}
                >
                  Publish page
                </Button>
              </>
            )}
          </div>
          <div className="pb-editor-layout" data-preview={preview}>
            <div className="pb-editor-form">
              <fieldset
                disabled={!editable || busy || !!record?.deletedAt}
                className="pb-editor-fields"
              >
                <Input
                  label="Page path"
                  value={doc.path}
                  onChange={(e) => change({ ...doc, path: e.target.value })}
                  hint="Example: /our-approach. Existing application routes are reserved."
                />
                <Checkbox
                  label={`Enable ${locale.toUpperCase()} page`}
                  checked={!!doc.translations[locale]}
                  onChange={(e) => {
                    const translations = { ...doc.translations };
                    if (e.target.checked)
                      translations[locale] = {
                        title: '',
                        seoTitle: '',
                        seoDescription: '',
                        ogImage: '',
                      };
                    else delete translations[locale];
                    change({ ...doc, translations });
                  }}
                />
                {doc.translations[locale] && (
                  <>
                    <Input
                      label="Page title"
                      value={doc.translations[locale]!.title}
                      onChange={(e) =>
                        change({
                          ...doc,
                          translations: {
                            ...doc.translations,
                            [locale]: { ...doc.translations[locale]!, title: e.target.value },
                          },
                        })
                      }
                    />
                    <details className="pb-editor-group">
                      <summary>SEO & social sharing</summary>
                      <Input
                        label="SEO title"
                        value={doc.translations[locale]!.seoTitle}
                        onChange={(e) =>
                          change({
                            ...doc,
                            translations: {
                              ...doc.translations,
                              [locale]: { ...doc.translations[locale]!, seoTitle: e.target.value },
                            },
                          })
                        }
                      />
                      <Textarea
                        label="SEO description"
                        value={doc.translations[locale]!.seoDescription}
                        onChange={(e) =>
                          change({
                            ...doc,
                            translations: {
                              ...doc.translations,
                              [locale]: {
                                ...doc.translations[locale]!,
                                seoDescription: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <Input
                        label="Open Graph image URL"
                        value={doc.translations[locale]!.ogImage}
                        onChange={(e) =>
                          change({
                            ...doc,
                            translations: {
                              ...doc.translations,
                              [locale]: { ...doc.translations[locale]!, ogImage: e.target.value },
                            },
                          })
                        }
                      />
                    </details>
                  </>
                )}
                <h2>
                  Sections <small>{doc.sections.length} / 80</small>
                </h2>
                <div className="pb-editor-add">
                  <Select
                    label="Section type"
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as SectionType)}
                  >
                    {sectionTypes.map((t) => (
                      <option key={t} value={t}>
                        {label(t)}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    disabled={doc.sections.length >= 80}
                    onClick={() => {
                      const next = {
                        id: crypto.randomUUID(),
                        type: addType,
                        visible: true,
                        order: doc.sections.length,
                        theme: 'LIGHT',
                        background: 'PLAIN',
                        spacing: 'NORMAL',
                        content: { [locale]: emptySectionCopy(addType) },
                      } as BuilderSection;
                      change({ ...doc, sections: [...doc.sections, next] });
                      setSelected(next.id);
                    }}
                  >
                    Add section
                  </Button>
                </div>
                <ol className="pb-section-list">
                  {[...doc.sections]
                    .sort((a, b) => a.order - b.order)
                    .map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          aria-current={s.id === selected ? 'true' : undefined}
                          onClick={() => setSelected(s.id)}
                        >
                          {s.order + 1}. {label(s.type)}
                          {s.content[locale]?.heading ? ` · ${s.content[locale]?.heading}` : ''}
                          <small>
                            {s.visible ? 'Visible' : 'Hidden'} · {s.theme}
                          </small>
                        </button>
                      </li>
                    ))}
                </ol>
                {current && (
                  <section className="pb-editor-group">
                    <h2>{label(current.type)}</h2>
                    <div className="pb-editor-actions">
                      <Button
                        variant="secondary"
                        disabled={!current.order}
                        onClick={() => moveSection(current.order - 1)}
                      >
                        Move section up
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={current.order === doc.sections.length - 1}
                        onClick={() => moveSection(current.order + 1)}
                      >
                        Move section down
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={doc.sections.length >= 80}
                        onClick={() => {
                          const next = {
                            ...structuredClone(current),
                            id: crypto.randomUUID(),
                            order: doc.sections.length,
                          };
                          change({ ...doc, sections: [...doc.sections, next] });
                          setSelected(next.id);
                        }}
                      >
                        Duplicate section
                      </Button>
                      <ConfirmAction
                        label="Remove section"
                        title="Remove this section from the draft?"
                        description="The published page remains unchanged until you publish again."
                        onConfirm={async () => {
                          change({
                            ...doc,
                            sections: doc.sections
                              .filter((s) => s.id !== current.id)
                              .sort((a, b) => a.order - b.order)
                              .map((s, i) => ({ ...s, order: i })),
                          });
                          setSelected('');
                        }}
                      />
                    </div>
                    <Checkbox
                      label="Section visible"
                      checked={current.visible}
                      onChange={(e) => updateSection({ ...current, visible: e.target.checked })}
                    />
                    <Select
                      label="Theme"
                      value={current.theme}
                      onChange={(e) =>
                        updateSection({
                          ...current,
                          theme: e.target.value as BuilderSection['theme'],
                        })
                      }
                    >
                      {sectionThemes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                    <Select
                      label="Background style"
                      value={current.background}
                      onChange={(e) =>
                        updateSection({
                          ...current,
                          background: e.target.value as BuilderSection['background'],
                        })
                      }
                    >
                      {sectionBackgrounds.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                    <Select
                      label="Spacing"
                      value={current.spacing}
                      onChange={(e) =>
                        updateSection({
                          ...current,
                          spacing: e.target.value as BuilderSection['spacing'],
                        })
                      }
                    >
                      {sectionSpacings.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                    <SectionEditor
                      key={`${current.id}/${locale}`}
                      section={current}
                      locale={locale}
                      onChange={updateSection}
                    />
                  </section>
                )}
              </fieldset>
              {id && editable && (
                <div className="pb-editor-actions">
                  {record?.published && !record.deletedAt && (
                    <ConfirmAction
                      disabled={dirty || busy || !can(user, 'pages.publish')}
                      label="Unpublish page"
                      title="Unpublish this page?"
                      description="The public URL will stop displaying the page. Your draft is retained."
                      onConfirm={() => state('unpublish')}
                    />
                  )}
                  <ConfirmAction
                    disabled={
                      dirty ||
                      busy ||
                      !can(user, record?.deletedAt ? 'pages.update' : 'pages.delete')
                    }
                    label={record?.deletedAt ? 'Restore page' : 'Archive page'}
                    title={
                      record?.deletedAt ? 'Restore this page as a draft?' : 'Archive this page?'
                    }
                    description="Page content is retained. Restored pages must be published explicitly."
                    onConfirm={() => state(record?.deletedAt ? 'restore' : 'archive')}
                  />
                </div>
              )}
              {record?.published && !record.deletedAt && (
                <a href={`/${locale}${doc.path}`} target="_blank" rel="noreferrer">
                  View published page ↗
                </a>
              )}
            </div>
            {preview && (
              <section className="pb-preview-panel" aria-label="Page preview">
                <header>
                  <h2>Live preview</h2>
                  <Button variant="secondary" onClick={() => setMobile(!mobile)}>
                    {mobile ? 'Desktop width' : 'Mobile width'}
                  </Button>
                </header>
                <p>Unsaved draft · {locale.toUpperCase()} · forms disabled</p>
                {previewError && <p role="alert">{previewError}</p>}
                <div
                  className="pb-preview-surface"
                  data-mobile={mobile}
                  onClick={(e) => {
                    if (e.target instanceof Element && e.target.closest('a')) e.preventDefault();
                  }}
                >
                  {parsed?.success ? (
                    <PageRenderer
                      document={parsed.data}
                      locale={locale}
                      cards={cards}
                      pageId={id}
                      preview
                    />
                  ) : (
                    <p className="pb-editor-hint">
                      Complete the page path, title, and image fields to preview.{' '}
                      {parsed && !parsed.success ? parsed.error.issues[0]?.message : ''}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </main>
  );
}
