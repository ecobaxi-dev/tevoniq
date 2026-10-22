import { notFound } from 'next/navigation';
import { adminModules } from '@tevoniq/validation';
import { RecordManager } from '@/components/admin/record-manager';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section } = await params;
  if (![...adminModules, 'search', 'audit-logs', 'trash'].includes(section)) notFound();
  const query = await searchParams;
  return (
    <RecordManager
      key={`${section}/${query.q || ''}/${query.status || ''}`}
      section={section}
      initialQuery={typeof query.q === 'string' ? query.q : ''}
      initialStatus={typeof query.status === 'string' ? query.status : ''}
    />
  );
}
