'use client';
/* eslint-disable @next/next/no-img-element -- Validated same-origin library assets, including SVG previews. */
import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Textarea, Select } from '@tevoniq/ui';
import { Upload, ImageIcon, ShieldCheck, Copy, Folder } from 'lucide-react';
import { cmsApi, can } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
import { ConfirmAction } from '@/components/admin/confirm-action';
import './media-library.css';
type FileVariant = {
  name: string;
  url: string;
  width: number;
  height: number;
  size: number;
  mime: string;
};
type Asset = {
  id: string;
  title: string;
  originalName: string;
  alt: string;
  caption: string;
  collection: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  version: number;
  protected: boolean;
  files: FileVariant[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  usage?: { id: string; title: string; kind: string }[];
};
const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const preview = (asset: Asset) =>
  asset.files.find((f) => f.name === 'thumb.webp')?.url || asset.files[0]?.url;
const date = (value: string) => new Date(value).toLocaleString();
export function MediaLibrary() {
  const session = useCmsSession(),
    editable = can(session.user, 'media.update');
  const [items, setItems] = useState<Asset[]>([]),
    [total, setTotal] = useState(0),
    [collections, setCollections] = useState<string[]>([]),
    [maxBytes, setMaxBytes] = useState(10 * 1024 * 1024);
  const [search, setSearch] = useState(''),
    [q, setQ] = useState(''),
    [collection, setCollection] = useState('*'),
    [mime, setMime] = useState(''),
    [archived, setArchived] = useState('false'),
    [sort, setSort] = useState('createdAt'),
    [page, setPage] = useState(1);
  const [asset, setAsset] = useState<Asset | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [uploadCollection, setUploadCollection] = useState(''),
    [protect, setProtect] = useState(false),
    [progress, setProgress] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  const refresh = useCallback(async () => {
    const params = new URLSearchParams({
      q,
      mime,
      archived,
      sort,
      page: String(page),
      direction: sort === 'title' ? 'asc' : 'desc',
    });
    if (collection !== '*') params.set('collection', collection);
    const data = await cmsApi('media-library?' + params);
    setItems(data.items as Asset[]);
    setTotal(data.total as number);
    setCollections(data.collections as string[]);
    setMaxBytes(data.maxFileBytes as number);
  }, [q, mime, archived, sort, page, collection]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (session.user) refresh().catch((e) => setError(e.message));
    }, 0);
    return () => clearTimeout(timer);
  }, [session.user, refresh]);
  async function open(id: string) {
    setError('');
    try {
      setAsset((await cmsApi('media-library/' + id)) as unknown as Asset);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load asset');
    }
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    setNotice('');
    const failures: string[] = [];
    let count = 0;
    for (const [index, file] of Array.from(files).entries()) {
      setProgress(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
      if (file.size > maxBytes) {
        failures.push(`${file.name}: exceeds ${size(maxBytes)}`);
        continue;
      }
      try {
        const body = new FormData();
        body.set('file', file);
        body.set('collection', uploadCollection);
        body.set('protected', String(protect));
        const response = await fetch('/api/cms/media-library/upload', { method: 'POST', body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Upload failed');
        count++;
      } catch (e) {
        failures.push(`${file.name}: ${e instanceof Error ? e.message : 'Upload failed'}`);
      }
    }
    setProgress('');
    setBusy(false);
    setNotice(`${count} file${count === 1 ? '' : 's'} uploaded.`);
    setError(failures.join('\n'));
    await refresh();
  }
  async function save() {
    if (!asset) return;
    setBusy(true);
    setError('');
    try {
      const updated = await cmsApi('media-library/' + asset.id, 'PUT', {
        title: asset.title,
        alt: asset.alt,
        caption: asset.caption,
        collection: asset.collection,
        version: asset.version,
      });
      setAsset(updated as unknown as Asset);
      setNotice('Media metadata saved.');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="media-library">
      <header className="media-heading">
        <div>
          <p className="admin-eyebrow">CONTENT / ASSETS</p>
          <h1>Media Library</h1>
          <p>Organize images, describe them, and see where they are used.</p>
        </div>
        <ImageIcon size={32} aria-hidden="true" />
      </header>
      {error && (
        <p className="media-error" role="alert">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {can(session.user, 'media.create') && (
        <section className="media-upload" aria-label="Upload images">
          <div>
            <Upload size={24} aria-hidden="true" />
            <h2>Upload images</h2>
            <p>
              JPEG, PNG, WebP, AVIF or static SVG · Up to {size(maxBytes)} each. Multiple files
              upload in sequence.
            </p>
          </div>
          <Input
            label="Collection for uploads"
            value={uploadCollection}
            maxLength={80}
            list="media-collections"
            onChange={(e) => setUploadCollection(e.target.value)}
          />
          <label className="media-protect">
            <input
              type="checkbox"
              checked={protect}
              onChange={(e) => setProtect(e.target.checked)}
              disabled={busy}
            />{' '}
            Protect original (no derivatives or archive)
          </label>
          <label className="media-upload-button">
            Choose files
            <input
              type="file"
              aria-label="Choose files"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              disabled={busy}
              onChange={(e) => {
                const files = e.target.files;
                void upload(files).catch((err) => setError(err.message));
                e.target.value = '';
              }}
            />
          </label>
          {progress && <p role="status">{progress}</p>}
        </section>
      )}
      <datalist id="media-collections">
        {collections.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <div className="media-filters">
        <Input
          label="Search media"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title, filename, alt text or caption"
        />
        <Select
          label="Collection"
          value={collection}
          onChange={(e) => {
            setCollection(e.target.value);
            setPage(1);
          }}
        >
          <option value="*">All collections</option>
          <option value="">Uncollected</option>
          {collections.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select
          label="File type"
          value={mime}
          onChange={(e) => {
            setMime(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All images</option>
          {['jpeg', 'png', 'webp', 'avif', 'svg+xml'].map((m) => (
            <option key={m} value={'image/' + m}>
              {m === 'svg+xml' ? 'SVG' : m.toUpperCase()}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={archived}
          onChange={(e) => {
            setArchived(e.target.value);
            setPage(1);
          }}
        >
          <option value="false">Active</option>
          <option value="true">Archived</option>
        </Select>
        <Select
          label="Sort"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="createdAt">Newest first</option>
          <option value="title">Title A–Z</option>
          <option value="size">Largest first</option>
        </Select>
      </div>
      <div className="media-workspace">
        <div>
          <p>
            {total} asset{total === 1 ? '' : 's'}
          </p>
          <div className="media-grid">
            {items.map((item) => (
              <button
                className="media-tile"
                key={item.id}
                type="button"
                aria-pressed={asset?.id === item.id}
                onClick={() => void open(item.id)}
              >
                <div className="media-thumb">
                  <img src={preview(item)} alt="" loading="lazy" />
                </div>
                <strong>{item.title}</strong>
                <span>
                  {item.width} × {item.height} · {size(item.size)}
                </span>
                <span>
                  <Folder size={13} aria-hidden="true" />
                  {item.collection || 'Uncollected'}{' '}
                  {item.protected && <ShieldCheck size={15} aria-label="Protected original" />}
                </span>
              </button>
            ))}
          </div>
          {!items.length && (
            <div className="media-empty">
              <ImageIcon size={36} aria-hidden="true" />
              <h2>No images found</h2>
              <p>Upload images or adjust your filters.</p>
            </div>
          )}
          <nav className="media-pagination" aria-label="Media pages">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(total / 24))}
            </span>
            <Button
              variant="secondary"
              disabled={page * 24 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </nav>
        </div>
        {asset && (
          <aside className="media-detail" aria-label="Asset details">
            <div className="media-detail-heading">
              <h2>Asset details</h2>
              <Button variant="ghost" onClick={() => setAsset(null)}>
                Close
              </Button>
            </div>
            <a
              href={asset.files[0]?.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Preview original image"
            >
              <img
                className="media-preview"
                src={asset.files.find((f) => f.name === 'medium.webp')?.url || asset.files[0]?.url}
                alt={asset.alt}
              />
            </a>
            {asset.protected && (
              <p>
                <ShieldCheck size={16} aria-hidden="true" /> Protected original
              </p>
            )}
            <fieldset disabled={!editable || busy || !!asset.deletedAt}>
              <Input
                label="Title / display name"
                value={asset.title}
                maxLength={180}
                onChange={(e) => setAsset({ ...asset, title: e.target.value })}
              />
              <Input
                label="Alt text"
                value={asset.alt}
                maxLength={500}
                onChange={(e) => setAsset({ ...asset, alt: e.target.value })}
              />
              <p className="media-help">
                Describe the image for assistive technology. Leave empty only for decorative images.
              </p>
              <Textarea
                label="Caption"
                value={asset.caption}
                maxLength={2000}
                onChange={(e) => setAsset({ ...asset, caption: e.target.value })}
              />
              <Input
                label="Collection"
                value={asset.collection}
                maxLength={80}
                list="media-collections"
                onChange={(e) => setAsset({ ...asset, collection: e.target.value })}
              />
              <Button disabled={!asset.title.trim()} onClick={() => void save()}>
                Save metadata
              </Button>
            </fieldset>
            <dl>
              <dt>Original filename</dt>
              <dd>{asset.originalName}</dd>
              <dt>MIME type</dt>
              <dd>{asset.mimeType}</dd>
              <dt>Dimensions / size</dt>
              <dd>
                {asset.width} × {asset.height} · {size(asset.size)}
              </dd>
              <dt>Created</dt>
              <dd>
                {date(asset.createdAt)}
                <br />
                {asset.createdBy}
              </dd>
              <dt>Updated</dt>
              <dd>
                {date(asset.updatedAt)}
                <br />
                {asset.updatedBy}
              </dd>
            </dl>
            <h3>Files & optimized sizes</h3>
            <ul className="media-files">
              {asset.files.map((f) => (
                <li key={f.name}>
                  <a href={f.url} target="_blank" rel="noreferrer">
                    {f.name}
                  </a>
                  <span>
                    {f.width} × {f.height} · {size(f.size)}
                  </span>
                  <button
                    type="button"
                    aria-label={'Copy URL for ' + f.name}
                    onClick={() =>
                      navigator.clipboard
                        .writeText(f.url)
                        .then(() => setNotice('Media URL copied.'))
                        .catch(() =>
                          setError('Could not copy. Open the image link to copy its URL.'),
                        )
                    }
                  >
                    <Copy size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <h3>Usage references ({asset.usage?.length || 0})</h3>
            {asset.usage?.length ? (
              <ul>
                {asset.usage.map((u) => (
                  <li key={u.kind + u.id}>
                    {u.kind}: {u.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No references found in CMS content.</p>
            )}
            <p className="media-help">
              Drafts, published snapshots and archived content are checked. Existing public URLs are
              retained when media is archived.
            </p>
            {can(session.user, asset.deletedAt ? 'media.update' : 'media.delete') && (
              <ConfirmAction
                label={asset.deletedAt ? 'Restore asset' : 'Archive asset'}
                title={asset.deletedAt ? 'Restore asset?' : 'Archive asset?'}
                description="Type CONFIRM to change this asset’s library status. Files are retained; this action does not permanently delete them."
                disabled={busy || (!asset.deletedAt && (asset.protected || !!asset.usage?.length))}
                onConfirm={async () => {
                  setAsset(
                    (await cmsApi('media-library/' + asset.id + '/state', 'POST', {
                      action: asset.deletedAt ? 'restore' : 'archive',
                      version: asset.version,
                      confirmation: 'CONFIRM',
                    })) as unknown as Asset,
                  );
                  await refresh();
                }}
              />
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
