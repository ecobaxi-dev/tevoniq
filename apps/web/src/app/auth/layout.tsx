import { connection } from 'next/server';
import type { ReactNode } from 'react';
import '../globals.css';
import '../admin/admin.css';
export default async function Layout({ children }: { children: ReactNode }) {
  await connection();
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
