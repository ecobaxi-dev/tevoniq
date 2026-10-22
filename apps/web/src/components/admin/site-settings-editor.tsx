'use client';
/* eslint-disable @next/next/no-img-element -- Validated CMS image URLs. */
import { useEffect, useState } from 'react';
import { Button, Input, Textarea, Select } from '@tevoniq/ui';
import {
  siteSettingsSchema,
  settingsGroups,
  type SiteSettings,
  type SettingsGroup,
} from '@tevoniq/validation';
import { useCmsSession } from '@/components/cms/session';
import { cmsApi, can } from '@/lib/cms-client';
import { MediaPicker } from '@/components/media/media-picker';
import './site-settings.css';

type Field = {
  key: string;
  label: string;
  type?: 'textarea' | 'email' | 'number' | 'boolean' | 'image' | 'recipients';
  help?: string;
};
const fields: Record<SettingsGroup, Field[]> = {
  general: [
    { key: 'siteName', label: 'Site name' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'legalCompanyName', label: 'Legal company name' },
    { key: 'descriptionEn', label: 'Company description — English', type: 'textarea' },
    { key: 'descriptionTr', label: 'Company description — Turkish', type: 'textarea' },
    { key: 'descriptionAr', label: 'Company description — Arabic', type: 'textarea' },
  ],
  brand: [
    { key: 'logo', label: 'Primary logo', type: 'image' },
    { key: 'logoLight', label: 'Logo for dark backgrounds', type: 'image' },
    { key: 'logoDark', label: 'Logo for light backgrounds', type: 'image' },
    { key: 'favicon', label: 'Favicon', type: 'image' },
    { key: 'brandIcon', label: 'Brand icon / app icon', type: 'image' },
  ],
  contact: [
    { key: 'email', label: 'Public email', type: 'email' },
    { key: 'salesEmail', label: 'Sales email', type: 'email' },
    { key: 'supportEmail', label: 'Support email', type: 'email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'whatsApp',
      label: 'WhatsApp number',
      help: 'International number including + and country code.',
    },
    { key: 'streetAddress', label: 'Street address' },
    { key: 'city', label: 'City' },
    { key: 'region', label: 'Region' },
    { key: 'postalCode', label: 'Postal code' },
    { key: 'country', label: 'Country', help: 'Two-letter uppercase ISO country code.' },
    { key: 'latitude', label: 'Map latitude', type: 'number' },
    { key: 'longitude', label: 'Map longitude', type: 'number' },
  ],
  social: [
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'x', label: 'X' },
    { key: 'github', label: 'GitHub' },
  ],
  localization: [],
  seo: [
    { key: 'defaultTitle', label: 'Default title' },
    {
      key: 'titleTemplate',
      label: 'Title template',
      help: 'Use %s for the page title, e.g. %s | TEVONIQ. Leave empty to preserve page titles.',
    },
    { key: 'defaultDescription', label: 'Default description', type: 'textarea' },
    { key: 'defaultOGImage', label: 'Default OpenGraph image', type: 'image' },
  ],
  email: [
    { key: 'senderName', label: 'Sender name' },
    {
      key: 'senderEmail',
      label: 'Sender email',
      type: 'email',
      help: 'Use an address verified with your configured email provider.',
    },
    {
      key: 'notificationRecipients',
      label: 'Notification recipients',
      type: 'recipients',
      help: 'One email address per line. Applies to lead notifications; an empty list pauses these notifications.',
    },
  ],
  analytics: [
    {
      key: 'googleTagManager',
      label: 'Google Tag Manager',
      help: 'GTM- container ID only. Leave blank to disable.',
    },
    {
      key: 'googleAnalytics',
      label: 'Google Analytics',
      help: 'GA4 G- measurement ID only. Leave blank if already deployed through GTM.',
    },
    { key: 'microsoftClarity', label: 'Microsoft Clarity', help: 'Clarity project ID only.' },
    { key: 'metaPixel', label: 'Meta Pixel', help: 'Numeric Pixel ID only. No access token.' },
  ],
  security: [
    {
      key: 'sessionIdleMinutes',
      label: 'Admin session idle timeout (minutes)',
      type: 'number',
      help: '5–30 minutes. Applies to existing sessions on their next request.',
    },
  ],
  media: [
    {
      key: 'maxUploadMB',
      label: 'Maximum media upload size (MB)',
      type: 'number',
      help: '1–50 MB. The deployment upload limit remains an upper bound.',
    },
    { key: 'allowSvg', label: 'Allow sanitized static SVG uploads', type: 'boolean' },
  ],
  legal: [
    {
      key: 'privacyInformation',
      label: 'Privacy information',
      type: 'textarea',
      help: 'Plain text shown in cookie preferences.',
    },
    { key: 'privacyPolicyUrl', label: 'Privacy Policy URL or page path' },
    { key: 'termsUrl', label: 'Terms URL or page path' },
    { key: 'cookiePolicyUrl', label: 'Cookie Policy URL or page path' },
    { key: 'cookiePolicyInformation', label: 'Cookie policy information', type: 'textarea' },
    {
      key: 'cookiePolicyVersion',
      label: 'Cookie policy version',
      help: 'Change this when consent purposes change to request a new choice.',
    },
    {
      key: 'requireMarketingConsent',
      label: 'Require consent before loading marketing',
      type: 'boolean',
    },
    {
      key: 'requireAnalyticsConsent',
      label: 'Require consent before loading analytics',
      type: 'boolean',
    },
    { key: 'cookieConsentDays', label: 'Remember cookie choice (days)', type: 'number' },
    { key: 'cookieNoticeEn', label: 'Cookie notice — English', type: 'textarea' },
    { key: 'cookieNoticeTr', label: 'Cookie notice — Turkish', type: 'textarea' },
    { key: 'cookieNoticeAr', label: 'Cookie notice — Arabic', type: 'textarea' },
  ],
};
const descriptions: Record<SettingsGroup, string> = {
  general: 'Your site identity and localized company descriptions.',
  brand: 'Original brand assets. Choose a library file or enter its public URL.',
  contact: 'Only verified public contact information. Leave unknown details blank.',
  social: 'Official profile URLs. Empty profiles are hidden on the site.',
  localization: 'Choose the default language and the languages available to visitors.',
  seo: 'Defaults for search results and social sharing. Page-specific SEO overrides still take priority.',
  email: 'Sender identity and internal notification routing. SMTP credentials stay on the server.',
  analytics:
    'Only configured providers load. Cookie consent rules apply before any vendor scripts are requested.',
  security:
    'Session controls. Authentication secrets and bot-protection keys are managed in the deployment.',
  media: 'Upload limits and permitted formats. Storage credentials stay on the server.',
  legal: 'Public policy links, privacy information and cookie preferences.',
};
const title = (v: string) => (v === 'seo' ? 'SEO' : v[0]!.toUpperCase() + v.slice(1));
export function SiteSettingsEditor() {
  const { user } = useCmsSession();
  const [settings, setSettings] = useState<SiteSettings | null>(null),
    [saved, setSaved] = useState(''),
    [version, setVersion] = useState(0);
  const [active, setActive] = useState<SettingsGroup>('general'),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [deployment, setDeployment] = useState<Record<string, boolean | number>>({});
  const readable = can(user, 'settings.read'),
    editable = can(user, 'settings.update') && can(user, 'settings.publish');
  const [attempt, setAttempt] = useState(0);
  const dirty = !!settings && JSON.stringify(settings) !== saved;
  useEffect(() => {
    if (!readable) return;
    let cancelled = false;
    void cmsApi('site-settings')
      .then((result) => {
        if (cancelled) return;
        const value = siteSettingsSchema.parse(result.settings);
        setSettings(value);
        setSaved(JSON.stringify(value));
        setVersion(Number(result.version));
        setDeployment(result.deployment as Record<string, boolean | number>);
      })
      .catch((error) => {
        if (!cancelled)
          setError(error instanceof Error ? error.message : 'Unable to load settings');
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [readable, attempt]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const update = (key: string, value: unknown) =>
    setSettings((current) =>
      current ? { ...current, [active]: { ...current[active], [key]: value } } : current,
    );
  if (!readable) return <p role="alert">You do not have permission to view site settings.</p>;
  return (
    <div className="settings-editor">
      <div className="settings-heading">
        <div>
          <p className="admin-eyebrow">WORKSPACE / CONFIGURATION</p>
          <h1>Site Settings</h1>
          <p>Manage your website’s identity, integrations and preferences.</p>
        </div>
        <div className="settings-save">
          <span>{dirty ? 'Unsaved changes' : version ? 'Saved' : 'Not yet configured'}</span>
          <Button
            type="button"
            disabled={!dirty || busy || !editable}
            onClick={() => {
              setSettings(siteSettingsSchema.parse(JSON.parse(saved)));
              setError('');
              setNotice('Unsaved changes discarded.');
            }}
          >
            Discard changes
          </Button>
          <Button
            form="site-settings-form"
            type="submit"
            disabled={!settings || !dirty || busy || !editable}
            loading={busy}
          >
            Save changes
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="settings-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="settings-notice">
          {notice}
        </p>
      )}
      {!settings ? (
        <div>
          <p role="status">{busy ? 'Loading settings…' : 'Settings could not be loaded.'}</p>
          {!busy && (
            <Button
              onClick={() => {
                setBusy(true);
                setError('');
                setAttempt((value) => value + 1);
              }}
            >
              Retry
            </Button>
          )}
        </div>
      ) : (
        <div className="settings-layout">
          <nav aria-label="Settings groups" className="settings-nav">
            {settingsGroups.map((group) => (
              <button
                key={group}
                type="button"
                aria-current={active === group ? 'page' : undefined}
                onClick={() => setActive(group)}
              >
                {title(group)}
              </button>
            ))}
          </nav>
          <form
            id="site-settings-form"
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy || !editable) return;
              setError('');
              setNotice('');
              const parsed = siteSettingsSchema.safeParse({
                ...settings,
                email: {
                  ...settings.email,
                  notificationRecipients: settings.email.notificationRecipients
                    .map((v) => v.trim())
                    .filter(Boolean),
                },
              });
              if (!parsed.success) {
                const issue = parsed.error.issues[0]!;
                setActive(issue.path[0] as SettingsGroup);
                setError(
                  parsed.error.issues.map((i) => i.path.join('.') + ': ' + i.message).join('\n'),
                );
                return;
              }
              setBusy(true);
              try {
                const result = await cmsApi('site-settings', 'PUT', {
                  settings: parsed.data,
                  version,
                });
                const value = siteSettingsSchema.parse(result.settings);
                setSettings(value);
                setSaved(JSON.stringify(value));
                setVersion(Number(result.version));
                setNotice('Settings saved. Public changes are now live.');
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Unable to save settings');
              } finally {
                setBusy(false);
              }
            }}
          >
            <section className="settings-panel">
              <h2>{title(active)}</h2>
              <p className="settings-description">{descriptions[active]}</p>
              <fieldset disabled={busy || !editable}>
                {active === 'localization' && (
                  <>
                    <Select
                      label="Default language"
                      value={settings.localization.defaultLanguage}
                      onChange={(e) => update('defaultLanguage', e.target.value)}
                    >
                      {['en', 'tr', 'ar'].map((l) => (
                        <option key={l} value={l}>
                          {
                            (
                              { en: 'English', tr: 'Türkçe', ar: 'العربية' } as Record<
                                string,
                                string
                              >
                            )[l]
                          }
                        </option>
                      ))}
                    </Select>
                    <fieldset className="settings-languages">
                      <legend>Enabled languages</legend>
                      {(['en', 'tr', 'ar'] as const).map((l) => (
                        <label key={l}>
                          <input
                            type="checkbox"
                            checked={settings.localization.enabledLanguages.includes(l)}
                            onChange={(e) =>
                              update(
                                'enabledLanguages',
                                e.target.checked
                                  ? [...settings.localization.enabledLanguages, l]
                                  : settings.localization.enabledLanguages.filter((v) => v !== l),
                              )
                            }
                          />
                          {{ en: 'English', tr: 'Türkçe', ar: 'العربية' }[l]}
                        </label>
                      ))}
                    </fieldset>
                  </>
                )}
                <div className="settings-fields">
                  {fields[active].map((field) => {
                    const value = (settings[active] as Record<string, unknown>)[field.key];
                    const fieldId = `settings-${active}-${field.key}`;
                    return (
                      <div
                        className={
                          'settings-field ' +
                          (field.type === 'textarea' || field.type === 'recipients'
                            ? 'settings-wide'
                            : '')
                        }
                        key={field.key}
                      >
                        {field.type === 'boolean' ? (
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={!!value}
                              onChange={(e) => update(field.key, e.target.checked)}
                            />
                            {field.label}
                          </label>
                        ) : field.type === 'textarea' || field.type === 'recipients' ? (
                          <Textarea
                            id={fieldId}
                            label={field.label}
                            value={Array.isArray(value) ? value.join('\n') : String(value ?? '')}
                            rows={4}
                            onChange={(e) =>
                              update(
                                field.key,
                                field.type === 'recipients'
                                  ? e.target.value.split('\n')
                                  : e.target.value,
                              )
                            }
                          />
                        ) : (
                          <Input
                            id={fieldId}
                            label={field.label}
                            type={
                              field.type === 'number'
                                ? 'number'
                                : field.type === 'email'
                                  ? 'email'
                                  : 'text'
                            }
                            step={
                              field.key === 'latitude' || field.key === 'longitude'
                                ? 'any'
                                : undefined
                            }
                            value={value === null ? '' : String(value ?? '')}
                            onChange={(e) =>
                              update(
                                field.key,
                                field.type === 'number'
                                  ? e.target.value === ''
                                    ? null
                                    : Number(e.target.value)
                                  : e.target.value,
                              )
                            }
                          />
                        )}
                        {field.help && <small>{field.help}</small>}
                        {field.type === 'image' && (
                          <div className="settings-image">
                            <MediaPicker onSelect={(image) => update(field.key, image.src)} />
                            {!!value && (
                              <img
                                src={String(value)}
                                alt={`${field.label} preview`}
                                width={160}
                                height={80}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
              {['security', 'email', 'media'].includes(active) && (
                <aside className="settings-deployment">
                  <h3>Deployment configuration</h3>
                  <p>
                    {active === 'email'
                      ? `Email transport: ${deployment.emailConfigured ? 'configured' : 'not configured'}.`
                      : active === 'security'
                        ? `Bot protection: ${deployment.botProtectionEnabled ? 'enabled' : 'not enabled'}. Password policies, rate limits and session tokens are enforced on the server.`
                        : `Deployment upload ceiling: ${deployment.maxUploadMB ?? '—'} MB. Uploads are validated and SVGs sanitized.`}
                  </p>
                  <p>
                    Credentials, API keys and secret tokens are never returned by this editor or the
                    public settings API.
                  </p>
                </aside>
              )}
            </section>
          </form>
        </div>
      )}
    </div>
  );
}
