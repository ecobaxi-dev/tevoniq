'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import {
  automationServiceCopy,
  type AutomationServiceLocale,
} from '@/content/intelligent-automation';
import { journeyPath, journeyProgress } from '@/lib/automation-journey';
export function AutomationJourney({ locale }: { locale: AutomationServiceLocale }) {
  const ar = locale === 'ar';
  const stages = automationServiceCopy[locale].stages;
  const root = useRef<HTMLOListElement>(null);
  const gradient = useId();
  const [visual, setVisual] = useState({ width: 1, height: 1, path: '', progress: 0, current: -1 });
  useEffect(() => {
    const list = root.current;
    if (!list) return;
    let frame = 0;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const measure = () => {
      frame = 0;
      const bounds = list.getBoundingClientRect();
      const rows = Array.from(list.children).filter(
        (item): item is HTMLLIElement => item instanceof HTMLLIElement,
      );
      const points = rows.map((row, index) => {
        const circle = row.querySelector('.ia-stage-number')!.getBoundingClientRect();
        const next = rows[index + 1]?.getBoundingClientRect();
        return {
          x: circle.left - bounds.left + circle.width / 2,
          y: circle.top - bounds.top + circle.height / 2,
          bottom: row.getBoundingClientRect().bottom - bounds.top,
          nextTop: next ? next.top - bounds.top : undefined,
        };
      });
      const readingLine = window.innerHeight * 0.62 - bounds.top;
      const progress = motion.matches
        ? 1
        : journeyProgress(points[0]!.y, points.at(-1)!.y, readingLine);
      const current = points.reduce(
        (active, point, index) => (readingLine >= point.y ? index : active),
        -1,
      );
      const value = {
        width: bounds.width,
        height: bounds.height,
        path: journeyPath(points),
        progress,
        current,
      };
      setVisual((previous) =>
        Object.keys(value).every(
          (key) => previous[key as keyof typeof value] === value[key as keyof typeof value],
        )
          ? previous
          : value,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    Array.from(list.children).forEach((child) => {
      if (child instanceof HTMLLIElement) observer.observe(child);
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);
  return (
    <div className="ia-journey-wrap">
      <svg
        className="ia-journey-path"
        viewBox={`0 0 ${visual.width} ${visual.height}`}
        aria-hidden="true"
        preserveAspectRatio="none"
        data-progress={visual.progress}
      >
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f79442" />
            <stop offset="50%" stopColor="#e35c5b" />
            <stop offset="100%" stopColor="#bd357b" />
          </linearGradient>
        </defs>
        <path d={visual.path} className="ia-path-track" />
        <path
          d={visual.path}
          stroke={`url(#${gradient})`}
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - visual.progress}
          className="ia-path-progress"
        />
      </svg>
      <ol className="ia-journey" ref={root}>
        {stages.map((stage, index) => (
          <li
            key={stage.id}
            id={`automation-stage-${stage.id}`}
            className="ia-stage"
            data-current={visual.current === index}
          >
            <a
              className="ia-stage-number"
              href={`#automation-stage-${stage.id}`}
              aria-label={`${ar ? 'المرحلة' : 'Stage'} ${index + 1}: ${stage.title}`}
              aria-current={visual.current === index ? 'step' : undefined}
            >
              <span>{index + 1}</span>
            </a>
            <div className="ia-stage-content">
              <p className="ia-stage-label">
                {ar ? `المرحلة ٠${'١٢٣٤٥'[index]}` : `STAGE 0${index + 1}`}
              </p>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
              <div className="ia-stage-output">
                <Check size={17} aria-hidden="true" />
                <span>
                  <strong>{ar ? 'المخرج: ' : 'OUTPUT: '}</strong>
                  {stage.output}
                </span>
              </div>
              <details>
                <summary>
                  {ar ? 'ماذا تشمل هذه المرحلة؟' : 'What does this stage include?'}
                  <span aria-hidden="true">+</span>
                </summary>
                <ul>
                  {stage.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
                <Link href={`/${locale}/contact?intent=quote&journey=${stage.id}`}>
                  {ar ? 'ناقش هذه الخطوة' : 'Discuss this step'}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </details>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
