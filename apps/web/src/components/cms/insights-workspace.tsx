'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Container, UIProvider, Input, Textarea, Select, Checkbox } from '@tevoniq/ui';
import {
  articleWriteSchema,
  taxonomySchema,
  taxonomyWriteSchema,
  estimateReadingTime,
  type ArticleWrite,
  type InsightTaxonomy,
} from '@tevoniq/validation';
import { CmsLogin, useCmsSession } from '@/components/cms/session';
import { cmsApi, can } from '@/lib/cms-client';
import { ArticleBlockEditor } from '@/components/cms/article-block-editor';
import { ArticleContent } from '@/components/article-content';
import '@/app/admin/services/cms.css';
import '@/app/[locale]/insights/insights.css';
import '@/app/admin/insights/insights-cms.css';
type Locale = 'en' | 'tr' | 'ar';
type Row = {
  id: string;
  title: string;
  status: string;
  publicationDate: string | null;
  kind: string;
};
const newArticle = (language: Locale): ArticleWrite => ({
  title: '',
  slug: '',
  excerpt: '',
  content: [],
  coverImage: '',
  coverImageAlt: '',
  author: '',
  categoryId: null,
  tagIds: [],
  publicationDate: null,
  readingTime: 1,
  featured: false,
  status: 'draft',
  language,
  kind: 'blog',
  seoTitle: '',
  seoDescription: '',
  ogImage: '',
  canonicalUrl: '',
  version: 0,
});
const writable = (data: Record<string, unknown>) =>
  articleWriteSchema.parse(
    Object.fromEntries(Object.keys(articleWriteSchema.shape).map((k) => [k, data[k]])),
  );

function Workspace({
  readOnly,
  canPublish,
  canDelete,
  initialKind,
}: {
  readOnly: boolean;
  canPublish: boolean;
  canDelete: boolean;
  initialKind?: 'blog' | 'resource';
}) {
  const [locale, setLocale] = useState<Locale>('en'),
    [rows, setRows] = useState<Row[]>([]),
    [taxonomy, setTaxonomy] = useState<InsightTaxonomy[]>([]);
  const [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [status, setStatus] = useState(''),
    [search, setSearch] = useState(''),
    [q, setQ] = useState(''),
    [refresh, setRefresh] = useState(0);
  const [id, setId] = useState(''),
    [article, setArticle] = useState<ArticleWrite | null>(null),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [message, setMessage] = useState(''),
    [preview, setPreview] = useState(false),
    [dirty, setDirty] = useState(false);
  const [term, setTerm] = useState<InsightTaxonomy | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([
      cmsApi(
        `insights?${new URLSearchParams({ locale, page: String(page), limit: '20', q, ...(initialKind ? { kind: initialKind } : {}), ...(status ? { status } : {}) })}`,
      ),
      cmsApi(`insights/taxonomies?locale=${locale}`),
    ])
      .then(([list, terms]) => {
        if (active) {
          setRows(list.items as Row[]);
          setTotal(list.total as number);
          setTaxonomy(taxonomySchema.array().parse(terms.items));
        }
      })
      .catch((e: unknown) => {
        if (active) setMessage(e instanceof Error ? e.message : 'Load failed');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale, page, q, status, refresh, initialKind]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const update = (patch: Partial<ArticleWrite>) => {
    setArticle((a) => a && { ...a, ...patch });
    setDirty(true);
    setPreview(false);
  };
  const reload = () => {
    setLoading(true);
    setRefresh((n) => n + 1);
  };
  async function open(articleId: string) {
    setBusy(true);
    setMessage('');
    setPreview(false);
    try {
      const data = await cmsApi(`insights/${articleId}`);
      setArticle(writable(data));
      setId(articleId);
      setDirty(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const data = await cmsApi(
        `insights${id ? `/${id}` : ''}`,
        id ? 'PUT' : 'POST',
        articleWriteSchema.parse(article),
      );
      setArticle(writable(data));
      setId(data.id as string);
      setDirty(false);
      setMessage('Article saved.');
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }
  async function saveTerm() {
    if (!term) return;
    setBusy(true);
    setMessage('');
    try {
      const { id: termId, ...body } = term;
      await cmsApi(
        `insights/taxonomies${termId ? `/${termId}` : ''}`,
        termId ? 'PUT' : 'POST',
        taxonomyWriteSchema.parse(body),
      );
      setTerm(null);
      setMessage('Taxonomy saved.');
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="cms-toolbar">
        <Select
          label="Language"
          value={locale}
          disabled={busy || dirty}
          onChange={(e) => {
            setLocale(e.target.value as Locale);
            setArticle(null);
            setTerm(null);
            setPage(1);
            setLoading(true);
          }}
        >
          {['en', 'tr', 'ar'].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </Select>
        <Button
          disabled={busy || readOnly || dirty}
          onClick={() => {
            setArticle({ ...newArticle(locale), kind: initialKind || 'blog' });
            setId('');
            setPreview(false);
          }}
        >
          New article
        </Button>
        <Button variant="secondary" disabled={busy} onClick={reload}>
          Refresh catalog
        </Button>
      </div>
      {message && (
        <p role="status" className="insight-cms-message">
          {message}
        </p>
      )}
      {dirty && (
        <p role="status">
          Unsaved changes. Save or discard before opening another article or changing language.{' '}
          <Button
            variant="secondary"
            onClick={() => {
              setArticle(null);
              setId('');
              setDirty(false);
            }}
          >
            Discard changes
          </Button>
        </p>
      )}
      <details className="insight-taxonomies">
        <summary>Categories and tags</summary>
        <div className="insight-editor-actions">
          {taxonomy.map((t) => (
            <Button
              key={t.id}
              variant="secondary"
              disabled={busy || readOnly}
              onClick={() => setTerm(t)}
            >
              {t.type}: {t.name}
            </Button>
          ))}
          {(['category', 'tag'] as const).map((type) => (
            <Button
              key={type}
              disabled={busy || readOnly}
              onClick={() =>
                setTerm({ id: '', name: '', slug: '', type, language: locale, version: 0 })
              }
            >
              New {type}
            </Button>
          ))}
        </div>
        {term && (
          <form
            className="insight-editor-fields"
            onSubmit={(e) => {
              e.preventDefault();
              void saveTerm();
            }}
          >
            <Input
              label={`${term.type} name`}
              value={term.name}
              disabled={busy}
              onChange={(e) => setTerm({ ...term, name: e.target.value })}
              required
            />
            <Input
              label="Slug"
              value={term.slug}
              disabled={busy}
              onChange={(e) => setTerm({ ...term, slug: e.target.value })}
              required
            />
            <Button type="submit" loading={busy} disabled={readOnly || (!!term?.id && !canPublish)}>
              Save {term.type}
            </Button>
          </form>
        )}
      </details>
      <div className="insight-cms-layout">
        <aside>
          <form
            className="insight-editor-fields"
            onSubmit={(e) => {
              e.preventDefault();
              setQ(search);
              setPage(1);
              setLoading(true);
              setRefresh((n) => n + 1);
            }}
          >
            <Input
              label="Search articles"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
                setLoading(true);
              }}
            >
              <option value="">All statuses</option>
              {['draft', 'scheduled', 'published', 'archived'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <Button type="submit">Search</Button>
          </form>
          {loading ? (
            <p role="status">Loading articles…</p>
          ) : (
            <ul className="cms-catalog">
              {rows.map((row) => (
                <li key={row.id}>
                  <button
                    disabled={busy || dirty}
                    aria-current={id === row.id ? 'true' : undefined}
                    onClick={() => void open(row.id)}
                  >
                    <strong>{row.title}</strong>
                    <span>
                      {row.kind} · {row.status}
                      {row.status === 'scheduled' &&
                      row.publicationDate &&
                      new Date(row.publicationDate) <= new Date()
                        ? ' (live)'
                        : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && !rows.length && <p>No articles found.</p>}
          <div className="insight-editor-actions">
            <Button
              variant="secondary"
              disabled={page === 1 || loading}
              onClick={() => {
                setPage((p) => p - 1);
                setLoading(true);
              }}
            >
              Previous
            </Button>
            <span>
              {page} / {Math.max(1, Math.ceil(total / 20))}
            </span>
            <Button
              variant="secondary"
              disabled={page * 20 >= total || loading}
              onClick={() => {
                setPage((p) => p + 1);
                setLoading(true);
              }}
            >
              Next
            </Button>
          </div>
        </aside>
        <div>
          {article ? (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void save();
                }}
              >
                <fieldset
                  disabled={
                    busy ||
                    readOnly ||
                    (!canPublish &&
                      rows.some(
                        (r) => r.id === id && ['published', 'scheduled'].includes(r.status),
                      ))
                  }
                  className="insight-editor-fields"
                >
                  <legend>
                    {id ? 'Edit article' : 'New article'} · {article.language}
                  </legend>
                  <Input
                    label="Title"
                    value={article.title}
                    onChange={(e) => update({ title: e.target.value })}
                    required
                  />
                  <Input
                    label="Slug"
                    value={article.slug}
                    onChange={(e) => update({ slug: e.target.value })}
                    required
                  />
                  <Textarea
                    label="Excerpt"
                    value={article.excerpt}
                    onChange={(e) => update({ excerpt: e.target.value })}
                  />
                  <Select
                    label="Collection"
                    value={article.kind}
                    onChange={(e) => update({ kind: e.target.value as ArticleWrite['kind'] })}
                  >
                    <option value="blog">Blog</option>
                    <option value="resource">Resources</option>
                    <option value="case-study">Case studies</option>
                  </Select>
                  <Input
                    label="Author"
                    value={article.author}
                    onChange={(e) => update({ author: e.target.value })}
                  />
                  <Select
                    label="Category"
                    value={article.categoryId || ''}
                    onChange={(e) => update({ categoryId: e.target.value || null })}
                  >
                    <option value="">Select category</option>
                    {taxonomy
                      .filter((t) => t.type === 'category')
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </Select>
                  <fieldset>
                    <legend>Tags</legend>
                    {taxonomy
                      .filter((t) => t.type === 'tag')
                      .map((t) => (
                        <Checkbox
                          key={t.id}
                          label={t.name}
                          checked={article.tagIds.includes(t.id)}
                          onChange={(e) =>
                            update({
                              tagIds: e.target.checked
                                ? [...article.tagIds, t.id]
                                : article.tagIds.filter((id) => id !== t.id),
                            })
                          }
                        />
                      ))}
                  </fieldset>
                  <Input
                    label="Cover image URL"
                    type="url"
                    value={article.coverImage}
                    onChange={(e) => update({ coverImage: e.target.value })}
                  />
                  <Input
                    label="Cover image alt text"
                    value={article.coverImageAlt}
                    onChange={(e) => update({ coverImageAlt: e.target.value })}
                  />
                  <ArticleBlockEditor
                    blocks={article.content}
                    onChange={(content) => update({ content })}
                  />
                  <Input
                    label="Reading time (minutes)"
                    type="number"
                    min={1}
                    max={1000}
                    value={article.readingTime}
                    onChange={(e) => update({ readingTime: Number(e.target.value) })}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => update({ readingTime: estimateReadingTime(article.content) })}
                  >
                    Calculate reading time
                  </Button>
                  <Select
                    label="Status"
                    value={article.status}
                    onChange={(e) => update({ status: e.target.value as ArticleWrite['status'] })}
                  >
                    {['draft', 'scheduled', 'published', 'archived'].map((s) => (
                      <option
                        key={s}
                        disabled={
                          (!canPublish && ['published', 'scheduled'].includes(s)) ||
                          (!canDelete && s === 'archived')
                        }
                      >
                        {s}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Publication date and time (UTC)"
                    type="datetime-local"
                    value={
                      article.publicationDate
                        ? new Date(article.publicationDate).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      update({
                        publicationDate: e.target.value
                          ? new Date(`${e.target.value}Z`).toISOString()
                          : null,
                      })
                    }
                  />
                  <p>
                    Scheduled articles become public at the UTC time above. Drafts and archived
                    articles stay private. Saving updates the current record immediately.
                  </p>
                  <Checkbox
                    label="Featured"
                    checked={article.featured}
                    onChange={(e) => update({ featured: e.target.checked })}
                  />
                  <Input
                    label="SEO title"
                    value={article.seoTitle}
                    onChange={(e) => update({ seoTitle: e.target.value })}
                  />
                  <Textarea
                    label="SEO description"
                    value={article.seoDescription}
                    onChange={(e) => update({ seoDescription: e.target.value })}
                  />
                  <Input
                    label="OG image URL"
                    type="url"
                    value={article.ogImage}
                    onChange={(e) => update({ ogImage: e.target.value })}
                  />
                  <Input
                    label="Canonical URL (optional; defaults to this article)"
                    type="url"
                    value={article.canonicalUrl}
                    onChange={(e) => update({ canonicalUrl: e.target.value })}
                  />
                  <Button type="submit" loading={busy}>
                    Save article
                  </Button>
                </fieldset>
              </form>
              <div className="insight-editor-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const result = articleWriteSchema.safeParse(article);
                    if (!result.success) setMessage(result.error.message);
                    else setPreview((p) => !p);
                  }}
                >
                  Toggle preview
                </Button>
                {id && (
                  <Link href={`/${article.language}/insights/blog/${article.slug}`}>
                    View public article
                  </Link>
                )}
              </div>
              {preview && (
                <article
                  lang={article.language}
                  dir={article.language === 'ar' ? 'rtl' : 'ltr'}
                  className="insight-preview"
                >
                  <p>CMS preview · {article.status}</p>
                  <h1 className="tv-h1">{article.title}</h1>
                  <p>{article.excerpt}</p>
                  <ArticleContent blocks={article.content} />
                </article>
              )}
            </>
          ) : (
            <p>Select an article or create one to begin.</p>
          )}
        </div>
      </div>
    </>
  );
}
export default function InsightsCms({ initialKind }: { initialKind?: 'blog' | 'resource' } = {}) {
  const session = useCmsSession();
  return (
    <UIProvider>
      <main className="cms-shell">
        <Container>
          <h1 className="tv-h1">Insights CMS</h1>
          <p>
            <Link href="/admin/company">Company CMS</Link> ·{' '}
            <Link href="/en/insights">View Insights</Link>
          </p>
          {session.checking ? (
            <p role="status">Checking session…</p>
          ) : session.sessionError ? (
            <>
              <p role="alert">{session.sessionError}</p>
              <Button onClick={session.retrySession}>Retry</Button>
            </>
          ) : !session.user ? (
            <CmsLogin onSignedIn={session.setUser} />
          ) : (
            <Workspace
              readOnly={!can(session.user, 'blog.update')}
              canPublish={can(session.user, 'blog.publish')}
              canDelete={can(session.user, 'blog.delete')}
              {...(initialKind ? { initialKind } : {})}
            />
          )}
        </Container>
      </main>
    </UIProvider>
  );
}
