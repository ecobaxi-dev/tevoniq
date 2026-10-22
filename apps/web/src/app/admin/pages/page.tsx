import { PageManager } from '@/components/page-builder/page-manager';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  return <PageManager initialId={typeof q.id === 'string' ? q.id : ''} />;
}
