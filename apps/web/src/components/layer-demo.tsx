'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  BrainCircuit,
  Cloud,
  ShieldCheck,
  Layers3,
  Code2,
  Network,
  FileText,
  Users,
  Monitor,
  Server,
  Check,
  X,
  Pause,
  Play,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import { demoCopy, type DemoKind } from '@/content/layer-demo';
import './layer-demo.css';

export const demoIcons: Record<DemoKind, LucideIcon> = {
  ai: BrainCircuit,
  cloud: Cloud,
  security: ShieldCheck,
  integration: Layers3,
  software: Code2,
  network: Network,
  general: Layers3,
};
const nodes: Record<DemoKind, [LucideIcon, LucideIcon, LucideIcon]> = {
  ai: [FileText, BrainCircuit, Users],
  cloud: [Monitor, Cloud, Server],
  security: [Users, ShieldCheck, Server],
  integration: [Monitor, Layers3, Server],
  software: [Monitor, Code2, Check],
  network: [Monitor, Network, Server],
  general: [Users, Layers3, Check],
};
const subscribeMotion = (listener: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
};
const motionSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function LayerDemo({ kind, locale }: { kind: DemoKind; locale: Locale }) {
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => true);
  const [step, setStep] = useState(0);
  const [playback, setPlayback] = useState<boolean | null>(null);
  const playing = !reducedMotion && (playback ?? true);
  const copy = demoCopy[locale];
  const scenario = copy.scenarios[kind];
  const packetPath =
    kind === 'network'
      ? step === 0
        ? 'M100 105 L300 50'
        : 'M300 50 L500 105'
      : step === 0
        ? 'M100 105 H300'
        : 'M300 105 H500';
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((current) => (current + 1) % 3), 4800);
    return () => window.clearInterval(timer);
  }, [playing]);
  return (
    <div
      className="layer-demo"
      data-demo-kind={kind}
      data-step={step}
      data-playing={playing}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="layer-demo__stage" aria-hidden="true">
        <div className="layer-demo__scene-label">{String(step + 1).padStart(2, '0')} / 03</div>
        {kind === 'software' ? (
          <div className="layer-demo__browser">
            <span className="layer-demo__browser-bar">
              <i />
              <i />
              <i />
            </span>
            <div className="layer-demo__wireframe">
              <span />
              <span />
              <span />
              <div className="layer-demo__action">
                {step === 2 ? <Check size={26} /> : <Code2 size={26} />}
              </div>
            </div>
          </div>
        ) : (
          <>
            <svg className="layer-demo__routes" viewBox="0 0 600 210" preserveAspectRatio="none">
              <path
                d={
                  kind === 'network'
                    ? 'M100 105 L300 50 L500 105 M100 105 L300 160 L500 105'
                    : kind === 'cloud'
                      ? 'M100 105 H300 M300 105 L500 50 M300 105 H500 M300 105 L500 160'
                      : 'M100 105 H500'
                }
              />
              <path className="layer-demo__packet" d={packetPath} />
            </svg>
            <div className="layer-demo__nodes">
              {nodes[kind].map((Icon, index) => (
                <div
                  key={index}
                  className="layer-demo__node"
                  data-active={index === step}
                  data-complete={index < step}
                >
                  <Icon size={34} strokeWidth={1.4} />
                  {index < step && <Check className="layer-demo__complete" size={15} />}
                </div>
              ))}
            </div>
            {kind === 'ai' && (
              <div className="layer-demo__documents">
                <i />
                <i />
                <i />
              </div>
            )}
            {kind === 'cloud' && (
              <div className="layer-demo__replicas">
                <Server size={20} />
                <Server size={20} />
              </div>
            )}
            {kind === 'security' && (
              <div className="layer-demo__blocked">
                <X size={20} />
                <span />
              </div>
            )}
            {kind === 'integration' && (
              <div className="layer-demo__mapping">
                <span>{'{ a: 1 }'}</span>
                <span>{'<a>1</a>'}</span>
              </div>
            )}
            {kind === 'network' && (
              <span className="layer-demo__router">
                <Network size={21} />
              </span>
            )}
          </>
        )}
        <div className="layer-demo__progress">
          {scenario.map((_, index) => (
            <span key={index} data-active={index <= step} />
          ))}
        </div>
      </div>
      <div
        className="layer-demo__caption"
        aria-live={playing ? 'off' : 'polite'}
        aria-atomic="true"
      >
        <h3>{scenario[step]?.title}</h3>
        <p>{scenario[step]?.body}</p>
      </div>
      <div className="layer-demo__steps" role="group" aria-label={copy.steps}>
        {scenario.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-pressed={step === index}
            onClick={() => {
              setPlayback(false);
              setStep(index);
            }}
          >
            <span aria-hidden="true">{index + 1}</span>
            {item.title}
          </button>
        ))}
      </div>
      {reducedMotion && <p className="layer-demo__motion-hint">{copy.motionHint}</p>}
      <div className="layer-demo__controls">
        <button type="button" disabled={reducedMotion} onClick={() => setPlayback(!playing)}>
          {playing ? <Pause size={17} /> : <Play size={17} />}
          {playing ? copy.pause : copy.play}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep(0);
            setPlayback(!reducedMotion);
          }}
        >
          <RotateCcw size={17} />
          {copy.replay}
        </button>
      </div>
    </div>
  );
}
