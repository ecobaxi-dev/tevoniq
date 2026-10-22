'use client';
import { useNonce } from '@/components/nonce-provider';
import { jsonLd } from '@/lib/seo-core';
export function StructuredData({ data }: { data: unknown }) {
  const nonce = useNonce();
  return data ? (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  ) : null;
}
