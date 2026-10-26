'use client';
import { useId, useRef, useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
export function DigitalExpertise({
  groups,
  label,
}: {
  groups: { title: string; items: string[] }[];
  label: string;
}) {
  const [active, setActive] = useState(0),
    id = useId(),
    refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="digital-expertise">
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label={label}
        className="digital-expertise-tabs"
      >
        {groups.map((group, i) => (
          <button
            type="button"
            key={group.title}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            ref={(node) => {
              refs.current[i] = node;
            }}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.altKey || e.metaKey || e.ctrlKey) return;
              const next =
                e.key === 'Home'
                  ? 0
                  : e.key === 'End'
                    ? groups.length - 1
                    : e.key === 'ArrowDown'
                      ? (i + 1) % groups.length
                      : e.key === 'ArrowUp'
                        ? (i - 1 + groups.length) % groups.length
                        : null;
              if (next === null) return;
              e.preventDefault();
              setActive(next);
              refs.current[next]?.focus();
            }}
          >
            <span>{group.title}</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="digital-expertise-panels">
        {groups.map((group, i) => (
          <div
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            tabIndex={0}
            hidden={active !== i}
            key={group.title}
          >
            <span className="digital-eyebrow">
              {String(i + 1).padStart(2, '0')} / {String(groups.length).padStart(2, '0')}
            </span>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>
                  <Check size={17} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
