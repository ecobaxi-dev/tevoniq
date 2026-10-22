import { connection } from 'next/server';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import '../globals.css';
import './admin.css';
import { AdminShell } from '@/components/admin/admin-shell';
export const metadata: Metadata = { title: 'TEVONIQ CMS', robots: { index: false, follow: false } };
export default async function Layout({ children }: { children: ReactNode }) {
  await connection();
  return (
    <html lang="en">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
