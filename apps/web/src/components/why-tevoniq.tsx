import {
  ArrowUpRight,
  Cpu,
  Gem,
  Handshake,
  Lightbulb,
  ShieldCheck,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { Container } from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import type { HomeCopy } from '@/content/home';
import { localizedHref } from '@/config/navigation';
import './why-tevoniq.css';

type ValueKind = 'quality' | 'engineering' | 'innovation' | 'security' | 'business' | 'support';
type Value = {
  names: string[];
  kind: ValueKind;
  icon: LucideIcon;
  description: Record<Locale, string>;
};
const values: Value[] = [
  {
    names: ['Premium Quality', 'Üstün Kalite', 'جودة متميزة'],
    kind: 'quality',
    icon: Gem,
    description: {
      en: 'Care in the details. Thoughtful choices in design, implementation and delivery.',
      tr: 'Ayrıntılara özen. Tasarım, uygulama ve teslimat boyunca düşünülmüş tercihler.',
      ar: 'عناية بالتفاصيل، واختيارات مدروسة في التصميم والتنفيذ والتسليم.',
    },
  },
  {
    names: ['Engineering Expertise', 'Mühendislik Uzmanlığı', 'خبرة هندسية'],
    kind: 'engineering',
    icon: Cpu,
    description: {
      en: 'Understand the requirements. Shape the architecture. Make the parts work together.',
      tr: 'Gereksinimleri anlayın. Mimariyi şekillendirin. Parçaların birlikte çalışmasını sağlayın.',
      ar: 'فهم المتطلبات، وتصميم البنية المناسبة، وربط المكوّنات لتعمل بانسجام.',
    },
  },
  {
    names: ['Innovative Mindset', 'Yenilikçi Bakış', 'فكر مبتكر'],
    kind: 'innovation',
    icon: Lightbulb,
    description: {
      en: 'Explore new possibilities with a practical question: how can this help your business?',
      tr: 'Yeni olasılıkları pratik bir soruyla keşfedin: Bu, işletmenize nasıl katkı sağlar?',
      ar: 'استكشاف فرص جديدة بسؤال عملي: كيف يمكن لهذه الفكرة أن تخدم أعمالك؟',
    },
  },
  {
    names: ['Security First', 'Önce Güvenlik', 'الأمن أولاً'],
    kind: 'security',
    icon: ShieldCheck,
    description: {
      en: 'Consider protection from the start, across access, information and everyday operations.',
      tr: 'Erişim, bilgi ve günlük operasyonlarda güvenliği en baştan ele alın.',
      ar: 'مراعاة الحماية منذ البداية، في الوصول إلى الأنظمة والمعلومات والعمليات اليومية.',
    },
  },
  {
    names: ['Business Focus', 'İş Odaklılık', 'التركيز على الأعمال'],
    kind: 'business',
    icon: Target,
    description: {
      en: 'Begin with your goals. Choose technology around the people and processes it serves.',
      tr: 'Hedeflerinizle başlayın. Teknolojiyi hizmet ettiği insanlara ve süreçlere göre seçin.',
      ar: 'الانطلاق من أهدافك، واختيار التقنية بما يناسب الأشخاص والعمليات التي تخدمها.',
    },
  },
  {
    names: ['Long-Term Support', 'Uzun Vadeli Destek', 'دعم طويل الأمد'],
    kind: 'support',
    icon: Handshake,
    description: {
      en: 'Keep the conversation going as your systems, teams and needs evolve.',
      tr: 'Sistemleriniz, ekipleriniz ve ihtiyaçlarınız geliştikçe iletişimi sürdürün.',
      ar: 'استمرار التواصل مع تطوّر أنظمتك وفرقك واحتياجات أعمالك.',
    },
  },
];
const fallback: Record<Locale, string> = {
  en: 'A principle that helps guide the conversation, the choices and the work we do together.',
  tr: 'Görüşmelerimize, tercihlerimize ve birlikte yaptığımız çalışmalara yön veren bir ilke.',
  ar: 'مبدأ يوجّه حوارنا واختياراتنا والعمل الذي نبنيه معاً.',
};
const intro: Record<Locale, string> = {
  en: 'Technology is only part of the picture. How we approach the work matters just as much.',
  tr: 'Teknoloji, resmin yalnızca bir parçası. İşe nasıl yaklaştığımız da en az onun kadar önemli.',
  ar: 'التقنية جزء من الصورة. وطريقة تعاملنا مع العمل لا تقلّ أهمية عنها.',
};
const paths: Record<ValueKind, string[]> = {
  quality: [
    'M60 42 L88 19 H152 L180 42 L120 108 Z',
    'M60 42 H180 M88 19 L98 42 L120 108 L142 42 L152 19 M98 42 L120 19 L142 42',
  ],
  engineering: [
    'M81 24 H159 V102 H81 Z M64 10 V116 M176 10 V116 M50 12 H190 M50 114 H190',
    'M91 12 H101 M139 12 H149 M91 114 H101 M139 114 H149 M64 37 V47 M64 79 V89 M176 37 V47 M176 79 V89',
  ],
  innovation: [
    'M120 13 V2 M120 124 V113 M74 27 L66 19 M166 27 L174 19 M62 63 H50 M178 63 H190 M74 99 L66 107 M166 99 L174 107',
    'M96 51 Q96 27 120 27 Q144 27 144 51 Q144 66 133 76 V91 H107 V76 Q96 66 96 51 M109 100 H131',
  ],
  security: [
    'M120 10 L169 28 V60 Q169 97 120 116 Q71 97 71 60 V28 Z',
    'M120 22 L157 36 V60 Q157 86 120 103 Q83 86 83 60 V36 Z M49 47 H62 M178 47 H191 M49 80 H62 M178 80 H191',
  ],
  business: [
    'M165 63 A45 45 0 1 1 75 63 A45 45 0 1 1 165 63 M152 63 A32 32 0 1 1 88 63 A32 32 0 1 1 152 63',
    'M120 63 L179 10 M161 11 L179 10 L178 28 M49 63 H63 M177 63 H191 M120 111 V125',
  ],
  support: [
    'M77 34 C28 34 28 95 77 95 C113 95 127 34 163 34 C212 34 212 95 163 95 C127 95 113 34 77 34',
    'M76 24 L86 34 L76 44 M164 85 L154 95 L164 105',
  ],
};

function ValueVisual({ kind, Icon }: { kind: ValueKind; Icon: LucideIcon }) {
  return (
    <div className={`why-tevoniq__visual why-tevoniq__visual--${kind}`} aria-hidden="true">
      <svg className="why-tevoniq__drawing" viewBox="0 0 240 128" fill="none">
        {paths[kind].map((path, index) => (
          <path
            key={path}
            d={path}
            className={index === 0 ? 'why-tevoniq__outline' : 'why-tevoniq__accent'}
          />
        ))}
        <circle cx="25" cy="63" r="2" />
        <circle cx="215" cy="63" r="2" />
      </svg>
      <span className="why-tevoniq__symbol">
        <Icon size={27} strokeWidth={1.5} />
      </span>
    </div>
  );
}

export function WhyTevoniq({
  locale,
  copy,
}: {
  locale: Locale;
  copy: Pick<
    HomeCopy,
    'whyLabel' | 'whyTitle' | 'values' | 'eyebrow' | 'footer' | 'capabilityBody' | 'contact'
  >;
}) {
  return (
    <section
      id="why-tevoniq"
      className="why-tevoniq"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      aria-labelledby="why-tevoniq-title"
    >
      <Container>
        <header className="why-tevoniq__header">
          <div>
            <p className="why-tevoniq__eyebrow">
              <span aria-hidden="true" />
              {copy.whyLabel}
            </p>
            <h2 id="why-tevoniq-title">{copy.whyTitle}</h2>
          </div>
          <p className="why-tevoniq__intro">{intro[locale]}</p>
        </header>
        <div className="why-tevoniq__values">
          {copy.values.map((title, index) => {
            const value = values.find((item) =>
              item.names.some(
                (name) => name.toLocaleLowerCase() === title.trim().toLocaleLowerCase(),
              ),
            );
            return (
              <article className="why-tevoniq__value" key={`${title}-${index}`}>
                <div className="why-tevoniq__value-top">
                  <span className="why-tevoniq__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <ValueVisual kind={value?.kind ?? 'quality'} Icon={value?.icon ?? Gem} />
                </div>
                <div className="why-tevoniq__value-copy">
                  <h3>{title}</h3>
                  <p>{value?.description[locale] ?? fallback[locale]}</p>
                </div>
              </article>
            );
          })}
        </div>
        <aside className="why-tevoniq__callout">
          <div>
            <p className="why-tevoniq__eyebrow">{copy.eyebrow}</p>
            <h3>{copy.footer}</h3>
          </div>
          <div>
            <p className="why-tevoniq__callout-body">{copy.capabilityBody}</p>
            <a href={localizedHref(locale, '/contact')}>
              {copy.contact}
              <ArrowUpRight size={21} aria-hidden="true" />
            </a>
          </div>
        </aside>
      </Container>
    </section>
  );
}
