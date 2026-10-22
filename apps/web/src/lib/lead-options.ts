import 'server-only';
import { z } from 'zod';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
export const leadOptionsSchema = z.object({
  budgetRanges: z.array(z.object({ value: z.string(), label: z.string() })),
  services: z.array(z.object({ id: z.string().uuid(), title: z.string() })),
  attachmentsEnabled: z.boolean(),
  maxAttachments: z.number(),
  maxAttachmentBytes: z.number(),
  turnstileSiteKey: z.string().nullable(),
});
export type LeadOptions = z.infer<typeof leadOptionsSchema>;
export async function getLeadOptions(locale: string) {
  const response = await fetchPublicContent(`${env.API_URL}/leads/options?locale=${locale}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('Contact forms unavailable');
  return leadOptionsSchema.parse(await response.json());
}
