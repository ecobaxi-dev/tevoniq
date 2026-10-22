import { Controller, Get, Post, Put, Param, Query, Body, Req, Res, Inject, Header, HttpCode, UseGuards, UseInterceptors, UploadedFile, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { jobSlugSchema, jobQuerySchema, adminJobQuerySchema, jobWriteSchema, applicationSubmitSchema, applicationQuerySchema, applicationUpdateSchema, applicationNoteSchema, MAX_CV_BYTES } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { parse, idSchema } from '../cms/content-policy.js';
import { requirePermission } from '../cms/permissions.js';
import type { CmsRequest } from '../cms/cms.guard.js';
import type { Prisma } from '../generated/prisma/client.js';
import { LeadSubmissionGuard, LeadBotProtection, submissionIp } from '../leads/bot-protection.js';
import { CvSecurity } from './cv-security.js';

export const publicJobWhere = (now = new Date()): Prisma.CareerJobWhereInput => ({ status: 'PUBLISHED', publishedAt: { lte: now }, OR: [{ closingDate: null }, { closingDate: { gt: now } }] });
export const publicJobSelect = { id: true, title: true, slug: true, department: true, location: true, employmentType: true, workMode: true, description: true, responsibilities: true, requirements: true, preferredQualifications: true, publishedAt: true, closingDate: true, updatedAt: true } as const;
const cvSelect = { id: true, name: true, mimeType: true, size: true, scanStatus: true } as const;
const applicationSelect = { id: true, jobId: true, name: true, email: true, phone: true, location: true, linkedIn: true, portfolio: true, coverLetter: true, consentAt: true, status: true, version: true, createdAt: true, updatedAt: true, job: { select: { id: true, title: true, slug: true, status: true } }, cv: { select: cvSelect } } as const;
const jobFilters = (q: z.infer<typeof jobQuerySchema>): Prisma.CareerJobWhereInput => ({
  ...(q.q ? { OR: [{ title: { contains: q.q, mode: 'insensitive' } }, { department: { contains: q.q, mode: 'insensitive' } }, { location: { contains: q.q, mode: 'insensitive' } }] } : {}),
  ...(q.department ? { department: q.department } : {}), ...(q.employmentType ? { employmentType: q.employmentType } : {}), ...(q.workMode ? { workMode: q.workMode } : {}),
});
async function transaction<T>(db: DatabaseService, work: (tx: Prisma.TransactionClient) => Promise<T>) {
  try { return await db.$transaction(work, { isolationLevel: 'Serializable', timeout: 10000 }); }
  catch (e) {
    if (e && typeof e === 'object' && 'code' in e) {
      if (e.code === 'P2002') throw new ConflictException('This slug or submission is already in use. Retry with the same submission.');
      if (e.code === 'P2034') throw new ConflictException('The record changed. Reload or retry.');
    }
    throw e;
  }
}

@Controller('careers')
export class CareersController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService, @Inject(ConfigService) private readonly config: ConfigService, @Inject(LeadBotProtection) private readonly bot: LeadBotProtection, @Inject(CvSecurity) private readonly cvs: CvSecurity) {}
  @Get() @Header('Cache-Control', 'no-store')
  async list(@Query() query: unknown) {
    const q = parse(jobQuerySchema, query), where = { AND: [publicJobWhere(), jobFilters(q)] };
    const [items, total] = await this.db.$transaction([
      this.db.careerJob.findMany({ where, select: publicJobSelect, take: q.limit, skip: (q.page - 1) * q.limit, orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }] }),
      this.db.careerJob.count({ where }),
    ]);
    return { items, total, page: q.page, limit: q.limit };
  }
  @Get(':slug') @Header('Cache-Control', 'no-store')
  async detail(@Param('slug') raw: string) {
    const slug = parse(jobSlugSchema, raw);
    const job = await this.db.careerJob.findFirst({ where: { ...publicJobWhere(), slug }, select: publicJobSelect });
    if (!job) throw new NotFoundException('This opening is unavailable');
    return { ...job, turnstileSiteKey: this.config.get('TURNSTILE_MODE') === 'turnstile' ? this.config.get<string>('TURNSTILE_SITE_KEY') : null };
  }
  @Post('apply') @UseGuards(LeadSubmissionGuard) @HttpCode(202) @Header('Cache-Control', 'no-store')
  @UseInterceptors(FileInterceptor('cv', { limits: { fileSize: MAX_CV_BYTES, files: 1, fields: 1, fieldSize: 64 * 1024, parts: 2 } }))
  async apply(@Body() raw: unknown, @UploadedFile() file: Express.Multer.File | undefined, @Req() req: Request) {
    const wrapper = parse(z.object({ payload: z.string().max(64000) }).strict(), raw);
    let payload: unknown;
    try { payload = JSON.parse(wrapper.payload); } catch { throw new BadRequestException('Invalid application'); }
    const value = parse(applicationSubmitSchema, payload);
    const { submissionId, jobSlug, website, turnstileToken, consent, ...fields } = value;
    if (website) throw new BadRequestException('Invalid application');
    // Validate availability before scanning and recheck under the submission transaction.
    if (!await this.db.careerJob.count({ where: { ...publicJobWhere(), slug: jobSlug } })) throw new NotFoundException('This opening is unavailable');
    await this.bot.rateLimit(`career-email:${fields.email}`, 5, 3600000);
    await this.bot.verify(turnstileToken, 'careers', submissionIp(req, this.config.get<string>('LEAD_PROXY_SECRET')));
    const cv = await this.cvs.validate(file);
    const submissionHash = createHash('sha256').update(JSON.stringify({ jobSlug, ...fields, consent, cv: cv.sha256 })).digest('hex');
    await transaction(this.db, async (tx) => {
      const prior = await tx.jobApplication.findUnique({ where: { submissionId }, select: { submissionHash: true } });
      if (prior) {
        if (prior.submissionHash !== submissionHash) throw new ConflictException('Submission changed. Reload the form.');
        return;
      }
      const job = await tx.careerJob.findFirst({ where: { ...publicJobWhere(), slug: jobSlug }, select: { id: true } });
      if (!job) throw new NotFoundException('This opening is unavailable');
      await tx.jobApplication.create({ data: { ...fields, jobId: job.id, submissionId, submissionHash, consentAt: new Date(), cv: { create: cv }, history: { create: { action: 'SUBMITTED', toStatus: 'NEW' } } } });
    });
    // No applicant fields, identifiers, attachment URLs or status are returned publicly.
    return { ok: true };
  }
}

@Controller('cms/careers')
export class CmsCareersController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get('jobs') @Header('Cache-Control', 'no-store')
  async list(@Query() query: unknown) {
    const q = parse(adminJobQuerySchema, query), where = { ...jobFilters(q), ...(q.status ? { status: q.status } : {}) };
    const [items, total] = await this.db.$transaction([
      this.db.careerJob.findMany({ where, take: q.limit, skip: (q.page - 1) * q.limit, orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }] }), this.db.careerJob.count({ where }),
    ]);
    return { items, total, page: q.page, limit: q.limit };
  }
  @Get('jobs/:id') @Header('Cache-Control', 'no-store')
  async get(@Param('id') raw: string) {
    const job = await this.db.careerJob.findUnique({ where: { id: parse(idSchema, raw) } });
    if (!job) throw new NotFoundException();
    return job;
  }
  @Post('jobs') create(@Body() body: unknown, @Req() req: CmsRequest) { return this.save(undefined, body, req); }
  @Put('jobs/:id') update(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) { return this.save(parse(idSchema, raw), body, req); }
  private async save(id: string | undefined, body: unknown, req: CmsRequest) {
    const { version, ...data } = parse(jobWriteSchema, body);
    if (!id && version !== 0) throw new ConflictException('New jobs start at version zero');
    if (data.status === 'PUBLISHED' || data.status === 'CLOSED') requirePermission(req, 'careers.publish');
    if (data.status === 'ARCHIVED') requirePermission(req, 'careers.delete');
    return transaction(this.db, async (tx) => {
      const before = id ? await tx.careerJob.findUnique({ where: { id } }) : null;
      if (id && (!before || before.version !== version)) throw new ConflictException('Job changed. Reload first.');
      if (before?.status === 'PUBLISHED') requirePermission(req, 'careers.publish');
      if (before?.status === 'ARCHIVED' && data.status !== 'ARCHIVED') requirePermission(req, 'careers.delete');
      const saved = id
        ? await tx.careerJob.update({ where: { id, version }, data: { ...data, updatedById: req.cmsUser.id, version: { increment: 1 } } })
        : await tx.careerJob.create({ data: { ...data, createdById: req.cmsUser.id, updatedById: req.cmsUser.id } });
      await tx.cmsAudit.create({ data: { actorId: req.cmsUser.id, entityId: saved.id, action: `careers.${data.status.toLowerCase()}` } });
      return saved;
    });
  }
  @Get('applications') @Header('Cache-Control', 'no-store')
  async applications(@Query() query: unknown) {
    const q = parse(applicationQuerySchema, query);
    const where: Prisma.JobApplicationWhereInput = { ...(q.jobId ? { jobId: q.jobId } : {}), ...(q.status ? { status: q.status } : {}), ...(q.q ? { OR: [{ name: { contains: q.q, mode: 'insensitive' } }, { email: { contains: q.q, mode: 'insensitive' } }] } : {}) };
    const [items, total] = await this.db.$transaction([
      this.db.jobApplication.findMany({ where, select: { id: true, name: true, email: true, status: true, createdAt: true, version: true, job: { select: { id: true, title: true } } }, take: q.limit, skip: (q.page - 1) * q.limit, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }] }), this.db.jobApplication.count({ where }),
    ]);
    return { items, total, page: q.page, limit: q.limit };
  }
  @Get('applications/:id') @Header('Cache-Control', 'no-store')
  async application(@Param('id') raw: string) {
    const application = await this.db.jobApplication.findUnique({ where: { id: parse(idSchema, raw) }, select: applicationSelect });
    if (!application) throw new NotFoundException();
    return application;
  }
  @Get('applications/:id/history') @Header('Cache-Control', 'no-store')
  async history(@Param('id') raw: string, @Query() query: unknown) {
    const id = parse(idSchema, raw), { page } = parse(z.object({ page: z.coerce.number().int().min(1).max(10000).default(1) }).strict(), query);
    if (!await this.db.jobApplication.count({ where: { id } })) throw new NotFoundException();
    const [items, total] = await this.db.$transaction([
      this.db.jobApplicationHistory.findMany({ where: { applicationId: id }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 30, skip: (page - 1) * 30 }),
      this.db.jobApplicationHistory.count({ where: { applicationId: id } }),
    ]);
    const users = await this.db.cmsUser.findMany({ where: { id: { in: items.flatMap((h) => h.actorId ? [h.actorId] : []) } }, select: { id: true, email: true } });
    return { items: items.map((h) => ({ ...h, actor: h.actorId ? users.find((u) => u.id === h.actorId)?.email || 'Former user' : 'Applicant' })), total, page };
  }
  @Put('applications/:id/status')
  async status(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    const id = parse(idSchema, raw), value = parse(applicationUpdateSchema, body);
    return transaction(this.db, async (tx) => {
      const before = await tx.jobApplication.findUnique({ where: { id }, select: { version: true, status: true } });
      if (!before || before.version !== value.version) throw new ConflictException('Application changed. Reload first.');
      if (before.status === value.status) return { ok: true };
      await tx.jobApplication.update({ where: { id, version: value.version }, data: { status: value.status, version: { increment: 1 } } });
      await tx.jobApplicationHistory.create({ data: { applicationId: id, action: 'STATUS_CHANGED', fromStatus: before.status, toStatus: value.status, actorId: req.cmsUser.id } });
      await tx.cmsAudit.create({ data: { actorId: req.cmsUser.id, entityId: id, action: 'careers.application.status' } });
      return { ok: true };
    });
  }
  @Post('applications/:id/notes')
  async note(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    const id = parse(idSchema, raw), value = parse(applicationNoteSchema, body);
    return transaction(this.db, async (tx) => {
      if (!(await tx.jobApplication.updateMany({ where: { id, version: value.version }, data: { version: { increment: 1 } } })).count) throw new ConflictException('Application changed. Reload first.');
      await tx.jobApplicationHistory.create({ data: { applicationId: id, action: 'NOTE_ADDED', note: value.note, actorId: req.cmsUser.id } });
      await tx.cmsAudit.create({ data: { actorId: req.cmsUser.id, entityId: id, action: 'careers.application.note' } });
      return { ok: true };
    });
  }
  @Get('applications/:id/cv')
  async cv(@Param('id') raw: string, @Req() req: CmsRequest, @Res() res: Response) {
    const id = parse(idSchema, raw), file = await this.db.jobCv.findUnique({ where: { applicationId: id } });
    if (!file) throw new NotFoundException();
    await this.db.cmsAudit.create({ data: { actorId: req.cmsUser.id, entityId: id, action: 'careers.cv.download' } });
    res.set({ 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="CV.pdf"; filename*=UTF-8''${encodeURIComponent(file.name)}`, 'Content-Length': String(file.size), 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "sandbox; default-src 'none'" });
    res.send(Buffer.from(file.bytes));
  }
}
