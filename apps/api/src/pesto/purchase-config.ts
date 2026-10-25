import { z } from 'zod';
import { readTrialKey } from './trial-signing.js';
export const pestoPurchaseEnvironmentSchema = z
  .object({
    PESTO_PURCHASE_ENABLED: z.enum(['true', 'false']).default('false'),
    PESTO_REGISTRATION_ENABLED: z.enum(['true', 'false']).default('false'),
    PESTO_REGISTRATION_EMAIL_KEY: z.string().optional(),
    PESTO_LICENSE_KEY_ID: z.string().optional(),
    PESTO_LICENSE_PRIVATE_KEY: z.string().optional(),
    EMAIL_TRANSPORT: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.PESTO_PURCHASE_ENABLED !== 'true') return;
    for (const [field, valid] of [
      ['PESTO_REGISTRATION_ENABLED', value.PESTO_REGISTRATION_ENABLED === 'true'],
      [
        'PESTO_REGISTRATION_EMAIL_KEY',
        /^[a-f0-9]{64}$/.test(value.PESTO_REGISTRATION_EMAIL_KEY ?? ''),
      ],
      ['PESTO_LICENSE_KEY_ID', /^[A-Za-z0-9_-]{1,80}$/.test(value.PESTO_LICENSE_KEY_ID ?? '')],
      ['EMAIL_TRANSPORT', ['smtp', 'resend'].includes(value.EMAIL_TRANSPORT ?? '')],
    ] as const)
      if (!valid)
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Required for Pesto purchase activation',
        });
    try {
      readTrialKey(value.PESTO_LICENSE_PRIVATE_KEY ?? '');
    } catch {
      ctx.addIssue({
        code: 'custom',
        path: ['PESTO_LICENSE_PRIVATE_KEY'],
        message: 'Invalid licensing signer',
      });
    }
  });
