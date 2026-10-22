'use client';
import { Button, Input, Textarea, Select, Checkbox } from '@tevoniq/ui';
import type { ArticleBlock } from '@tevoniq/validation';
export function emptyArticleBlock(type: ArticleBlock['type']): ArticleBlock {
  switch (type) {
    case 'paragraph':
      return { type, text: '' };
    case 'heading':
      return { type, text: '', level: 2 };
    case 'list':
      return { type, items: [''], ordered: false };
    case 'quote':
      return { type, text: '', attribution: '' };
    case 'code':
      return { type, code: '', language: '' };
    case 'image':
      return { type, url: '', alt: '', caption: '' };
    case 'link':
      return { type, text: '', url: '' };
  }
}
export function ArticleBlockEditor({
  blocks,
  onChange,
}: {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}) {
  const update = (index: number, block: ArticleBlock) =>
    onChange(blocks.map((b, i) => (i === index ? block : b)));
  function move(index: number, delta: number) {
    const next = [...blocks];
    [next[index], next[index + delta]] = [next[index + delta]!, next[index]!];
    onChange(next);
  }
  return (
    <div className="insight-editor-fields">
      <h2 className="tv-h3">Article content</h2>
      {blocks.map((block, index) => (
        <fieldset className="insight-block-editor" key={index}>
          <legend>
            {index + 1}. {block.type}
          </legend>
          {'text' in block && (
            <Textarea
              label="Text"
              rows={block.type === 'paragraph' ? 5 : 2}
              value={block.text}
              onChange={(e) => update(index, { ...block, text: e.target.value })}
            />
          )}
          {block.type === 'heading' && (
            <Select
              label="Heading level"
              value={block.level}
              onChange={(e) => update(index, { ...block, level: Number(e.target.value) as 2 | 3 })}
            >
              <option value={2}>Heading 2</option>
              <option value={3}>Heading 3</option>
            </Select>
          )}
          {block.type === 'list' && (
            <>
              <Textarea
                label="Items (one per line)"
                value={block.items.join('\n')}
                onChange={(e) => update(index, { ...block, items: e.target.value.split('\n') })}
              />
              <Checkbox
                label="Numbered list"
                checked={block.ordered}
                onChange={(e) => update(index, { ...block, ordered: e.target.checked })}
              />
            </>
          )}
          {block.type === 'quote' && (
            <Input
              label="Attribution"
              value={block.attribution}
              onChange={(e) => update(index, { ...block, attribution: e.target.value })}
            />
          )}
          {block.type === 'code' && (
            <>
              <Input
                label="Code language"
                value={block.language}
                onChange={(e) => update(index, { ...block, language: e.target.value })}
              />
              <Textarea
                label="Code"
                rows={8}
                value={block.code}
                onChange={(e) => update(index, { ...block, code: e.target.value })}
              />
            </>
          )}
          {(block.type === 'image' || block.type === 'link') && (
            <Input
              label="HTTP(S) URL"
              type="url"
              value={block.url}
              onChange={(e) => update(index, { ...block, url: e.target.value })}
            />
          )}
          {block.type === 'image' && (
            <>
              <Input
                label="Image description (alt text)"
                value={block.alt}
                onChange={(e) => update(index, { ...block, alt: e.target.value })}
              />
              <Input
                label="Caption"
                value={block.caption}
                onChange={(e) => update(index, { ...block, caption: e.target.value })}
              />
            </>
          )}
          <div className="insight-editor-actions">
            <Button
              type="button"
              variant="secondary"
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              Move up
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={index === blocks.length - 1}
              onClick={() => move(index, 1)}
            >
              Move down
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onChange(blocks.filter((_, i) => i !== index))}
            >
              Remove block
            </Button>
          </div>
        </fieldset>
      ))}
      <Select
        label="Add content block"
        value=""
        onChange={(e) => {
          if (e.target.value)
            onChange([...blocks, emptyArticleBlock(e.target.value as ArticleBlock['type'])]);
        }}
      >
        <option value="">Choose a block…</option>
        {['paragraph', 'heading', 'list', 'quote', 'code', 'image', 'link'].map((t) => (
          <option key={t}>{t}</option>
        ))}
      </Select>
    </div>
  );
}
