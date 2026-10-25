'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  Compass,
  Layers3,
  Rocket,
  Target,
  ClipboardCheck,
  Network,
  ShieldCheck,
  CheckCheck,
  Check,
  FileCheck2,
} from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import { solutionExperience } from '@/content/solution-experience';
import { journeyCopy, journeyKeyIndex } from '@/content/solution-journey';
import './solution-journey.css';

const icons = [Compass, Layers3, Rocket];
const sceneIcons = [
  [Target, Compass, ClipboardCheck],
  [Network, Layers3, ShieldCheck],
  [ClipboardCheck, Rocket, CheckCheck],
];

function JourneyVisual({ index }: { index: number }) {
  const stageIcons = sceneIcons[index] ?? sceneIcons[0]!;
  return (
    <div className="journey-visual" data-stage={index} aria-hidden="true">
      <div className="journey-visual-header">
        <span className="journey-window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>TEVONIQ</span>
      </div>
      <div className="journey-network">
        <span className="journey-network-line" />
        {stageIcons.map((Icon, i) => (
          <div key={i} className={`journey-node${i === 1 ? ' journey-node--core' : ''}`}>
            <Icon strokeWidth={1.4} />
            <span />
          </div>
        ))}
      </div>
      <div className="journey-visual-sheet">
        <div>
          <span />
          <span />
          <span />
        </div>
        <FileCheck2 size={28} strokeWidth={1.3} />
      </div>
      <div className="journey-visual-progress">
        {icons.map((Icon, i) => (
          <span key={i} data-complete={i <= index}>
            <Icon size={16} strokeWidth={1.5} />
          </span>
        ))}
      </div>
      <span className="journey-visual-orbit" />
    </div>
  );
}

export function SolutionJourney({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const copy = solutionExperience[locale],
    details = journeyCopy[locale];
  const selectByKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const next = journeyKeyIndex(event.key, index, copy.steps.length, locale === 'ar');
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };
  return (
    <div className="solution-journey">
      <div className="journey-tabs" role="tablist" aria-label={copy.approachTitle}>
        {copy.steps.map((step, index) => {
          const Icon = icons[index] ?? Compass;
          return (
            <button
              key={step.title}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${index}`}
              aria-selected={active === index}
              aria-controls={`${uid}-panel-${index}`}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => selectByKey(event, index)}
            >
              <span className="journey-tab-icon">
                <Icon size={23} strokeWidth={1.5} />
              </span>
              <span className="journey-tab-copy">
                <small>0{index + 1}</small>
                <span>{step.title}</span>
              </span>
              <span className="journey-tab-indicator" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {copy.steps.map((step, index) => {
        const stage = details.stages[index]!;
        return (
          <div
            key={step.title}
            className="journey-panel"
            role="tabpanel"
            id={`${uid}-panel-${index}`}
            aria-labelledby={`${uid}-tab-${index}`}
            hidden={active !== index}
            tabIndex={0}
          >
            <div className="journey-panel-copy">
              <p className="journey-stage-label">
                <span />
                {details.stage}
                <b>0{index + 1}</b>
                <span className="journey-stage-total">/ 03</span>
              </p>
              <h3>{step.title}</h3>
              <p className="journey-description">{step.body}</p>
              <ul className="journey-checklist">
                {stage.points.map((point) => (
                  <li key={point}>
                    <Check size={15} aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="journey-deliverable">
                <FileCheck2 size={23} aria-hidden="true" />
                <div>
                  <span>{details.outcome}</span>
                  <strong>{stage.deliverable}</strong>
                </div>
              </div>
            </div>
            <JourneyVisual index={index} />
          </div>
        );
      })}
    </div>
  );
}
