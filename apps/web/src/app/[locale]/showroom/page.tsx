import { notFound } from 'next/navigation';
import { ShowroomPage } from '@/components/growth-pages';
import { growthMetadata } from '@/lib/growth-metadata';
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  return growthMetadata(
    props,
    '/showroom',
    locale === 'ar'
      ? 'عروض قصيرة لحلول الأعمال والنماذج التفاعلية'
      : 'Short business solution walkthroughs & interactive demos',
    locale === 'ar'
      ? 'شاهد أربعة عروض توضيحية لمواقع الأعمال ومتابعة الطلبات والأتمتة ولوحات المعلومات، ثم جرّب النماذج بنفسك.'
      : 'Watch four illustrative walkthroughs for business websites, request tracking, automation and dashboards, then explore the demos.',
  );
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  return <ShowroomPage locale={locale} />;
}
