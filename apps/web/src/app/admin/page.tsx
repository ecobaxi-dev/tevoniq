'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cmsApi } from '@/lib/cms-client';
import { Button } from '@tevoniq/ui';
type Card = { label: string; value: number | null; href: string };
export default function Dashboard() {
  const [cards, setCards] = useState<Card[] | null>(null),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0),
    [loading, setLoading] = useState(true),
    [updatedAt, setUpdatedAt] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    cmsApi('admin/dashboard')
      .then((r) => {
        if (active) {
          setCards(r.cards as Card[]);
          setError('');
          setUpdatedAt(new Date().toLocaleTimeString('en-GB'));
        }
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Dashboard unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <main>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">YOUR WORKSPACE, AT A GLANCE</p>
          <h1>Dashboard</h1>
          <p>Content, conversations, and business activity.</p>
        </div>
        <div>
          <Button
            variant="secondary"
            loading={loading}
            onClick={() => {
              setLoading(true);
              setError('');
              setAttempt((a) => a + 1);
            }}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
          <p role="status">
            {loading ? 'Updating dashboard…' : updatedAt ? `Dashboard updated at ${updatedAt}` : ''}
          </p>
        </div>
      </div>
      {error ? (
        <p role="alert">{error}</p>
      ) : !cards ? (
        <p role="status">Loading dashboard…</p>
      ) : (
        <div className="admin-metrics">
          {cards.map((card, i) => (
            <div className="admin-metric" key={card.label}>
              <span className="admin-metric-icon" aria-hidden="true">
                {['↗', '◎', '✉', '▤', '⊕', '▧', '◈', '✎'][i]}
              </span>
              <p>{card.label}</p>
              <strong>
                {card.value === null ? '—' : new Intl.NumberFormat('en').format(card.value)}
              </strong>
              {card.value === null ? (
                <small>Administrator access required</small>
              ) : (
                <Link href={card.href}>View records →</Link>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="admin-dashboard-bottom">
        <section className="admin-panel">
          <h2>Content workspace</h2>
          <p>Review drafts, update company information, and publish your next article.</p>
          <div className="admin-quick-links">
            <Link href="/admin/pages">Manage pages →</Link>
            <Link href="/admin/insights">Open article editor →</Link>
            <Link href="/admin/search?status=draft">Review drafts →</Link>
          </div>
        </section>
        <section className="admin-panel">
          <h2>Activity & recovery</h2>
          <p>Review recorded changes and restore archived catalog records.</p>
          <div className="admin-quick-links">
            <Link href="/admin/audit-logs">Audit logs →</Link>
            <Link href="/admin/trash">Archived catalog records →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
