'use client';
import { Input, Textarea, Select } from '@tevoniq/ui';
import type { ServiceBlock } from '@tevoniq/validation';

// Shared field controls; Solutions supply business section semantics separately.
export function BlockFields({
  block,
  onChange,
  onRawChange,
  relationships = true,
}: {
  block: ServiceBlock;
  onChange: (patch: Record<string, unknown>) => void;
  onRawChange: (text: string) => void;
  relationships?: boolean;
}) {
  return (
    <>
      <Input
        label="Block heading"
        value={block.title}
        onChange={(e) => onChange({ title: e.target.value })}
      />
      {block.type === 'hero' && (
        <>
          <Textarea
            label="Hero description"
            value={block.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
          <Select
            label="Official artwork"
            value={block.assetKey}
            onChange={(e) => onChange({ assetKey: e.target.value })}
          >
            <option value="none">None</option>
            <option value="brand-icon">Brand icon</option>
            <option value="home">Home artwork (hidden if not supplied)</option>
          </Select>
        </>
      )}
      {'body' in block && (
        <Textarea
          label="Body"
          value={block.body}
          onChange={(e) => onChange({ body: e.target.value })}
        />
      )}
      {block.type === 'cta' && (
        <>
          <Input
            label="Button label"
            value={block.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
          <Input
            label="Internal destination (without locale)"
            value={block.href}
            onChange={(e) => onChange({ href: e.target.value })}
          />
        </>
      )}
      {('items' in block || ('ids' in block && relationships)) && (
        <Textarea
          label={'ids' in block ? 'Related record IDs (JSON array)' : 'Items (JSON array)'}
          hint={
            'ids' in block
              ? 'Use existing CMS UUIDs. Unpublished records are excluded automatically.'
              : block.type === 'faq'
                ? 'Each item requires question and answer.'
                : 'Each item requires title and description.'
          }
          dir="ltr"
          defaultValue={JSON.stringify(
            'ids' in block ? block.ids : 'items' in block ? block.items : [],
            null,
            2,
          )}
          rows={6}
          onChange={(e) => onRawChange(e.target.value)}
        />
      )}
    </>
  );
}
export function emptyBlock(type: ServiceBlock['type']): ServiceBlock {
  const base = { id: crypto.randomUUID(), title: '' };
  if (type === 'hero') return { ...base, type, description: '', assetKey: 'none' };
  if (type === 'overview') return { ...base, type, body: '' };
  if (type === 'cta') return { ...base, type, body: '', label: '', href: '/contact' };
  if (type === 'related-services' || type === 'related-projects') return { ...base, type, ids: [] };
  return { ...base, type, items: [] };
}
export function resolveBlockFields(block: ServiceBlock, raw: Record<string, string>): ServiceBlock {
  if (raw[block.id] === undefined) return block;
  return {
    ...block,
    ...('ids' in block
      ? { ids: JSON.parse(raw[block.id]!) }
      : { items: JSON.parse(raw[block.id]!) }),
  } as ServiceBlock;
}
