'use client';
import { Heading } from '@tevoniq/ui';

import { useId, useState } from 'react';
import { ArrowRight, Layers3, Network, Play } from 'lucide-react';
import { Container, Modal, UIProvider } from '@tevoniq/ui';
import { LayerDemo, demoIcons } from '@/components/layer-demo';
import { demoCopy, findDemoKind } from '@/content/layer-demo';
import type { Locale } from '@tevoniq/types';
import type { HomeCopy } from '@/content/home';
import { connectedThinkingCopy } from '@/content/connected-thinking';
import { localizedHref } from '@/config/navigation';
import './connected-thinking.css';

export function ConnectedThinking({
  locale,
  copy,
}: {
  locale: Locale;
  copy: Pick<
    HomeCopy,
    'capabilityLabel' | 'capabilityTitle' | 'capabilityBody' | 'solutions' | 'explore' | 'pillars'
  >;
}) {
  const [selected, setSelected] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const id = useId();
  const ui = connectedThinkingCopy[locale];
  const solution = copy.solutions[selected];
  const ActiveIcon = demoIcons[findDemoKind(solution?.title ?? '')];

  return (
    <section
      id="connected-thinking"
      className="home-capability connected-thinking"
      aria-labelledby={`${id}-title`}
      data-theme="light"
    >
      <Container>
        <div className="connected-thinking__topline">
          <p className="connected-thinking__eyebrow">
            <span aria-hidden="true" />
            {copy.capabilityLabel}
          </p>
          <span className="connected-thinking__edition">
            TEVONIQ / <span>{ui.ecosystem}</span>
          </span>
        </div>
        <div className="connected-thinking__layout">
          <div className="connected-thinking__intro" data-entrance>
            <Heading as="h2" id={`${id}-title`}>
              {copy.capabilityTitle}
            </Heading>
            <p className="connected-thinking__body">{copy.capabilityBody}</p>
            <a className="connected-thinking__link" href={localizedHref(locale, '/solutions')}>
              {copy.explore}
              <ArrowRight size={19} aria-hidden="true" />
            </a>
            <ul className="connected-thinking__pillars">
              {copy.pillars.map((pillar, index) => (
                <li key={pillar}>
                  <span aria-hidden="true">0{index + 1}</span>
                  {pillar}
                </li>
              ))}
            </ul>
          </div>
          <div className="connected-thinking__console" data-entrance>
            <p className="connected-thinking__prompt" id={`${id}-prompt`}>
              <Layers3 size={15} aria-hidden="true" />
              {ui.prompt}
            </p>
            <div className="connected-thinking__map">
              <div className="connected-thinking__core">
                <div className="connected-thinking__core-icon" aria-hidden="true">
                  <Network size={30} strokeWidth={1.4} />
                </div>
                <span>{ui.core}</span>
              </div>
              <div
                className="connected-thinking__layers"
                role="group"
                aria-labelledby={`${id}-prompt`}
              >
                {copy.solutions.map((item, index) => {
                  const kind = findDemoKind(item.title);
                  const Icon = demoIcons[kind];
                  return (
                    <UIProvider key={item.title} direction={locale === 'ar' ? 'rtl' : 'ltr'}>
                      <Modal
                        title={item.title}
                        description={demoCopy[locale].label}
                        closeLabel={demoCopy[locale].close}
                        open={openIndex === index}
                        onOpenChange={(open) => {
                          setOpenIndex(open ? index : null);
                          if (open) setSelected(index);
                        }}
                        trigger={
                          <button
                            type="button"
                            className="connected-thinking__layer"
                            aria-pressed={selected === index}
                          >
                            <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
                            <span>{item.title}</span>
                            <span className="connected-thinking__layer-index" aria-hidden="true">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="connected-thinking__demo-play" aria-hidden="true">
                              <Play size={14} />
                            </span>
                          </button>
                        }
                      >
                        {openIndex === index && <LayerDemo kind={kind} locale={locale} />}
                      </Modal>
                    </UIProvider>
                  );
                })}
              </div>
            </div>
            <div
              className="connected-thinking__detail"
              id={`${id}-detail`}
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="connected-thinking__detail-icon" aria-hidden="true">
                <ActiveIcon size={25} strokeWidth={1.4} />
              </div>
              <div>
                <p className="connected-thinking__detail-label">{ui.detail}</p>
                <Heading as="h3">{solution?.title}</Heading>
                <p className="connected-thinking__description">{solution?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
