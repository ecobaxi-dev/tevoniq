'use client';

import { useId, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Cable,
  Code2,
  Cpu,
  Database,
  Monitor,
  Network,
  Settings2,
  ShieldCheck,
  Users,
  Workflow,
  Smartphone,
  Headphones,
  Radio,
  LockKeyhole,
  Video,
  FileText,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { Container } from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import type { HomeCopy } from '@/content/home';
import { localizedHref } from '@/config/navigation';
import './technology-ecosystem.css';

const ui = {
  en: {
    intro:
      'Explore the building blocks of a connected business. Select a technology to see where it fits.',
    prompt: 'Explore the ecosystem',
    detail: 'Part of a bigger picture',
    core: 'Your business',
    people: 'People',
    systems: 'Systems',
    data: 'Data',
    fallback:
      'Start with your business needs. We can explore how this technology fits your people, processes and existing systems.',
  },
  tr: {
    intro:
      'Bağlantılı bir işletmenin yapı taşlarını keşfedin. Nasıl katkı sağladığını görmek için bir teknoloji seçin.',
    prompt: 'Ekosistemi keşfedin',
    detail: 'Büyük resmin bir parçası',
    core: 'İşletmeniz',
    people: 'İnsanlar',
    systems: 'Sistemler',
    data: 'Veri',
    fallback:
      'İşletmenizin ihtiyaçlarıyla başlayın. Bu teknolojinin insanlarınıza, süreçlerinize ve mevcut sistemlerinize nasıl uyum sağlayabileceğini birlikte keşfedelim.',
  },
  ar: {
    intro: 'اكتشف مكوّنات الأعمال المترابطة. اختر تقنية لتتعرف على دورها في منظومتك.',
    prompt: 'استكشف المنظومة',
    detail: 'جزء من صورة أكبر',
    core: 'أعمالك',
    people: 'الأشخاص',
    systems: 'الأنظمة',
    data: 'البيانات',
    fallback:
      'لنبدأ باحتياجات أعمالك. نستكشف معاً كيف تتكامل هذه التقنية مع فرقك وعملياتك وأنظمتك الحالية.',
  },
};

type DiagramNode = { icon: LucideIcon; label: Record<Locale, string> };
type DiagramVariant =
  | 'software'
  | 'managed'
  | 'business'
  | 'automation'
  | 'iot'
  | 'data'
  | 'signage'
  | 'av'
  | 'security';
type Technology = {
  names: string[];
  icon: LucideIcon;
  diagram: DiagramVariant;
  description: Record<Locale, string>;
};
const node = (icon: LucideIcon, en: string, tr: string, ar: string): DiagramNode => ({
  icon,
  label: { en, tr, ar },
});
const diagrams: Record<
  DiagramVariant,
  { nodes: [DiagramNode, DiagramNode, DiagramNode]; path: string; motif: string }
> = {
  software: {
    nodes: [
      node(Monitor, 'Web', 'Web', 'الويب'),
      node(Smartphone, 'Mobile', 'Mobil', 'الجوال'),
      node(Database, 'APIs', 'API’ler', 'واجهات الربط'),
    ],
    path: 'M70 57 H140 V117 H300 V57 H370 M220 117 V234',
    motif: 'M188 94 L178 104 L188 114 M252 94 L262 104 L252 114',
  },
  managed: {
    nodes: [
      node(Monitor, 'Devices', 'Cihazlar', 'الأجهزة'),
      node(Headphones, 'Support', 'Destek', 'الدعم'),
      node(Settings2, 'Monitoring', 'İzleme', 'المراقبة'),
    ],
    path: 'M70 57 Q70 117 220 117 Q370 117 370 57 M220 117 V234',
    motif: 'M165 117 A55 55 0 0 1 275 117 M178 149 A55 55 0 0 0 262 149',
  },
  business: {
    nodes: [
      node(Users, 'Customers', 'Müşteriler', 'العملاء'),
      node(Workflow, 'Operations', 'Operasyonlar', 'العمليات'),
      node(Database, 'Shared data', 'Ortak veri', 'بيانات مشتركة'),
    ],
    path: 'M70 57 H120 V117 H320 V57 H370 M220 117 V234',
    motif: 'M174 96 H266 M174 138 H266 M188 88 V146 M252 88 V146',
  },
  automation: {
    nodes: [
      node(Cable, 'Triggers', 'Tetikleyiciler', 'المحفّزات'),
      node(SlidersHorizontal, 'Rules', 'Kurallar', 'القواعد'),
      node(Workflow, 'Actions', 'Eylemler', 'الإجراءات'),
    ],
    path: 'M70 57 H160 V117 H280 V57 H370 M220 117 V234',
    motif:
      'M172 94 H268 M172 117 H268 M172 140 H268 M257 89 L268 94 L257 99 M257 135 L268 140 L257 145',
  },
  iot: {
    nodes: [
      node(Radio, 'Sensors', 'Sensörler', 'المستشعرات'),
      node(Network, 'Gateways', 'Ağ geçitleri', 'بوابات الربط'),
      node(Database, 'Signals', 'Sinyaller', 'الإشارات'),
    ],
    path: 'M70 57 L220 117 L370 57 M220 117 V234',
    motif:
      'M174 87 Q160 117 174 147 M266 87 Q280 117 266 147 M160 76 Q138 117 160 158 M280 76 Q302 117 280 158',
  },
  data: {
    nodes: [
      node(Database, 'Sources', 'Kaynaklar', 'المصادر'),
      node(Code2, 'Applications', 'Uygulamalar', 'التطبيقات'),
      node(Database, 'Storage', 'Depolama', 'التخزين'),
    ],
    path: 'M70 57 V117 H370 V57 M220 117 V234',
    motif:
      'M177 91 Q220 74 263 91 V104 Q220 121 177 104 Z M177 113 Q220 130 263 113 V126 Q220 143 177 126 Z M177 135 Q220 152 263 135 V148 Q220 165 177 148 Z',
  },
  signage: {
    nodes: [
      node(FileText, 'Content', 'İçerik', 'المحتوى'),
      node(Monitor, 'Displays', 'Ekranlar', 'الشاشات'),
      node(Settings2, 'Scheduling', 'Planlama', 'الجدولة'),
    ],
    path: 'M70 57 H145 V117 H295 V57 H370 M220 117 V234',
    motif: 'M168 83 H272 V151 H168 Z M205 151 V160 H235 V151 M192 160 H248',
  },
  av: {
    nodes: [
      node(Headphones, 'Audio', 'Ses', 'الصوت'),
      node(Video, 'Video', 'Görüntü', 'الصورة'),
      node(Users, 'Collaboration', 'İş birliği', 'التعاون'),
    ],
    path: 'M70 57 Q145 155 220 117 Q295 155 370 57 M220 117 V234',
    motif: 'M168 107 V127 M178 97 V137 M188 86 V148 M252 86 V148 M262 97 V137 M272 107 V127',
  },
  security: {
    nodes: [
      node(LockKeyhole, 'Access', 'Erişim', 'الدخول'),
      node(Video, 'Monitoring', 'İzleme', 'المراقبة'),
      node(ShieldCheck, 'Protection', 'Koruma', 'الحماية'),
    ],
    path: 'M70 57 H145 L220 117 L295 57 H370 M220 117 V234',
    motif: 'M220 66 L271 83 V117 Q268 153 220 171 Q172 153 169 117 V83 Z',
  },
};
const technologies: Technology[] = [
  {
    names: ['Web & Mobile Development', 'Web ve Mobil Geliştirme', 'تطوير الويب والجوال'],
    icon: Code2,
    diagram: 'software',
    description: {
      en: 'Bring services closer to your customers and teams through web and mobile experiences connected to the systems behind them.',
      tr: 'Arkasındaki sistemlere bağlı web ve mobil deneyimlerle hizmetlerinizi müşterilerinize ve ekiplerinize yaklaştırın.',
      ar: 'قرّب خدماتك من عملائك وفرقك عبر تجارب ويب وجوال متصلة بالأنظمة التي تدعمها.',
    },
  },
  {
    names: ['Managed IT Services', 'Yönetilen BT Hizmetleri', 'خدمات تقنية المعلومات المُدارة'],
    icon: Settings2,
    diagram: 'managed',
    description: {
      en: 'Connect day-to-day IT support, maintenance and monitoring with the way your business operates.',
      tr: 'Günlük BT desteğini, bakımı ve izlemeyi işletmenizin çalışma biçimiyle uyumlu hale getirin.',
      ar: 'اربط الدعم التقني اليومي والصيانة والمراقبة بطريقة عمل مؤسستك.',
    },
  },
  {
    names: ['ERP & CRM', 'ERP ve CRM', 'ERP وCRM'],
    icon: Workflow,
    diagram: 'business',
    description: {
      en: 'Bring customer relationships and business operations into a shared flow of information, from the first enquiry to delivery.',
      tr: 'İlk talepten teslimata kadar müşteri ilişkilerini ve iş operasyonlarını ortak bir bilgi akışında birleştirin.',
      ar: 'اجمع علاقات العملاء وعمليات الأعمال في تدفق مشترك للمعلومات، من الاستفسار الأول حتى التسليم.',
    },
  },
  {
    names: ['Automation', 'Otomasyon', 'الأتمتة'],
    icon: Cpu,
    diagram: 'automation',
    description: {
      en: 'Connect repeatable tasks across your tools so information moves with fewer manual handoffs.',
      tr: 'Bilginin daha az manuel müdahaleyle ilerlemesi için araçlarınızdaki tekrarlanan görevleri birbirine bağlayın.',
      ar: 'اربط المهام المتكررة بين أدواتك لتنتقل المعلومات بخطوات يدوية أقل.',
    },
  },
  {
    names: ['IoT', 'إنترنت الأشياء'],
    icon: Cable,
    diagram: 'iot',
    description: {
      en: 'Link physical devices with digital systems to turn signals from your environment into useful information.',
      tr: 'Ortamınızdaki sinyalleri yararlı bilgiye dönüştürmek için fiziksel cihazları dijital sistemlere bağlayın.',
      ar: 'اربط الأجهزة بالأنظمة الرقمية لتحويل إشارات بيئة العمل إلى معلومات مفيدة.',
    },
  },
  {
    names: ['Data Infrastructure', 'Veri Altyapısı', 'البنية التحتية للبيانات'],
    icon: Database,
    diagram: 'data',
    description: {
      en: 'Give applications and teams a considered foundation for storing, moving and accessing the data they need.',
      tr: 'Uygulamalarınız ve ekipleriniz için ihtiyaç duydukları veriyi saklama, taşıma ve erişme temeli oluşturun.',
      ar: 'وفّر للتطبيقات والفرق أساساً مدروساً لتخزين البيانات ونقلها والوصول إليها.',
    },
  },
  {
    names: ['Digital Signage', 'Dijital Ekran Sistemleri', 'اللافتات الرقمية'],
    icon: Monitor,
    diagram: 'signage',
    description: {
      en: 'Connect your messages to physical spaces with digital displays and coordinated content.',
      tr: 'Dijital ekranlar ve koordineli içeriklerle mesajlarınızı fiziksel mekânlara taşıyın.',
      ar: 'أوصل رسائلك إلى المساحات الفعلية عبر شاشات رقمية ومحتوى منسّق.',
    },
  },
  {
    names: ['Audiovisual Systems', 'Görsel-İşitsel Sistemler', 'الأنظمة السمعية والبصرية'],
    icon: Users,
    diagram: 'av',
    description: {
      en: 'Bring sound, video and collaboration tools together for rooms designed around how people communicate.',
      tr: 'İnsanların iletişim biçimine göre tasarlanmış mekânlar için ses, görüntü ve iş birliği araçlarını bir araya getirin.',
      ar: 'اجمع الصوت والصورة وأدوات التعاون في مساحات مصمّمة حول طريقة تواصل الأشخاص.',
    },
  },
  {
    names: ['Security Systems', 'Güvenlik Sistemleri', 'أنظمة الأمن'],
    icon: ShieldCheck,
    diagram: 'security',
    description: {
      en: 'Consider access, monitoring and connected security systems as part of the wider environment you need to protect.',
      tr: 'Erişim, izleme ve bağlantılı güvenlik sistemlerini korumanız gereken ortamın bütünü içinde ele alın.',
      ar: 'انظر إلى التحكم بالدخول والمراقبة وأنظمة الأمن المترابطة كجزء من البيئة التي تحتاج إلى حمايتها.',
    },
  },
];
const findTechnology = (name: string) =>
  technologies.find((item) =>
    item.names.some((alias) => alias.toLocaleLowerCase() === name.trim().toLocaleLowerCase()),
  );

export function TechnologyEcosystem({
  locale,
  copy,
}: {
  locale: Locale;
  copy: Pick<HomeCopy, 'technologiesLabel' | 'technologiesTitle' | 'technologies' | 'explore'>;
}) {
  const [selected, setSelected] = useState<string>();
  const detailRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const text = ui[locale];
  const names = [...new Set(copy.technologies.filter((name) => name.trim()))];
  const active = selected && names.includes(selected) ? selected : names[0];
  const info = active ? findTechnology(active) : undefined;
  const ActiveIcon = info?.icon ?? Network;
  const diagram = info
    ? diagrams[info.diagram]
    : {
        nodes: [
          node(Users, 'People', 'İnsanlar', 'الأشخاص'),
          node(Database, 'Systems', 'Sistemler', 'الأنظمة'),
          node(Network, 'Data', 'Veri', 'البيانات'),
        ],
        path: 'M70 57 L220 117 L370 57 M220 117 V234',
        motif: '',
      };
  const activeNumber = active ? names.indexOf(active) + 1 : 0;
  function selectTechnology(name: string) {
    setSelected(name);
    if (window.matchMedia('(width < 48rem)').matches) {
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({
          block: 'start',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
        });
      });
    }
  }

  return (
    <section
      id="technologies"
      className="technology-ecosystem"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      aria-labelledby={`${id}-title`}
      data-theme="navy"
    >
      <Container>
        <header className="technology-ecosystem__header">
          <div>
            <p className="technology-ecosystem__eyebrow">
              <span aria-hidden="true" />
              {copy.technologiesLabel}
            </p>
            <h2 id={`${id}-title`}>{copy.technologiesTitle}</h2>
          </div>
          <p className="technology-ecosystem__intro">{text.intro}</p>
        </header>
        <div className="technology-ecosystem__layout">
          <div className="technology-ecosystem__directory">
            <p className="technology-ecosystem__caption" id={`${id}-prompt`}>
              {text.prompt}
            </p>
            <div
              className="technology-ecosystem__choices"
              role="group"
              aria-labelledby={`${id}-prompt`}
            >
              {names.map((name, index) => {
                const Icon = findTechnology(name)?.icon ?? Network;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={name === active}
                    aria-controls={`${id}-detail`}
                    onClick={() => selectTechnology(name)}
                  >
                    <span className="technology-ecosystem__index" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Icon size={21} aria-hidden="true" />
                    <span>{name}</span>
                    <ArrowUpRight
                      className="technology-ecosystem__choice-arrow"
                      size={17}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="technology-ecosystem__stage" data-variant={info?.diagram ?? 'default'}>
            <div className="technology-ecosystem__diagram" aria-hidden="true">
              <svg
                className="technology-ecosystem__connections"
                viewBox="0 0 440 260"
                preserveAspectRatio="none"
              >
                <path d={diagram.path} />
                <path className="technology-ecosystem__signal" d={diagram.path} />
                <path className="technology-ecosystem__motif" d={diagram.motif} />
              </svg>
              {diagram.nodes.map(({ icon: NodeIcon, label }, index) => (
                <span
                  key={index}
                  className={`technology-ecosystem__node technology-ecosystem__node--${['people', 'systems', 'data'][index]}`}
                >
                  <NodeIcon size={18} />
                  {label[locale]}
                </span>
              ))}
              <div className="technology-ecosystem__hub">
                <ActiveIcon size={35} strokeWidth={1.5} />
              </div>
              <span className="technology-ecosystem__core-label">{text.core}</span>
            </div>
            <div
              ref={detailRef}
              id={`${id}-detail`}
              className="technology-ecosystem__detail"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="technology-ecosystem__detail-heading">
                <p className="technology-ecosystem__caption">{text.detail}</p>
                <span className="technology-ecosystem__position" dir="ltr">
                  {String(activeNumber).padStart(2, '0')}{' '}
                  <span>/ {String(names.length).padStart(2, '0')}</span>
                </span>
              </div>
              <h3>{active ?? text.core}</h3>
              <p>{info?.description[locale] ?? text.fallback}</p>
            </div>
            <a className="technology-ecosystem__link" href={localizedHref(locale, '/solutions')}>
              {copy.explore}
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
