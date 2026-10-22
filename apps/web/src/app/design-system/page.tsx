import { notFound } from 'next/navigation';
import { DesignSystemShowcase } from './showcase';
export const dynamic = 'force-dynamic';
export default function Page() {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DESIGN_SYSTEM !== 'true')
    notFound();
  return <DesignSystemShowcase />;
}
