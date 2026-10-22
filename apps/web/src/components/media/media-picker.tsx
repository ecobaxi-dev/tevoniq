'use client';
/* eslint-disable @next/next/no-img-element -- Validated library thumbnails. */
import { useEffect, useState } from 'react';
import { Button, Input, Modal } from '@tevoniq/ui';
import { cmsApi } from '@/lib/cms-client';
type Item = {
  id: string;
  title: string;
  alt: string;
  caption: string;
  files: { name: string; url: string }[];
};
export function MediaPicker({
  onSelect,
}: {
  onSelect: (value: { src: string; alt: string; caption: string }) => void;
}) {
  const [open, setOpen] = useState(false),
    [q, setQ] = useState(''),
    [items, setItems] = useState<Item[]>([]),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [error, setError] = useState('');
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      cmsApi('media-library?' + new URLSearchParams({ q, page: String(page), limit: '12' }))
        .then((data) => {
          if (!cancelled) {
            setItems(data.items as Item[]);
            setTotal(data.total as number);
            setError('');
          }
        })
        .catch((e) => {
          if (!cancelled) setError(e.message);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, q, page]);
  return (
    <Modal
      title="Choose an image"
      description="Select an active library image. Alt text and caption are copied into this section and can be translated there."
      closeLabel="Close media library"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button type="button" variant="secondary">
          Choose from Media Library
        </Button>
      }
    >
      <Input
        label="Search library"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
      />
      {error && <p role="alert">{error}</p>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
          gap: 12,
          marginBlock: 20,
        }}
      >
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              onSelect({
                src:
                  item.files.find((f) => f.name === 'large.webp')?.url ||
                  item.files.find((f) => f.name === 'medium.webp')?.url ||
                  item.files[0]!.url,
                alt: item.alt,
                caption: item.caption,
              });
              setOpen(false);
            }}
            style={{
              border: '1px solid #b1bfd2',
              borderRadius: 8,
              padding: 8,
              background: 'white',
              color: '#0a1f44',
              cursor: 'pointer',
              overflowWrap: 'anywhere',
            }}
          >
            <img
              src={item.files.find((f) => f.name === 'thumb.webp')?.url || item.files[0]?.url}
              alt=""
              style={{ width: '100%', height: 90, objectFit: 'contain' }}
            />
            {item.title}
          </button>
        ))}
      </div>
      {!items.length && <p>No matching media.</p>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button
          type="button"
          variant="secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span>
          {page} / {Math.max(1, Math.ceil(total / 12))}
        </span>
        <Button
          type="button"
          variant="secondary"
          disabled={page * 12 >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </Modal>
  );
}
