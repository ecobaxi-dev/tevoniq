import { PasswordRecovery } from '@/components/cms/password-recovery';
export const metadata = { title: 'New password | TEVONIQ', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default function ResetPassword() { return <PasswordRecovery reset />; }
