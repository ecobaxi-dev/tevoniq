import { ConfigService } from '@nestjs/config';
import { submissionIp } from '../leads/bot-protection.js';
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Inject,
  UnauthorizedException,
  Header,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { loginSchema, accountEmailSchema, passwordSchema } from '@tevoniq/validation';
import { z } from 'zod';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service.js';
import { digest, verifyPassword, hashPassword } from './password.js';
import type { CmsRequest } from './cms.guard.js';
import { parse, idSchema } from './content-policy.js';
import { throttleAuth } from './auth-throttle.js';
const dummy = '00000000000000000000000000000000:' + '0'.repeat(128);
const resetSchema = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    password: passwordSchema,
    confirmation: z.string(),
  })
  .strict()
  .refine((v) => v.password === v.confirmation, 'Passwords must match');
@Controller('cms/auth')
export class CmsAuthController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(ConfigService) private readonly config?: ConfigService,
  ) {}
  @Post('login')
  @Header('Cache-Control', 'no-store')
  async login(@Body() body: unknown, @Req() req: Request) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      await throttleAuth(
        this.db,
        'login',
        submissionIp(req, this.config?.get<string>('LEAD_PROXY_SECRET')),
      );
      throw new UnauthorizedException('Invalid credentials');
    }
    const { email, password } = parsed.data;
    await throttleAuth(
      this.db,
      'login',
      submissionIp(req, this.config?.get<string>('LEAD_PROXY_SECRET')),
      email,
    );
    const user = await this.db.cmsUser.findUnique({ where: { email } });
    const valid = await verifyPassword(password, user?.passwordHash ?? dummy);
    if (!user || !valid || user.disabled) throw new UnauthorizedException('Invalid credentials');
    const token = randomBytes(32).toString('hex');
    await this.db.$transaction(async (tx) => {
      // Serialize against reset, role changes and disabling before minting a session.
      const updated = await tx.cmsUser.updateMany({
        where: {
          id: user.id,
          disabled: false,
          passwordHash: user.passwordHash,
          authVersion: user.authVersion,
        },
        data: { lastLoginAt: new Date() },
      });
      if (!updated.count) throw new UnauthorizedException('Invalid credentials');
      await tx.cmsSession.deleteMany({ where: { expiresAt: { lte: new Date() } } });
      await tx.cmsSession.create({
        data: {
          tokenHash: digest(token),
          userId: user.id,
          authVersion: user.authVersion,
          userAgent: (req.headers['user-agent'] ?? '').slice(0, 300),
          expiresAt: new Date(Date.now() + 8 * 3600000),
        },
      });
      await tx.cmsAudit.create({
        data: { actorId: user.id, action: 'auth.login', entityId: user.id },
      });
    });
    return { token };
  }
  @Get('me')
  @Header('Cache-Control', 'no-store')
  me(@Req() req: CmsRequest) {
    return req.cmsUser;
  }
  @Post('logout')
  async logout(@Req() req: CmsRequest) {
    const sessionId = req.cmsSessionId;
    if (!sessionId) throw new UnauthorizedException('Session required');
    await this.db.$transaction(async (tx) => {
      await tx.cmsSession.deleteMany({ where: { id: sessionId, userId: req.cmsUser.id } });
      await tx.cmsAudit.create({
        data: { actorId: req.cmsUser.id, action: 'auth.logout', entityId: req.cmsUser.id },
      });
    });
    return { ok: true };
  }
  @Get('sessions')
  @Header('Cache-Control', 'no-store')
  async sessions(@Req() req: CmsRequest) {
    const items = await this.db.cmsSession.findMany({
      where: {
        userId: req.cmsUser.id,
        expiresAt: { gt: new Date() },
        lastSeenAt: { gt: new Date(Date.now() - 30 * 60000) },
      },
      select: { id: true, createdAt: true, lastSeenAt: true, expiresAt: true, userAgent: true },
      orderBy: { createdAt: 'desc' },
    });
    return { items: items.map((s) => ({ ...s, current: s.id === req.cmsSessionId })) };
  }
  @Post('sessions/:id/revoke')
  async revokeSession(@Param('id') id: string, @Req() req: CmsRequest) {
    const sessionId = parse(idSchema, id);
    await this.db.$transaction(async (tx) => {
      await tx.cmsSession.deleteMany({ where: { id: sessionId, userId: req.cmsUser.id } });
      await tx.cmsAudit.create({
        data: { actorId: req.cmsUser.id, action: 'auth.session.revoke', entityId: sessionId },
      });
    });
    return { ok: true };
  }
  @Post('logout-all')
  logoutAll(@Req() req: CmsRequest) {
    return this.revokeAll(req.cmsUser.id, req.cmsUser.id);
  }
  @Post('users/:id/revoke')
  revokeUserSessions(@Param('id') id: string, @Req() req: CmsRequest) {
    return this.revokeAll(parse(idSchema, id), req.cmsUser.id);
  }
  private async revokeAll(userId: string, actorId: string) {
    await this.db.$transaction(async (tx) => {
      await tx.cmsUser.updateMany({
        where: { id: userId },
        data: { authVersion: { increment: 1 } },
      });
      await tx.cmsSession.deleteMany({ where: { userId } });
      await tx.cmsPasswordReset.deleteMany({ where: { userId } });
      await tx.cmsAudit.create({
        data: { actorId, action: 'auth.sessions.revoke', entityId: userId },
      });
    });
    return { ok: true };
  }
  @Post('forgot-password')
  async forgotPassword(@Body() body: unknown, @Req() req: Request) {
    const { email } = parse(z.object({ email: accountEmailSchema }).strict(), body);
    await throttleAuth(
      this.db,
      'recovery',
      submissionIp(req, this.config?.get<string>('LEAD_PROXY_SECRET')),
      email,
    );
    await this.db.cmsRecoveryJob.create({ data: { email } });
    return { message: 'If this account is active, password reset instructions will be emailed.' };
  }
  @Post('reset-password')
  async resetPassword(@Body() body: unknown, @Req() req: Request) {
    await throttleAuth(
      this.db,
      'reset',
      submissionIp(req, this.config?.get<string>('LEAD_PROXY_SECRET')),
    );
    const value = parse(resetSchema, body);
    const tokenHash = digest(value.token);
    const reset = await this.db.cmsPasswordReset.findUnique({ where: { tokenHash } });
    const invalid = () => new BadRequestException('Reset link is invalid or expired');
    if (!reset || reset.expiresAt <= new Date()) throw invalid();
    const passwordHash = await hashPassword(value.password);
    await this.db.$transaction(async (tx) => {
      const updated = await tx.cmsUser.updateMany({
        where: { id: reset.userId, disabled: false, authVersion: reset.authVersion },
        data: { passwordHash, authVersion: { increment: 1 }, version: { increment: 1 } },
      });
      if (!updated.count) throw invalid();
      const consumed = await tx.cmsPasswordReset.deleteMany({
        where: { tokenHash, expiresAt: { gt: new Date() } },
      });
      if (!consumed.count) throw invalid();
      await tx.cmsSession.deleteMany({ where: { userId: reset.userId } });
      await tx.cmsAudit.create({
        data: { actorId: reset.userId, action: 'auth.password.reset', entityId: reset.userId },
      });
    });
    return { ok: true, message: 'Password updated. Sign in with your new password.' };
  }
}
