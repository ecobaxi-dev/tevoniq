import {
  Injectable,
  Inject,
  BadRequestException,
  ServiceUnavailableException,
  HttpException,
  ForbiddenException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service.js';
import { digest } from '../cms/password.js';
export function submissionIp(req: Request, secret?: string) {
  const ip = req.header?.('x-lead-client-ip') ?? req.headers?.['x-lead-client-ip'],
    signature = req.header?.('x-lead-ip-signature') ?? req.headers?.['x-lead-ip-signature'];
  if (
    secret &&
    typeof ip === 'string' &&
    isIP(ip) &&
    typeof signature === 'string' &&
    /^[a-f0-9]{64}$/.test(signature)
  ) {
    const expected = createHmac('sha256', secret).update(ip).digest();
    if (timingSafeEqual(expected, Buffer.from(signature, 'hex'))) return ip;
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}
@Injectable()
export class LeadBotProtection {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}
  async rateLimit(key: string, maximum: number, windowMs: number) {
    const now = Date.now(),
      bucket = Math.floor(now / windowMs);
    const counter = await this.db.leadThrottle.upsert({
      where: { key: digest(`${key}:${bucket}`) },
      create: {
        key: digest(`${key}:${bucket}`),
        attempts: 1,
        expiresAt: new Date((bucket + 1) * windowMs),
      },
      update: { attempts: { increment: 1 } },
    });
    if (counter.attempts > maximum)
      throw new HttpException('Too many submissions. Please try again later.', 429);
  }
  async verify(token: string, action: string, ip: string) {
    if (this.config.get<string>('TURNSTILE_MODE') !== 'turnstile') return;
    if (!token) throw new BadRequestException('Complete the verification challenge');
    let result: { success?: boolean; hostname?: string; action?: string };
    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({
          secret: this.config.getOrThrow<string>('TURNSTILE_SECRET_KEY'),
          response: token,
          ...(isIP(ip) ? { remoteip: ip } : {}),
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('Verification unavailable');
      result = (await response.json()) as typeof result;
    } catch {
      throw new ServiceUnavailableException(
        'Verification is temporarily unavailable. Please try again.',
      );
    }
    const hostnames = this.config
      .getOrThrow<string>('TURNSTILE_HOSTNAMES')
      .split(',')
      .map((h) => h.trim().toLowerCase());
    if (
      !result.success ||
      result.action !== action ||
      !result.hostname ||
      !hostnames.includes(result.hostname.toLowerCase())
    )
      throw new BadRequestException('Verification expired or failed. Please try again.');
  }
}

@Injectable()
export class LeadSubmissionGuard implements CanActivate {
  constructor(
    @Inject(LeadBotProtection) private readonly bot: LeadBotProtection,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    if (
      req.header('origin') &&
      req.header('origin') !== this.config.getOrThrow<string>('CORS_ORIGIN')
    )
      throw new ForbiddenException('Invalid submission origin');
    await this.bot.rateLimit(
      `ip:${submissionIp(req, this.config.get<string>('LEAD_PROXY_SECRET'))}`,
      10,
      15 * 60000,
    );
    return true;
  }
}
