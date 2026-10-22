'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Container, UIProvider, Button, Input, Textarea, Select, Checkbox } from '@tevoniq/ui';
import { companySlugs, companyWriteSchema, type CompanyWrite } from '@tevoniq/validation';
import { CmsLogin, useCmsSession } from '@/components/cms/session';
import { cmsApi, can } from '@/lib/cms-client';
import { CompanyContentView } from '@/components/company-content';
import '../services/cms.css';
import '../../[locale]/company/company.css';

export default function CompanyCms() {
  const session = useCmsSession();
  const [slug, setSlug] = useState('about'),
    [locale, setLocale] = useState('en');
  const [record, setRecord] = useState<CompanyWrite | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [preview, setPreview] = useState(false);
  const editable = can(session.user, 'pages.publish');
  const patch = (value: Partial<CompanyWrite['content']>) =>
    setRecord((r) => r && { ...r, content: { ...r.content, ...value } });
  async function load() {
    setBusy(true);
    setMessage('');
    setRecord(null);
    setPreview(false);
    try {
      const data = await cmsApi(`company/${slug}?locale=${locale}`);
      setRecord(
        companyWriteSchema.parse({
          content: data.content,
          published: data.published,
          version: data.version,
        }),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Load failed');
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const data = await cmsApi(
        `company/${slug}?locale=${locale}`,
        'PUT',
        companyWriteSchema.parse(record),
      );
      setRecord(
        companyWriteSchema.parse({
          content: data.content,
          published: data.published,
          version: data.version,
        }),
      );
      setMessage('Saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <UIProvider>
      <main className="cms-shell">
        <Container>
          <h1 className="tv-h1">Company CMS</h1>
          <p>
            <Link href="/admin/services">Services CMS</Link> ·{' '}
            <Link href={`/${locale}/company/${slug}`}>View company page</Link>
          </p>
          {session.checking ? (
            <p role="status">Checking session…</p>
          ) : session.sessionError ? (
            <>
              <p role="alert">{session.sessionError}</p>
              <Button onClick={session.retrySession}>Retry</Button>
            </>
          ) : !session.user ? (
            <CmsLogin onSignedIn={session.setUser} />
          ) : (
            <>
              <div className="cms-toolbar">
                <Select
                  label="Page"
                  value={slug}
                  disabled={busy}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setRecord(null);
                  }}
                >
                  {companySlugs.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
                <Select
                  label="Language"
                  value={locale}
                  disabled={busy}
                  onChange={(e) => {
                    setLocale(e.target.value);
                    setRecord(null);
                  }}
                >
                  {['en', 'tr', 'ar'].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </Select>
                <Button loading={busy} onClick={() => void load()}>
                  Load page
                </Button>
              </div>
              <p>
                Publish only verified company information. Leave founding year and geographic
                coverage empty unless confirmed. Translate all content before publishing another
                language. Saving with Published unchecked removes this page from the public site.
              </p>
              {record && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save();
                  }}
                >
                  <fieldset
                    disabled={!editable || busy}
                    style={{ display: 'grid', gap: '1.5rem', border: 0, padding: 0 }}
                  >
                    <Input
                      label="Page title"
                      value={record.content.title}
                      onChange={(e) => patch({ title: e.target.value })}
                      required
                    />
                    <Textarea
                      label="Introduction"
                      value={record.content.intro}
                      onChange={(e) => patch({ intro: e.target.value })}
                    />
                    <Textarea
                      label="SEO description"
                      value={record.content.seoDescription}
                      onChange={(e) => patch({ seoDescription: e.target.value })}
                    />
                    <Input
                      label="Verified founding year (optional)"
                      type="number"
                      min={1000}
                      max={9999}
                      value={record.content.foundingYear ?? ''}
                      onChange={(e) =>
                        patch({ foundingYear: e.target.value ? Number(e.target.value) : null })
                      }
                    />
                    <Textarea
                      label="Verified geographic coverage (optional)"
                      value={record.content.geographicCoverage}
                      onChange={(e) => patch({ geographicCoverage: e.target.value })}
                    />
                    {record.content.sections.map((section, index) => (
                      <fieldset key={index}>
                        <legend>Section {index + 1}</legend>
                        <Input
                          label="Heading"
                          value={section.title}
                          onChange={(e) =>
                            patch({
                              sections: record.content.sections.map((s, i) =>
                                i === index ? { ...s, title: e.target.value } : s,
                              ),
                            })
                          }
                          required
                        />
                        <Textarea
                          label="Content"
                          rows={5}
                          value={section.body}
                          onChange={(e) =>
                            patch({
                              sections: record.content.sections.map((s, i) =>
                                i === index ? { ...s, body: e.target.value } : s,
                              ),
                            })
                          }
                          required
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            patch({
                              sections: record.content.sections.filter((_, i) => i !== index),
                            })
                          }
                        >
                          Remove section
                        </Button>
                      </fieldset>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        patch({
                          sections: [
                            ...record.content.sections,
                            { title: 'New section', body: '' },
                          ],
                        })
                      }
                    >
                      Add section
                    </Button>
                    {(['title', 'body', 'label', 'href'] as const).map((key) => (
                      <Input
                        key={key}
                        label={`CTA ${key}`}
                        value={record.content.cta[key]}
                        onChange={(e) =>
                          patch({ cta: { ...record.content.cta, [key]: e.target.value } })
                        }
                      />
                    ))}
                    <Checkbox
                      label="Published"
                      checked={record.published}
                      onChange={(e) => setRecord({ ...record, published: e.target.checked })}
                    />
                    <Button type="submit" loading={busy}>
                      Save page
                    </Button>
                  </fieldset>
                  <Button type="button" variant="secondary" onClick={() => setPreview(!preview)}>
                    Toggle preview
                  </Button>
                </form>
              )}
              {record && preview && (
                <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="company-page">
                  <CompanyContentView content={record.content} locale={locale} />
                </div>
              )}
            </>
          )}
          {message && (
            <p role="status" style={{ whiteSpace: 'pre-wrap' }}>
              {message}
            </p>
          )}
        </Container>
      </main>
    </UIProvider>
  );
}
