'use client';
import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Input, Select } from '@tevoniq/ui';
import { useCmsSession } from '@/components/cms/session';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { cmsApi, CmsApiError } from '@/lib/cms-client';
import './pesto-purchases.css';

type Purchase = {
  purchaseId: string;
  reference: string;
  email: string;
  businessName: string;
  createdAt: string;
  status: 'unused' | 'activated' | 'revoked';
  revokedAt: string | null;
  consumedAt: string | null;
  activationId: string | null;
  issuedAt: string | null;
  delivery: null | {
    status: 'PENDING' | 'RUNNING' | 'SENT' | 'FAILED';
    attempts: number;
    sentAt: string | null;
  };
};
type Catalog = {
  enabled: boolean;
  page: number;
  pageSize: number;
  total: number;
  items: Purchase[];
};
type Order = { requestId: string; email: string; reference: string };
const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
const message = (error: unknown) =>
  error instanceof Error ? error.message : 'The request could not be completed. Please retry.';
export default function PestoPurchases() {
  const { user, checking } = useCmsSession();
  if (checking) return <p role="status">Opening licensing workspace…</p>;
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role))
    return (
      <main className="pesto-console">
        <h1>Access restricted</h1>
        <p>Purchase keys are available to company administrators only.</p>
      </main>
    );
  return <PurchaseConsole key={`${user.id}:${user.role}`} />;
}
function PurchaseConsole() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState(''),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState('all'),
    [page, setPage] = useState(1),
    [refresh, setRefresh] = useState(0);
  const [email, setEmail] = useState(''),
    [reference, setReference] = useState(''),
    [paid, setPaid] = useState(false);
  const [order, setOrder] = useState<Order | null>(null),
    [busy, setBusy] = useState(false),
    [issueError, setIssueError] = useState('');
  const [revealed, setRevealed] = useState<{ purchaseKey: string; email: string } | null>(null),
    [copied, setCopied] = useState(false);
  const mounted = useRef(true),
    submitting = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setLoading(true);
        setError('');
      }
    });
    void cmsApi(
      `pesto/purchases?${new URLSearchParams({ search: query, status, page: String(page) })}`,
    )
      .then((result) => {
        if (active) setCatalog(result as Catalog);
      })
      .catch((cause) => {
        if (active) {
          setError(message(cause));
          setCatalog(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, status, page, refresh]);
  const enabled = !!catalog?.enabled && !loading;
  async function issue() {
    if (submitting.current || !enabled || revealed) return;
    const request = order || {
      requestId: crypto.randomUUID(),
      email: email.trim().toLowerCase(),
      reference: reference.trim(),
    };
    submitting.current = true;
    setOrder(request);
    setBusy(true);
    setIssueError('');
    try {
      const result = await cmsApi('pesto/purchases', 'POST', request);
      if (mounted.current) {
        setRevealed(result as { purchaseKey: string; email: string });
        setRefresh((n) => n + 1);
      }
    } catch (cause) {
      if (mounted.current) setIssueError(message(cause));
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  function dismiss() {
    setRevealed(null);
    setCopied(false);
    setOrder(null);
    setIssueError('');
    setEmail('');
    setReference('');
    setPaid(false);
  }
  return (
    <main className="pesto-console">
      <header className="pesto-console-heading">
        <div>
          <p className="pesto-console-eyebrow">PESTO / LICENSING</p>
          <h1>Purchase keys</h1>
          <p>One purchase. A verified customer. A traceable activation.</p>
        </div>
        <span className="pesto-console-edition">
          LITE <span>2 users · 2 devices</span>
        </span>
      </header>
      {catalog && !catalog.enabled && (
        <aside className="pesto-console-notice">
          <strong>Purchase activation is being prepared</strong>
          <p>
            Existing records remain visible. Issuing and revoking keys will become available when
            the activation service is enabled.
          </p>
        </aside>
      )}
      <section className="pesto-console-issue" aria-labelledby="issue-title">
        <div className="pesto-console-section-intro">
          <span className="pesto-console-step">01</span>
          <div>
            <h2 id="issue-title">Issue a purchase key</h2>
            <p>
              Use the customer’s verified registration email. Share the key with them after
              confirming payment.
            </p>
          </div>
        </div>
        {revealed ? (
          <div className="pesto-console-reveal" aria-live="polite">
            <p className="pesto-console-eyebrow">KEY READY — SHARE SECURELY</p>
            <h3>Purchase key for {revealed.email}</h3>
            <p>This key is shown in this session only. It has not been emailed automatically.</p>
            <code dir="ltr">{revealed.purchaseKey}</code>
            <div className="pesto-console-actions">
              <Button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(revealed.purchaseKey);
                    setCopied(true);
                  } catch {
                    setIssueError('Clipboard unavailable. Select and copy the key manually.');
                  }
                }}
              >
                {copied ? 'Copied' : 'Copy purchase key'}
              </Button>
              <Button variant="secondary" onClick={dismiss}>
                Dismiss key
              </Button>
            </div>
            {issueError && <p role="alert">{issueError}</p>}
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void issue();
            }}
          >
            <fieldset disabled={!enabled || !!order || busy}>
              <div className="pesto-console-fields">
                <Input
                  label="Verified customer email"
                  type="email"
                  required
                  autoComplete="off"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="owner@restaurant.com"
                />
                <Input
                  label="Order / payment reference"
                  required
                  maxLength={120}
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="e.g. TEV-2026-0042"
                  autoComplete="off"
                />
              </div>
              <Checkbox
                label="I have confirmed payment for this customer and order."
                checked={paid}
                onChange={(event) => setPaid(event.target.checked)}
              />
            </fieldset>
            {order && (
              <p className="pesto-console-retry">
                This request is locked to {order.email} / {order.reference}. Retry uses the same
                order ID and cannot issue a duplicate key.
                <br />
                Request ID: <code>{order.requestId}</code>
              </p>
            )}
            {issueError && (
              <p role="alert" className="pesto-console-error">
                {issueError}
              </p>
            )}
            <div className="pesto-console-actions">
              <Button
                type="submit"
                loading={busy}
                disabled={!enabled || !paid || !email.trim() || !reference.trim()}
              >
                {order ? 'Retry same request' : 'Issue purchase key'}
              </Button>
              {order && !busy && (
                <ConfirmAction
                  label="Start a different order"
                  title="Leave this issuance request?"
                  description="This does not cancel a purchase that may already have been created. First review purchase history for this email and reference. Starting a new order can create an additional key."
                  onConfirm={async () => {
                    dismiss();
                  }}
                />
              )}
              <span>Operating permits go only to the verified email after activation.</span>
            </div>
          </form>
        )}
      </section>
      <section className="pesto-console-history" aria-labelledby="history-title">
        {actionError && (
          <p role="alert" className="pesto-console-error">
            {actionError}
          </p>
        )}
        <div className="pesto-console-history-heading">
          <div className="pesto-console-section-intro">
            <span className="pesto-console-step">02</span>
            <div>
              <h2 id="history-title">Purchase history</h2>
              <p>Follow each key from issue to activation and email acceptance.</p>
            </div>
          </div>
          <Button variant="secondary" disabled={loading} onClick={() => setRefresh((n) => n + 1)}>
            Refresh records
          </Button>
        </div>
        <form
          className="pesto-console-filters"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setQuery(search.trim());
          }}
        >
          <Input
            label="Search customer or reference"
            value={search}
            maxLength={120}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Email, restaurant or order reference"
          />
          <Select
            label="Purchase status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All purchases</option>
            <option value="unused">Unused keys</option>
            <option value="activated">Activated</option>
            <option value="revoked">Revoked</option>
          </Select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        {loading ? (
          <div className="pesto-console-empty" role="status">
            Loading purchase records…
          </div>
        ) : error ? (
          <div className="pesto-console-empty">
            <p role="alert" className="pesto-console-error">
              {error}
            </p>
            <Button variant="secondary" onClick={() => setRefresh((n) => n + 1)}>
              Try again
            </Button>
          </div>
        ) : !catalog?.items.length ? (
          <div className="pesto-console-empty">
            <strong>
              {query || status !== 'all' ? 'No matching purchases' : 'No purchase keys yet'}
            </strong>
            <p>
              {query || status !== 'all'
                ? 'Try another customer, reference or status.'
                : 'Issued keys will appear here with their activation and email status.'}
            </p>
          </div>
        ) : (
          <div className="pesto-console-records">
            {catalog.items.map((item) => (
              <article className="pesto-console-record" key={item.purchaseId}>
                <div className="pesto-console-customer">
                  <h3>{item.businessName || 'Registered customer'}</h3>
                  <p>{item.email}</p>
                  <span className="pesto-console-reference">{item.reference}</span>
                  <small>Issued {date(item.createdAt)}</small>
                </div>
                <div className="pesto-console-trail">
                  <div>
                    <span className={`pesto-console-badge is-${item.status}`}>
                      {item.status === 'unused'
                        ? 'Unused key'
                        : item.status === 'activated'
                          ? 'Activated'
                          : 'Revoked'}
                    </span>
                    <small>
                      {item.status === 'revoked'
                        ? date(item.revokedAt)
                        : item.status === 'activated'
                          ? date(item.issuedAt)
                          : 'Awaiting customer activation'}
                    </small>
                  </div>
                  <span className="pesto-console-trail-arrow" aria-hidden="true">
                    →
                  </span>
                  <div>
                    <span className={`pesto-console-badge mail-${item.delivery?.status || 'NONE'}`}>
                      {item.delivery?.status === 'SENT'
                        ? 'Email accepted'
                        : item.delivery?.status === 'FAILED'
                          ? 'Email needs attention'
                          : item.delivery?.status === 'RUNNING'
                            ? 'Sending email'
                            : item.delivery?.status === 'PENDING'
                              ? 'Email queued'
                              : 'No operating permit'}
                    </span>
                    <small>
                      {item.delivery?.status === 'SENT'
                        ? `Provider accepted · ${date(item.delivery.sentAt)}`
                        : item.delivery?.status === 'FAILED'
                          ? 'Contact support to investigate delivery.'
                          : item.delivery
                            ? `${item.delivery.attempts} delivery attempt${item.delivery.attempts === 1 ? '' : 's'}`
                            : 'Created after activation'}
                    </small>
                  </div>
                </div>
                <div className="pesto-console-record-action">
                  {item.status === 'unused' ? (
                    <ConfirmAction
                      label="Revoke key"
                      title="Revoke this unused key?"
                      description={`The key for ${item.email}, order ${item.reference}, will no longer activate Pesto. This does not delete the purchase record.`}
                      disabled={!enabled}
                      onConfirm={async () => {
                        try {
                          await cmsApi(`pesto/purchases/${item.purchaseId}/revoke`, 'POST', {});
                        } catch (cause) {
                          if (mounted.current) {
                            setActionError(
                              cause instanceof CmsApiError && cause.status === 409
                                ? 'This key changed or was activated. Records have been refreshed; review its current status.'
                                : message(cause),
                            );
                            setRefresh((n) => n + 1);
                          }
                          throw new Error(
                            cause instanceof CmsApiError && cause.status === 409
                              ? 'This key changed or was activated. Records have been refreshed; review its current status.'
                              : message(cause),
                          );
                        }
                        if (mounted.current) setRefresh((n) => n + 1);
                      }}
                    />
                  ) : (
                    <span>{item.status === 'activated' ? 'License retained' : 'Key blocked'}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {catalog && !loading && !error && (
          <footer className="pesto-console-pagination">
            <span>
              {catalog.total} purchase{catalog.total === 1 ? '' : 's'} · Page {page} of{' '}
              {Math.max(1, Math.ceil(catalog.total / catalog.pageSize))}
            </span>
            <div>
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((n) => n - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page * catalog.pageSize >= catalog.total}
                onClick={() => setPage((n) => n + 1)}
              >
                Next
              </Button>
            </div>
          </footer>
        )}
      </section>
      <p className="pesto-console-footnote">
        Email accepted means the provider accepted the message; it does not confirm delivery to the
        inbox. Activated licenses cannot be revoked here.
      </p>
    </main>
  );
}
