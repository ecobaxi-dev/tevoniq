'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@tevoniq/ui';
import { useCmsSession } from '@/components/cms/session';
import { cmsApi } from '@/lib/cms-client';
import './pesto-customers.css';

type Contact = {
  id: string;
  kind: 'verified' | 'pending';
  email: string;
  managerName: string;
  businessName: string;
  country: string;
  phone: string;
  language: string;
  registeredAt: string;
  verifiedAt: string | null;
  lastActivityAt: string;
  status: string;
  registrationCount: number;
  trialCount: number;
  purchaseCount: number;
  licenseCount: number;
  unusedPurchaseKeys: number;
  latestTrialExpiresAt: string | null;
  latestPurchaseAt: string | null;
  latestLicenseAt: string | null;
};
type Catalog = {
  asOf: string;
  page: number;
  pageSize: number;
  total: number;
  items: Contact[];
  summary: {
    totalContacts: number;
    verifiedCustomers: number;
    pendingContacts: number;
    activeTrials: number;
    expiredTrials: number;
    licensedCustomers: number;
    unusedPurchaseKeys: number;
  };
};
type Detail = {
  asOf: string;
  customer: Contact;
  historyLimit: number;
  counts: { registrations: number; trials: number; purchases: number; licenses: number };
  registrations: {
    id: string;
    createdAt: string;
    verifiedAt: string | null;
    expiresAt: string;
    deliveryStatus: string;
    deliveryAttempts: number;
    sentAt: string | null;
    consentAt: string;
    consentVersion: string;
    profile: Pick<Contact, 'managerName' | 'businessName' | 'country' | 'phone' | 'language'>;
  }[];
  trials: { id: string; issuedAt: string; expiresAt: string; status: string }[];
  purchases: {
    id: string;
    reference: string;
    createdAt: string;
    consumedAt: string | null;
    revokedAt: string | null;
    status: string;
    licenseId: string | null;
  }[];
  licenses: {
    id: string;
    purchaseId: string;
    reference: string;
    issuedAt: string;
    delivery: null | { status: string; attempts: number; sentAt: string | null };
  }[];
};
const statusNames: Record<string, string> = {
  pending: 'Email unverified',
  verified: 'Verified · no trial',
  'trial-active': 'Trial active',
  'trial-expired': 'Trial expired',
  licensed: 'Operating license issued',
};
const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
const failure = (error: unknown) =>
  error instanceof Error ? error.message : 'Report unavailable. Please retry.';
const blank = { search: '', status: 'all', country: '', from: '', to: '' };
function Badge({ status }: { status: string }) {
  return (
    <span className="pcr-badge" data-status={status}>
      {statusNames[status] || status}
    </span>
  );
}
export default function PestoCustomers() {
  const { user, checking } = useCmsSession();
  if (checking) return <p role="status">Opening customer reports…</p>;
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role))
    return (
      <main className="pcr">
        <h1>Access restricted</h1>
        <p>Customer reports are available to company administrators only.</p>
      </main>
    );
  return <CustomerReport key={`${user.id}:${user.role}`} />;
}
function CustomerReport() {
  const [draft, setDraft] = useState(blank),
    [filters, setFilters] = useState(blank);
  const [page, setPage] = useState(1),
    [refresh, setRefresh] = useState(0);
  const [catalog, setCatalog] = useState<Catalog | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null),
    [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false),
    [detailError, setDetailError] = useState(''),
    [detailRefresh, setDetailRefresh] = useState(0);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setLoading(true);
        setError('');
        setCatalog(null);
      }
    });
    const query = new URLSearchParams({ status: filters.status, page: String(page) });
    for (const [name, value] of Object.entries(filters)) if (value) query.set(name, value);
    void cmsApi(`pesto/customers?${query}`)
      .then((data) => {
        if (active) setCatalog(data as unknown as Catalog);
      })
      .catch((e: unknown) => {
        if (active) setError(failure(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, page, refresh]);
  useEffect(() => {
    let active = true;
    if (!selected) return;
    queueMicrotask(() => {
      if (active) {
        setDetail(null);
        setDetailError('');
        setDetailLoading(true);
        detailHeading.current?.focus();
      }
    });
    void cmsApi(`pesto/customers/${selected.kind}/${selected.id}`)
      .then((data) => {
        if (active) setDetail(data as unknown as Detail);
      })
      .catch((e: unknown) => {
        if (active) setDetailError(failure(e));
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selected, detailRefresh]);
  function closeDetail() {
    setSelected(null);
    setDetail(null);
    setDetailError('');
  }
  const metrics = catalog && [
    ['All contacts', catalog.summary.totalContacts],
    ['Verified', catalog.summary.verifiedCustomers],
    ['Email unverified', catalog.summary.pendingContacts],
    ['Active trials', catalog.summary.activeTrials],
    ['Expired trials', catalog.summary.expiredTrials],
    ['Licensed customers', catalog.summary.licensedCustomers],
    ['Unused purchase keys', catalog.summary.unusedPurchaseKeys],
  ];
  return (
    <main className="pcr">
      <header className="pcr-heading">
        <div>
          <p className="pcr-eyebrow">PESTO · CUSTOMER INTELLIGENCE</p>
          <h1>Customer reports</h1>
          <p>From first registration to operating license, in one customer record.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setRefresh((v) => v + 1);
            if (selected) setDetailRefresh((v) => v + 1);
          }}
        >
          Refresh report
        </Button>
      </header>
      <section className="pcr-summary" aria-label="Global portfolio summary">
        <div className="pcr-section-label">
          <h2>Portfolio overview</h2>
          <span>All contacts · independent of filters</span>
        </div>
        {metrics ? (
          <dl className="pcr-metrics">
            {metrics.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p>{loading ? 'Loading portfolio…' : 'Portfolio unavailable.'}</p>
        )}
      </section>
      <section className="pcr-ledger" aria-labelledby="pcr-ledger-title">
        <div className="pcr-section-label">
          <h2 id="pcr-ledger-title">Customer ledger</h2>
          <span>One record per email · multiple devices and requests may belong to a customer</span>
        </div>
        <form
          className="pcr-filters"
          onSubmit={(event) => {
            event.preventDefault();
            closeDetail();
            setPage(1);
            setFilters({
              ...draft,
              country: draft.country.toUpperCase().trim(),
              search: draft.search.trim(),
            });
          }}
        >
          <label className="pcr-search">
            Search customer or reference
            <input
              value={draft.search}
              maxLength={120}
              placeholder="Name, restaurant, email, phone or order reference"
              onChange={(e) => setDraft({ ...draft, search: e.target.value })}
            />
          </label>
          <label>
            Customer status
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            >
              <option value="all">All statuses</option>
              {Object.entries(statusNames).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Country code
            <input
              value={draft.country}
              maxLength={2}
              pattern="[a-zA-Z]{2}|"
              placeholder="SA"
              onChange={(e) => setDraft({ ...draft, country: e.target.value })}
            />
          </label>
          <label>
            Registered from (UTC)
            <input
              type="date"
              value={draft.from}
              max={draft.to || undefined}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
            />
          </label>
          <label>
            Registered to (UTC)
            <input
              type="date"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            />
          </label>
          <div className="pcr-filter-actions">
            <Button type="submit">Apply filters</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                closeDetail();
                setDraft(blank);
                setFilters(blank);
                setPage(1);
                setRefresh((v) => v + 1);
              }}
            >
              Clear filters
            </Button>
          </div>
        </form>
        <p className="pcr-note">
          Registration dates include the full selected UTC days. Other dates below use your
          browser’s local time.
        </p>
        {loading && (
          <p role="status" className="pcr-state">
            Loading customer records…
          </p>
        )}
        {error && (
          <div className="pcr-state" role="alert">
            <p>{error}</p>
            <Button onClick={() => setRefresh((v) => v + 1)}>Retry report</Button>
          </div>
        )}
        {catalog && (
          <>
            <div className="pcr-results">
              <strong>
                {catalog.total} matching {catalog.total === 1 ? 'contact' : 'contacts'}
              </strong>
              <span>As of {formatDate(catalog.asOf)}</span>
            </div>
            {!catalog.items.length ? (
              <div className="pcr-state">
                <h3>No matching customers</h3>
                <p>Try another name, status or registration date range.</p>
              </div>
            ) : (
              <div className="pcr-contacts">
                {catalog.items.map((contact) => (
                  <article className="pcr-contact" key={`${contact.kind}:${contact.id}`}>
                    <div className="pcr-profile">
                      <h3>{contact.businessName}</h3>
                      <p>{contact.managerName}</p>
                      <span dir="ltr">{contact.email}</span>
                      <small dir="ltr">
                        {contact.phone} · {contact.country} · {contact.language.toUpperCase()}
                      </small>
                    </div>
                    <div className="pcr-stage">
                      <Badge status={contact.status} />
                      <span>Registered {formatDate(contact.registeredAt)}</span>
                      <span>Last activity {formatDate(contact.lastActivityAt)}</span>
                      {contact.latestTrialExpiresAt && (
                        <span>Trial ends {formatDate(contact.latestTrialExpiresAt)}</span>
                      )}
                    </div>
                    <dl className="pcr-counts">
                      <div>
                        <dt>Requests</dt>
                        <dd>{contact.registrationCount}</dd>
                      </div>
                      <div>
                        <dt>Trials</dt>
                        <dd>{contact.trialCount}</dd>
                      </div>
                      <div>
                        <dt>Keys issued</dt>
                        <dd>{contact.purchaseCount}</dd>
                      </div>
                      <div>
                        <dt>Licenses</dt>
                        <dd>{contact.licenseCount}</dd>
                      </div>
                    </dl>
                    <Button
                      variant="secondary"
                      aria-label={`View customer ${contact.businessName}`}
                      onClick={() => {
                        setDetail(null);
                        setDetailError('');
                        setDetailLoading(true);
                        setSelected({ ...contact });
                      }}
                    >
                      View customer
                    </Button>
                  </article>
                ))}
              </div>
            )}
            <nav className="pcr-pagination" aria-label="Customer report pages">
              <span>
                Page {catalog.page} of {Math.max(1, Math.ceil(catalog.total / catalog.pageSize))}
              </span>
              <div>
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => {
                    closeDetail();
                    setPage((v) => v - 1);
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={page * catalog.pageSize >= catalog.total}
                  onClick={() => {
                    closeDetail();
                    setPage((v) => v + 1);
                  }}
                >
                  Next
                </Button>
              </div>
            </nav>
          </>
        )}
      </section>
      {selected && (
        <section className="pcr-detail" aria-labelledby="pcr-detail-title">
          <header className="pcr-section-label">
            <div>
              <p className="pcr-eyebrow">CUSTOMER RECORD</p>
              <h2 id="pcr-detail-title" ref={detailHeading} tabIndex={-1}>
                {detail?.customer.businessName || selected.businessName}
              </h2>
            </div>
            <Button variant="secondary" onClick={closeDetail}>
              Close customer
            </Button>
          </header>
          {detailLoading && <p role="status">Loading customer history…</p>}
          {detailError && (
            <div role="alert">
              <p>{detailError}</p>
              <Button onClick={() => setDetailRefresh((v) => v + 1)}>Retry customer</Button>
            </div>
          )}
          {detail && (
            <>
              <dl className="pcr-detail-profile">
                <div>
                  <dt>Owner / manager</dt>
                  <dd>{detail.customer.managerName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd dir="ltr">{detail.customer.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd dir="ltr">{detail.customer.phone}</dd>
                </div>
                <div>
                  <dt>Country / language</dt>
                  <dd>
                    {detail.customer.country} / {detail.customer.language.toUpperCase()}
                  </dd>
                </div>
                <div>
                  <dt>First registered</dt>
                  <dd>{formatDate(detail.customer.registeredAt)}</dd>
                </div>
                <div>
                  <dt>Email verified</dt>
                  <dd>{formatDate(detail.customer.verifiedAt)}</dd>
                </div>
              </dl>
              <Badge status={detail.customer.status} />
              <p className="pcr-note">
                History as of {formatDate(detail.asOf)}. Each section shows up to the newest{' '}
                {detail.historyLimit} records.
              </p>
              <History
                title="Registration requests"
                total={detail.counts.registrations}
                shown={detail.registrations.length}
              >
                {detail.registrations.map((r) => (
                  <article key={r.id}>
                    <h4>{formatDate(r.createdAt)}</h4>
                    <p>
                      {r.verifiedAt
                        ? `Email verified ${formatDate(r.verifiedAt)}`
                        : `Awaiting email verification · request expires ${formatDate(r.expiresAt)}`}
                    </p>
                    <p>
                      {r.profile.managerName} · {r.profile.businessName} · {r.profile.country} ·{' '}
                      <bdi>{r.profile.phone}</bdi> · {r.profile.language}
                    </p>
                    <p>
                      Consent {r.consentVersion} · {formatDate(r.consentAt)}
                    </p>
                    <EmailStatus
                      status={r.deliveryStatus}
                      attempts={r.deliveryAttempts}
                      sentAt={r.sentAt}
                    />
                  </article>
                ))}
              </History>
              <History
                title="Trial permits"
                total={detail.counts.trials}
                shown={detail.trials.length}
              >
                {detail.trials.map((r) => (
                  <article key={r.id}>
                    <h4>{r.status === 'active' ? 'Active trial' : 'Expired trial'}</h4>
                    <p>
                      Issued {formatDate(r.issuedAt)} · Ends {formatDate(r.expiresAt)}
                    </p>
                  </article>
                ))}
              </History>
              <History
                title="Purchase keys"
                total={detail.counts.purchases}
                shown={detail.purchases.length}
              >
                {detail.purchases.map((r) => (
                  <article key={r.id}>
                    <h4>{r.reference}</h4>
                    <p>
                      Key issued {formatDate(r.createdAt)} ·{' '}
                      {r.status === 'activated'
                        ? 'Used for activation'
                        : r.status === 'revoked'
                          ? 'Revoked'
                          : 'Unused'}
                    </p>
                    {r.consumedAt && <p>Used {formatDate(r.consumedAt)}</p>}
                    {r.revokedAt && <p>Revoked {formatDate(r.revokedAt)}</p>}
                  </article>
                ))}
              </History>
              <p className="pcr-note">
                Key issuance is not a payment ledger. Payment amounts and payment methods are not
                recorded here.
              </p>
              <Link href="/admin/pesto-purchases" className="pcr-link">
                Manage purchase keys →
              </Link>
              <History
                title="Operating licenses"
                total={detail.counts.licenses}
                shown={detail.licenses.length}
              >
                {detail.licenses.map((r) => (
                  <article key={r.id}>
                    <h4>Issued centrally · {r.reference}</h4>
                    <p>Issued {formatDate(r.issuedAt)}</p>
                    <EmailStatus
                      status={r.delivery?.status}
                      attempts={r.delivery?.attempts}
                      sentAt={r.delivery?.sentAt}
                    />
                  </article>
                ))}
              </History>
              <p className="pcr-note">
                An issued license does not confirm it was imported on the restaurant computer.
                “Provider accepted” confirms mail-provider acceptance, not inbox delivery.
              </p>
            </>
          )}
        </section>
      )}
    </main>
  );
}
function History({
  title,
  total,
  shown,
  children,
}: {
  title: string;
  total: number;
  shown: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pcr-history">
      <div className="pcr-section-label">
        <h3>{title}</h3>
        <span>{total} total</span>
      </div>
      {total > shown && (
        <p className="pcr-note">
          Showing the newest {shown} of {total} records.
        </p>
      )}
      {shown ? (
        <div className="pcr-history-list">{children}</div>
      ) : (
        <p className="pcr-empty">No records yet.</p>
      )}
    </section>
  );
}
function EmailStatus({
  status,
  attempts,
  sentAt,
}: {
  status: string | undefined;
  attempts: number | undefined;
  sentAt: string | null | undefined;
}) {
  return (
    <p className="pcr-email">
      {status === 'SENT'
        ? `Provider accepted · ${formatDate(sentAt || null)}`
        : status
          ? `Email ${status.toLowerCase()}`
          : 'No email delivery record'}
      {attempts !== undefined && ` · ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}`}
    </p>
  );
}
