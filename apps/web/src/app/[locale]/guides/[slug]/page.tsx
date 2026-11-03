import { notFound } from 'next/navigation';
import { growthGuides } from '@/content/growth';
import { GuidePage } from '@/components/growth-pages';
import { growthMetadata } from '@/lib/growth-metadata';
type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
async function resolve(props: Props) {
  const { locale, slug } = await props.params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  const item = growthGuides.find((item) => item.slug === slug);
  if (!item) notFound();
  return { locale: locale as 'ar' | 'en', item };
}
export async function generateMetadata(props: Props) {
  const { locale, item } = await resolve(props);
  return growthMetadata(props, '/guides/' + item.slug, item[locale].title, item[locale].intro);
}
export default async function Page(props: Props) {
  const { locale, item } = await resolve(props);
  return <GuidePage locale={locale} item={item} />;
}
