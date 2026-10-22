import { z } from 'zod';
export const publicNavigationSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      label: z.string().trim().min(1).max(200),
      href: z
        .string()
        .max(2048)
        .regex(/^\/(?!\/)(?!(?:en|tr|ar)(?:\/|$))[a-zA-Z0-9_/?=&%.-]*$/),
      group: z.string().max(100),
      order: z.number().int(),
    }),
  ),
  labels: z.record(z.string(), z.string().trim().min(1).max(1000)),
});
