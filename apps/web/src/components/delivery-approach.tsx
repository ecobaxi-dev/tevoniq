import type { Locale } from '@tevoniq/types';
import { ArrowRight, Plus } from 'lucide-react';
import { Container, Section, SectionHeader } from '@tevoniq/ui';
import { localizedHref } from '@/config/navigation';

const content = {
  en: {
    eyebrow: 'FROM AMBITION TO DELIVERY',
    title: 'A clear path from your challenge to a working solution.',
    body: 'Start with the business need. Define the scope, validate the approach, and build a foundation for what comes next.',
    action: 'Discuss your project',
    output: 'What we define together',
    steps: [
      {
        title: 'Discover',
        body: 'Explore your goals, existing systems and operational constraints before choosing the technology.',
        output: 'Priorities, requirements and success criteria.',
      },
      {
        title: 'Design',
        body: 'Shape the architecture and implementation plan around your workflows, security needs and budget.',
        output: 'A solution blueprint and an agreed scope.',
      },
      {
        title: 'Build & validate',
        body: 'Implement in focused stages, integrate with your environment and review progress against the agreed goals.',
        output: 'A tested solution and a clear handover plan.',
      },
      {
        title: 'Support & evolve',
        body: 'Plan the transition into everyday operations and identify improvements as your business needs change.',
        output: 'Support responsibilities and a roadmap for improvement.',
      },
    ],
  },
  tr: {
    eyebrow: 'HEDEFTEN UYGULAMAYA',
    title: 'İhtiyacınızdan çalışan bir çözüme uzanan net bir yol.',
    body: 'İş ihtiyacıyla başlayın. Kapsamı belirleyin, yaklaşımı doğrulayın ve sonraki adımlar için sağlam bir temel oluşturun.',
    action: 'Projenizi konuşalım',
    output: 'Birlikte belirlediklerimiz',
    steps: [
      {
        title: 'Keşif',
        body: 'Teknolojiyi seçmeden önce hedeflerinizi, mevcut sistemlerinizi ve operasyonel kısıtlarınızı inceleyelim.',
        output: 'Öncelikler, gereksinimler ve başarı ölçütleri.',
      },
      {
        title: 'Tasarım',
        body: 'Mimariyi ve uygulama planını iş akışlarınıza, güvenlik ihtiyaçlarınıza ve bütçenize göre şekillendirelim.',
        output: 'Çözüm taslağı ve üzerinde anlaşılan kapsam.',
      },
      {
        title: 'Geliştirme ve doğrulama',
        body: 'Çözümü aşamalar halinde uygulayalım, ortamınıza entegre edelim ve ilerlemeyi belirlenen hedeflerle değerlendirelim.',
        output: 'Test edilmiş çözüm ve net bir devir planı.',
      },
      {
        title: 'Destek ve gelişim',
        body: 'Günlük operasyonlara geçişi planlayalım ve iş ihtiyaçlarınız değiştikçe iyileştirmeleri belirleyelim.',
        output: 'Destek sorumlulukları ve iyileştirme yol haritası.',
      },
    ],
  },
  ar: {
    eyebrow: 'من الطموح إلى التنفيذ',
    title: 'مسار واضح من تحديات أعمالك إلى حل يعمل.',
    body: 'نبدأ باحتياجات العمل، ثم نحدد النطاق ونتحقق من النهج ونبني أساساً للخطوة التالية.',
    action: 'ناقش مشروعك معنا',
    output: 'ما نحدده معاً',
    steps: [
      {
        title: 'الاكتشاف',
        body: 'نفهم أهدافك وأنظمتك الحالية وقيود التشغيل قبل اختيار التقنية المناسبة.',
        output: 'الأولويات والمتطلبات ومعايير النجاح.',
      },
      {
        title: 'التصميم',
        body: 'نصمم البنية وخطة التنفيذ وفق سير العمل واحتياجات الأمان والميزانية.',
        output: 'تصور للحل ونطاق عمل متفق عليه.',
      },
      {
        title: 'البناء والتحقق',
        body: 'ننفذ على مراحل، ونربط الحل ببيئتك، ونراجع التقدم وفق الأهداف المتفق عليها.',
        output: 'حل مختبر وخطة واضحة للتسليم.',
      },
      {
        title: 'الدعم والتطوير',
        body: 'نخطط للانتقال إلى التشغيل اليومي ونحدد فرص التحسين مع تغير احتياجات أعمالك.',
        output: 'مسؤوليات الدعم وخارطة طريق للتحسين.',
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    body: string;
    action: string;
    output: string;
    steps: { title: string; body: string; output: string }[];
  }
>;

export function DeliveryApproach({ locale }: { locale: Locale }) {
  const copy = content[locale];
  return (
    <Section id="delivery-approach" className="delivery-approach" spacing="generous">
      <Container>
        <div className="delivery-intro" data-entrance>
          <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />
          <div>
            <p className="tv-description">{copy.body}</p>
            <a className="home-section-link" href={localizedHref(locale, '/request-quote')}>
              {copy.action}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
        <ol className="delivery-steps">
          {copy.steps.map((step, index) => (
            <li key={step.title} data-entrance>
              <span className="delivery-number" aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <details className="delivery-detail">
                <summary>
                  {copy.output}
                  <Plus size={16} aria-hidden="true" />
                </summary>
                <p>{step.output}</p>
              </details>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
