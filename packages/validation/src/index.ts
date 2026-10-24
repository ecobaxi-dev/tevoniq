import { z } from 'zod';
export * from './rbac.js';
export * from './leads.js';
export * from './admin.js';
export * from './insights.js';
export * from './company.js';
export const localeSchema = z.enum(['en', 'tr', 'ar']);
const httpUrl = z
  .url()
  .refine(
    (value) => URL.canParse(value) && ['http:', 'https:'].includes(new URL(value).protocol),
    'Expected HTTP(S) URL',
  );
export const apiEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DATABASE_URL: z
      .string()
      .min(1)
      .refine((value) => {
        try {
          return ['postgres:', 'postgresql:'].includes(new URL(value).protocol);
        } catch {
          return false;
        }
      }, 'Expected PostgreSQL URL'),
    CORS_ORIGIN: httpUrl.refine(
      (value) => URL.canParse(value) && new URL(value).origin === value,
      'Use an origin without a trailing slash or path',
    ),
    REDIS_URL: z
      .url()
      .refine(
        (value) => URL.canParse(value) && ['redis:', 'rediss:'].includes(new URL(value).protocol),
      )
      .optional(),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
  })
  .superRefine((env, context) => {
    if (!URL.canParse(env.CORS_ORIGIN)) return;
    const origin = new URL(env.CORS_ORIGIN);
    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname);
    if (env.NODE_ENV === 'production' && origin.protocol !== 'https:' && !isLoopback) {
      context.addIssue({
        code: 'custom',
        path: ['CORS_ORIGIN'],
        message: 'Public production origins require HTTPS',
      });
    }
  });
export type ApiEnvironment = z.infer<typeof apiEnvironmentSchema>;
export const webEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_URL: httpUrl.default('http://localhost:4000/api/v1'),
    SITE_URL: httpUrl.default('http://localhost:3000'),
  })
  .superRefine((env, ctx) => {
    const site = new URL(env.SITE_URL);
    if (site.username || site.password || site.search || site.hash || site.pathname !== '/')
      ctx.addIssue({
        code: 'custom',
        path: ['SITE_URL'],
        message: 'Use a public origin without credentials, path, query or fragment',
      });
    if (
      env.NODE_ENV === 'production' &&
      site.protocol !== 'https:' &&
      !['localhost', '127.0.0.1', '[::1]'].includes(site.hostname)
    )
      ctx.addIssue({
        code: 'custom',
        path: ['SITE_URL'],
        message: 'Public production origins require HTTPS',
      });
    const api = new URL(env.API_URL);
    if (api.username || api.password || api.search || api.hash)
      ctx.addIssue({
        code: 'custom',
        path: ['API_URL'],
        message: 'API URL must not contain credentials, query or fragment',
      });
  });
export * from './services.js';
export * from './solutions.js';

export * from './industries.js';
export * from './page-builder.js';
export * from './projects.js';
export * from './careers.js';
export * from './newsletter.js';
export * from './seo.js';
export * from './site-settings.js';
export * from './home.js';
export * from './navigation.js';

export * from './pesto-registration.js';
