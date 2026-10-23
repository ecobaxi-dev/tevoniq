import { z } from 'zod';
export const leadEnvironmentSchema = z
  .object({
    EMAIL_TRANSPORT: z.enum(['disabled', 'smtp', 'resend']).default('disabled'),
    RESEND_API_KEY: z.string().min(1).optional(),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    SMTP_SECURE: z.enum(['true', 'false']).default('false'),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.email().optional(),
    TURNSTILE_MODE: z.enum(['disabled', 'turnstile']).default('disabled'),
    TURNSTILE_SITE_KEY: z.string().min(1).optional(),
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
    TURNSTILE_HOSTNAMES: z.string().min(1).optional(),
    LEAD_PROXY_SECRET: z.string().min(32).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.EMAIL_TRANSPORT === 'resend')
      for (const key of ['RESEND_API_KEY', 'EMAIL_FROM'] as const)
        if (!v[key])
          ctx.addIssue({ code: 'custom', path: [key], message: 'Required for Resend delivery' });
    if (v.EMAIL_TRANSPORT === 'smtp')
      for (const key of ['SMTP_HOST', 'EMAIL_FROM'] as const)
        if (!v[key])
          ctx.addIssue({ code: 'custom', path: [key], message: 'Required for SMTP delivery' });
    if (!!v.SMTP_USER !== !!v.SMTP_PASSWORD)
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_USER'],
        message: 'Set SMTP_USER and SMTP_PASSWORD together',
      });
    if (v.TURNSTILE_MODE === 'turnstile')
      for (const key of [
        'TURNSTILE_SITE_KEY',
        'TURNSTILE_SECRET_KEY',
        'TURNSTILE_HOSTNAMES',
      ] as const)
        if (!v[key])
          ctx.addIssue({ code: 'custom', path: [key], message: 'Required for Turnstile' });
  });
