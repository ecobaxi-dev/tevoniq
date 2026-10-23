import { Heading } from '@tevoniq/ui';
import Image from 'next/image';
import type { ArticleBlock } from '@tevoniq/validation';
export function ArticleContent({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="insight-prose">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={index}>{block.text}</p>;
          case 'heading':
            return block.level === 2 ? (
              <Heading as="h2" key={index}>
                {block.text}
              </Heading>
            ) : (
              <Heading as="h3" key={index}>
                {block.text}
              </Heading>
            );
          case 'list': {
            const List = block.ordered ? 'ol' : 'ul';
            return (
              <List key={index}>
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </List>
            );
          }
          case 'quote':
            return (
              <blockquote key={index}>
                <p>{block.text}</p>
                {block.attribution && <cite>{block.attribution}</cite>}
              </blockquote>
            );
          case 'code':
            return (
              <pre key={index}>
                <code data-language={block.language}>{block.code}</code>
              </pre>
            );
          case 'image':
            return (
              <figure key={index}>
                <Image
                  unoptimized
                  src={block.url}
                  alt={block.alt}
                  width={1200}
                  height={800}
                  style={{ width: '100%', height: 'auto' }}
                />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          case 'link':
            return (
              <p key={index}>
                <a href={block.url} rel="noopener noreferrer">
                  {block.text}
                </a>
              </p>
            );
        }
      })}
    </div>
  );
}
