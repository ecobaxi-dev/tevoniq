import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Req,
  Res,
  Inject,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  Header,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  leadSubmissionSchema,
  leadQuerySchema,
  leadUpdateSchema,
  leadNoteSchema,
  leadSettingsSchema,
  leadStatusSchema,
  localeSchema,
  cleanLeadText,
} from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { CmsGuard, type CmsRequest } from '../cms/cms.guard.js';
import { parse, idSchema } from '../cms/content-policy.js';
import { digest } from '../cms/password.js';
import { requirePermission } from '../cms/permissions.js';
import { LeadSettingsService } from './lead-settings.service.js';
import { LeadBotProtection, LeadSubmissionGuard, submissionIp } from './bot-protection.js';
import { validateAttachments, scanAttachments, MAX_ATTACHMENT_SIZE } from './attachments.js';
import type { Prisma } from '../generated/prisma/client.js';
import { retiredServiceSlugs } from '@tevoniq/types';

const adminOnly = (req: CmsRequest) => {
  requirePermission(req, 'leads.read');
};
const attachmentsSelect = {
  id: true,
  name: true,
  mimeType: true,
  size: true,
  createdAt: true,
} as const;
@Controller('leads')
export class LeadsController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(LeadSettingsService) private readonly settings: LeadSettingsService,
    @Inject(LeadBotProtection) private readonly bot: LeadBotProtection,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}
  @Get('options')
  @Header('Cache-Control', 'no-store')
  async options(@Query() query: unknown) {
    const { locale } = parse(z.object({ locale: localeSchema.default('en') }).strict(), query),
      settings = await this.settings.get();
    const services = await this.db.service.findMany({
      where: {
        active: true,
        deletedAt: null,
        slug: { notIn: [...retiredServiceSlugs] },
        translations: { some: { locale, published: true } },
      },
      include: { translations: { where: { locale, published: true } } },
      orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
    });
    return {
      budgetRanges: settings.budgetRanges,
      attachmentsEnabled: settings.attachmentsEnabled,
      maxAttachments: 3,
      maxAttachmentBytes: MAX_ATTACHMENT_SIZE,
      services: services.map((s) => ({ id: s.id, title: s.translations[0]!.title })),
      turnstileSiteKey:
        this.config.get('TURNSTILE_MODE') === 'turnstile'
          ? this.config.getOrThrow<string>('TURNSTILE_SITE_KEY')
          : null,
    };
  }
  @Post('submit')
  @UseGuards(LeadSubmissionGuard)
  @HttpCode(202)
  @Header('Cache-Control', 'no-store')
  @UseInterceptors(
    FilesInterceptor('attachments', 3, {
      limits: {
        fileSize: MAX_ATTACHMENT_SIZE,
        files: 3,
        fields: 1,
        fieldSize: 100 * 1024,
        parts: 5,
      },
    }),
  )
  async submit(
    @Body() body: unknown,
    @UploadedFiles() rawFiles: Express.Multer.File[] | undefined,
    @Req() req: Request,
  ) {
    const origin = req.header('origin');
    if (origin && origin !== this.config.getOrThrow<string>('CORS_ORIGIN'))
      throw new ForbiddenException('Invalid submission origin');
    const ip = submissionIp(req, this.config.get<string>('LEAD_PROXY_SECRET'));
    const wrapper = parse(z.object({ payload: z.string().max(100 * 1024) }).strict(), body);
    let raw: unknown;
    try {
      raw = JSON.parse(wrapper.payload);
    } catch {
      throw new BadRequestException('Invalid form payload');
    }
    const value = parse(leadSubmissionSchema, raw),
      files = validateAttachments(rawFiles || []);
    const { website, turnstileToken, ...fields } = value;
    if (website) throw new BadRequestException('Submission could not be accepted');
    const fingerprint = digest(
      JSON.stringify({
        fields,
        attachments: files.map((f) => ({
          name: f.name,
          hash: digest(Buffer.from(f.bytes).toString('base64')),
        })),
      }),
    );
    const previous = await this.db.lead.findUnique({ where: { submissionId: value.submissionId } });
    if (previous) {
      if (previous.submissionHash !== fingerprint)
        throw new ConflictException('Submission changed. Start a new request.');
      return { ok: true, reference: previous.id };
    }
    await this.bot.rateLimit(`email:${value.email}`, 3, 3600000);
    await this.bot.verify(turnstileToken, value.type, ip);
    const settings = await this.settings.get();
    if (files.length && (value.type !== 'quote' || !settings.attachmentsEnabled))
      throw new BadRequestException('Attachments are not enabled for this form');
    await scanAttachments(files, this.config);
    const budget = settings.budgetRanges.find((b) => b.value === value.budgetRange);
    if (value.budgetRange && (value.type !== 'quote' || !budget))
      throw new BadRequestException('Choose an available budget option');
    const services = await this.db.service.findMany({
      where: {
        id: { in: value.servicesInterested },
        active: true,
        deletedAt: null,
        translations: { some: { locale: value.language, published: true } },
      },
      include: { translations: { where: { locale: value.language, published: true } } },
    });
    if (services.length !== value.servicesInterested.length)
      throw new BadRequestException('One or more selected services are unavailable');
    try {
      const lead = await this.db.$transaction(async (tx) => {
        const created = await tx.lead.create({
          data: {
            ...fields,
            submissionHash: fingerprint,
            servicesInterested: services.map((s) => ({
              id: s.id,
              slug: s.slug,
              title: s.translations[0]!.title,
            })),
            budgetLabel: budget?.label || '',
            consentAt: value.consent ? new Date() : null,
            consentVersion: value.consent ? 'quote-contact-v1' : null,
            attachments: { create: files },
            activities: { create: { action: 'lead.submitted', toStatus: 'NEW' } },
            emails: { create: [{ kind: 'notification' }, { kind: 'confirmation' }] },
          },
        });
        return created;
      });
      return { ok: true, reference: lead.id };
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
        const saved = await this.db.lead.findUnique({
          where: { submissionId: value.submissionId },
        });
        if (saved?.submissionHash === fingerprint) return { ok: true, reference: saved.id };
        throw new ConflictException('Submission changed. Start a new request.');
      }
      throw error;
    }
  }
}

@Controller('cms/leads')
@UseGuards(CmsGuard)
export class CmsLeadsController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(LeadSettingsService) private readonly settings: LeadSettingsService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}
  @Get('settings')
  async getSettings(@Req() req: CmsRequest) {
    requirePermission(req, 'settings.read');
    return {
      ...(await this.settings.get()),
      emailTransport: this.config.get<string>('EMAIL_TRANSPORT'),
      botProtection: this.config.get<string>('TURNSTILE_MODE'),
    };
  }
  @Put('settings')
  async saveSettings(@Body() body: unknown, @Req() req: CmsRequest) {
    requirePermission(req, 'settings.update');
    const { version, ...value } = parse(leadSettingsSchema, body);
    return this.db.$transaction(async (tx) => {
      if (!version) {
        const created = await tx.leadSettings.createMany({
          data: [{ id: 'default', value, updatedById: req.cmsUser.id }],
          skipDuplicates: true,
        });
        if (!created.count) throw new ConflictException('Settings changed. Reload first.');
      } else {
        const updated = await tx.leadSettings.updateMany({
          where: { id: 'default', version },
          data: { value, version: { increment: 1 }, updatedById: req.cmsUser.id },
        });
        if (!updated.count) throw new ConflictException('Settings changed. Reload first.');
      }
      await tx.cmsAudit.create({
        data: {
          actorId: req.cmsUser.id,
          entityId: 'lead-settings',
          action: 'leads.settings.update',
        },
      });
      const row = await tx.leadSettings.findUniqueOrThrow({ where: { id: 'default' } });
      return { ...value, version: row.version };
    });
  }
  @Get()
  async list(@Query() query: unknown, @Req() req: CmsRequest) {
    adminOnly(req);
    const q = parse(leadQuerySchema, query);
    const where: Prisma.LeadWhereInput = {
      deletedAt: q.archived === 'true' ? { not: null } : null,
      ...(q.status ? { status: q.status } : {}),
      ...(q.type ? { type: q.type } : {}),
      ...(q.q
        ? {
            OR: ['name', 'company', 'email', 'subject', 'projectDescription'].map((field) => ({
              [field]: { contains: q.q, mode: 'insensitive' },
            })),
          }
        : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.lead.findMany({
        where,
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          type: true,
          status: true,
          sourcePage: true,
          createdAt: true,
          updatedAt: true,
          version: true,
          deletedAt: true,
        },
        orderBy: [{ [q.sort]: q.direction }, { id: 'asc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.db.lead.count({ where }),
    ]);
    return { items, total, page: q.page, limit: q.limit };
  }
  @Post('bulk')
  async bulk(@Body() body: unknown, @Req() req: CmsRequest) {
    adminOnly(req);
    const value = parse(
      z
        .object({
          records: z
            .array(z.object({ id: idSchema, version: z.number().int().min(1) }).strict())
            .min(1)
            .max(100)
            .refine(
              (items) => new Set(items.map((item) => item.id)).size === items.length,
              'Duplicate records',
            ),
          action: z.enum(['status', 'archive', 'restore']),
          status: leadStatusSchema.optional(),
          confirmation: z.literal('CONFIRM'),
        })
        .strict(),
      body,
    );
    if (value.action === 'status' && !value.status)
      throw new BadRequestException('Choose a lead status');
    await this.db.$transaction(async (tx) => {
      for (const record of [...value.records].sort((a, b) => a.id.localeCompare(b.id))) {
        const before = await tx.lead.findUnique({ where: { id: record.id } });
        const changed = await tx.lead.updateMany({
          where: {
            id: record.id,
            version: record.version,
            deletedAt: value.action === 'restore' ? { not: null } : null,
          },
          data: {
            ...(value.action === 'status'
              ? { status: value.status! }
              : { deletedAt: value.action === 'archive' ? new Date() : null }),
            updatedById: req.cmsUser.id,
            version: { increment: 1 },
          },
        });
        if (!changed.count || !before)
          throw new ConflictException('A selected lead changed. Reload and select again.');
        await tx.leadActivity.create({
          data: {
            leadId: record.id,
            actorId: req.cmsUser.id,
            action: `lead.bulk.${value.action}`,
            ...(value.action === 'status'
              ? { fromStatus: before.status, toStatus: value.status! }
              : {}),
          },
        });
        await tx.cmsAudit.create({
          data: {
            actorId: req.cmsUser.id,
            entityId: record.id,
            action: `lead.bulk.${value.action}${value.status ? `.${value.status}` : ''}`,
          },
        });
        if (value.action === 'archive' || (value.action === 'status' && value.status === 'SPAM'))
          await tx.leadEmail.updateMany({
            where: { leadId: record.id, status: 'pending' },
            data: { status: 'cancelled' },
          });
      }
    });
    return { ok: true, count: value.records.length };
  }
  @Get(':id')
  async detail(@Param('id') raw: string, @Req() req: CmsRequest) {
    adminOnly(req);
    const id = parse(idSchema, raw);
    const lead = await this.db.lead.findUnique({
      where: { id },
      include: {
        attachments: { select: attachmentsSelect },
        emails: {
          select: {
            id: true,
            kind: true,
            status: true,
            attempts: true,
            sentAt: true,
            lastError: true,
          },
        },
      },
    });
    if (!lead) throw new NotFoundException();
    const { submissionHash, ...record } = lead;
    const updater = lead.updatedById
      ? await this.db.cmsUser.findUnique({
          where: { id: lead.updatedById },
          select: { email: true },
        })
      : null;
    return {
      ...record,
      createdBy:
        submissionHash === 'legacy-import' ? 'Not recorded (legacy import)' : 'Website visitor',
      updatedBy: updater?.email || (lead.updatedById ? 'Former administrator' : 'System'),
    };
  }
  @Get(':id/activity')
  async activity(@Param('id') raw: string, @Query() query: unknown, @Req() req: CmsRequest) {
    adminOnly(req);
    const id = parse(idSchema, raw),
      q = parse(z.object({ page: z.coerce.number().int().min(1).default(1) }).strict(), query);
    const [items, total] = await this.db.$transaction([
      this.db.leadActivity.findMany({
        where: { leadId: id },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        take: 30,
        skip: (q.page - 1) * 30,
      }),
      this.db.leadActivity.count({ where: { leadId: id } }),
    ]);
    const users = await this.db.cmsUser.findMany({
      where: { id: { in: items.flatMap((a) => (a.actorId ? [a.actorId] : [])) } },
      select: { id: true, email: true },
    });
    return {
      items: items.map((a) => ({
        ...a,
        actor:
          users.find((u) => u.id === a.actorId)?.email ||
          (a.actorId ? 'Former administrator' : 'System'),
      })),
      total,
      page: q.page,
      limit: 30,
    };
  }
  @Put(':id')
  async update(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    adminOnly(req);
    const id = parse(idSchema, raw),
      value = parse(leadUpdateSchema, body);
    await this.db.$transaction(async (tx) => {
      const before = await tx.lead.findUnique({ where: { id } });
      const changed = await tx.lead.updateMany({
        where: { id, version: value.version, deletedAt: null },
        data: { status: value.status, updatedById: req.cmsUser.id, version: { increment: 1 } },
      });
      if (!changed.count || !before)
        throw new ConflictException('Lead changed or archived. Reload first.');
      await tx.leadActivity.create({
        data: {
          leadId: id,
          actorId: req.cmsUser.id,
          action: 'lead.status',
          fromStatus: before.status,
          toStatus: value.status,
          note: value.note,
        },
      });
      await tx.cmsAudit.create({
        data: { actorId: req.cmsUser.id, entityId: id, action: `lead.status.${value.status}` },
      });
      if (value.status === 'SPAM')
        await tx.leadEmail.updateMany({
          where: { leadId: id, status: 'pending' },
          data: { status: 'cancelled' },
        });
    });
    return { ok: true };
  }
  @Post(':id/notes')
  async note(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    adminOnly(req);
    const id = parse(idSchema, raw),
      value = parse(leadNoteSchema, body);
    await this.db.$transaction(async (tx) => {
      if (
        !(
          await tx.lead.updateMany({
            where: { id, version: value.version, deletedAt: null },
            data: { updatedById: req.cmsUser.id, version: { increment: 1 } },
          })
        ).count
      )
        throw new ConflictException('Lead changed or archived. Reload first.');
      await tx.leadActivity.create({
        data: { leadId: id, actorId: req.cmsUser.id, action: 'lead.note', note: value.note },
      });
      await tx.cmsAudit.create({
        data: { actorId: req.cmsUser.id, entityId: id, action: 'lead.note' },
      });
    });
    return { ok: true };
  }
  @Post(':id/archive')
  async archive(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    adminOnly(req);
    const id = parse(idSchema, raw),
      value = parse(
        z
          .object({
            version: z.number().int(),
            archived: z.boolean(),
            confirmation: z.literal('CONFIRM'),
          })
          .strict(),
        body,
      );
    await this.db.$transaction(async (tx) => {
      if (
        !(
          await tx.lead.updateMany({
            where: { id, version: value.version },
            data: {
              deletedAt: value.archived ? new Date() : null,
              updatedById: req.cmsUser.id,
              version: { increment: 1 },
            },
          })
        ).count
      )
        throw new ConflictException('Lead changed. Reload first.');
      await tx.leadActivity.create({
        data: {
          leadId: id,
          actorId: req.cmsUser.id,
          action: value.archived ? 'lead.archived' : 'lead.restored',
        },
      });
      await tx.cmsAudit.create({
        data: {
          actorId: req.cmsUser.id,
          entityId: id,
          action: value.archived ? 'lead.archive' : 'lead.restore',
        },
      });
      if (value.archived)
        await tx.leadEmail.updateMany({
          where: { leadId: id, status: 'pending' },
          data: { status: 'cancelled' },
        });
    });
    return { ok: true };
  }
  @Post(':id/retry-email')
  async retryEmail(@Param('id') raw: string, @Req() req: CmsRequest) {
    adminOnly(req);
    const id = parse(idSchema, raw),
      lead = await this.db.lead.findUnique({ where: { id } });
    if (!lead || lead.deletedAt || lead.status === 'SPAM')
      throw new BadRequestException('Only active, non-spam leads can receive emails');
    await this.db.$transaction([
      this.db.leadEmail.updateMany({
        where: { leadId: id, status: 'failed' },
        data: { status: 'pending', attempts: 0, nextAttemptAt: new Date(), lockedUntil: null },
      }),
      this.db.leadActivity.create({
        data: { leadId: id, actorId: req.cmsUser.id, action: 'email.retry-requested' },
      }),
    ]);
    return { ok: true };
  }
  @Get(':id/attachments/:attachmentId')
  async attachment(
    @Param('id') raw: string,
    @Param('attachmentId') rawAttachment: string,
    @Req() req: CmsRequest,
    @Res() res: Response,
  ) {
    adminOnly(req);
    const id = parse(idSchema, raw),
      attachmentId = parse(idSchema, rawAttachment);
    const file = await this.db.leadAttachment.findFirst({
      where: { id: attachmentId, leadId: id },
    });
    if (!file) throw new NotFoundException();
    await this.db.leadActivity.create({
      data: {
        leadId: id,
        actorId: req.cmsUser.id,
        action: 'attachment.downloaded',
        note: cleanLeadText(file.name),
      },
    });
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(Buffer.from(file.bytes));
  }
}
