'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button, Input } from '@tevoniq/ui';
import { cmsApi } from '@/lib/cms-client';
export function PasswordRecovery({ reset = false }: { reset?: boolean }) {
  const resetToken = useRef<string | null>(null);
  const [token, setToken] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  useEffect(() => {
    if (!reset) return;
    resetToken.current ??= new URLSearchParams(window.location.hash.slice(1)).get('reset') ?? '';
    const value = resetToken.current;
    window.history.replaceState(null, '', window.location.pathname);
    const timer = setTimeout(() => setToken(value), 0);
    return () => clearTimeout(timer);
  }, [reset]);
  return (
    <main className="admin-login">
      <form
        className="cms-login"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setBusy(true);
          setError('');
          try {
            const data = await cmsApi(
              reset ? 'auth/reset-password' : 'auth/forgot-password',
              'POST',
              reset
                ? { token, password: form.get('password'), confirmation: form.get('confirmation') }
                : { email: form.get('email') },
            );
            setMessage(String(data.message));
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Please try again.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1>{reset ? 'Choose a new password' : 'Reset your password'}</h1>
        {message ? (
          <p role="status">{message}</p>
        ) : (
          <>
            {reset ? (
              <>
                <p>Use 15–128 characters. All existing sessions will be signed out.</p>
                <Input
                  label="New password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={15}
                  maxLength={128}
                  required
                />
                <Input
                  label="Confirm new password"
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  minLength={15}
                  maxLength={128}
                  required
                />
              </>
            ) : (
              <Input
                label="Account email"
                name="email"
                type="email"
                autoComplete="username"
                maxLength={254}
                required
              />
            )}
            <Button type="submit" loading={busy} disabled={reset && !token}>
              {reset ? 'Save password' : 'Send reset instructions'}
            </Button>
            {reset && !token && <p>Open the reset link from your email, or request a new one.</p>}
          </>
        )}
        {error && <p role="alert">{error}</p>}
        <Link href="/admin">Back to sign in</Link>
        {reset && <Link href="/auth/forgot-password">Request a new reset link</Link>}
      </form>
    </main>
  );
}
