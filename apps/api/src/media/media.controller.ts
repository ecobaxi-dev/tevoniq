import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Req,
  Res,
  Body,
  UseGuards,
  Inject,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import multer from 'multer';
import { randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';
import { DatabaseService } from '../database/database.service.js';
import { CmsGuard, CmsAdminGuard, type CmsRequest } from '../cms/cms.guard.js';
import { StorageProvider } from './storage.js';
import { prepareImage } from './image-processing.js';
import { mediaUsage } from './usage.js';
import type { MediaAsset } from '../generated/prisma/client.js';
const plain = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (v) => ![...v].some((char) => char.charCodeAt(0) < 32 && !'\t\n\r'.includes(char)),
      'Control characters are not allowed',
    );
const meta = z
  .object({
    title: plain(180).min(1),
    alt: plain(500),
    caption: plain(2000),
    collection: plain(80),
    version: z.number().int().positive(),
  })
  .strict();
const querySchema = z.object({
  q: plain(160).default(''),
  collection: plain(80).optional(),
  mime: z
    .enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', ''])
    .default(''),
  archived: z.enum(['true', 'false']).default('false'),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
  sort: z.enum(['createdAt', 'title', 'size']).default('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc'),
});
type StoredFile = { name: string; mime: string; width: number; height: number; size: number };
function files(row: MediaAsset) {
  return row.files as unknown as StoredFile[];
}
function present(row: MediaAsset) {
  const { storage: _storage, sha256: _sha256, ...rest } = row;
  void _storage;
  void _sha256;
  return { ...rest, files: files(row).map((f) => ({ ...f, url: `/media/${row.id}/${f.name}` })) };
}
function parse<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new BadRequestException(
      result.error.issues.map((i) => i.path.join('.') + ': ' + i.message).join('; '),
    );
  return result.data;
}
@Controller('cms/media-library')
@UseGuards(CmsGuard)
export class MediaController {
  private activeUploads = 0;
  constructor(
    @Inject(DatabaseService) private db: DatabaseService,
    @Inject(ConfigService) private config: ConfigService,
    @Inject(StorageProvider) private storage: StorageProvider,
    @Inject(SiteSettingsService) private settings: SiteSettingsService,
  ) {}
  @Get()
  async list(@Query() query: unknown) {
    const q = parse(querySchema, query);
    const where = {
      deletedAt: q.archived === 'true' ? { not: null } : null,
      ...(q.mime ? { mimeType: q.mime } : {}),
      ...(q.collection !== undefined ? { collection: q.collection } : {}),
      ...(q.q
        ? {
            OR: ['title', 'alt', 'caption', 'originalName'].map((field) => ({
              [field]: { contains: q.q, mode: 'insensitive' as const },
            })),
          }
        : {}),
    };
    const [items, total, collections] = await Promise.all([
      this.db.mediaAsset.findMany({
        where,
        orderBy: [{ [q.sort]: q.direction }, { id: 'asc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.db.mediaAsset.count({ where }),
      this.db.mediaAsset.findMany({
        distinct: ['collection'],
        select: { collection: true },
        orderBy: { collection: 'asc' },
      }),
    ]);
    return {
      items: items.map(present),
      total,
      page: q.page,
      limit: q.limit,
      collections: collections.map((c) => c.collection).filter(Boolean),
      maxFileBytes: this.config.get<number>('MEDIA_MAX_FILE_BYTES'),
    };
  }
  @Get(':id')
  async detail(@Param('id') raw: string, @Req() req: CmsRequest) {
    const id = parse(z.uuid(), raw),
      row = await this.db.mediaAsset.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    const [usage, creators] = await Promise.all([
      mediaUsage(this.db, id, req.cmsUser.role),
      this.db.cmsUser.findMany({
        where: { id: { in: [row.createdById, row.updatedById] } },
        select: { id: true, email: true },
      }),
    ]);
    return {
      ...present(row),
      usage,
      createdBy: creators.find((u) => u.id === row.createdById)?.email || row.createdById,
      updatedBy: creators.find((u) => u.id === row.updatedById)?.email || row.updatedById,
    };
  }
  @Post('upload')
  @UseGuards(CmsAdminGuard)
  async upload(@Req() req: CmsRequest, @Res({ passthrough: true }) res: Response) {
    if (this.storage.name === 'disabled')
      throw new HttpException('File uploads are currently unavailable', 503);
    if (this.activeUploads >= 2)
      throw new HttpException('Uploads are busy. Please retry shortly.', 429);
    this.activeUploads++;
    const written: string[] = [];
    try {
      const { settings } = await this.settings.read();
      await new Promise<void>((resolve, reject) =>
        multer({
          storage: multer.memoryStorage(),
          limits: {
            fileSize: Math.min(
              this.config.getOrThrow<number>('MEDIA_MAX_FILE_BYTES'),
              settings.media.maxUploadMB * 1048576,
            ),
            files: 1,
            fields: 2,
            fieldSize: 200,
            parts: 4,
          },
          fileFilter: (_req, file, cb) =>
            cb(
              null,
              ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'].includes(
                file.mimetype,
              ) &&
                (settings.media.allowSvg || file.mimetype !== 'image/svg+xml'),
            ),
        }).single('file')(req, res, (e) =>
          e
            ? reject(
                new BadRequestException(
                  e instanceof multer.MulterError && e.code === 'LIMIT_FILE_SIZE'
                    ? 'File exceeds the configured upload limit'
                    : 'Invalid multipart upload',
                ),
              )
            : resolve(),
        ),
      );
      const fields = parse(
        z
          .object({
            collection: plain(80).default(''),
            protected: z.enum(['true', 'false']).default('false'),
          })
          .strict(),
        req.body,
      );
      if (!req.file?.buffer.length)
        throw new BadRequestException('Choose a JPEG, PNG, WebP, AVIF or static SVG file');
      const id = randomUUID(),
        originalName =
          [...req.file.originalname]
            .map((char) => (char === '/' || char === '\\' || char.charCodeAt(0) < 32 ? '_' : char))
            .join('')
            .slice(0, 180) || 'Untitled image';
      const prepared = await prepareImage(
        req.file.buffer,
        req.file.mimetype,
        this.config.getOrThrow<number>('MEDIA_MAX_PIXELS'),
        fields.protected === 'true',
      );
      for (const f of prepared) {
        const key = `${id}/${f.name}`;
        await this.storage.put(key, f.bytes, f.mime);
        written.push(key);
      }
      const original = prepared[0]!;
      const row = await this.db.$transaction(async (tx) => {
        const row = await tx.mediaAsset.create({
          data: {
            id,
            title: originalName,
            originalName,
            collection: fields.collection,
            protected: fields.protected === 'true',
            mimeType: original.mime,
            width: original.width,
            height: original.height,
            size: original.bytes.length,
            sha256: createHash('sha256').update(original.bytes).digest('hex'),
            storage: this.storage.name,
            files: prepared.map((f) => ({
              name: f.name,
              mime: f.mime,
              width: f.width,
              height: f.height,
              size: f.bytes.length,
            })),
            createdById: req.cmsUser.id,
            updatedById: req.cmsUser.id,
          },
        });
        await tx.cmsAudit.create({
          data: { actorId: req.cmsUser.id, entityId: id, action: 'media.upload' },
        });
        return row;
      });
      return present(row);
    } catch (e) {
      await Promise.allSettled(written.map((key) => this.storage.remove(key)));
      throw e;
    } finally {
      this.activeUploads--;
    }
  }
  @Put(':id')
  @UseGuards(CmsAdminGuard)
  async update(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    const id = parse(z.uuid(), raw),
      { version, ...value } = parse(meta, body);
    await this.db.$transaction(async (tx) => {
      const changed = await tx.mediaAsset.updateMany({
        where: { id, version, deletedAt: null },
        data: { ...value, version: { increment: 1 }, updatedById: req.cmsUser.id },
      });
      if (!changed.count)
        throw new ConflictException('This asset changed or was archived. Reload before saving.');
      await tx.cmsAudit.create({
        data: { actorId: req.cmsUser.id, entityId: id, action: 'media.metadata' },
      });
    });
    return this.detail(id, req);
  }
  @Post(':id/state')
  @UseGuards(CmsAdminGuard)
  async state(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    const id = parse(z.uuid(), raw),
      value = parse(
        z
          .object({
            action: z.enum(['archive', 'restore']),
            version: z.number().int().positive(),
            confirmation: z.literal('CONFIRM'),
          })
          .strict(),
        body,
      );
    await this.db.$transaction(async (tx) => {
      const row = await tx.mediaAsset.findUnique({ where: { id } });
      if (!row) throw new NotFoundException();
      if (row.version !== value.version)
        throw new ConflictException('This asset changed. Reload before continuing.');
      if (value.action === 'archive') {
        if (row.protected) throw new ConflictException('Protected originals cannot be archived.');
        if ((await mediaUsage(tx, id)).length)
          throw new ConflictException(
            'This asset is referenced by content. Remove its usages first.',
          );
      }
      const changed = await tx.mediaAsset.updateMany({
        where: { id, version: value.version },
        data: {
          deletedAt: value.action === 'archive' ? new Date() : null,
          version: { increment: 1 },
          updatedById: req.cmsUser.id,
        },
      });
      if (!changed.count)
        throw new ConflictException('This asset changed. Reload before continuing.');
      await tx.cmsAudit.create({
        data: { actorId: req.cmsUser.id, entityId: id, action: 'media.' + value.action },
      });
    });
    return this.detail(id, req);
  }
}
@Controller('media')
export class PublicMediaController {
  constructor(
    @Inject(DatabaseService) private db: DatabaseService,
    @Inject(StorageProvider) private storage: StorageProvider,
  ) {}
  @Get(':id/:file')
  async file(@Param('id') id: string, @Param('file') name: string, @Res() res: Response) {
    if (!z.uuid().safeParse(id).success) throw new NotFoundException();
    const row = await this.db.mediaAsset.findUnique({ where: { id } });
    const file = row && files(row).find((f) => f.name === name);
    if (!row || !file || row.storage !== this.storage.name) throw new NotFoundException();
    const bytes = await this.storage.get(`${id}/${name}`);
    res.set({
      'Content-Type': file.mime,
      'Content-Length': String(bytes.length),
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; style-src 'none'; sandbox",
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.send(bytes);
  }
}
