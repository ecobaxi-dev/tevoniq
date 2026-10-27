'use client';
import { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, Check, Database, ClipboardCheck } from 'lucide-react';
import { erpCopy, erpModules, type ErpLocale } from '@/content/erp-service';
import { erpBrief } from '@/lib/erp-service';
export function ErpModuleExplorer({ locale }: { locale: ErpLocale }) {
  const ar = locale === 'ar';
  const [selected, setSelected] = useState('sales');
  const groupId = useId();
  const selectedModule = erpModules.find((item) => item.id === selected) ?? erpModules[0]!;
  const c = selectedModule[locale];
  const download = () => {
    const brief = erpBrief(selectedModule.id, locale);
    if (!brief) return;
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `tevoniq-erp-${selectedModule.id}-${locale}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="erp-explorer">
      <fieldset className="erp-module-choices">
        <legend>{ar ? 'اختر وحدة لاستكشافها' : 'Choose a module to explore'}</legend>
        {erpModules.map((item, index) => (
          <label key={item.id} data-selected={item.id === selected}>
            <input
              type="radio"
              name={`erp-module-${groupId}`}
              value={item.id}
              checked={item.id === selected}
              onChange={() => setSelected(item.id)}
            />
            <span aria-hidden="true">0{index + 1}</span>
            <strong>{item[locale].title}</strong>
            <ArrowUpRight size={17} aria-hidden="true" />
          </label>
        ))}
      </fieldset>
      <section
        className="erp-module-panel"
        aria-label={ar ? 'تفاصيل الوحدة المختارة' : 'Selected module details'}
      >
        <p className="erp-kicker">
          {ar ? 'تصوّر أولي قابل للنقاش' : 'AN INITIAL SCOPE TO DISCUSS'}
        </p>
        <h3>{c.title}</h3>
        <p>{c.body}</p>
        <div
          className="erp-module-diagram"
          aria-label={ar ? 'حقول الوحدة ومخرج العمل' : 'Module fields and workflow output'}
        >
          <div className="erp-module-fields">
            {c.fields.map((field) => (
              <span key={field}>
                <Database size={17} aria-hidden="true" />
                {field}
              </span>
            ))}
          </div>
          <div className="erp-module-connector" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="erp-module-output">
            <ClipboardCheck size={24} aria-hidden="true" />
            <strong>{c.output}</strong>
          </div>
        </div>
        <p className="erp-module-boundary">
          <Check size={17} aria-hidden="true" />
          {c.boundary}
        </p>
        <div className="erp-actions">
          <Link className="erp-primary" href={`/${locale}/work-systems/${selectedModule.model}`}>
            {ar ? 'شاهد نموذجًا قريبًا' : 'Explore a related demo'}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <Link
            className="erp-secondary"
            href={`/${locale}/contact?intent=quote&erp=module&module=${selectedModule.id}`}
          >
            {ar ? 'ناقش هذه الوحدة' : 'Discuss this module'}
          </Link>
          <button className="erp-download" onClick={download}>
            <Download size={17} aria-hidden="true" />
            {ar ? 'تحميل الملخص' : 'Download brief'}
          </button>
        </div>
      </section>
      <noscript>
        <div className="erp-static-modules">
          {erpModules.map((item) => (
            <details key={item.id}>
              <summary>{item[locale].title}</summary>
              <p>{item[locale].body}</p>
              <ul>
                {item[locale].fields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
              <p>{item[locale].output}</p>
              <p>{item[locale].boundary}</p>
              <Link href={`/${locale}/work-systems/${item.model}`}>
                {ar ? 'شاهد نموذجًا قريبًا' : 'Explore a related demo'}
              </Link>
            </details>
          ))}
        </div>
      </noscript>
    </div>
  );
}
export function ErpComparison({ locale }: { locale: ErpLocale }) {
  const ar = locale === 'ar',
    c = erpCopy[locale];
  const [option, setOption] = useState<'ready' | 'custom'>('ready');
  const groupId = useId();
  return (
    <div className="erp-comparison">
      <div
        className="erp-table-scroll"
        role="region"
        aria-label={
          ar
            ? 'جدول مقارنة خيارات النظام، قابل للتمرير أفقيًا'
            : 'System options comparison, horizontally scrollable'
        }
        tabIndex={0}
      >
        <table>
          <caption>
            {ar
              ? 'نقارن الملاءمة والتكلفة والمسؤوليات قبل اختيار مسار التنفيذ.'
              : 'Compare fit, costs and responsibilities before choosing a delivery path.'}
          </caption>
          <thead>
            <tr>
              <th scope="col">{ar ? 'وجه المقارنة' : 'Consideration'}</th>
              <th scope="col" data-selected={option === 'ready'}>
                {c.options.ready.title}
              </th>
              <th scope="col" data-selected={option === 'custom'}>
                {c.options.custom.title}
              </th>
            </tr>
          </thead>
          <tbody>
            {c.comparison.map(([label, ready, custom]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td data-selected={option === 'ready'}>{ready}</td>
                <td data-selected={option === 'custom'}>{custom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="erp-option-review">
        <fieldset>
          <legend>{ar ? 'أي خيار تريد مناقشته؟' : 'Which option would you discuss?'}</legend>
          {(['ready', 'custom'] as const).map((value) => (
            <label key={value}>
              <input
                type="radio"
                name={`erp-option-${groupId}`}
                value={value}
                checked={option === value}
                onChange={() => setOption(value)}
              />
              {c.options[value].title}
            </label>
          ))}
        </fieldset>
        <div className="erp-option-detail">
          <h3>{c.options[option].title}</h3>
          <p>{c.options[option].body}</p>
          <Link href={`/${locale}/contact?intent=quote&erp=option&option=${option}`}>
            {ar ? 'لنراجع هذا الخيار معًا' : 'Review this option together'}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
