import {
  Body,
  Controller,
  ForbiddenException,
  Header,
  HttpCode,
  Inject,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { LeadBotProtection, submissionIp } from '../leads/bot-protection.js';
import { PestoRegistrationService } from './registration.service.js';
import { registrationInputSchema } from './registration-protocol.js';

@Controller('pesto/registrations')
export class PestoRegistrationController {
  constructor(
    @Inject(PestoRegistrationService) private readonly service: PestoRegistrationService,
    @Inject(LeadBotProtection) private readonly bot: LeadBotProtection,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}
  private origin(req: Request) {
    const origin = req.headers.origin;
    if (origin && origin !== this.config.getOrThrow<string>('CORS_ORIGIN'))
      throw new ForbiddenException('Invalid registration origin.');
    return submissionIp(req, this.config.get<string>('LEAD_PROXY_SECRET'));
  }
  @Post()
  @HttpCode(202)
  @Header('Cache-Control', 'no-store')
  async register(@Body() body: unknown, @Req() req: Request) {
    this.service.ensureEnabled();
    const ip = this.origin(req);
    const parsed = registrationInputSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('Invalid Pesto registration details.');
    await this.bot.rateLimit(`pesto:register:ip:${ip}`, 10, 15 * 60000);
    await this.bot.rateLimit(`pesto:register:email:${parsed.data.email}`, 3, 60 * 60000);
    await this.bot.rateLimit(`pesto:register:email-day:${parsed.data.email}`, 6, 24 * 60 * 60000);
    await this.bot.verify(parsed.data.botToken, 'pesto_registration', ip);
    return this.service.register(parsed.data);
  }
  @Post('verify')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async verify(@Body() body: unknown, @Req() req: Request) {
    this.service.ensureEnabled();
    const ip = this.origin(req);
    await this.bot.rateLimit(`pesto:verify:ip:${ip}`, 30, 15 * 60000);
    return this.service.verify(body);
  }
}
