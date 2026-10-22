import { ApplicationManager } from '@/components/careers/application-manager';
export default async function Page({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  const query = await searchParams;
  return <ApplicationManager jobId={typeof query.jobId === 'string' ? query.jobId : ''} />;
}
