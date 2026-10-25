'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { UIProvider, Button } from '@tevoniq/ui';
import { CmsSessionProvider, CmsLogin, useCmsSession } from '@/components/cms/session';
import { BrandLogo } from '@/components/brand-image';
import { cmsApi, can } from '@/lib/cms-client';
import { moduleResource } from '@tevoniq/validation';
export const adminNavigation = [
  ['Dashboard', ''],
  ['Homepage', 'home'],
  ['Pages', 'pages'],
  ['Services', 'services'],
  ['Solutions', 'solutions'],
  ['Industries', 'industries'],
  ['Projects', 'projects'],
  ['Blog', 'blog'],
  ['Resources', 'resources'],
  ['Team', 'team'],
  ['Partners', 'partners'],
  ['Testimonials', 'testimonials'],
  ['Careers', 'careers'],
  ['Job Applications', 'job-applications'],
  ['Leads', 'leads'],
  ['Newsletter', 'newsletter'],
  ['Media Library', 'media'],
  ['Navigation', 'navigation'],
  ['Translations', 'translations'],
  ['SEO', 'seo'],
  ['Users', 'users'],
  ['Pesto licenses', 'pesto-purchases'],
  ['Roles', 'roles'],
  ['Audit Logs', 'audit-logs'],
  ['Site Settings', 'site-settings'],
  ['Account Security', 'security'],
] as const;
function Shell({ children }: { children: ReactNode }) {
  const session = useCmsSession(),
    pathname = usePathname();
  const [menu, setMenu] = useState(false),
    [query, setQuery] = useState(''),
    [error, setError] = useState('');
  if (session.checking)
    return (
      <main className="admin-login">
        <p role="status">Opening your workspace…</p>
      </main>
    );
  if (session.sessionError)
    return (
      <main className="admin-login">
        <p role="alert">{session.sessionError}</p>
        <Button onClick={session.retrySession}>Retry</Button>
      </main>
    );
  if (!session.user)
    return (
      <main className="admin-login">
        <div className="admin-brand">
          <BrandLogo />
        </div>
        <p className="admin-eyebrow">ADMIN WORKSPACE</p>
        <h1 className="tv-h2">Welcome to TEVONIQ</h1>
        <p>Sign in to manage content and business activity.</p>
        <CmsLogin onSignedIn={session.setUser} />
      </main>
    );
  const active = adminNavigation.find(([, slug]) =>
    slug ? pathname.startsWith(`/admin/${slug}`) : pathname === '/admin',
  );
  return (
    <div className="admin-frame">
      <a href="#admin-content" className="admin-skip">
        Skip to workspace
      </a>
      <aside className="admin-sidebar" data-open={menu}>
        <Link href="/admin" className="admin-brand" aria-label="TEVONIQ dashboard">
          <BrandLogo />
        </Link>
        <p className="admin-eyebrow">WORKSPACE</p>
        <nav aria-label="Admin sections">
          {adminNavigation
            .filter(([, slug]) =>
              slug === 'pesto-purchases'
                ? ['ADMIN', 'SUPER_ADMIN'].includes(session.user!.role)
                : can(
                    session.user,
                    slug === 'security'
                      ? 'account.manage'
                      : slug === 'audit-logs'
                        ? 'audit.read'
                        : !slug || slug === 'roles'
                          ? 'workspace.read'
                          : `${moduleResource(slug)}.read`,
                  ),
            )
            .map(([label, slug]) => (
              <Link
                key={slug}
                href={`/admin${slug ? `/${slug}` : ''}`}
                aria-current={active?.[1] === slug ? 'page' : undefined}
                onClick={() => setMenu(false)}
              >
                <span className="admin-nav-mark" aria-hidden="true">
                  {label.slice(0, 1)}
                </span>
                {label}
              </Link>
            ))}
        </nav>
        <Link className="admin-site-link" href="/en">
          View website ↗
        </Link>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-button"
            aria-label="Toggle sidebar"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            ☰
          </button>
          <span className="admin-location">{active?.[0] || 'Content editor'}</span>
          <form action="/admin/search" role="search">
            <label className="admin-visually-hidden" htmlFor="admin-search">
              Search all content
            </label>
            <input
              id="admin-search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workspace…"
              maxLength={200}
            />
            <button type="submit" aria-label="Search workspace">
              Search
            </button>
          </form>
          <div className="admin-account">
            <span>
              {session.user.email || 'TEVONIQ user'}
              <small>{session.user.role.replaceAll('_', ' ')}</small>
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await cmsApi('auth/logout', 'POST', {});
                  session.setUser(null);
                } catch {
                  setError('Sign out failed. Please retry.');
                }
              }}
            >
              Sign out
            </button>
          </div>
        </header>
        {error && <p role="alert">{error}</p>}
        <div id="admin-content" tabIndex={-1} className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <CmsSessionProvider>
        <Shell>{children}</Shell>
      </CmsSessionProvider>
    </UIProvider>
  );
}
