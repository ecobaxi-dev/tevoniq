'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

/** A short, once-only illustration; visitors can replay it without leaving the card. */
export function ServiceDemo({
  children,
  variant,
  replay,
  label,
}: {
  children: ReactNode;
  variant: string;
  replay: string;
  label: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRun(1);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="sme-demo" ref={root}>
      <div className={`sme-service-preview sme-service-preview--${variant}`}>
        <div key={run} className="sme-demo-motion" data-playing={run > 0} aria-hidden="true">
          {children}
        </div>
      </div>
      <div className="sme-demo-controls">
        <span>{label}</span>
        <button
          type="button"
          className="sme-demo-replay"
          onClick={() => setRun((value) => value + 1)}
        >
          <RotateCcw size={14} aria-hidden="true" />
          {replay}
        </button>
      </div>
    </div>
  );
}
