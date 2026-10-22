'use client';
import { useEffect, useState } from 'react';
import { Input, Button, Checkbox } from '@tevoniq/ui';
import { cmsApi } from '@/lib/cms-client';
type ServiceOption = {
  id: string;
  slug: string;
  active: boolean;
  translations: Array<{ locale: string; title: string }>;
};
export function ServicePicker({
  ids,
  onChange,
  locale,
  disabled,
}: {
  ids: string[];
  onChange: (ids: string[]) => void;
  locale: string;
  disabled: boolean;
}) {
  const [q, setQ] = useState(''),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0);
  const [items, setItems] = useState<ServiceOption[]>([]),
    [known, setKnown] = useState<Record<string, ServiceOption>>({});
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      setBusy(true);
      setError('');
      void cmsApi(`services?${new URLSearchParams({ q, page: String(page), limit: '8' })}`)
        .then((data) => {
          if (!mounted) return;
          const records = data.items as ServiceOption[];
          setItems(records);
          setTotal(data.total as number);
          setKnown((old) => ({ ...old, ...Object.fromEntries(records.map((r) => [r.id, r])) }));
        })
        .catch((cause) => {
          if (mounted) setError(cause instanceof Error ? cause.message : 'Unable to load services');
        })
        .finally(() => {
          if (mounted) setBusy(false);
        });
    }, 200);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [q, page]);
  useEffect(() => {
    let mounted = true;
    void Promise.all(
      ids.map(async (id) => {
        try {
          return (await cmsApi(`services/${id}`)) as ServiceOption;
        } catch {
          return null;
        }
      }),
    ).then((rows) => {
      if (mounted)
        setKnown((old) => ({
          ...old,
          ...Object.fromEntries(rows.filter((r) => r !== null).map((r) => [r.id, r])),
        }));
    });
    return () => {
      mounted = false;
    };
  }, [ids]);
  const name = (r: ServiceOption) =>
    r.translations.find((t) => t.locale === locale)?.title ?? r.translations[0]?.title ?? r.slug;
  const move = (index: number, delta: number) => {
    const next = [...ids];
    [next[index], next[index + delta]] = [next[index + delta]!, next[index]!];
    onChange(next);
  };
  return (
    <section className="solution-service-picker" aria-label="Included services">
      <h3>Included services</h3>
      <p>
        Reference existing technical capabilities. Only active services with a published translation
        appear publicly.
      </p>
      <Input
        label="Find services to include"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
        maxLength={120}
      />
      {busy && <p role="status">Loading services…</p>}
      {error && <p role="alert">{error}</p>}
      <div role="group" aria-label="Available services" className="solution-service-options">
        {items.map((r) => (
          <Checkbox
            key={r.id}
            disabled={disabled || (!ids.includes(r.id) && ids.length >= 40)}
            label={`${name(r)}${r.active ? '' : ' · inactive'}`}
            checked={ids.includes(r.id)}
            onChange={(e) =>
              onChange(e.target.checked ? [...ids, r.id] : ids.filter((id) => id !== r.id))
            }
          />
        ))}
        {!busy && !items.length && <p>No matching services.</p>}
      </div>
      <div className="cms-pager">
        <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous services
        </Button>
        <span>{page}</span>
        <Button variant="ghost" disabled={page * 8 >= total} onClick={() => setPage(page + 1)}>
          Next services
        </Button>
      </div>
      <ol className="solution-selected-services">
        {ids.map((id, i) => (
          <li key={id}>
            <span>{known[id] ? name(known[id]) : id}</span>
            <div>
              <Button
                variant="ghost"
                disabled={disabled || i === 0}
                onClick={() => move(i, -1)}
                aria-label={`Move service ${i + 1} up`}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                disabled={disabled || i === ids.length - 1}
                onClick={() => move(i, 1)}
                aria-label={`Move service ${i + 1} down`}
              >
                ↓
              </Button>
              <Button
                variant="outline"
                disabled={disabled}
                onClick={() => onChange(ids.filter((value) => value !== id))}
                aria-label={`Remove service ${i + 1}`}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
