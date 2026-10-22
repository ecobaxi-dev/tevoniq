import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Req,
  Inject,
  UseGuards,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { z } from 'zod';
import { pageSummary } from '../page-builder/page-content.js';
import {
  adminModuleSchema,
  adminDefinitions,
  adminWriteSchema,
  adminBulkSchema,
  adminQuerySchema,
  adminUserWriteSchema,
  type AdminModule,
  adminModules,
  hasPermission,
  moduleResource,
  cmsRoles,
  permissionsForRole,
} from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { CmsGuard, type CmsRequest } from '../cms/cms.guard.js';
import { parse, idSchema } from '../cms/content-policy.js';
import { hashPassword } from '../cms/password.js';
import { requirePermission } from '../cms/permissions.js';
import type { Prisma } from '../generated/prisma/client.js';

const privileged = (req: CmsRequest) => ['SUPER_ADMIN', 'ADMIN'].includes(req.cmsUser.role);
const privateModules = ['leads', 'messages', 'job-applications', 'newsletter', 'site-settings'];
export function authorizeModule(req: CmsRequest, module: string, write = false) {
  if (module === 'site-settings')
    throw new BadRequestException('Use the dedicated Site Settings editor');
  requirePermission(req, `${moduleResource(module) ?? 'unknown'}.${write ? 'update' : 'read'}`);
  if (write && ['leads', 'messages'].includes(module))
    throw new BadRequestException('Use the dedicated lead management workflow');
}
const adminOnly = (req: CmsRequest) => {
  if (!privileged(req)) throw new ForbiddenException('Administrator access required');
};
const recordInclude = {
  references: { select: { targetId: true } },
  _count: { select: { referencedBy: true } },
} as const;
const userSelect = {
  id: true,
  email: true,
  role: true,
  disabled: true,
  lastLoginAt: true,
  version: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
} as const;
async function transaction<T>(
  db: DatabaseService,
  work: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    return await db.$transaction(work, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error) {
      if (error.code === 'P2034')
        throw new ConflictException('Another update occurred. Reload and retry.');
      if (error.code === 'P2002') throw new ConflictException('This record already exists.');
    }
    throw error;
  }
}
@Controller('cms/admin')
@UseGuards(CmsGuard)
export class AdminController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  private async annotate<T extends { createdById?: string | null; updatedById?: string | null }>(
    items: T[],
  ) {
    const ids = [
      ...new Set(
        items.flatMap((r) => [r.createdById, r.updatedById]).filter((id): id is string => !!id),
      ),
    ];
    const users = await this.db.cmsUser.findMany({
      where: { id: { in: ids } },
      select: { id: true, email: true },
    });
    const names = new Map(users.map((u) => [u.id, u.email]));
    return items.map((r) => ({
      ...r,
      createdBy: r.createdById ? names.get(r.createdById) || r.createdById : null,
      updatedBy: r.updatedById ? names.get(r.updatedById) || r.updatedById : null,
    }));
  }
  @Get('dashboard')
  @Header('Cache-Control', 'no-store')
  async dashboard(@Req() req: CmsRequest) {
    const [
      newLeads,
      openLeads,
      messages,
      applications,
      subscribers,
      articles,
      projects,
      genericDrafts,
      blogDrafts,
      companyDrafts,
      servicesDrafts,
      solutionsDrafts,
      industriesDrafts,
      projectDrafts,
      pageDrafts,
    ] = await Promise.all([
      privileged(req)
        ? this.db.lead.count({ where: { deletedAt: null, status: 'NEW' } })
        : Promise.resolve(null),
      privileged(req)
        ? this.db.lead.count({
            where: {
              deletedAt: null,
              status: { in: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL'] },
            },
          })
        : Promise.resolve(null),
      privileged(req)
        ? this.db.lead.count({ where: { deletedAt: null, type: 'contact' } })
        : Promise.resolve(null),
      hasPermission(req.cmsUser.role, 'careers.applications.read')
        ? this.db.jobApplication.count()
        : Promise.resolve(null),
      hasPermission(req.cmsUser.role, 'newsletter.read')
        ? this.db.newsletterSubscriber.count({ where: { status: 'ACTIVE' } })
        : Promise.resolve(null),
      this.db.insightArticle.count({
        where: { status: { in: ['published', 'scheduled'] }, publicationDate: { lte: new Date() } },
      }),
      this.db.project.count({ where: { deletedAt: null } }),
      this.db.adminRecord.count({
        where: { deletedAt: null, status: 'draft', module: { notIn: privateModules } },
      }),
      this.db.insightArticle.count({ where: { status: 'draft' } }),
      this.db.companyPage.count({ where: { published: false } }),
      this.db.service.count({
        where: {
          deletedAt: null,
          OR: [{ active: false }, { translations: { none: { published: true } } }],
        },
      }),
      this.db.solution.count({ where: { deletedAt: null, status: 'DRAFT' } }),
      this.db.industry.count({ where: { deletedAt: null, status: 'DRAFT' } }),
      this.db.project.count({ where: { deletedAt: null, published: false } }),
      this.db.cmsPage.count({ where: { deletedAt: null, publishedAt: null } }),
    ]);
    return {
      cards: [
        { label: 'New leads', value: newLeads, href: '/admin/leads?status=NEW' },
        { label: 'Open leads', value: openLeads, href: '/admin/leads' },
        { label: 'Website messages', value: messages, href: '/admin/messages' },
        { label: 'Job applications', value: applications, href: '/admin/job-applications' },
        {
          label: 'Newsletter subscribers',
          value: subscribers,
          href: '/admin/newsletter',
        },
        { label: 'Published articles', value: articles, href: '/admin/insights' },
        { label: 'Projects', value: projects, href: '/admin/projects' },
        {
          label: 'Content drafts',
          value:
            genericDrafts +
            blogDrafts +
            companyDrafts +
            servicesDrafts +
            solutionsDrafts +
            industriesDrafts +
            projectDrafts +
            pageDrafts,
          href: '/admin/search?status=draft',
        },
      ],
    };
  }
  @Get('records/:module')
  async list(@Param('module') raw: string, @Query() query: unknown, @Req() req: CmsRequest) {
    const module = parse(adminModuleSchema, raw);
    authorizeModule(req, module);
    const q = parse(adminQuerySchema, query);
    const where: Prisma.AdminRecordWhereInput = {
      module,
      ...(q.trash === 'all' ? {} : { deletedAt: q.trash === 'deleted' ? { not: null } : null }),
      ...(q.status ? { status: q.status } : {}),
      ...(q.language ? { language: q.language } : {}),
      ...(q.q
        ? {
            OR: [
              { title: { contains: q.q, mode: 'insensitive' } },
              { searchText: { contains: q.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.adminRecord.findMany({
        where,
        include: recordInclude,
        orderBy: [{ [q.sort]: q.direction }, { id: 'asc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.db.adminRecord.count({ where }),
    ]);
    return {
      items: await this.annotate(
        items.map((r) => ({
          ...r,
          referenceIds: r.references.map((ref) => ref.targetId),
          referenceCount: r._count.referencedBy,
        })),
      ),
      total,
      page: q.page,
      limit: q.limit,
    };
  }
  @Get('references')
  async references(@Query() query: unknown, @Req() req: CmsRequest) {
    const q = parse(adminQuerySchema, query);
    const where = {
      deletedAt: null,
      module: {
        in: adminModules.filter((m) =>
          hasPermission(req.cmsUser.role, `${moduleResource(m)}.read`),
        ),
      },
      ...(q.q ? { title: { contains: q.q, mode: 'insensitive' as const } } : {}),
    };
    return {
      items: await this.db.adminRecord.findMany({
        where,
        select: { id: true, title: true, module: true },
        orderBy: { title: 'asc' },
        take: 100,
      }),
    };
  }
  @Post('records/:module')
  create(@Param('module') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    return this.save(parse(adminModuleSchema, raw), null, body, req);
  }
  @Put('records/:module/:id')
  update(
    @Param('module') raw: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: CmsRequest,
  ) {
    return this.save(parse(adminModuleSchema, raw), parse(idSchema, id), body, req);
  }
  private async save(module: AdminModule, id: string | null, body: unknown, req: CmsRequest) {
    authorizeModule(req, module, true);
    const { referenceIds, version, ...value } = parse(adminWriteSchema(module), body);
    requirePermission(req, `${moduleResource(module)}.${id ? 'update' : 'create'}`);
    if (value.status === 'published') requirePermission(req, `${moduleResource(module)}.publish`);
    if (!id && version !== 0) throw new BadRequestException('New records require version 0');
    if (id && referenceIds.includes(id))
      throw new BadRequestException('A record cannot reference itself');
    return transaction(this.db, async (tx) => {
      const references = await tx.adminRecord.findMany({
        where: { id: { in: referenceIds }, deletedAt: null },
        select: { id: true, module: true },
      });
      if (references.length !== referenceIds.length)
        throw new BadRequestException('One or more references are unavailable');
      for (const reference of references) authorizeModule(req, reference.module);
      const data = {
        ...value,
        searchText: Object.values(value.data).join(' '),
        updatedById: req.cmsUser.id,
      };
      let target = id;
      if (target) {
        const changed = await tx.adminRecord.updateMany({
          where: {
            id: target,
            module,
            version,
            deletedAt: null,
            ...(!hasPermission(req.cmsUser.role, `${moduleResource(module)}.publish`)
              ? { status: { not: 'published' } }
              : {}),
          },
          data: { ...data, version: { increment: 1 } },
        });
        if (!changed.count)
          throw new ConflictException('Record changed or archived. Reload before saving.');
        await tx.adminReference.deleteMany({ where: { sourceId: target } });
      } else
        target = (
          await tx.adminRecord.create({ data: { ...data, module, createdById: req.cmsUser.id } })
        ).id;
      if (referenceIds.length)
        await tx.adminReference.createMany({
          data: referenceIds.map((targetId) => ({ sourceId: target!, targetId })),
        });
      await tx.cmsAudit.create({
        data: {
          actorId: req.cmsUser.id,
          entityId: target,
          action: `${module}.${id ? 'update' : 'create'}`,
        },
      });
      return {
        ...(await tx.adminRecord.findUniqueOrThrow({
          where: { id: target },
          include: recordInclude,
        })),
        referenceIds,
      };
    });
  }
  @Post('records/:module/bulk')
  async bulk(@Param('module') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    const module = parse(adminModuleSchema, raw);
    authorizeModule(req, module, true);
    const value = parse(adminBulkSchema, body);
    requirePermission(
      req,
      `${moduleResource(module)}.${value.action === 'archive' ? 'delete' : 'update'}`,
    );
    if (value.status === 'published') requirePermission(req, `${moduleResource(module)}.publish`);
    if (
      value.action === 'status' &&
      !adminDefinitions[module].statuses.includes(value.status || '')
    )
      throw new BadRequestException('Invalid status');
    return transaction(this.db, async (tx) => {
      for (const selected of value.records) {
        const row = await tx.adminRecord.findFirst({ where: { ...selected, module } });
        if (!row) throw new ConflictException('Selection changed. Reload before continuing.');
        if (row.status === 'published') requirePermission(req, `${moduleResource(module)}.publish`);
        if (value.action === 'archive') {
          if (row.deletedAt) throw new ConflictException('Record is already archived');
          if (await tx.adminReference.count({ where: { targetId: row.id } }))
            throw new ConflictException(
              `“${row.title}” is referenced. Remove its references before archiving.`,
            );
          if (module === 'media') await this.checkMediaUsage(tx, row.data);
        } else if (value.action === 'restore') {
          if (!row.deletedAt) throw new ConflictException('Only archived records can be restored');
          const blocked = await tx.adminReference.count({
            where: { sourceId: row.id, target: { deletedAt: { not: null } } },
          });
          if (blocked) throw new ConflictException('Restore referenced records first');
        } else {
          if (row.deletedAt) throw new ConflictException('Restore before editing');
          parse(adminWriteSchema(module), {
            title: row.title,
            language: row.language,
            status: value.status,
            data: row.data,
            referenceIds: [],
            version: row.version,
          });
        }
        await tx.adminRecord.update({
          where: { id: row.id },
          data: {
            deletedAt: value.action === 'archive' ? new Date() : null,
            ...(value.action === 'status'
              ? { status: value.status! }
              : value.action === 'restore' && adminDefinitions[module].statuses.includes('draft')
                ? { status: 'draft' }
                : {}),
            updatedById: req.cmsUser.id,
            version: { increment: 1 },
          },
        });
        await tx.cmsAudit.create({
          data: { actorId: req.cmsUser.id, entityId: row.id, action: `${module}.${value.action}` },
        });
      }
      return { ok: true, count: value.records.length };
    });
  }
  private async checkMediaUsage(tx: Prisma.TransactionClient, data: Prisma.JsonValue) {
    const url = typeof data === 'object' && data && !Array.isArray(data) ? data.url : null;
    if (typeof url !== 'string' || !url) return;
    // Check legacy URL-based content as well as explicit reference records.
    const sources = await Promise.all([
      tx.insightArticle.findMany({ select: { content: true, coverImage: true, ogImage: true } }),
      tx.companyPage.findMany({ select: { content: true } }),
      tx.cmsPage.findMany({ select: { draft: true, published: true } }),
      tx.serviceTranslation.findMany({ select: { blocks: true } }),
      tx.solutionTranslation.findMany({ select: { blocks: true } }),
      tx.industryTranslation.findMany({ select: { blocks: true } }),
      tx.projectTranslation.findMany({ select: { heroImage: true, gallery: true } }),
      tx.adminRecord.findMany({ where: { module: { not: 'media' } }, select: { data: true } }),
    ]);
    if (sources.some((rows) => JSON.stringify(rows).includes(JSON.stringify(url).slice(1, -1))))
      throw new ConflictException(
        'This media URL is used by content. Remove its usages before archiving.',
      );
  }
  @Get('users')
  async users(@Query() query: unknown, @Req() req: CmsRequest) {
    adminOnly(req);
    const q = parse(adminQuerySchema, query);
    const where = {
      ...(q.q ? { email: { contains: q.q, mode: 'insensitive' as const } } : {}),
      ...(q.status === 'disabled'
        ? { disabled: true }
        : q.status === 'active'
          ? { disabled: false }
          : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.cmsUser.findMany({
        where,
        select: userSelect,
        orderBy: [
          { [q.sort === 'title' ? 'email' : q.sort === 'status' ? 'role' : q.sort]: q.direction },
          { id: 'asc' },
        ],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.db.cmsUser.count({ where }),
    ]);
    return { items: await this.annotate(items), total, page: q.page, limit: q.limit };
  }
  @Post('users')
  createUser(@Body() body: unknown, @Req() req: CmsRequest) {
    return this.saveUser(null, body, req);
  }
  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() body: unknown, @Req() req: CmsRequest) {
    return this.saveUser(parse(idSchema, id), body, req);
  }
  private async saveUser(id: string | null, body: unknown, req: CmsRequest) {
    if (req.cmsUser.role !== 'SUPER_ADMIN')
      throw new ForbiddenException('Only a super administrator can manage users');
    const { version, password, confirmation, ...data } = parse(adminUserWriteSchema, body);
    if (confirmation !== 'CONFIRM') throw new BadRequestException('Confirmation required');
    if (!id && (!password || version !== 0))
      throw new BadRequestException('New users require a password and version 0');
    if (id === req.cmsUser.id && (data.disabled || data.role !== 'SUPER_ADMIN'))
      throw new ConflictException('You cannot disable or demote your own account');
    const passwordHash = password ? await hashPassword(password) : undefined;
    return transaction(this.db, async (tx) => {
      if (id) {
        const before = await tx.cmsUser.findUnique({ where: { id } });
        if (!before || before.version !== version)
          throw new ConflictException('User changed. Reload first.');
        if (
          !before.disabled &&
          before.role === 'SUPER_ADMIN' &&
          (data.disabled || data.role !== 'SUPER_ADMIN') &&
          (await tx.cmsUser.count({ where: { role: 'SUPER_ADMIN', disabled: false } })) <= 1
        )
          throw new ConflictException('Keep at least one active super administrator');
        await tx.cmsUser.update({
          where: { id },
          data: {
            ...data,
            ...(passwordHash ? { passwordHash } : {}),
            authVersion: { increment: 1 },
            updatedById: req.cmsUser.id,
            version: { increment: 1 },
          },
        });
        await tx.cmsSession.deleteMany({ where: { userId: id } });
        await tx.cmsPasswordReset.deleteMany({ where: { userId: id } });
      } else
        id = (
          await tx.cmsUser.create({
            data: {
              ...data,
              passwordHash: passwordHash!,
              createdById: req.cmsUser.id,
              updatedById: req.cmsUser.id,
            },
          })
        ).id;
      await tx.cmsAudit.create({
        data: {
          actorId: req.cmsUser.id,
          entityId: id,
          action: `user.${data.disabled ? 'disable' : 'save'}`,
        },
      });
      return tx.cmsUser.findUniqueOrThrow({ where: { id }, select: userSelect });
    });
  }
  @Get('roles')
  roles() {
    return {
      items: cmsRoles.map((role) => ({
        role,
        permissions: permissionsForRole(role),
        content: hasPermission(role, 'pages.publish')
          ? 'Manage / publish'
          : hasPermission(role, 'pages.update')
            ? 'Edit drafts'
            : 'Read / preview',
        business: hasPermission(role, 'leads.update')
          ? 'Leads'
          : hasPermission(role, 'careers.applications.read')
            ? 'Hiring'
            : hasPermission(role, 'newsletter.update')
              ? 'Newsletter'
              : 'No access',
        users: hasPermission(role, 'users.update')
          ? 'Manage'
          : hasPermission(role, 'users.read')
            ? 'Read'
            : 'No access',
        audit: hasPermission(role, 'audit.read') ? 'Read' : 'No access',
      })),
    };
  }
  @Get('audit')
  async audit(@Query() query: unknown, @Req() req: CmsRequest) {
    adminOnly(req);
    const q = parse(adminQuerySchema, query);
    const where = q.q
      ? {
          OR: [
            { action: { contains: q.q, mode: 'insensitive' as const } },
            { entityId: { contains: q.q, mode: 'insensitive' as const } },
            { actorId: { contains: q.q, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [items, total] = await this.db.$transaction([
      this.db.cmsAudit.findMany({
        where,
        orderBy: [{ createdAt: q.direction }, { id: 'asc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.db.cmsAudit.count({ where }),
    ]);
    return {
      items: await this.annotate(items.map((r) => ({ ...r, createdById: r.actorId }))),
      total,
      page: q.page,
      limit: q.limit,
    };
  }
  @Get('search')
  async search(@Query() query: unknown, @Req() req: CmsRequest) {
    const q = parse(adminQuerySchema, query);
    const match = (text: string) => text.toLowerCase().includes(q.q.toLowerCase());
    const [records, articles, services, solutions, industries, projects, pages, leads, builtPages] =
      await Promise.all([
        this.db.adminRecord.findMany({
          where: {
            deletedAt: null,
            module: {
              in: adminModules.filter(
                (m) =>
                  !['leads', 'messages', 'site-settings'].includes(m) &&
                  hasPermission(req.cmsUser.role, `${moduleResource(m)}.read`),
              ),
            },
          },
        }),
        this.db.insightArticle.findMany(),
        this.db.service.findMany({ where: { deletedAt: null }, include: { translations: true } }),
        this.db.solution.findMany({ where: { deletedAt: null }, include: { translations: true } }),
        this.db.industry.findMany({ where: { deletedAt: null }, include: { translations: true } }),
        this.db.project.findMany({ where: { deletedAt: null }, include: { translations: true } }),
        this.db.companyPage.findMany(),
        privileged(req)
          ? this.db.lead.findMany({
              where: {
                deletedAt: null,
                ...(q.q
                  ? {
                      OR: [
                        { name: { contains: q.q, mode: 'insensitive' } },
                        { email: { contains: q.q, mode: 'insensitive' } },
                        { company: { contains: q.q, mode: 'insensitive' } },
                      ],
                    }
                  : {}),
              },
              select: {
                id: true,
                name: true,
                company: true,
                email: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                updatedById: true,
              },
            })
          : Promise.resolve([]),
        this.db.cmsPage.findMany({ where: { deletedAt: null } }),
      ]);
    const items = [
      ...builtPages.map((r) => ({
        ...pageSummary(r),
        module: 'pages',
        href: `/admin/pages?id=${r.id}`,
      })),
      ...leads.map((r) => ({
        ...r,
        title: `${r.name} ${r.company} ${r.email}`,
        module: 'leads',
        createdById: null,
        href: `/admin/leads?lead=${r.id}`,
      })),
      ...records.map((r) => ({
        ...r,
        href: `/admin/${r.module === 'pages' ? 'page-records' : r.module}`,
      })),
      ...articles.map((r) => ({
        ...r,
        module: r.kind === 'resource' ? 'resources' : 'blog',
        href: '/admin/insights',
      })),
      ...services.map((r) => ({
        ...r,
        title: r.translations[0]?.title || r.slug,
        status: r.active && r.translations.some((t) => t.published) ? 'published' : 'draft',
        module: 'services',
        href: '/admin/services',
      })),
      ...solutions.map((r) => ({
        ...r,
        title: r.translations[0]?.name || r.slug,
        status: r.status.toLowerCase(),
        module: 'solutions',
        href: '/admin/solutions',
      })),
      ...industries.map((r) => ({
        ...r,
        title: r.translations[0]?.name || r.slug,
        status: r.status.toLowerCase(),
        module: 'industries',
        href: '/admin/industries',
      })),
      ...projects.map((r) => ({
        ...r,
        title: r.translations[0]?.title || r.slug,
        status: r.published ? 'published' : 'draft',
        module: 'projects',
        href: '/admin/projects',
      })),
      ...pages.map((r) => ({
        ...r,
        id: `${r.slug}/${r.locale}`,
        title: `Company / ${r.slug} (${r.locale})`,
        status: r.published ? 'published' : 'draft',
        module: 'company',
        href: '/admin/company',
      })),
    ]
      .filter(
        (r) =>
          (match(r.title) || ('path' in r && typeof r.path === 'string' && match(r.path))) &&
          (!q.status || r.status === q.status),
      )
      .map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        module: r.module,
        href: r.href,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        createdById: r.createdById,
        updatedById: r.updatedById,
      }));
    items.sort(
      (a, b) =>
        (q.sort === 'createdAt' || q.sort === 'updatedAt'
          ? a[q.sort].getTime() - b[q.sort].getTime()
          : String(a[q.sort]).localeCompare(String(b[q.sort]))) *
          (q.direction === 'asc' ? 1 : -1) || a.id.localeCompare(b.id),
    );
    return {
      items: await this.annotate(items.slice((q.page - 1) * q.limit, q.page * q.limit)),
      total: items.length,
      page: q.page,
      limit: q.limit,
    };
  }
  @Get('trash')
  async trash(@Query() query: unknown) {
    const q = parse(adminQuerySchema, query);
    const where = {
      deletedAt: { not: null },
      ...(q.q ? { slug: { contains: q.q, mode: 'insensitive' as const } } : {}),
    };
    const [services, solutions, industries, projects] = await Promise.all([
      this.db.service.findMany({ where }),
      this.db.solution.findMany({ where }),
      this.db.industry.findMany({ where }),
      this.db.project.findMany({ where }),
    ]);
    const items = [
      ...services.map((r) => ({ ...r, module: 'service' })),
      ...solutions.map((r) => ({ ...r, module: 'solution' })),
      ...industries.map((r) => ({ ...r, module: 'industry' })),
      ...projects.map((r) => ({ ...r, module: 'project' })),
    ].map((r) => ({ ...r, title: r.slug, status: 'archived' }));
    items.sort(
      (a, b) =>
        (q.sort === 'createdAt' || q.sort === 'updatedAt'
          ? a[q.sort].getTime() - b[q.sort].getTime()
          : String(a[q.sort]).localeCompare(String(b[q.sort]))) *
          (q.direction === 'asc' ? 1 : -1) || a.id.localeCompare(b.id),
    );
    return {
      items: await this.annotate(items.slice((q.page - 1) * q.limit, q.page * q.limit)),
      total: items.length,
      page: q.page,
      limit: q.limit,
    };
  }
  @Post('restore/:kind/:id')
  async restore(
    @Param('kind') raw: string,
    @Param('id') rawId: string,
    @Body() body: unknown,
    @Req() req: CmsRequest,
  ) {
    authorizeModule(req, 'pages', true);
    const kind = parse(z.enum(['service', 'solution', 'industry', 'project']), raw),
      id = parse(idSchema, rawId);
    const { version } = parse(
      z.object({ version: z.number().int().min(0), confirmation: z.literal('CONFIRM') }).strict(),
      body,
    );
    return transaction(this.db, async (tx) => {
      const where = { id, version, deletedAt: { not: null } },
        data = { deletedAt: null, updatedById: req.cmsUser.id, version: { increment: 1 } };
      const result =
        kind === 'service'
          ? await tx.service.updateMany({ where, data })
          : kind === 'solution'
            ? await tx.solution.updateMany({ where, data })
            : kind === 'industry'
              ? await tx.industry.updateMany({ where, data })
              : await tx.project.updateMany({ where, data });
      if (!result.count) throw new ConflictException('Record changed. Reload before restoring.');
      await tx.cmsAudit.create({
        data: { actorId: req.cmsUser.id, entityId: id, action: `${kind}.restore` },
      });
      return { ok: true };
    });
  }
}
