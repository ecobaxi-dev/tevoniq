import { notFound } from 'next/navigation';
import { findAutomationCase } from '@/content/automation-cases';
import { AutomationPreview } from '@/components/automation-preview';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const model = findAutomationCase(slug);
  return {
    title:
      model && (locale === 'ar' || locale === 'en')
        ? `${model[locale].name} — TEVONIQ Demo`
        : 'Automation preview',
    robots: { index: false, follow: false },
  };
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const model = findAutomationCase(slug);
  if (!model || (locale !== 'ar' && locale !== 'en')) notFound();
  return <AutomationPreview key={`${locale}-${slug}`} model={model} locale={locale} />;
}
