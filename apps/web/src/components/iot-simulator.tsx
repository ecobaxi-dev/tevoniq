'use client';
import { useId, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowUpRight, RotateCcw, Radio, Thermometer, Droplets, Waves, Check } from 'lucide-react';
import { iotScenarios, type IotLocale } from '@/content/iot-service';
import { evaluateIotReading, type IotResult, type IotState } from '@/lib/iot-simulator';
const subscribe = () => () => {};
export function IotSimulator({ locale }: { locale: IotLocale }) {
  const ar = locale === 'ar',
    id = useId(),
    enhanced = useSyncExternalStore(
      subscribe,
      () => true,
      () => false,
    );
  const [scenarioId, setScenarioId] = useState('temperature');
  const scenario = iotScenarios.find((item) => item.id === scenarioId) ?? iotScenarios[0]!;
  const [value, setValue] = useState(String(iotScenarios[0]!.initial)),
    [threshold, setThreshold] = useState(String(iotScenarios[0]!.threshold));
  const [age, setAge] = useState('0'),
    [connected, setConnected] = useState(true),
    [result, setResult] = useState<IotResult | null>(null);
  const [history, setHistory] = useState<
    { number: number; result: Extract<IotResult, { ok: true }> }[]
  >([]);
  const [sequence, setSequence] = useState(0);
  const statuses: Record<IotState, string> = ar
    ? {
        normal: 'قراءة حديثة ضمن القاعدة',
        alert: 'قراءة حديثة تستدعي المراجعة',
        stale: 'قراءة متقادمة — تحتاج تحديثًا',
        offline: 'المصدر غير متصل — لا قراءة جديدة',
      }
    : {
        normal: 'Fresh reading within the rule',
        alert: 'Fresh reading needs review',
        stale: 'Outdated reading — refresh needed',
        offline: 'Source disconnected — no new reading',
      };
  const reset = (nextId = scenarioId) => {
    const next = iotScenarios.find((item) => item.id === nextId)!;
    setScenarioId(next.id);
    setValue(String(next.initial));
    setThreshold(String(next.threshold));
    setAge('0');
    setConnected(true);
    setResult(null);
    setHistory([]);
    setSequence(0);
  };
  const run = () => {
    const outcome = evaluateIotReading({ scenario: scenarioId, value, threshold, age, connected });
    setResult(outcome);
    if (outcome.ok) {
      const next = sequence + 1;
      setSequence(next);
      setHistory((items) => [{ number: next, result: outcome }, ...items].slice(0, 5));
    }
  };
  const Icon =
    scenario.id === 'temperature' ? Thermometer : scenario.id === 'moisture' ? Droplets : Waves;
  return (
    <div className="iot-simulator">
      <div className="iot-simulator-intro">
        <span>
          <Radio size={24} aria-hidden="true" />
        </span>
        <div>
          <h3>
            {ar
              ? 'جرّب منطق القراءة قبل ربط جهاز'
              : 'Try the reading logic before connecting hardware'}
          </h3>
          <p>
            {ar
              ? 'اختر مثالًا وعدّل القيمة والحد وعمر القراءة، ثم قيّم النتيجة. البيانات والحدود للتوضيح فقط، ولا تُرسل المحاكاة رسائل أو أوامر.'
              : 'Choose a scenario, change its reading, threshold and age, then evaluate it. Data and thresholds are illustrative; the simulator sends no messages or commands.'}
          </p>
        </div>
      </div>
      <div className="iot-simulator-workspace" hidden={!enhanced}>
        <form
          className="iot-simulator-form"
          onSubmit={(event) => {
            event.preventDefault();
            run();
          }}
        >
          <label htmlFor={`${id}-scenario`}>{ar ? 'المثال' : 'Scenario'}</label>
          <select
            id={`${id}-scenario`}
            value={scenarioId}
            onChange={(event) => reset(event.target.value)}
          >
            {iotScenarios.map((item) => (
              <option key={item.id} value={item.id}>
                {item[locale]}
              </option>
            ))}
          </select>
          <label htmlFor={`${id}-value`}>
            {ar ? 'قيمة القراءة التجريبية' : 'Simulated reading'}{' '}
            <bdi dir="ltr">({scenario.unit})</bdi>
          </label>
          <input
            id={`${id}-value`}
            name="reading"
            type="number"
            step="any"
            min={scenario.min}
            max={scenario.max}
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <label htmlFor={`${id}-threshold`}>
            {ar ? 'حد المراجعة التجريبي' : 'Illustrative review threshold'}{' '}
            <bdi dir="ltr">({scenario.unit})</bdi>
          </label>
          <input
            id={`${id}-threshold`}
            name="threshold"
            type="number"
            step="any"
            min={scenario.min}
            max={scenario.max}
            required
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
          />
          <small>
            {ar
              ? `نطاق المثال: ${scenario.min} إلى ${scenario.max}. تُراجع القراءة ${scenario.direction === 'above' ? 'أعلى' : 'أقل من'} الحد.`
              : `Example range: ${scenario.min} to ${scenario.max}. Review values ${scenario.direction === 'above' ? 'above' : 'below'} the threshold.`}
          </small>
          <label htmlFor={`${id}-age`}>
            {ar ? 'عمر القراءة بالدقائق' : 'Reading age in minutes'}
          </label>
          <input
            id={`${id}-age`}
            name="age"
            type="number"
            min="0"
            max="1440"
            step="1"
            required
            value={age}
            onChange={(event) => setAge(event.target.value)}
          />
          <small>
            {ar
              ? 'في هذا المثال، تُعد القراءة متقادمة إذا تجاوز عمرها 15 دقيقة.'
              : 'In this example, readings older than 15 minutes are considered outdated.'}
          </small>
          <label className="iot-connected">
            <input
              type="checkbox"
              checked={connected}
              onChange={(event) => setConnected(event.target.checked)}
            />
            {ar ? 'مصدر القراءة متصل في المحاكاة' : 'Reading source connected in the simulation'}
          </label>
          <button className="erp-primary" type="submit">
            {ar ? 'قيّم القراءة التجريبية' : 'Evaluate the simulated reading'}
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
          <button className="iot-reset" type="button" onClick={() => reset()}>
            <RotateCcw size={16} aria-hidden="true" />
            {ar ? 'إعادة ضبط المثال' : 'Reset this example'}
          </button>
        </form>
        <div className="iot-simulator-results" data-state={result?.ok ? result.state : 'idle'}>
          <div className="iot-reading-top">
            <Icon size={28} aria-hidden="true" />
            <span>{scenario[locale]}</span>
            <small>{ar ? 'بيانات افتراضية' : 'FICTIONAL DATA'}</small>
          </div>
          {result?.ok ? (
            <>
              <p className="iot-reading-value">
                {result.value === null ? '—' : `${result.value} ${scenario.unit}`}
              </p>
              <p className="iot-reading-status" role="status">
                {statuses[result.state]}
              </p>
              <div className="iot-reading-scale" aria-hidden="true">
                <span style={{ width: `${result.percentage ?? 0}%` }} />
              </div>
              <div className="iot-reading-metadata">
                <span>
                  {ar ? 'الحد المستخدم' : 'Evaluated threshold'}:{' '}
                  <bdi dir="ltr">
                    {result.threshold} {scenario.unit}
                  </bdi>
                </span>
                <span>
                  {ar ? 'عمر القراءة' : 'Reading age'}: {result.age} {ar ? 'دقيقة' : 'min'}
                </span>
              </div>
              <p className="iot-reading-explainer">
                {result.state === 'offline'
                  ? ar
                    ? 'لم تُعتمد قراءة جديدة؛ نعرض حالة الاتصال بدل إعطاء انطباع بوجود قياس حديث.'
                    : 'No new reading was accepted; show connection status rather than implying a fresh measurement.'
                  : result.state === 'stale'
                    ? ar
                      ? 'نوضح أن القراءة قديمة، ولا نعرضها كحالة حديثة ضمن الحد أو متجاوزة له.'
                      : 'Mark the reading as outdated rather than presenting a current threshold assessment.'
                    : ar
                      ? 'هذه نتيجة قاعدة توضيحية داخل الصفحة، وليست تنبيهًا مرسلًا أو أمر تشغيل.'
                      : 'This is an illustrative in-page rule result, not a sent notification or a control command.'}
              </p>
            </>
          ) : result && !result.ok ? (
            <p role="alert">
              {ar
                ? 'تحقق من القيم ونطاق المثال وعمر القراءة.'
                : 'Check the values, example range and reading age.'}
            </p>
          ) : (
            <div className="iot-reading-empty">
              <Icon size={48} aria-hidden="true" />
              <p>
                {ar
                  ? 'قيّم قراءة لتظهر الحالة وسجل التجربة.'
                  : 'Evaluate a reading to see its status and trial history.'}
              </p>
            </div>
          )}
          <div className="iot-history">
            <h4>{ar ? 'آخر خمس تجارب' : 'Latest five trials'}</h4>
            {!history.length ? (
              <p>{ar ? 'لا توجد تجارب مسجلة بعد.' : 'No trials recorded yet.'}</p>
            ) : (
              <ol>
                {history.map((entry) => (
                  <li key={entry.number}>
                    <span>#{entry.number}</span>
                    <strong dir="ltr">
                      {entry.result.value === null ? '—' : `${entry.result.value} ${scenario.unit}`}
                    </strong>
                    <span>{statuses[entry.result.state]}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <Link className="iot-discuss" href={`/${locale}/contact?intent=quote&iot=${scenario.id}`}>
            {ar ? 'ناقش مثالًا مشابهًا لنشاطك' : 'Discuss a similar business use case'}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <p className="iot-local-note">
            <Check size={15} aria-hidden="true" />
            {ar
              ? 'التجارب محلية وتُمسح عند إعادة التحميل.'
              : 'Trials stay local and clear on reload.'}
          </p>
        </div>
      </div>
      <noscript>
        <p>
          {ar
            ? 'تحتاج المحاكاة إلى JavaScript. تبقى الخدمات والأمثلة ومراحل العمل متاحة للقراءة أدناه.'
            : 'The simulator needs JavaScript. Services, examples and delivery stages remain available below.'}
        </p>
      </noscript>
    </div>
  );
}
