'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export function HomeEntrances({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('home-entered');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    const nodes = root.current?.querySelectorAll('[data-entrance]');
    nodes?.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return <div ref={root}>{children}</div>;
}
