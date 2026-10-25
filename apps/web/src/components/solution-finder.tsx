'use client';

import { useId, useState } from 'react';
import { ArrowUpRight, Workflow, ShieldCheck, PanelsTopLeft } from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import {
  solutionExperience,
  solutionTracks,
  type SolutionTrack,
} from '@/content/solution-experience';

type Suggestion = { id: string; slug: string; name: string };
const icons = { workflow: Workflow, resilience: ShieldCheck, experience: PanelsTopLeft };
export function SolutionFinder({ locale, solutions }: { locale: Locale; solutions: Suggestion[] }) {
  const copy = solutionExperience[locale];
  const panelId = useId();
  const available = (Object.keys(solutionTracks) as SolutionTrack[]).filter((key) =>
    solutions.some((s) => solutionTracks[key].includes(s.slug)),
  );
  const [selected, setSelected] = useState<SolutionTrack>('workflow');
  const active = available.includes(selected) ? selected : available[0];
  if (!solutions.length) return null;
  const matches = active
    ? solutions.filter((s) => solutionTracks[active].includes(s.slug))
    : solutions.slice(0, 3);
  return (
    <div className="solution-finder">
      <p className="solution-finder-eyebrow">
        <span aria-hidden="true" />
        {copy.finderEyebrow}
      </p>
      <h2>{active ? copy.finderTitle : copy.catalogTitle}</h2>
      <p className="solution-finder-hint">{active ? copy.finderHint : copy.catalogBody}</p>
      {available.length > 0 && (
        <div className="solution-goals" role="group" aria-label={copy.finderTitle}>
          {available.map((key) => {
            const Icon = icons[key];
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active === key}
                aria-controls={panelId}
                onClick={() => setSelected(key)}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{copy.tracks[key]}</span>
              </button>
            );
          })}
        </div>
      )}
      <div id={panelId} className="solution-recommendations" aria-live="polite" aria-atomic="true">
        {active && <p>{copy.trackDescriptions[active]}</p>}
        <p className="solution-finder-label">{copy.suggested}</p>
        <ul>
          {matches.map((solution) => (
            <li key={solution.id}>
              <a href={`/${locale}/solutions/${solution.slug}`}>
                {solution.name}
                <ArrowUpRight size={18} className="solutions-arrow" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
