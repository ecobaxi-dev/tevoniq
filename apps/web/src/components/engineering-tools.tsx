'use client';
import { useId, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ClipboardCheck } from 'lucide-react';
import {
  engineeringServices,
  engineeringStages,
  type EngineeringLocale,
} from '@/content/software-engineering';
const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
function useEnhanced() {
  return useSyncExternalStore(subscribe, clientReady, serverReady);
}
export function EngineeringServiceExplorer({ locale }: { locale: EngineeringLocale }) {
  const enhanced = useEnhanced();
  const ar = locale === 'ar',
    id = useId();
  const [selected, setSelected] = useState('discovery');
  const item = engineeringServices.find((item) => item.id === selected) ?? engineeringServices[0]!;
  const c = item[locale];
  return (
    <div className="se-service-explorer">
      <fieldset className="se-service-choices" hidden={!enhanced}>
        <legend>{ar ? 'اختر ما يحتاجه مشروعك' : 'Choose what your project needs'}</legend>
        {engineeringServices.map((item) => (
          <label key={item.id} data-selected={selected === item.id}>
            <input
              type="radio"
              name={`engineering-service-${id}`}
              value={item.id}
              checked={selected === item.id}
              onChange={() => setSelected(item.id)}
            />
            <strong>{item[locale].title}</strong>
          </label>
        ))}
      </fieldset>
      <div className="se-service-panels">
        {engineeringServices.map((entry) => (
          <article
            key={entry.id}
            className="se-service-panel"
            hidden={enhanced && entry.id !== selected}
          >
            <h3>{entry[locale].title}</h3>
            <p>{entry[locale].body}</p>
            <ul>
              {entry[locale].items.map((line) => (
                <li key={line}>
                  <Check size={17} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="se-output">
              <ClipboardCheck size={21} aria-hidden="true" />
              {entry[locale].output}
            </div>
            <div className="erp-actions">
              <Link className="erp-primary" href={`/${locale}/${entry.href}`}>
                {ar ? 'استكشف مثالًا مرتبطًا' : 'Explore a related example'}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <Link
                className="erp-secondary"
                href={`/${locale}/contact?intent=quote&engineering=service&id=${entry.id}`}
              >
                {ar ? 'ناقش هذه الخدمة' : 'Discuss this service'}
              </Link>
            </div>
          </article>
        ))}
      </div>
      <span className="se-sr-only" aria-live="polite">
        {c.title}
      </span>
    </div>
  );
}
export function EngineeringStages({ locale }: { locale: EngineeringLocale }) {
  const enhanced = useEnhanced();
  const ar = locale === 'ar',
    id = useId();
  const [selected, setSelected] = useState('define');
  return (
    <div className="se-stages">
      <fieldset className="se-stage-choices" hidden={!enhanced}>
        <legend>{ar ? 'استكشف مراحل العمل' : 'Explore the delivery stages'}</legend>
        {engineeringStages.map((stage, index) => (
          <label key={stage.id} data-selected={selected === stage.id}>
            <input
              type="radio"
              name={`engineering-stage-${id}`}
              value={stage.id}
              checked={selected === stage.id}
              onChange={() => setSelected(stage.id)}
            />
            <span aria-hidden="true">0{index + 1}</span>
            <strong>{stage[locale].title}</strong>
          </label>
        ))}
      </fieldset>
      <div className="se-stage-panels">
        {engineeringStages.map((stage) => (
          <article key={stage.id} hidden={enhanced && selected !== stage.id}>
            <h3>{stage[locale].title}</h3>
            <p>{stage[locale].body}</p>
            <div className="se-stage-grid">
              <div>
                <strong>{ar ? 'ما الذي تحصل عليه؟' : 'What do you receive?'}</strong>
                <p>{stage[locale].output}</p>
              </div>
              <div>
                <strong>{ar ? 'كيف نقرر الانتقال؟' : 'How do we decide to proceed?'}</strong>
                <p>{stage[locale].gate}</p>
              </div>
            </div>
            <Link href={`/${locale}/contact?intent=quote&engineering=stage&id=${stage.id}`}>
              {ar ? 'ناقش هذه المرحلة' : 'Discuss this stage'}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
