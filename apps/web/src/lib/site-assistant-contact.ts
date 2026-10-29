import type { AssistantLocale, AssistantSource } from './site-assistant-core';
export type AssistantContactFacts = {
  streetAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  whatsApp: string;
  email: string;
  salesEmail: string;
  supportEmail: string;
};
// Headquarters confirmed directly by the owner on 2026-10-29; no street/reception policy implied.
export const assistantHeadquarters = {
  ar: 'مقر الشركة الرئيسي: إسطنبول، تركيا.',
  en: 'The company’s main headquarters is in Istanbul, Türkiye.',
};

/** Owner-confirmed headquarters plus public CMS contact data. A city/address is not permission to receive visitors. */
export function assistantContactSource(
  locale: AssistantLocale,
  contact: AssistantContactFacts,
  legalName = '',
): AssistantSource {
  const ar = locale === 'ar';
  let country = contact.country;
  try {
    country = country
      ? (new Intl.DisplayNames([locale], { type: 'region' }).of(country) ?? country)
      : '';
  } catch {
    /* Preserve the published country code if display names are unavailable. */
  }
  const address = [contact.streetAddress, contact.city, contact.region, contact.postalCode, country]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(ar ? '، ' : ', ');
  const email = contact.salesEmail || contact.email || contact.supportEmail;
  const facts = [
    assistantHeadquarters[locale],
    legalName
      ? (ar ? 'الاسم القانوني المنشور: ' : 'Published legal company name: ') + legalName
      : '',
    address
      ? (ar ? 'الموقع الجغرافي المنشور: ' : 'Published geographic location: ') + address
      : ar
        ? 'لا توجد بيانات عنوان إضافية منشورة في إعدادات التواصل.'
        : 'No additional contact address is published in contact settings.',
    !contact.streetAddress.trim()
      ? ar
        ? 'العنوان التفصيلي للشارع غير منشور؛ لا تذكر المدينة كعنوان مكتب كامل.'
        : 'No street address is published; do not present the city as a full office address.'
      : '',
    contact.phone ? (ar ? 'رقم الهاتف المنشور: ' : 'Published phone number: ') + contact.phone : '',
    contact.whatsApp
      ? (ar ? 'رقم واتساب المنشور: ' : 'Published WhatsApp number: ') + contact.whatsApp
      : '',
    email ? (ar ? 'البريد المنشور للتواصل: ' : 'Published contact email: ') + email : '',
    ar
      ? 'لا تتضمن هذه الإعدادات تأكيدًا لوجود مكتب لاستقبال الزوار أو ساعات الزيارة أو سياسة مواعيد. لا تستنتج وجود مكتب أو عدم وجوده. لا تدّع أننا نعمل عن بُعد أو نستقبل زيارات أو لدينا فروع ما لم تؤكدها معرفة معتمدة. عند طلب مكان للرجوع إليه، أجب بالموقع ووسائل التواصل المعروفة، وبيّن ما يلزم تأكيده قبل الزيارة باختصار.'
      : 'These settings do not confirm a visitor reception office, visiting hours or appointment policy. Do not infer either the presence or absence of an office. Do not claim remote-only operation, walk-in visits or branches without approved evidence. For a place to refer to, provide known location/contact facts and briefly identify what needs confirmation before a visit.',
  ].filter(Boolean);
  return {
    title: ar
      ? 'موقع الشركة وبيانات التواصل المعتمدة'
      : 'Company location and verified contact details',
    href: `/${locale}/contact`,
    text: facts.join('\n'),
    keywords:
      'أين اين وين فين موقعكم مكانكم عنوان مقر مكتب جغرافي زيارة رجوع مرجع تواصل هاتف واتساب بريد location address office visit contact phone whatsapp email',
  };
}
