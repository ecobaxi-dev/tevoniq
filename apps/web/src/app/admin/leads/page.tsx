import { LeadManager } from '@/components/admin/lead-manager';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  return (
    <LeadManager
      initialLead={typeof query.lead === 'string' ? query.lead : ''}
      initialStatus={typeof query.status === 'string' ? query.status : ''}
    />
  );
}
