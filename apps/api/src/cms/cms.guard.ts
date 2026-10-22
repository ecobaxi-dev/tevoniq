import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import { Injectable, Inject, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service.js';
import { digest } from './password.js';
import { permissionsForRole, type CmsRoleName } from '@tevoniq/validation';
import { enforceEndpoint, publicEndpoints } from './permissions.js';
// Only this guard may mark a request authenticated; request properties are not proof.
const authenticatedRequests = new WeakSet<Request>();
export type CmsRequest = Request & {
  cmsUser: {
    id: string;
    email?: string;
    role: CmsRoleName;
    permissions?: string[];
    lastLoginAt?: Date | null;
  };
  cmsSessionId?: string;
};
@Injectable()
export class CmsGuard implements CanActivate {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(SiteSettingsService) private readonly settings: SiteSettingsService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    if (
      Object.hasOwn(publicEndpoints, controller) &&
      publicEndpoints[controller]?.includes(handler)
    )
      return true;
    const req = context.switchToHttp().getRequest<CmsRequest>();
    if (authenticatedRequests.has(req)) {
      enforceEndpoint(controller, handler, req);
      return true;
    }
    const token = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    if (!token) throw new UnauthorizedException();
    const session = await this.db.cmsSession.findUnique({
      where: { tokenHash: digest(token) },
      include: { user: true },
    });
    const now = new Date();
    const idleMinutes = (await this.settings.read()).settings.security.sessionIdleMinutes;
    if (
      !session ||
      session.expiresAt <= now ||
      session.user.disabled ||
      session.authVersion !== session.user.authVersion ||
      session.lastSeenAt.getTime() <= now.getTime() - idleMinutes * 60000
    )
      throw new UnauthorizedException();
    req.cmsUser = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      permissions: permissionsForRole(session.user.role),
      lastLoginAt: session.user.lastLoginAt,
    };
    req.cmsSessionId = session.id;
    enforceEndpoint(controller, handler, req);
    const touched = await this.db.cmsSession.updateMany({
      where: {
        tokenHash: digest(token),
        authVersion: session.authVersion,
        user: { is: { disabled: false, authVersion: session.authVersion } },
        expiresAt: { gt: now },
        lastSeenAt: { gt: new Date(now.getTime() - idleMinutes * 60000) },
      },
      data: { lastSeenAt: now },
    });
    if (!touched.count) throw new UnauthorizedException();
    authenticatedRequests.add(req);

    return true;
  }
}

@Injectable()
export class CmsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<CmsRequest>();
    if (!req.cmsUser) throw new ForbiddenException('Authentication required');
    enforceEndpoint(context.getClass().name, context.getHandler().name, req);
    return true;
  }
}
