'use client';
import { presentHomeContent } from '@/content/home-presentation';
import { useEffect, useState } from 'react';
import { homeContentSchema, type HomeContent } from '@tevoniq/validation';
import { homeCopy } from '@/content/home';
import { referenceHeroCopy } from '@/content/reference-hero';
import { cmsApi, can } from '@/lib/cms-client';
import { useCmsSession } from '@/components/cms/session';
import { Button, Input, Textarea, Select } from '@tevoniq/ui';

type Locale = 'en' | 'tr' | 'ar';
type TextTree = string | TextTree[] | { [key: string]: TextTree };
const label = (value: string) =>
  value.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
function TextFields({
  value,
  name,
  onChange,
}: {
  value: TextTree;
  name: string;
  onChange: (value: TextTree) => void;
}) {
  if (typeof value === 'string')
    return value.length > 120 || /body|description|introduction/i.test(name) ? (
      <Textarea
        label={name}
        value={value}
        required={!name.endsWith('Video Url')}
        maxLength={4000}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <Input
        label={name}
        value={value}
        required={!name.endsWith('Video Url')}
        maxLength={4000}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  if (Array.isArray(value))
    return (
      <fieldset>
        <legend>{name}</legend>
        {value.map((item, index) => (
          <TextFields
            key={index}
            value={item}
            name={`${name} ${index + 1}`}
            onChange={(next) => onChange(value.map((old, i) => (i === index ? next : old)))}
          />
        ))}
      </fieldset>
    );
  return (
    <>
      {Object.entries(value).map(([key, item]) => (
        <TextFields
          key={key}
          value={item}
          name={`${name} · ${label(key)}`}
          onChange={(next) => onChange({ ...value, [key]: next })}
        />
      ))}
    </>
  );
}
export function HomeEditor() {
  const { user } = useCmsSession();
  const [locale, setLocale] = useState<Locale>('en');
  const [record, setRecord] = useState<{
    draft: HomeContent;
    published: HomeContent | null;
    version: number;
  } | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    cmsApi(`home/${locale}`)
      .then((result) => {
        if (!active) return;
        setRecord({
          draft: presentHomeContent(
            locale,
            homeContentSchema.parse(
              result.draft ?? { copy: homeCopy[locale], hero: referenceHeroCopy[locale] },
            ),
          ),
          published: result.published
            ? presentHomeContent(locale, homeContentSchema.parse(result.published))
            : null,
          version: result.version as number,
        });
        setDirty(false);
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      });
    return () => {
      active = false;
    };
  }, [locale, reload]);
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  async function save(action: 'save' | 'publish' | 'unpublish') {
    if (!record) return;
    setBusy(true);
    setMessage('');
    try {
      const content = homeContentSchema.parse(record.draft);
      const result = await cmsApi(`home/${locale}`, 'PUT', {
        content,
        version: record.version,
        action,
      });
      setRecord({
        draft: presentHomeContent(locale, homeContentSchema.parse(result.draft)),
        published: result.published
          ? presentHomeContent(locale, homeContentSchema.parse(result.published))
          : null,
        version: result.version as number,
      });
      setDirty(false);
      setMessage(
        action === 'save'
          ? 'Draft saved. The live homepage has not changed.'
          : action === 'publish'
            ? 'Homepage published.'
            : 'Homepage unpublished.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save homepage');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="home-editor">
      <h1>Homepage</h1>
      <p>
        Edit each language independently. Save a draft to review your copy, then publish it to the
        website.
      </p>
      <Select
        label="Language"
        value={locale}
        disabled={busy}
        onChange={(e) => {
          if (dirty && !window.confirm('Discard unsaved changes?')) return;
          setRecord(null);
          setMessage('');
          setLocale(e.target.value as Locale);
        }}
      >
        <option value="en">English</option>
        <option value="tr">Türkçe</option>
        <option value="ar">العربية</option>
      </Select>
      {!record && message && <p role="status">{message}</p>}
      {!record ? (
        <Button onClick={() => setReload((n) => n + 1)}>Reload homepage</Button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save('save');
          }}
        >
          <p>
            {record.published ? 'Published homepage available' : 'Homepage not published'}
            {dirty ? ' · Unsaved changes' : ''}
          </p>
          <a href={`/${locale}`} target="_blank" rel="noreferrer">
            View published homepage
          </a>
          <fieldset
            disabled={busy || !can(user, 'pages.update')}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <legend>Homepage content</legend>
            <TextFields
              value={record.draft as unknown as TextTree}
              name="Homepage"
              onChange={(draft) => {
                setRecord({ ...record, draft: draft as unknown as HomeContent });
                setDirty(true);
              }}
            />
          </fieldset>
          <p role="status" aria-live="polite">
            {busy ? 'Saving homepage…' : message}
          </p>
          <div className="admin-actions">
            <Button type="submit" loading={busy} disabled={!can(user, 'pages.update')}>
              Save draft
            </Button>
            <Button
              type="button"
              loading={busy}
              disabled={!can(user, 'pages.publish')}
              onClick={() => void save('publish')}
            >
              Publish homepage
            </Button>
            {record.published && (
              <Button
                type="button"
                variant="secondary"
                disabled={busy || !can(user, 'pages.publish')}
                onClick={() => {
                  if (
                    window.confirm(
                      'Unpublish this language? Visitors will see a page not found until you publish again.',
                    )
                  )
                    void save('unpublish');
                }}
              >
                Unpublish
              </Button>
            )}
          </div>
        </form>
      )}
    </main>
  );
}
