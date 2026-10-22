'use client';
import { useEffect, useState } from 'react';
import { Button, Input, Select, Textarea } from '@tevoniq/ui';
import {
  emptySectionCopy,
  gridKinds,
  type BuilderSection,
  type BuilderLocale,
  type BuilderCard,
  type SectionType,
} from '@tevoniq/validation';
import { cmsApi } from '@/lib/cms-client';
import { MediaPicker } from '@/components/media/media-picker';
type Data = Record<string, unknown>;
type Field = {
  key: string;
  label: string;
  kind?: 'long' | 'media' | 'action' | 'select';
  options?: string[];
};
const strings = (value: unknown) => (typeof value === 'string' ? value : '');
function MoveButtons({
  index,
  length,
  move,
  remove,
}: {
  index: number;
  length: number;
  move: (to: number) => void;
  remove: () => void;
}) {
  return (
    <div className="pb-editor-actions">
      <Button type="button" variant="secondary" disabled={!index} onClick={() => move(index - 1)}>
        Move up
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={index === length - 1}
        onClick={() => move(index + 1)}
      >
        Move down
      </Button>
      <Button type="button" variant="secondary" onClick={remove}>
        Remove item
      </Button>
    </div>
  );
}
function MediaEditor({
  value,
  onChange,
  label = 'Image',
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  label?: string;
}) {
  const image = value as Data | null;
  return (
    <fieldset className="pb-editor-group">
      <legend>{label}</legend>
      <MediaPicker onSelect={onChange} />
      {image ? (
        <>
          <Input
            label="Image URL"
            value={strings(image.src)}
            onChange={(e) => onChange({ ...image, src: e.target.value })}
            hint="Public local path or HTTPS URL"
          />
          <Input
            label="Alternative text"
            value={strings(image.alt)}
            onChange={(e) => onChange({ ...image, alt: e.target.value })}
          />
          <Input
            label="Caption"
            value={strings(image.caption)}
            onChange={(e) => onChange({ ...image, caption: e.target.value })}
          />
          <Button type="button" variant="secondary" onClick={() => onChange(null)}>
            Remove image
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => onChange({ src: '', alt: '', caption: '' })}
        >
          Add image
        </Button>
      )}
    </fieldset>
  );
}
function Fields({
  fields,
  value,
  onChange,
}: {
  fields: Field[];
  value: Data;
  onChange: (v: Data) => void;
}) {
  return (
    <>
      {fields.map((f) => {
        const set = (v: unknown) => onChange({ ...value, [f.key]: v });
        if (f.kind === 'media')
          return <MediaEditor key={f.key} label={f.label} value={value[f.key]} onChange={set} />;
        if (f.kind === 'action') {
          const action = (value[f.key] || { label: '', href: '' }) as Data;
          return (
            <fieldset className="pb-editor-group" key={f.key}>
              <legend>{f.label}</legend>
              <Fields
                fields={[
                  { key: 'label', label: 'Button label' },
                  { key: 'href', label: 'Destination URL' },
                ]}
                value={action}
                onChange={set}
              />
            </fieldset>
          );
        }
        if (f.kind === 'select')
          return (
            <Select
              key={f.key}
              label={f.label}
              value={strings(value[f.key])}
              onChange={(e) => set(e.target.value)}
            >
              {f.options?.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          );
        if (f.kind === 'long')
          return (
            <Textarea
              key={f.key}
              label={f.label}
              rows={4}
              value={strings(value[f.key])}
              onChange={(e) => set(e.target.value)}
            />
          );
        return (
          <Input
            key={f.key}
            label={f.label}
            value={strings(value[f.key])}
            onChange={(e) => set(e.target.value)}
          />
        );
      })}
    </>
  );
}
const repeaters: Partial<
  Record<SectionType, { key: string; label: string; max: number; fields: Field[]; empty: Data }>
> = {
  Hero: {
    key: 'actions',
    label: 'Hero button',
    max: 2,
    fields: [
      { key: 'label', label: 'Button label' },
      { key: 'href', label: 'Destination URL' },
    ],
    empty: { label: '', href: '' },
  },
  FeatureGrid: {
    key: 'items',
    label: 'Feature',
    max: 24,
    fields: [
      { key: 'title', label: 'Feature title' },
      { key: 'text', label: 'Description', kind: 'long' },
    ],
    empty: { title: '', text: '' },
  },
  Stats: {
    key: 'items',
    label: 'Statistic',
    max: 12,
    fields: [
      { key: 'value', label: 'Value' },
      { key: 'label', label: 'Label' },
      { key: 'note', label: 'Supporting note' },
    ],
    empty: { value: '', label: '', note: '' },
  },
  LogoGrid: {
    key: 'items',
    label: 'Logo',
    max: 30,
    fields: [
      { key: 'name', label: 'Organization name' },
      { key: 'media', label: 'Logo image', kind: 'media' },
      { key: 'href', label: 'Website URL' },
    ],
    empty: { name: '', media: null, href: '' },
  },
  TeamGrid: {
    key: 'items',
    label: 'Team member',
    max: 24,
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Job title' },
      { key: 'bio', label: 'Biography', kind: 'long' },
      { key: 'media', label: 'Portrait', kind: 'media' },
    ],
    empty: { name: '', role: '', bio: '', media: null },
  },
  Testimonials: {
    key: 'items',
    label: 'Testimonial',
    max: 20,
    fields: [
      { key: 'quote', label: 'Quotation', kind: 'long' },
      { key: 'author', label: 'Author' },
      { key: 'company', label: 'Company' },
    ],
    empty: { quote: '', author: '', company: '' },
  },
  FAQ: {
    key: 'items',
    label: 'Question',
    max: 30,
    fields: [
      { key: 'question', label: 'Question' },
      { key: 'answer', label: 'Answer', kind: 'long' },
    ],
    empty: { question: '', answer: '' },
  },
  Timeline: {
    key: 'items',
    label: 'Timeline event',
    max: 30,
    fields: [
      { key: 'label', label: 'Date or milestone label' },
      { key: 'title', label: 'Event title' },
      { key: 'text', label: 'Description', kind: 'long' },
    ],
    empty: { label: '', title: '', text: '' },
  },
};
const extraFields: Partial<Record<SectionType, Field[]>> = {
  Hero: [{ key: 'eyebrow', label: 'Eyebrow' }],
  ImageText: [
    { key: 'imageSide', label: 'Image position', kind: 'select', options: ['START', 'END'] },
    { key: 'action', label: 'Optional button', kind: 'action' },
  ],
  CTA: [{ key: 'action', label: 'Call to action', kind: 'action' }],
  Video: [
    { key: 'provider', label: 'Video provider', kind: 'select', options: ['YOUTUBE', 'VIMEO'] },
    { key: 'videoId', label: 'Provider video ID' },
    { key: 'transcript', label: 'Transcript', kind: 'long' },
  ],
  ContactBlock: [
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address', kind: 'long' },
    { key: 'action', label: 'Contact button', kind: 'action' },
  ],
  Newsletter: [
    { key: 'buttonLabel', label: 'Subscribe button label' },
    { key: 'consentLabel', label: 'Consent label', kind: 'long' },
    { key: 'successMessage', label: 'Success message', kind: 'long' },
  ],
  CustomHeading: [
    { key: 'level', label: 'Heading level', kind: 'select', options: ['h2', 'h3'] },
    { key: 'alignment', label: 'Alignment', kind: 'select', options: ['START', 'CENTER'] },
  ],
};
function reordered<T>(items: T[], index: number, to: number) {
  const next = [...items];
  const [item] = next.splice(index, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}
function RichEditor({ nodes, onChange }: { nodes: Data[]; onChange: (v: Data[]) => void }) {
  const [type, setType] = useState('paragraph');
  return (
    <fieldset className="pb-editor-group">
      <legend>Rich text content</legend>
      {nodes.map((node, i) => (
        <fieldset className="pb-editor-group" key={i}>
          <legend>
            {String(node.type)} {i + 1}
          </legend>
          {node.type === 'list' ? (
            <>
              <Select
                label="List style"
                value={node.ordered ? 'ordered' : 'unordered'}
                onChange={(e) =>
                  onChange(
                    nodes.map((n, j) =>
                      j === i ? { ...n, ordered: e.target.value === 'ordered' } : n,
                    ),
                  )
                }
              >
                <option value="unordered">Bullets</option>
                <option value="ordered">Numbered</option>
              </Select>
              <Textarea
                label="List items (one per line)"
                value={(node.items as string[]).join('\n')}
                onChange={(e) =>
                  onChange(
                    nodes.map((n, j) =>
                      j === i ? { ...n, items: e.target.value.split('\n') } : n,
                    ),
                  )
                }
              />
            </>
          ) : (
            <Fields
              fields={
                node.type === 'link'
                  ? [
                      { key: 'label', label: 'Link label' },
                      { key: 'href', label: 'Destination URL' },
                    ]
                  : [
                      { key: 'text', label: 'Text', kind: 'long' },
                      ...(node.type === 'heading'
                        ? [
                            {
                              key: 'level',
                              label: 'Heading level',
                              kind: 'select' as const,
                              options: ['h3', 'h4'],
                            },
                          ]
                        : []),
                      ...(node.type === 'quote'
                        ? [{ key: 'attribution', label: 'Attribution' }]
                        : []),
                    ]
              }
              value={node}
              onChange={(v) => onChange(nodes.map((n, j) => (j === i ? v : n)))}
            />
          )}
          <MoveButtons
            index={i}
            length={nodes.length}
            move={(to) => onChange(reordered(nodes, i, to))}
            remove={() => onChange(nodes.filter((_, j) => j !== i))}
          />
        </fieldset>
      ))}
      <Select label="Text block type" value={type} onChange={(e) => setType(e.target.value)}>
        {['paragraph', 'heading', 'list', 'quote', 'link'].map((t) => (
          <option key={t}>{t}</option>
        ))}
      </Select>
      <Button
        type="button"
        variant="secondary"
        disabled={nodes.length >= 40}
        onClick={() =>
          onChange([
            ...nodes,
            type === 'list'
              ? { type, items: [], ordered: false }
              : type === 'link'
                ? { type, label: '', href: '' }
                : {
                    type,
                    text: '',
                    ...(type === 'heading' ? { level: 'h3' } : {}),
                    ...(type === 'quote' ? { attribution: '' } : {}),
                  },
          ])
        }
      >
        Add text block
      </Button>
    </fieldset>
  );
}
function CatalogPicker({
  kind,
  locale,
  ids,
  onChange,
}: {
  kind: (typeof gridKinds)[keyof typeof gridKinds];
  locale: BuilderLocale;
  ids: string[];
  onChange: (ids: string[]) => void;
}) {
  const [q, setQ] = useState(''),
    [items, setItems] = useState<BuilderCard[]>([]),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void cmsApi(`page-builder/options?${new URLSearchParams({ kind, locale, q })}`)
        .then((r) => {
          if (active) {
            setItems(r.items as BuilderCard[]);
            setError('');
          }
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [kind, locale, q]);
  return (
    <fieldset className="pb-editor-group">
      <legend>Catalog records</legend>
      <Input
        label="Search published records by slug"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Select
        label="Add catalog record"
        value=""
        onChange={(e) => {
          if (e.target.value) onChange([...ids, e.target.value]);
        }}
        disabled={ids.length >= 24}
      >
        <option value="">Choose a record</option>
        {items
          .filter((item) => !ids.includes(item.id))
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
      </Select>
      {ids.map((id, i) => (
        <div className="pb-editor-group" key={id}>
          <p>{items.find((item) => item.id === id)?.title || id}</p>
          <MoveButtons
            index={i}
            length={ids.length}
            move={(to) => onChange(reordered(ids, i, to))}
            remove={() => onChange(ids.filter((v) => v !== id))}
          />
        </div>
      ))}
      {error && <p role="alert">{error}</p>}
      <p>
        Only published records in {locale.toUpperCase()} are offered. Their text stays managed in
        the catalog.
      </p>
    </fieldset>
  );
}
export function SectionEditor({
  section,
  locale,
  onChange,
}: {
  section: BuilderSection;
  locale: BuilderLocale;
  onChange: (s: BuilderSection) => void;
}) {
  const copy = (section.content[locale] || emptySectionCopy(section.type)) as Data;
  const setCopy = (value: Data) =>
    onChange({ ...section, content: { ...section.content, [locale]: value } } as BuilderSection);
  const repeater = repeaters[section.type];
  return (
    <div className="pb-section-editor">
      <p className="pb-editor-hint">
        {locale.toUpperCase()} content
        {!section.content[locale]
          ? ' — this section is hidden in this language until you add content.'
          : ''}
      </p>
      <Fields
        fields={[
          { key: 'heading', label: 'Section heading' },
          { key: 'text', label: 'Introduction', kind: 'long' },
          { key: 'media', label: 'Optional section image', kind: 'media' },
        ]}
        value={copy}
        onChange={setCopy}
      />
      <Fields fields={extraFields[section.type] || []} value={copy} onChange={setCopy} />
      {repeater && (
        <fieldset className="pb-editor-group">
          <legend>{repeater.label}s</legend>
          {(copy[repeater.key] as Data[]).map((item, i) => (
            <fieldset className="pb-editor-group" key={i}>
              <legend>
                {repeater.label} {i + 1}
              </legend>
              <Fields
                fields={repeater.fields}
                value={item}
                onChange={(value) =>
                  setCopy({
                    ...copy,
                    [repeater.key]: (copy[repeater.key] as Data[]).map((old, j) =>
                      j === i ? value : old,
                    ),
                  })
                }
              />
              <MoveButtons
                index={i}
                length={(copy[repeater.key] as Data[]).length}
                move={(to) =>
                  setCopy({
                    ...copy,
                    [repeater.key]: reordered(copy[repeater.key] as Data[], i, to),
                  })
                }
                remove={() =>
                  setCopy({
                    ...copy,
                    [repeater.key]: (copy[repeater.key] as Data[]).filter((_, j) => j !== i),
                  })
                }
              />
            </fieldset>
          ))}
          <Button
            type="button"
            variant="secondary"
            disabled={(copy[repeater.key] as Data[]).length >= repeater.max}
            onClick={() =>
              setCopy({
                ...copy,
                [repeater.key]: [
                  ...(copy[repeater.key] as Data[]),
                  structuredClone(repeater.empty),
                ],
              })
            }
          >
            Add {repeater.label.toLowerCase()}
          </Button>
        </fieldset>
      )}
      {section.type in gridKinds && (
        <CatalogPicker
          kind={gridKinds[section.type as keyof typeof gridKinds]}
          locale={locale}
          ids={copy.ids as string[]}
          onChange={(ids) => setCopy({ ...copy, ids })}
        />
      )}
      {section.type === 'RichText' && (
        <RichEditor
          nodes={copy.nodes as Data[]}
          onChange={(nodes) => setCopy({ ...copy, nodes })}
        />
      )}
      {section.type === 'ImageGallery' && (
        <fieldset className="pb-editor-group">
          <legend>Gallery</legend>
          {(copy.images as Data[]).map((media, i) => (
            <div key={i}>
              <MediaEditor
                label={`Gallery image ${i + 1}`}
                value={media}
                onChange={(image) =>
                  setCopy({
                    ...copy,
                    images: image
                      ? (copy.images as Data[]).map((old, j) => (j === i ? image : old))
                      : (copy.images as Data[]).filter((_, j) => j !== i),
                  })
                }
              />
              <MoveButtons
                index={i}
                length={(copy.images as Data[]).length}
                move={(to) => setCopy({ ...copy, images: reordered(copy.images as Data[], i, to) })}
                remove={() =>
                  setCopy({ ...copy, images: (copy.images as Data[]).filter((_, j) => j !== i) })
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            disabled={(copy.images as Data[]).length >= 24}
            onClick={() =>
              setCopy({
                ...copy,
                images: [...(copy.images as Data[]), { src: '', alt: '', caption: '' }],
              })
            }
          >
            Add gallery image
          </Button>
        </fieldset>
      )}
      {section.content[locale] && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const content = { ...section.content };
            delete content[locale];
            onChange({ ...section, content } as BuilderSection);
          }}
        >
          Remove this language from section
        </Button>
      )}
    </div>
  );
}
