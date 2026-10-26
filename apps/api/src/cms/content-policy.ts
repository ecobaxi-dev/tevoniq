import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import type { Locale, Prisma } from '../generated/prisma/client.js';
import { retiredServiceSlugs, retiredProjectSlugs } from '@tevoniq/types';

export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new BadRequestException(
      result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    );
  return result.data;
}
export const idSchema = z.string().uuid();
export const versionSchema = z.object({ version: z.number().int().min(0) }).strict();
export const localeQuerySchema = z
  .object({ locale: z.enum(['en', 'tr', 'ar']).default('en') })
  .strict();
export const publicServiceWhere = (locale: Locale): Prisma.ServiceWhereInput => ({
  slug: { notIn: [...retiredServiceSlugs] },
  active: true,
  translations: { some: { locale, published: true } },
});
export const publicProjectWhere = (locale: Locale): Prisma.ProjectWhereInput => ({
  slug: { notIn: retiredProjectSlugs },
  published: true,
  verified: true,
  translations: { some: { locale, published: true } },
});
export function reordered(before: string[], after: string[]) {
  return (
    JSON.stringify(before.filter((id) => after.includes(id))) !==
    JSON.stringify(after.filter((id) => before.includes(id)))
  );
}

export const publicIndustryWhere = (locale: Locale): Prisma.IndustryWhereInput => ({
  active: true,
  published: true,
  status: 'PUBLISHED',
  translations: { some: { locale, published: true } },
});
