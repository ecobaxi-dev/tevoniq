'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Input, Textarea, Select, Checkbox, Button, Card, Badge } from '@tevoniq/ui';
import { projectWriteSchema, publicProjectSchema, projectImageSchema } from '@tevoniq/validation';
import type { ProjectWrite, PublicProject } from '@tevoniq/validation';
import { cmsApi } from '@/lib/cms-client';
import { RecordPicker } from './record-picker';
import { ServicePicker } from './service-picker';
import { ProjectCaseStudy } from '../project-case-study';

type Translation = ProjectWrite['translations'][number];
type Media = NonNullable<Translation['heroImage']>;
export type ProjectRecord = ProjectWrite & { id: string };
const newTranslation = (locale: Translation['locale']): Translation => ({
  locale,
  title: '',
  summary: '',
  published: false,
  anonymousClientName: '',
  heroImage: null,
  gallery: [],
  challenge: '',
  approach: '',
  solution: '',
  implementation: '',
  technologies: [],
  results: [],
  testimonial: '',
  testimonialAuthor: '',
  seoTitle: '',
  seoDescription: '',
});
export const newProjectRecord = (): ProjectRecord => ({
  id: '',
  slug: '',
  clientName: '',
  clientVisibility: 'PRIVATE',
  country: '',
  city: '',
  projectDate: null,
  featured: false,
  published: false,
  verified: false,
  version: 0,
  sortOrder: 0,
  industryIds: [],
  serviceIds: [],
  solutionIds: [],
  translations: [newTranslation('en')],
});
function writable(r: ProjectRecord): ProjectWrite {
  return {
    slug: r.slug,
    clientName: r.clientName,
    clientVisibility: r.clientVisibility,
    country: r.country,
    city: r.city,
    projectDate: r.projectDate,
    featured: r.featured,
    published: r.published,
    verified: r.verified,
    version: r.version,
    sortOrder: r.sortOrder,
    industryIds: r.industryIds,
    serviceIds: r.serviceIds,
    solutionIds: r.solutionIds,
    translations: r.translations.map(
      (t) =>
        Object.fromEntries(
          Object.keys(newTranslation(t.locale)).map((k) => [k, t[k as keyof Translation]]),
        ) as Translation,
    ),
  };
}
function MediaFields({
  value,
  label,
  onChange,
}: {
  value: Media;
  label: string;
  onChange: (value: Media) => void;
}) {
  return (
    <div className="project-media-fields">
      <Input
        label={`${label} URL`}
        value={value.url}
        maxLength={2000}
        dir="ltr"
        onChange={(e) => onChange({ ...value, url: e.target.value })}
      />
      <Input
        label={`${label} alt text`}
        value={value.alt}
        maxLength={300}
        onChange={(e) => onChange({ ...value, alt: e.target.value })}
      />
      <Input
        label={`${label} caption`}
        value={value.caption}
        maxLength={1000}
        onChange={(e) => onChange({ ...value, caption: e.target.value })}
      />
      {projectImageSchema.safeParse(value).success && (
        <Image src={value.url} alt={value.alt} width={640} height={400} unoptimized />
      )}
    </div>
  );
}
export function ProjectEditor({
  record,
  readOnly,
  onSaved,
  onDeleted,
}: {
  record: ProjectRecord;
  readOnly: boolean;
  onSaved: (r: ProjectRecord) => void;
  onDeleted: () => void;
}) {
  const [value, setValue] = useState(() => writable(record)),
    [locale, setLocale] = useState<Translation['locale']>('en');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [preview, setPreview] = useState<PublicProject | null>(null);
  const [audits, setAudits] = useState<{
    items: Array<{ id: string; action: string; createdAt: string }>;
    page: number;
    limit: number;
    total: number;
  } | null>(null);
  const t = value.translations.find((t) => t.locale === locale);
  const patch = (update: Partial<Translation>) =>
    setValue((v) => ({
      ...v,
      translations: v.translations.map((t) => (t.locale === locale ? { ...t, ...update } : t)),
    }));
  async function save() {
    setBusy(true);
    setError('');
    setPreview(null);
    try {
      const parsed = projectWriteSchema.safeParse({
        ...value,
        translations: value.translations.map((t) => ({
          ...t,
          technologies: t.technologies.map((s) => s.trim()).filter(Boolean),
        })),
      });
      if (!parsed.success)
        throw new Error(
          parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'),
        );
      onSaved(
        (await cmsApi(
          `projects${record.id ? `/${record.id}` : ''}`,
          record.id ? 'PUT' : 'POST',
          parsed.data,
        )) as unknown as ProjectRecord,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }
  async function audit(page: number) {
    setBusy(true);
    setError('');
    try {
      setAudits(
        (await cmsApi(`projects/${record.id}/audit?page=${page}`)) as unknown as NonNullable<
          typeof audits
        >,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Audit unavailable');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="cms-editor" aria-label="Project editor">
      <h2>{record.id ? 'Edit project' : 'New project'}</h2>
      <p>
        Build a case study from reviewed facts and approved imagery. No client identity is displayed
        by default.
      </p>
      <p>
        <Badge>{value.published ? 'Published' : 'Draft'}</Badge> · {value.clientVisibility} · v
        {value.version}
      </p>
      <Select
        label="Translation"
        value={locale}
        onChange={(e) => {
          setLocale(e.target.value as Translation['locale']);
          setPreview(null);
        }}
      >
        <option value="en">English</option>
        <option value="tr">Turkish</option>
        <option value="ar">Arabic</option>
      </Select>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <fieldset disabled={readOnly || busy}>
          <section className="project-editor-section">
            <h3>Client identity & publication</h3>
            <Input
              label="Client name (internal)"
              value={value.clientName}
              maxLength={300}
              onChange={(e) => setValue({ ...value, clientName: e.target.value, verified: false })}
            />
            <Select
              label="Client visibility"
              value={value.clientVisibility}
              onChange={(e) =>
                setValue({
                  ...value,
                  clientVisibility: e.target.value as ProjectWrite['clientVisibility'],
                  verified: false,
                })
              }
            >
              <option value="PRIVATE">PRIVATE — hide client identity</option>
              <option value="ANONYMOUS">ANONYMOUS — show an approved descriptor</option>
              <option value="PUBLIC">PUBLIC — show the real client name</option>
            </Select>
            <p className="project-privacy-note">
              PRIVATE hides the client label. ANONYMOUS uses a descriptor such as “Regional
              Hospitality Company”. PUBLIC displays the real name. Review titles, slugs, narrative,
              testimonials and imagery for identifying details.
            </p>
            <Checkbox
              label="Content, client visibility and images reviewed for publication"
              checked={value.verified}
              onChange={(e) => setValue({ ...value, verified: e.target.checked })}
            />
            <Checkbox
              label="Publish project"
              checked={value.published}
              onChange={(e) => setValue({ ...value, published: e.target.checked })}
            />
            <Checkbox
              label="Featured"
              checked={value.featured}
              onChange={(e) => setValue({ ...value, featured: e.target.checked })}
            />
          </section>
          <section className="project-editor-section">
            <h3>Project details</h3>
            <Input
              label="Slug"
              value={value.slug}
              maxLength={120}
              required
              dir="ltr"
              onChange={(e) => setValue({ ...value, slug: e.target.value })}
            />
            <div className="project-editor-pair">
              <Input
                label="Country"
                value={value.country}
                maxLength={160}
                onChange={(e) => setValue({ ...value, country: e.target.value })}
              />
              <Input
                label="City"
                value={value.city}
                maxLength={160}
                onChange={(e) => setValue({ ...value, city: e.target.value })}
              />
              <Input
                label="Project date"
                type="date"
                value={value.projectDate ?? ''}
                onChange={(e) => setValue({ ...value, projectDate: e.target.value || null })}
              />
              <Input
                label="Sort order"
                type="number"
                min={0}
                max={2147483647}
                value={value.sortOrder}
                onChange={(e) => setValue({ ...value, sortOrder: Number(e.target.value) })}
              />
            </div>
          </section>
          {!t ? (
            <Button
              onClick={() =>
                setValue({
                  ...value,
                  translations: [...value.translations, newTranslation(locale)],
                })
              }
            >
              Add translation
            </Button>
          ) : (
            <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <section className="project-editor-section">
                <h3>Case study</h3>
                <Input
                  label="Project title"
                  value={t.title}
                  maxLength={500}
                  required
                  onChange={(e) => patch({ title: e.target.value })}
                />
                <Textarea
                  label="Summary"
                  value={t.summary}
                  maxLength={1000}
                  onChange={(e) => patch({ summary: e.target.value })}
                />
                {value.clientVisibility === 'ANONYMOUS' && (
                  <Input
                    label="Anonymous client descriptor"
                    value={t.anonymousClientName}
                    maxLength={300}
                    placeholder="Approved anonymous client descriptor"
                    onChange={(e) => patch({ anonymousClientName: e.target.value })}
                  />
                )}
                <Checkbox
                  label="Publish this translation"
                  checked={t.published}
                  onChange={(e) => patch({ published: e.target.checked })}
                />
                {(['challenge', 'approach', 'solution', 'implementation'] as const).map((key) => (
                  <Textarea
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={t[key]}
                    maxLength={12000}
                    rows={6}
                    onChange={(e) => patch({ [key]: e.target.value })}
                  />
                ))}
                <Textarea
                  label="Technologies (one per line)"
                  value={t.technologies.join('\n')}
                  onChange={(e) => patch({ technologies: e.target.value.split('\n') })}
                />
              </section>
              <section className="project-editor-section">
                <h3>Results</h3>
                <p>Enter only verified project outcomes.</p>
                {t.results.map((r, i) => (
                  <Card key={i} className="project-editor-row">
                    <Input
                      label={`Result ${i + 1} value`}
                      value={r.value}
                      maxLength={100}
                      onChange={(e) =>
                        patch({
                          results: t.results.map((r, j) =>
                            i === j ? { ...r, value: e.target.value } : r,
                          ),
                        })
                      }
                    />
                    <Input
                      label={`Result ${i + 1} label`}
                      value={r.label}
                      maxLength={300}
                      onChange={(e) =>
                        patch({
                          results: t.results.map((r, j) =>
                            i === j ? { ...r, label: e.target.value } : r,
                          ),
                        })
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => patch({ results: t.results.filter((_, j) => i !== j) })}
                    >
                      Remove result {i + 1}
                    </Button>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  disabled={t.results.length >= 20}
                  onClick={() => patch({ results: [...t.results, { value: '', label: '' }] })}
                >
                  Add result
                </Button>
              </section>
              <section className="project-editor-section">
                <h3>Images</h3>
                <p>
                  Use approved HTTPS image URLs or local image paths. Images must be cleared for
                  public use, including visible logos and embedded identifying details.
                </p>
                {t.heroImage ? (
                  <Card className="project-editor-row">
                    <MediaFields
                      label="Hero image"
                      value={t.heroImage}
                      onChange={(heroImage) => patch({ heroImage })}
                    />
                    <Button variant="outline" onClick={() => patch({ heroImage: null })}>
                      Remove hero image
                    </Button>
                  </Card>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => patch({ heroImage: { url: '', alt: '', caption: '' } })}
                  >
                    Add hero image
                  </Button>
                )}
                <h4>Gallery</h4>
                {t.gallery.map((img, i) => (
                  <Card key={i} className="project-editor-row">
                    <MediaFields
                      label={`Gallery image ${i + 1}`}
                      value={img}
                      onChange={(img) =>
                        patch({ gallery: t.gallery.map((old, j) => (i === j ? img : old)) })
                      }
                    />
                    <div className="project-editor-actions">
                      <Button
                        variant="ghost"
                        disabled={i === 0}
                        onClick={() => {
                          const gallery = [...t.gallery];
                          [gallery[i - 1], gallery[i]] = [gallery[i]!, gallery[i - 1]!];
                          patch({ gallery });
                        }}
                      >
                        Move image {i + 1} up
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={i === t.gallery.length - 1}
                        onClick={() => {
                          const gallery = [...t.gallery];
                          [gallery[i + 1], gallery[i]] = [gallery[i]!, gallery[i + 1]!];
                          patch({ gallery });
                        }}
                      >
                        Move image {i + 1} down
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => patch({ gallery: t.gallery.filter((_, j) => i !== j) })}
                      >
                        Remove image {i + 1}
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  disabled={t.gallery.length >= 24}
                  onClick={() =>
                    patch({ gallery: [...t.gallery, { url: '', alt: '', caption: '' }] })
                  }
                >
                  Add gallery image
                </Button>
              </section>
              <section className="project-editor-section">
                <h3>Testimonial</h3>
                <Textarea
                  label="Testimonial quote"
                  value={t.testimonial}
                  maxLength={4000}
                  onChange={(e) => patch({ testimonial: e.target.value })}
                />
                <Input
                  label="Testimonial author (public clients only)"
                  value={t.testimonialAuthor}
                  maxLength={300}
                  onChange={(e) => patch({ testimonialAuthor: e.target.value })}
                />
                <p>
                  Anonymous testimonials use the approved client descriptor. Private testimonials
                  have no attribution.
                </p>
              </section>
              <section className="project-editor-section">
                <h3>SEO metadata</h3>
                <Input
                  label="SEO title"
                  value={t.seoTitle}
                  maxLength={160}
                  onChange={(e) => patch({ seoTitle: e.target.value })}
                />
                <Textarea
                  label="SEO description"
                  value={t.seoDescription}
                  maxLength={320}
                  onChange={(e) => patch({ seoDescription: e.target.value })}
                />
              </section>
            </div>
          )}
          <section className="project-editor-section">
            <h3>Relationships</h3>
            <RecordPicker
              collection="industries"
              ids={value.industryIds}
              onChange={(industryIds) => setValue({ ...value, industryIds })}
              locale={locale}
              disabled={readOnly || busy}
            />
            <ServicePicker
              ids={value.serviceIds}
              onChange={(serviceIds) => setValue({ ...value, serviceIds })}
              locale={locale}
              disabled={readOnly || busy}
            />
            <RecordPicker
              collection="solutions"
              ids={value.solutionIds}
              onChange={(solutionIds) => setValue({ ...value, solutionIds })}
              locale={locale}
              disabled={readOnly || busy}
            />
          </section>
          <Button type="submit" loading={busy}>
            Save project
          </Button>
          {record.id && (
            <Button
              variant="outline"
              onClick={async () => {
                if (
                  !window.confirm(
                    'Archive this project? Its translations will be retained for recovery. Referenced projects cannot be archived.',
                  )
                )
                  return;
                setBusy(true);
                setError('');
                try {
                  await cmsApi(`projects/${record.id}`, 'DELETE', { version: value.version });
                  onDeleted();
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Delete failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Archive project
            </Button>
          )}
        </fieldset>
      </form>
      {record.id && (
        <div className="project-editor-actions">
          <Button
            variant="outline"
            disabled={busy || !t}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                setPreview(
                  publicProjectSchema.parse(
                    await cmsApi(`projects/${record.id}/preview?locale=${locale}`),
                  ),
                );
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Preview unavailable');
              } finally {
                setBusy(false);
              }
            }}
          >
            Preview saved project
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => void audit(1)}>
            View audit history
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="cms-error">
          {error}
        </p>
      )}
      {preview && (
        <section
          className="project-preview"
          aria-label="Private project preview"
          lang={preview.locale}
          dir={preview.locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <p>Private preview of public content. Internal client details are excluded.</p>
          <ProjectCaseStudy project={preview} />
        </section>
      )}
      {audits && (
        <section aria-label="Audit history">
          <h3>Audit history</h3>
          <ol>
            {audits.items.map((a) => (
              <li key={a.id}>
                {a.action} ·{' '}
                <time dateTime={a.createdAt}>{new Date(a.createdAt).toLocaleString()}</time>
              </li>
            ))}
          </ol>
          <div className="project-editor-actions">
            <Button
              disabled={busy || audits.page === 1}
              onClick={() => void audit(audits.page - 1)}
            >
              Previous audit page
            </Button>
            <Button
              disabled={busy || audits.page * audits.limit >= audits.total}
              onClick={() => void audit(audits.page + 1)}
            >
              Next audit page
            </Button>
          </div>
        </section>
      )}
    </section>
  );
}
