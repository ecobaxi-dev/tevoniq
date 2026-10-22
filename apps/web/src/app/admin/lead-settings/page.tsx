'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Input, Textarea, Checkbox } from '@tevoniq/ui';
import { leadSettingsSchema } from '@tevoniq/validation';
import { cmsApi } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
type Settings = {
  notificationRecipients: string[];
  budgetRanges: { value: string; label: string }[];
  attachmentsEnabled: boolean;
  version: number;
  emailTransport?: string;
  botProtection?: string;
};
export default function Page() {
  const { user } = useCmsSession();
  const allowed = !!user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const [settings, setSettings] = useState<Settings | null>(null),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (allowed)
      void cmsApi('leads/settings')
        .then((data) => setSettings(data as Settings))
        .catch((e) => setError(e.message));
  }, [allowed]);
  if (!allowed) return <p>Administrator access required.</p>;
  return (
    <main className="admin-leads">
      <Link href="/admin/leads">← Leads</Link>
      <h1>Lead & email settings</h1>
      <p>Budget choices appear on the quote form only when configured here.</p>
      {error && <p role="alert">{error}</p>}
      {saved && <p role="status">Settings saved.</p>}
      {settings ? (
        <form
          className="lead-settings-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            setError('');
            setSaved(false);
            const parsed = leadSettingsSchema.safeParse({
              version: settings.version,
              notificationRecipients: String(data.get('recipients'))
                .split(/[,\n]/)
                .map((v) => v.trim())
                .filter(Boolean),
              budgetRanges: settings.budgetRanges,
              attachmentsEnabled: settings.attachmentsEnabled,
            });
            if (!parsed.success) {
              setError(parsed.error.issues.map((i) => i.message).join('. '));
              return;
            }
            setBusy(true);
            try {
              const result = await cmsApi('leads/settings', 'PUT', parsed.data);
              setSettings({ ...settings, ...result } as Settings);
              setSaved(true);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Save failed');
            } finally {
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy}>
            <Textarea
              label="Notification recipients"
              name="recipients"
              defaultValue={settings.notificationRecipients.join('\n')}
              hint="One email per line, up to 10. No recipients means notification emails remain queued."
            />
            <p>
              Email transport: <strong>{settings.emailTransport || 'disabled'}</strong>. Bot
              protection: <strong>{settings.botProtection || 'disabled'}</strong>. Configure
              provider credentials and Turnstile keys in the server environment.
            </p>
            <h2>Budget choices</h2>
            {settings.budgetRanges.map((range, index) => (
              <div className="lead-budget-row" key={index}>
                <Input
                  label="Stable key"
                  value={range.value}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      budgetRanges: settings.budgetRanges.map((r, i) =>
                        i === index ? { ...r, value: e.target.value } : r,
                      ),
                    })
                  }
                />
                <Input
                  label="Public label"
                  value={range.label}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      budgetRanges: settings.budgetRanges.map((r, i) =>
                        i === index ? { ...r, label: e.target.value } : r,
                      ),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      budgetRanges: settings.budgetRanges.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove option {index + 1}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              disabled={settings.budgetRanges.length >= 20}
              onClick={() =>
                setSettings({
                  ...settings,
                  budgetRanges: [...settings.budgetRanges, { value: '', label: '' }],
                })
              }
            >
              Add budget option
            </Button>
            <p>
              Removing an option hides it from future submissions. Existing leads retain their
              selected budget label.
            </p>
            <Checkbox
              label="Allow private quote attachments"
              checked={settings.attachmentsEnabled}
              onChange={(e) => setSettings({ ...settings, attachmentsEnabled: e.target.checked })}
            />
            <Button type="submit" loading={busy}>
              Save settings
            </Button>
          </fieldset>
        </form>
      ) : (
        <p>Loading settings…</p>
      )}
    </main>
  );
}
