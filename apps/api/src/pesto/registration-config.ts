import { z } from 'zod';
import type { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';

export const pestoRegistrationEnvironmentSchema = z
  .object({
    PESTO_REGISTRATION_ENABLED: z.enum(['true', 'false']).default('false'),
    PESTO_REGISTRATION_EMAIL_KEY: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    EMAIL_TRANSPORT: z.enum(['disabled', 'smtp', 'resend']).default('disabled'),
  })
  .superRefine((value, ctx) => {
    if (value.PESTO_REGISTRATION_ENABLED !== 'true') return;
    if (!value.PESTO_REGISTRATION_EMAIL_KEY)
      ctx.addIssue({
        code: 'custom',
        path: ['PESTO_REGISTRATION_EMAIL_KEY'],
        message: 'Required for Pesto email verification',
      });
    if (value.EMAIL_TRANSPORT === 'disabled')
      ctx.addIssue({
        code: 'custom',
        path: ['EMAIL_TRANSPORT'],
        message: 'Pesto registration requires email delivery',
      });
  });

export function registrationEnabled(config: ConfigService) {
  return config.get<string>('PESTO_REGISTRATION_ENABLED') === 'true';
}
export function registrationKey(config: ConfigService) {
  const key = config.get<string>('PESTO_REGISTRATION_EMAIL_KEY');
  if (!key || !/^[a-f0-9]{64}$/.test(key))
    throw new ServiceUnavailableException('Pesto registration is not configured.');
  return Buffer.from(key, 'hex');
}
