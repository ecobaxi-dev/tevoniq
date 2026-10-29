import 'server-only';
import { isRetiredService, isRetiredPublicPath } from '@tevoniq/types';
import { homeServices } from '@/content/home-services';
import { pestoCopy } from '@/content/pesto';
import { advocasCopy } from '@/content/advocas';
import { consultingCopy } from '@/content/technology-consulting';
import { automationServiceCopy } from '@/content/intelligent-automation';
import { erpCopy } from '@/content/erp-service';
import { engineeringCopy } from '@/content/software-engineering';
import { iotCopy } from '@/content/iot-service';
import { getService } from '@/lib/services';
import type { AssistantLocale, AssistantSource } from './site-assistant-core';

const presentations = {
  'it-consulting': consultingCopy,
  'business-automation': automationServiceCopy,
  'erp-solutions': erpCopy,
  'software-product-engineering': engineeringCopy,
  'iot-solutions': iotCopy,
};
const paths = {
  website: '/website-designs',
  workflow: '/work-systems',
  automation: '/automation-demos',
  dashboard: '/dashboard-demos',
};
export async function assistantKnowledge(locale: AssistantLocale): Promise<AssistantSource[]> {
  const ar = locale === 'ar';
  const company: AssistantSource = {
    title: ar ? 'عن TEVONIQ وخدماتنا' : 'About TEVONIQ and our services',
    href: `/${locale}/services`,
    text: ar
      ? 'نساعد أصحاب المنشآت الصغيرة والمتوسطة على تطوير مواقع وأنظمة وأتمتة تسهّل متابعة الطلبات وتقلّل العمل المتكرر، بتواصل مباشر ونطاق واضح وتنفيذ على مراحل. نماذج الموقع وأمثلة الخدمات توضيحية ببيانات افتراضية. الأسعار والمدة والتكاملات النهائية تتحدد بعد مراجعة المتطلبات؛ لا يوجد سعر أو موعد مضمون.'
      : 'We help small and medium businesses with websites, work systems and automation, clear scope, direct communication and staged delivery. Website demos and examples use illustrative data, not client results. Pricing, delivery timelines and final integrations require a requirements review and are not guaranteed.',
  };
  const base: AssistantSource[] = [
    company,
    ...homeServices[locale].services.map((service) => ({
      title: service.title,
      href: `/${locale}${paths[service.id]}`,
      text: [service.description, ...service.deliverables].join(' '),
      keywords:
        service.id === 'website'
          ? 'موقع مواقع متجر عقاري تجاري website shop ecommerce'
          : service.id === 'workflow'
            ? 'طلبات مخزون صيانة crm inventory management'
            : service.id === 'automation'
              ? 'ربط واتساب اشعارات api automation integration'
              : 'مؤشرات تقرير تقارير لوحة dashboard reporting',
    })),
    {
      title: 'Pesto',
      href: `/${locale}/pesto`,
      text: pestoCopy[locale].intro,
      keywords: 'بيستو مطعم مطاعم restaurant pos كاشير',
    },
    {
      title: ar ? 'المحامون — Advocas' : 'Advocas legal services platform',
      href: `/${locale}/advocas`,
      text: advocasCopy[locale].intro,
      keywords: 'محامي محامون قانونية lawyers legal',
    },
    {
      title: ar ? 'التواصل ومناقشة المتطلبات' : 'Contact and discuss requirements',
      href: `/${locale}/contact`,
      text: ar
        ? 'يمكنك إرسال متطلبات مشروعك من نموذج التواصل، أو استخدام خيارات الهاتف وواتساب المنشورة في الموقع. لا تُرسل كلمات مرور أو معلومات مالية حساسة.'
        : 'Share project requirements through the contact form or the published phone and WhatsApp options. Do not share passwords or sensitive financial data.',
    },
  ];
  const services = await Promise.all(
    Object.entries(presentations).map(async ([slug, copy]) => {
      if (isRetiredService(slug)) return null;
      try {
        if (!(await getService(locale, slug))) return null;
        return {
          title: copy[locale].serviceTitle,
          href: `/${locale}/services/${slug}`,
          text: copy[locale].seoDescription,
        } satisfies AssistantSource;
      } catch {
        return null;
      }
    }),
  );
  return [
    ...base,
    ...services.filter((source): source is NonNullable<typeof source> => source !== null),
  ].filter((source) => !isRetiredPublicPath(source.href.replace(/^\/(ar|en)/, '')));
}
