import {
  Body,
  Controller,
  ForbiddenException,
  Header,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { CmsRequest } from '../cms/cms.guard.js';
import { PestoPurchaseService } from './purchase.service.js';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { LeadBotProtection, submissionIp } from '../leads/bot-protection.js';

@Controller('pesto/registrations')
export class PublicPestoPurchaseController {
  constructor(
    @Inject(PestoPurchaseService) private readonly service: PestoPurchaseService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LeadBotProtection) private readonly bot: LeadBotProtection,
  ) {}
  @Post('activate')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async activate(@Body() body: unknown, @Req() req: Request) {
    this.service.ensureEnabled();
    if (req.headers.origin && req.headers.origin !== this.config.getOrThrow('CORS_ORIGIN'))
      throw new ForbiddenException('Invalid activation origin.');
    const ip = submissionIp(req, this.config.get<string>('LEAD_PROXY_SECRET'));
    await this.bot.rateLimit(`pesto:activate:ip:${ip}`, 10, 15 * 60000);
    return this.service.activate(body);
  }
}

@Controller('cms/pesto/purchases')
export class CmsPestoPurchaseController {
  constructor(@Inject(PestoPurchaseService) private readonly service: PestoPurchaseService) {}
  private companyAdmin(req: CmsRequest) {
    if (!['SUPER_ADMIN', 'ADMIN'].includes(req.cmsUser?.role))
      throw new ForbiddenException('Company administrator required.');
    return req.cmsUser.id;
  }
  @Post()
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  issue(@Body() body: unknown, @Req() req: CmsRequest) {
    return this.service.issue(body, this.companyAdmin(req));
  }
  @Post(':id/revoke')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  revoke(@Param('id') id: string, @Req() req: CmsRequest) {
    return this.service.revoke(id, this.companyAdmin(req));
  }
}
