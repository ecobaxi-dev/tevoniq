import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Req,
  Res,
  Query,
  Param,
  Inject,
  Header,
  HttpCode,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
  newsletterSubscribeSchema,
  newsletterTokenSchema,
  newsletterQuerySchema,
  newsletterUpdateSchema,
} from '@tevoniq/validation';
import type { Prisma } from '../generated/prisma/client.js';
import { DatabaseService } from '../database/database.service.js';
import { NewsletterService, subscriberSelect } from './newsletter.service.js';
import { parse, idSchema } from '../cms/content-policy.js';
import type { CmsRequest } from '../cms/cms.guard.js';
import { LeadSubmissionGuard, LeadBotProtection, submissionIp } from '../leads/bot-protection.js';
const filters = (
  q: ReturnType<typeof newsletterQuerySchema.parse>,
): Prisma.NewsletterSubscriberWhereInput => ({
  ...(q.status ? { status: q.status } : {}),
  ...(q.language ? { language: q.language } : {}),
  ...(q.q
    ? {
        OR: [
          { email: { contains: q.q, mode: 'insensitive' } },
          { name: { contains: q.q, mode: 'insensitive' } },
        ],
      }
    : {}),
});
export function subscriberCsv(rows: Array<Record<string, unknown>>) {
  const columns = [
    'email',
    'name',
    'language',
    'source',
    'status',
    'subscribedAt',
    'unsubscribedAt',
  ];
  const cell = (raw: unknown) => {
    let value = raw instanceof Date ? raw.toISOString() : raw == null ? '' : String(raw);
    if (/^[\s]*[=+@-]/.test(value) || /^[\t\r\n]/.test(value)) value = `'${value}`;
    return `"${value.replaceAll('"', '""')}"`;
  };
  return (
    '\uFEFF' +
    [
      columns.map(cell).join(','),
      ...rows.map((row) => columns.map((key) => cell(row[key])).join(',')),
    ].join('\r\n') +
    '\r\n'
  );
}
@Controller('newsletter')
export class NewsletterController {
  constructor(
    @Inject(NewsletterService) private readonly service: NewsletterService,
    @Inject(LeadBotProtection) private readonly bot: LeadBotProtection,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}
  @Get('config')
  @Header('Cache-Control', 'no-store')
  publicConfig() {
    return {
      turnstileSiteKey:
        this.config.get('TURNSTILE_MODE') === 'turnstile'
          ? this.config.get<string>('TURNSTILE_SITE_KEY') || null
          : null,
    };
  }
  @Post('subscribe')
  @UseGuards(LeadSubmissionGuard)
  @HttpCode(202)
  @Header('Cache-Control', 'no-store')
  async subscribe(@Body() body: unknown, @Req() req: Request) {
    const { email, name, language, source, turnstileToken } = parse(
      newsletterSubscribeSchema,
      body,
    );
    await this.bot.rateLimit(`newsletter:${email}`, 3, 3600000);
    await this.bot.verify(
      turnstileToken,
      'newsletter',
      submissionIp(req, this.config.get<string>('LEAD_PROXY_SECRET')),
    );
    return this.service.subscribe(
      { email, name, language, source },
      'I agree to receive TEVONIQ newsletter emails and may unsubscribe at any time.',
    );
  }
  @Post('confirm')
  @UseGuards(LeadSubmissionGuard)
  @Header('Cache-Control', 'no-store')
  confirm(@Body() body: unknown) {
    return this.service.confirm(parse(newsletterTokenSchema, body).token);
  }
  @Post('unsubscribe')
  @UseGuards(LeadSubmissionGuard)
  @Header('Cache-Control', 'no-store')
  unsubscribe(@Body() body: unknown) {
    return this.service.unsubscribe(parse(newsletterTokenSchema, body).token);
  }
}
@Controller('cms/newsletter')
export class CmsNewsletterController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(NewsletterService) private readonly service: NewsletterService,
  ) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  async list(@Query() query: unknown) {
    const q = parse(newsletterQuerySchema, query),
      where = filters(q);
    const [items, total] = await this.db.$transaction([
      this.db.newsletterSubscriber.findMany({
        where,
        select: subscriberSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        take: q.limit,
        skip: (q.page - 1) * q.limit,
      }),
      this.db.newsletterSubscriber.count({ where }),
    ]);
    return { items, total, page: q.page, limit: q.limit };
  }
  @Put(':id')
  update(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    const input = parse(newsletterUpdateSchema, body);
    return this.service.suppress(parse(idSchema, raw), input.status, input.version, req.cmsUser.id);
  }
  @Get('export')
  async export(@Query() query: unknown, @Req() req: CmsRequest, @Res() res: Response) {
    const q = parse(newsletterQuerySchema, query),
      where = filters(q);
    const rows = await this.db.newsletterSubscriber.findMany({
      where,
      select: subscriberSelect,
      take: 10001,
      orderBy: { id: 'asc' },
    });
    if (rows.length > 10000)
      throw new BadRequestException(
        'Export supports up to 10,000 subscribers. Narrow your filters.',
      );
    await this.db.cmsAudit.create({
      data: { actorId: req.cmsUser.id, entityId: 'newsletter', action: 'newsletter.export' },
    });
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(subscriberCsv(rows));
  }
}
