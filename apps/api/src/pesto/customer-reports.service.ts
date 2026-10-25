import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { DatabaseService } from '../database/database.service.js';

type Contact = {
  id: string;
  kind: 'verified' | 'pending';
  email: string;
  managerName: string;
  businessName: string;
  country: string;
  phone: string;
  language: string;
  registeredAt: Date;
  verifiedAt: Date | null;
  lastActivityAt: Date;
  status: string;
  registrationCount: number;
  trialCount: number;
  purchaseCount: number;
  licenseCount: number;
  unusedPurchaseKeys: number;
  latestTrialExpiresAt: Date | null;
  latestPurchaseAt: Date | null;
  latestLicenseAt: Date | null;
};
const statuses = ['all', 'pending', 'verified', 'trial-active', 'trial-expired', 'licensed'];

// All interpolated values use Prisma parameters. One profile per normalized email:
// verified customer wins over later pending requests, otherwise use the latest request.
function contacts(now: Date) {
  return Prisma.sql`WITH registration_stats AS (
    SELECT email, MIN("createdAt") AS first_at, MAX("createdAt") AS last_at,
      COUNT(*)::int AS registrations FROM "PestoRegistration" GROUP BY email
  ), pending_profiles AS (
    SELECT DISTINCT ON (r.email) r.id, r.email, r."managerName", r."businessName", r.country,
      r.phone, r.language, r."createdAt" FROM "PestoRegistration" r
    WHERE NOT EXISTS (SELECT 1 FROM "PestoCustomer" c WHERE c.email = r.email)
    ORDER BY r.email, r."createdAt" DESC, r.id DESC
  ), trial_stats AS (
    SELECT "customerId", COUNT(*)::int AS trials, MAX("expiresAt") AS expiry,
      MAX("issuedAt") AS last_at,
      (COUNT(*) FILTER (WHERE "issuedAt" <= ${now} AND "expiresAt" > ${now}))::int AS active
    FROM "PestoTrial" GROUP BY "customerId"
  ), purchase_stats AS (
    SELECT p."customerId", COUNT(*)::int AS purchases, MAX(p."createdAt") AS issued_at,
      MAX(GREATEST(p."createdAt", p."consumedAt", p."revokedAt")) AS last_at,
      (COUNT(*) FILTER (WHERE p."revokedAt" IS NULL AND p."consumedAt" IS NULL AND
        NOT EXISTS (SELECT 1 FROM "PestoPerpetualLicense" l WHERE l."purchaseId" = p.id)))::int AS unused
    FROM "PestoPurchaseKey" p GROUP BY p."customerId"
  ), license_stats AS (
    SELECT "customerId", COUNT(*)::int AS licenses, MAX("issuedAt") AS last_at
    FROM "PestoPerpetualLicense" GROUP BY "customerId"
  ), profiles AS (
    SELECT c.id, 'verified'::text AS kind, c.email, c."managerName", c."businessName",
      c.country, c.phone, c.language::text, c."emailVerifiedAt" AS "verifiedAt",
      LEAST(c."createdAt", r.first_at) AS "registeredAt",
      GREATEST(c."createdAt", r.last_at, t.last_at, p.last_at, l.last_at) AS "lastActivityAt",
      COALESCE(r.registrations,0)::int AS "registrationCount", COALESCE(t.trials,0)::int AS "trialCount",
      COALESCE(p.purchases,0)::int AS "purchaseCount", COALESCE(l.licenses,0)::int AS "licenseCount",
      COALESCE(p.unused,0)::int AS "unusedPurchaseKeys", t.expiry AS "latestTrialExpiresAt",
      p.issued_at AS "latestPurchaseAt", l.last_at AS "latestLicenseAt",
      CASE WHEN l.licenses > 0 THEN 'licensed' WHEN t.active > 0 THEN 'trial-active'
        WHEN t.trials > 0 THEN 'trial-expired' ELSE 'verified' END AS status
    FROM "PestoCustomer" c LEFT JOIN registration_stats r ON r.email=c.email
    LEFT JOIN trial_stats t ON t."customerId"=c.id
    LEFT JOIN purchase_stats p ON p."customerId"=c.id LEFT JOIN license_stats l ON l."customerId"=c.id
    UNION ALL
    SELECT p.id, 'pending'::text, p.email, p."managerName", p."businessName", p.country, p.phone,
      p.language::text, NULL::timestamp, r.first_at, r.last_at, r.registrations,
      0::int,0::int,0::int,0::int,NULL::timestamp,NULL::timestamp,NULL::timestamp,'pending'::text
    FROM pending_profiles p JOIN registration_stats r ON r.email=p.email
  )`;
}

function filters(raw: Record<string, unknown>) {
  if (
    Object.keys(raw).some(
      (key) => !['page', 'search', 'status', 'country', 'from', 'to'].includes(key),
    ) ||
    Object.values(raw).some((value) => typeof value !== 'string')
  )
    throw new BadRequestException('Invalid report filters.');
  const page = raw.page === undefined ? 1 : Number(raw.page);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    page > 100000 ||
    (raw.page !== undefined && !/^[1-9][0-9]*$/.test(raw.page as string))
  )
    throw new BadRequestException('Invalid report page.');
  const search = ((raw.search as string) ?? '').trim();
  const country = ((raw.country as string) ?? '').trim().toUpperCase();
  const status = (raw.status as string) ?? 'all';
  if (search.length > 120 || (country && !/^[A-Z]{2}$/.test(country)) || !statuses.includes(status))
    throw new BadRequestException('Invalid report filters.');
  function day(value: unknown) {
    if (value === undefined || value === '') return null;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      throw new BadRequestException('Invalid registration date.');
    const date = new Date(value + 'T00:00:00.000Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value)
      throw new BadRequestException('Invalid registration date.');
    return date;
  }
  const from = day(raw.from),
    to = day(raw.to);
  if (from && to && from > to) throw new BadRequestException('Registration dates are reversed.');
  return { page, search, country, status, from, to };
}

@Injectable()
export class PestoCustomerReportsService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  async list(raw: Record<string, unknown>) {
    const filter = filters(raw),
      now = new Date(),
      pageSize = 20;
    const conditions: Prisma.Sql[] = [Prisma.sql`TRUE`];
    if (filter.status !== 'all') conditions.push(Prisma.sql`p.status = ${filter.status}`);
    if (filter.country) conditions.push(Prisma.sql`p.country = ${filter.country}`);
    if (filter.from) conditions.push(Prisma.sql`p."registeredAt" >= ${filter.from}`);
    if (filter.to)
      conditions.push(Prisma.sql`p."registeredAt" < ${new Date(filter.to.getTime() + 86400000)}`);
    if (filter.search) {
      // Escape LIKE metacharacters so searches for %, _ and backslash are literal.
      const pattern = '%' + filter.search.replace(/[\\%_]/g, '\\$&') + '%';
      conditions.push(Prisma.sql`(p.email ILIKE ${pattern} OR p."managerName" ILIKE ${pattern}
        OR p."businessName" ILIKE ${pattern} OR p.phone ILIKE ${pattern} OR EXISTS (
          SELECT 1 FROM "PestoPurchaseKey" k WHERE p.kind='verified' AND k."customerId" = p.id AND k.reference ILIKE ${pattern}))`);
    }
    const where = Prisma.join(conditions, ' AND ');
    return this.db.$transaction(
      async (tx) => {
        const summary = await tx.$queryRaw<
          {
            totalContacts: number;
            verifiedCustomers: number;
            pendingContacts: number;
            activeTrials: number;
            expiredTrials: number;
            licensedCustomers: number;
            unusedPurchaseKeys: number;
          }[]
        >(Prisma.sql`${contacts(now)} SELECT COUNT(*)::int AS "totalContacts",
        (COUNT(*) FILTER (WHERE kind='verified'))::int AS "verifiedCustomers",
        (COUNT(*) FILTER (WHERE status='pending'))::int AS "pendingContacts",
        (COUNT(*) FILTER (WHERE status='trial-active'))::int AS "activeTrials",
        (COUNT(*) FILTER (WHERE status='trial-expired'))::int AS "expiredTrials",
        (COUNT(*) FILTER (WHERE status='licensed'))::int AS "licensedCustomers",
        COALESCE(SUM("unusedPurchaseKeys"),0)::int AS "unusedPurchaseKeys" FROM profiles`);
        const count = await tx.$queryRaw<{ total: number }[]>(Prisma.sql`${contacts(now)}
        SELECT COUNT(*)::int AS total FROM profiles p WHERE ${where}`);
        const items = await tx.$queryRaw<
          Contact[]
        >(Prisma.sql`${contacts(now)} SELECT p.* FROM profiles p
        WHERE ${where} ORDER BY p."lastActivityAt" DESC, p.email ASC
        LIMIT ${pageSize} OFFSET ${(filter.page - 1) * pageSize}`);
        return {
          asOf: now.toISOString(),
          summary: summary[0],
          page: filter.page,
          pageSize,
          total: count[0]!.total,
          items,
        };
      },
      { isolationLevel: 'RepeatableRead' },
    );
  }

  async detail(kind: string, id: string) {
    if (
      !['verified', 'pending'].includes(kind) ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)
    )
      throw new BadRequestException('Invalid customer reference.');
    const now = new Date(),
      historyLimit = 50;
    return this.db.$transaction(
      async (tx) => {
        const anchor =
          kind === 'verified'
            ? await tx.pestoCustomer.findUnique({ where: { id }, select: { email: true } })
            : await tx.pestoRegistration.findUnique({ where: { id }, select: { email: true } });
        if (!anchor) throw new NotFoundException('Pesto customer not found.');
        const matches = await tx.$queryRaw<Contact[]>(Prisma.sql`${contacts(now)}
        SELECT p.* FROM profiles p WHERE p.email = ${anchor.email}`);
        const customer = matches[0];
        if (!customer) throw new NotFoundException('Pesto customer not found.');
        const registrations = await tx.pestoRegistration.findMany({
          where: { email: customer.email },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: historyLimit,
          select: {
            id: true,
            createdAt: true,
            verifiedAt: true,
            expiresAt: true,
            deliveryStatus: true,
            deliveryAttempts: true,
            sentAt: true,
            consentAt: true,
            consentVersion: true,
            managerName: true,
            businessName: true,
            country: true,
            phone: true,
            language: true,
          },
        });
        // Pending-only contacts have no customer FK yet. Never use an undefined where
        // value: that would accidentally return the whole portfolio's history.
        const verified = customer.kind === 'verified';
        const trials = verified
          ? await tx.pestoTrial.findMany({
              where: { customerId: customer.id },
              orderBy: [{ issuedAt: 'desc' }, { id: 'desc' }],
              take: historyLimit,
              select: { id: true, issuedAt: true, expiresAt: true },
            })
          : [];
        const purchases = verified
          ? await tx.pestoPurchaseKey.findMany({
              where: { customerId: customer.id },
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              take: historyLimit,
              select: {
                id: true,
                reference: true,
                createdAt: true,
                consumedAt: true,
                revokedAt: true,
                license: { select: { id: true } },
              },
            })
          : [];
        const licenses = verified
          ? await tx.pestoPerpetualLicense.findMany({
              where: { customerId: customer.id },
              orderBy: [{ issuedAt: 'desc' }, { id: 'desc' }],
              take: historyLimit,
              select: {
                id: true,
                purchaseId: true,
                issuedAt: true,
                purchase: { select: { reference: true } },
                delivery: { select: { status: true, attempts: true, sentAt: true } },
              },
            })
          : [];
        return {
          asOf: now.toISOString(),
          customer,
          historyLimit,
          counts: {
            registrations: customer.registrationCount,
            trials: customer.trialCount,
            purchases: customer.purchaseCount,
            licenses: customer.licenseCount,
          },
          registrations: registrations.map(
            ({ managerName, businessName, country, phone, language, ...r }) => ({
              ...r,
              profile: { managerName, businessName, country, phone, language },
            }),
          ),
          trials: trials.map((r) => ({
            ...r,
            status: r.expiresAt > now && r.issuedAt <= now ? 'active' : 'expired',
          })),
          purchases: purchases.map(({ license, ...p }) => ({
            ...p,
            licenseId: license?.id ?? null,
            status: p.revokedAt ? 'revoked' : p.consumedAt ? 'activated' : 'unused',
          })),
          licenses: licenses.map(({ purchase, ...l }) => ({ ...l, reference: purchase.reference })),
        };
      },
      { isolationLevel: 'RepeatableRead' },
    );
  }
}
