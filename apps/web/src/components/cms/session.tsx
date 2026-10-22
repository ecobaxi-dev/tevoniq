'use client';
import Link from 'next/link';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Input, Button } from '@tevoniq/ui';
import { cmsApi, CmsApiError } from '@/lib/cms-client';
export type CmsUser = {
  id: string;
  role: string;
  email?: string;
  permissions?: string[];
  lastLoginAt?: string | null;
};
const SessionContext = createContext<ReturnType<typeof useLocalCmsSession> | null>(null);
export function CmsSessionProvider({ children }: { children: ReactNode }) {
  const session = useLocalCmsSession();
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
export function useCmsSession() {
  const shared = useContext(SessionContext);
  const local = useLocalCmsSession(!shared);
  return shared || local;
}
function useLocalCmsSession(enabled = true) {
  const [user, setUser] = useState<CmsUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const expired = () => setUser(null);
    window.addEventListener('cms-session-expired', expired);
    return () => window.removeEventListener('cms-session-expired', expired);
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    void cmsApi('auth/me')
      .then((data) => {
        if (mounted) setUser(data as CmsUser);
      })
      .catch((error: unknown) => {
        if (mounted && !(error instanceof CmsApiError && error.status === 401))
          setSessionError(
            error instanceof Error ? error.message : 'CMS is temporarily unavailable',
          );
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, [attempt, enabled]);
  const retrySession = () => {
    setChecking(true);
    setSessionError('');
    setAttempt((n) => n + 1);
  };
  return { user, setUser, checking, sessionError, retrySession };
}
export function CmsLogin({ onSignedIn }: { onSignedIn: (user: CmsUser) => void }) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="cms-login"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setBusy(true);
        setError('');
        try {
          await cmsApi('auth/login', 'POST', {
            email: form.get('email'),
            password: form.get('password'),
          });
          onSignedIn((await cmsApi('auth/me')) as CmsUser);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Sign in failed');
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Administrator sign in</h2>
      <Input label="Email" name="email" type="email" autoComplete="username" required />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={128}
      />
      <Button type="submit" loading={busy}>
        Sign in
      </Button>
      <Link href="/auth/forgot-password">Forgot password?</Link>
      {error && (
        <p role="alert" className="cms-error">
          {error}
        </p>
      )}
    </form>
  );
}
