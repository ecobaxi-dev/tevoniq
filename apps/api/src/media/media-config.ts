import { z } from 'zod';
export const mediaEnvironmentSchema = z
  .object({
    MEDIA_STORAGE: z.enum(['local', 's3', 'disabled']).default('local'),
    MEDIA_LOCAL_ROOT: z.string().min(1).default('.data/media'),
    MEDIA_MAX_FILE_BYTES: z.coerce
      .number()
      .int()
      .min(1024)
      .max(25 * 1024 * 1024)
      .default(10 * 1024 * 1024),
    MEDIA_MAX_PIXELS: z.coerce.number().int().min(10000).max(40000000).default(25000000),
    MEDIA_S3_BUCKET: z.string().optional(),
    MEDIA_S3_REGION: z.string().default('us-east-1'),
    MEDIA_S3_ENDPOINT: z.url().optional(),
    MEDIA_S3_FORCE_PATH_STYLE: z.enum(['true', 'false']).default('true'),
  })
  .superRefine((value, ctx) => {
    if (value.MEDIA_STORAGE === 's3' && !value.MEDIA_S3_BUCKET)
      ctx.addIssue({
        code: 'custom',
        path: ['MEDIA_S3_BUCKET'],
        message: 'Required for S3 storage',
      });
  });
