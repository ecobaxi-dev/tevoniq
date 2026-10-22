import { connection } from 'next/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../globals.css';
import './showcase.css';
export const metadata: Metadata = {
  title: 'TEVONIQ — Design System',
  robots: { index: false, follow: false },
};
export default async function Layout({ children }: { children: ReactNode }) {
  await connection();
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
