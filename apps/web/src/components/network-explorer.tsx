'use client';
import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Globe,
  Monitor,
  Network,
  Router,
  ShieldCheck,
  Wifi,
  Users,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { networkCases, type NetworkLocale } from '@/content/network-infrastructure';
import {
  networkProfiles,
  networkSizes,
  networkPriorities,
  networkDelivery,
  networkGuideLabels,
  networkGuidePlan,
  networkPlanText,
  networkContactHref,
  networkNodes,
  networkLinkState,
  type NetworkProfile,
  type NetworkGuideInput,
} from '@/lib/network-guide';
export function NetworkExplorer({ locale }: { locale: NetworkLocale }) {
  const ar = locale === 'ar',
    t = (a: string, e: string) => (ar ? a : e);
  const [profile, setProfile] = useState<NetworkProfile>('office'),
    [selected, setSelected] = useState<string>('gateway'),
    [primary, setPrimary] = useState(true),
    [backup, setBackup] = useState(true),
    [guestTest, setGuestTest] = useState(false);
  const icons = [Globe, ShieldCheck, Network, Wifi, Monitor, Users];
  const node = networkNodes.find((v) => v.id === selected) ?? networkNodes[1];
  const mode = networkLinkState(primary, backup),
    scenario = networkCases.find((v) => v.id === profile) ?? networkCases[0]!;
  return (
    <div className="net-explorer">
      <div
        className="net-profile-buttons"
        role="group"
        aria-label={t('اختر مثال الشبكة', 'Choose a network example')}
      >
        {networkCases.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={profile === item.id}
            onClick={() => {
              setProfile(item.id as NetworkProfile);
              setPrimary(true);
              setBackup(true);
              setGuestTest(false);
            }}
          >
            {networkGuideLabels[locale][item.id as NetworkProfile]}
          </button>
        ))}
      </div>
      <div className="net-explorer-grid">
        <div className={`net-topology net-link-${mode}`}>
          <div className="net-topology-bar">
            <span>TEVONIQ / NETWORK LAB</span>
            <span>{t('مخطط تعليمي', 'ILLUSTRATIVE TOPOLOGY')}</span>
          </div>
          <div className="net-topology-nodes">
            {networkNodes.map((item, i) => {
              const Icon = icons[i] ?? Router;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`net-node net-node-${item.id}`}
                  aria-pressed={selected === item.id}
                  onClick={() => setSelected(item.id)}
                >
                  <Icon size={25} aria-hidden="true" />
                  <strong>
                    {item.id === 'staff' && profile === 'store'
                      ? t('أجهزة التشغيل والبيع', 'Operations & POS')
                      : item.id === 'staff' && profile === 'branches'
                        ? t('موارد الفروع', 'Site resources')
                        : item[locale][0]}
                  </strong>
                </button>
              );
            })}
          </div>
          <div className="net-link-status" role="status">
            {mode === 'primary'
              ? t('الاتصال الأساسي متاح في المثال', 'Primary link available in this example')
              : mode === 'backup'
                ? t('تحوّل المثال إلى المسار الاحتياطي', 'Example switched to the backup path')
                : t('لا يوجد مسار متاح في المثال', 'No path available in this example')}
          </div>
        </div>
        <div className="net-explorer-panel">
          <p className="net-small-label">{t('اختر عنصرًا لفهم وظيفته', 'SELECT A COMPONENT')}</p>
          <h3>{node[locale][0]}</h3>
          <p>{node[locale][1]}</p>
          <fieldset>
            <legend>{t('جرّب تعثر الاتصال', 'Explore connection failure')}</legend>
            <label>
              <input
                type="checkbox"
                checked={primary}
                onChange={(e) => setPrimary(e.target.checked)}
              />
              {t('الخط الأساسي متاح', 'Primary link available')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={backup}
                onChange={(e) => setBackup(e.target.checked)}
              />
              {t('مسار احتياطي متاح', 'Backup path available')}
            </label>
          </fieldset>
          <button className="net-test-button" type="button" onClick={() => setGuestTest(true)}>
            {t('جرّب وصول الضيف لشبكة العمل', 'Try guest access to work devices')}
          </button>
          {guestTest && (
            <p className="net-guest-result" role="status">
              <ShieldCheck size={18} aria-hidden="true" />
              {t(
                'ممنوع وفق سياسة الفصل في المثال؛ هذا ليس فحصًا لشبكة فعلية.',
                'Denied by the example isolation rule; this does not test a real network.',
              )}
            </p>
          )}
          <div className="net-example-note">
            <strong>{scenario[locale].title}</strong>
            <p>{scenario[locale].approach}</p>
          </div>
          <a href={`#net-case-${profile}`}>
            {t('اقرأ تفاصيل السيناريو', 'Read the scenario details')}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
      <p className="net-local-note">
        {t(
          'محاكاة محلية مبسطة لا تتصل بأجهزة ولا تغيّر إعدادات. تُعرض الفكرة فقط؛ التحويل وVPN وفصل الشبكات في الواقع تحتاج إعدادات وتراخيص وفحوص قبول.',
          'A simplified local simulation that contacts no devices and changes no settings. Actual failover, VPN and segmentation require configuration, licensing and acceptance checks.',
        )}
      </p>
      <noscript>
        <p>
          {t(
            'يحتاج المختبر إلى JavaScript. تبقى الخدمات والدراسات ومراحل التنفيذ متاحة بدونه.',
            'The lab needs JavaScript. Services, scenarios and delivery stages remain available without it.',
          )}
        </p>
      </noscript>
    </div>
  );
}
export function NetworkNeedsGuide({ locale }: { locale: NetworkLocale }) {
  const ar = locale === 'ar',
    t = (a: string, e: string) => (ar ? a : e),
    initial: NetworkGuideInput = {
      profile: 'office',
      size: 'small',
      priority: 'coverage',
      delivery: 'remote',
    };
  const [input, setInput] = useState<NetworkGuideInput>(initial),
    [result, setResult] = useState<NetworkGuideInput | null>(null);
  const labels = networkGuideLabels[locale];
  const fields = [
    { key: 'profile' as const, title: t('نوع الموقع', 'Premises type'), options: networkProfiles },
    {
      key: 'size' as const,
      title: t('عدد الأجهزة التقريبي', 'Approximate device count'),
      options: networkSizes,
    },
    {
      key: 'priority' as const,
      title: t('أهم ما تريد تحسينه', 'Your main priority'),
      options: networkPriorities,
    },
    {
      key: 'delivery' as const,
      title: t('طريقة التنفيذ المطلوبة', 'Required delivery arrangement'),
      options: networkDelivery,
    },
  ];
  return (
    <div className="net-guide">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResult({ ...input });
        }}
        className="net-guide-form"
      >
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={`net-guide-${field.key}`}>{field.title}</label>
            <select
              id={`net-guide-${field.key}`}
              value={input[field.key]}
              onChange={(e) => {
                setInput({ ...input, [field.key]: e.target.value });
                setResult(null);
              }}
            >
              {field.options.map((id) => (
                <option key={id} value={id}>
                  {labels[id]}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="submit" className="erp-primary">
          {t('اعرض ملخص الاحتياج', 'Build a needs brief')}
          <ArrowUpRight size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="net-reset"
          onClick={() => {
            setInput(initial);
            setResult(null);
          }}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {t('ابدأ من جديد', 'Start again')}
        </button>
      </form>
      <div className="net-guide-result" aria-live="polite" aria-atomic="true">
        <p className="net-small-label">{t('نقطة بداية للمراجعة', 'A STARTING POINT FOR REVIEW')}</p>
        <h3>
          {result
            ? t('ما نراجعه لهذا الاحتياج', 'What to review for these needs')
            : t('تصميم مناسب يبدأ بفهم الموقع', 'A suitable design starts with your premises')}
        </h3>
        {result ? (
          <>
            <ul>
              {networkGuidePlan(result).map((id) => (
                <li key={id}>
                  <Check size={16} aria-hidden="true" />
                  {networkPlanText[locale][id as keyof typeof networkPlanText.ar]}
                </li>
              ))}
            </ul>
            <Link className="erp-primary" href={networkContactHref(locale, result)}>
              {t('ناقش هذا الملخص', 'Discuss this brief')}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </>
        ) : (
          <p>
            {t(
              'أربع اختيارات تُجهّز محاور للمناقشة دون طلب عنوان أو كلمات مرور أو تفاصيل شبكة حساسة.',
              'Four choices prepare discussion points without asking for an address, passwords or sensitive network details.',
            )}
          </p>
        )}
        <p className="net-local-note">
          {t(
            'مرشد أولي بقواعد ثابتة، وليس مخطط تنفيذ أو قائمة شراء أو عرض سعر. لا يحدد عدد نقاط الوصول أو طراز الجهاز قبل دراسة الموقع. لا تُحفظ الاختيارات ولا تُرسل تلقائيًا.',
            'A rule-based starting guide, not an installation design, shopping list or quotation. Access point counts and device models require site assessment. Choices are not saved or sent automatically.',
          )}
        </p>
        <noscript>
          <p>
            {t(
              'يحتاج المرشد إلى JavaScript؛ يمكنك التواصل مباشرة من أزرار الصفحة.',
              'The guide needs JavaScript; direct contact links remain available.',
            )}
          </p>
        </noscript>
      </div>
    </div>
  );
}
