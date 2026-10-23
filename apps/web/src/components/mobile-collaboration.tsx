'use client';
import { Heading } from '@tevoniq/ui';

import { useId, useRef, useState, type KeyboardEvent } from 'react';

export function MobileCollaboration({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const group = useRef<HTMLDivElement>(null);
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const rtl = group.current && getComputedStyle(group.current).direction === 'rtl';
    let next = index;
    if (event.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + items.length) % items.length;
    else if (event.key === 'ArrowLeft')
      next = (index + (rtl ? 1 : -1) + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    group.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }
  return (
    <div className="mobile-cooperation">
      <div className="mobile-cooperation__tabs" role="tablist" ref={group}>
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.title}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={index}
          className="mobile-cooperation__panel"
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={selected !== index}
          tabIndex={0}
        >
          <Heading as="h3">{item.title}</Heading>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
