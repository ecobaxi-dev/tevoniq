import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { hasPermission, moduleResource } from '@tevoniq/validation';
import type { CmsRequest } from './cms.guard.js';

type Policy = string[] | ((req: CmsRequest) => string[]);
const crud = (resource: string): Record<string, Policy> => ({
  list: [`${resource}.read`],
  detail: [`${resource}.read`],
  preview: [`${resource}.read`],
  audit: [`${resource}.read`],
  create: [`${resource}.create`],
  update: [`${resource}.update`],
  remove: [`${resource}.delete`],
});
const resource = (req: CmsRequest) =>
  moduleResource(String(req.params.module ?? req.params.kind ?? '')) ?? 'unknown';
const stateAction = (req: CmsRequest) =>
  req.body?.action === 'archive'
    ? 'delete'
    : req.body?.action === 'unpublish'
      ? 'publish'
      : 'update';
export const endpointPermissions: Record<string, Record<string, Policy>> = {
  CmsHomeController: {
    get: ['pages.read'],
    save: (req) => ['pages.update', ...(req.body?.action === 'save' ? [] : ['pages.publish'])],
  },
  CmsSiteSettingsController: {
    get: ['settings.read'],
    save: ['settings.update', 'settings.publish'],
  },
  CmsNewsletterController: {
    list: ['newsletter.read'],
    export: ['newsletter.export'],
    update: ['newsletter.update'],
  },
  CmsCareersController: {
    list: ['careers.read'],
    get: ['careers.read'],
    create: ['careers.create'],
    update: ['careers.update'],
    applications: ['careers.applications.read'],
    application: ['careers.applications.read'],
    history: ['careers.applications.read'],
    cv: ['careers.applications.read'],
    status: ['careers.applications.update'],
    note: ['careers.applications.update'],
  },
  CmsAuthController: {
    me: ['account.manage'],
    logout: ['account.manage'],
    sessions: ['account.manage'],
    revokeSession: ['account.manage'],
    logoutAll: ['account.manage'],
    revokeUserSessions: ['users.revoke'],
  },
  CmsServicesController: crud('services'),
  CmsSolutionsController: crud('solutions'),
  CmsIndustriesController: crud('industries'),
  CmsProjectsController: crud('projects'),
  // Company saves and taxonomy updates immediately affect public content.
  CmsCompanyController: { get: ['pages.read'], save: ['pages.update', 'pages.publish'] },
  CmsInsightsController: {
    ...crud('blog'),
    create: (req) => ['blog.create', ...(req.body?.status === 'archived' ? ['blog.delete'] : [])],
    update: (req) => ['blog.update', ...(req.body?.status === 'archived' ? ['blog.delete'] : [])],
    get: ['blog.read'],
    taxonomies: ['blog.read'],
    createTaxonomy: ['blog.create'],
    updateTaxonomy: ['blog.update', 'blog.publish'],
  },
  PageBuilderController: {
    ...crud('pages'),
    get: ['pages.read'],
    options: ['pages.read'],
    state: (req) => [`pages.${stateAction(req)}`],
  },
  MediaController: {
    list: ['media.read'],
    detail: ['media.read'],
    upload: ['media.create'],
    update: ['media.update'],
    state: (req) => [`media.${stateAction(req)}`],
  },
  CmsLeadsController: {
    list: ['leads.read'],
    detail: ['leads.read'],
    activity: ['leads.read'],
    attachment: ['leads.read'],
    getSettings: ['settings.read'],
    saveSettings: ['settings.update'],
    update: ['leads.update'],
    note: ['leads.update'],
    bulk: (req) => [req.body?.action === 'archive' ? 'leads.delete' : 'leads.update'],
    archive: ['leads.delete'],
    retryEmail: ['leads.update'],
  },
  AdminController: {
    dashboard: ['workspace.read'],
    references: ['workspace.read'],
    search: ['workspace.read'],
    trash: ['workspace.read'],
    roles: ['workspace.read'],
    list: (req) => [`${resource(req)}.read`],
    create: (req) => [`${resource(req)}.create`],
    update: (req) => [`${resource(req)}.update`],
    bulk: (req) => [`${resource(req)}.${stateAction(req)}`],
    restore: (req) => [`${resource(req)}.update`],
    users: ['users.read'],
    createUser: ['users.create'],
    updateUser: ['users.update'],
    audit: ['audit.read'],
  },
};
export const publicEndpoints: Record<string, readonly string[]> = {
  PestoRegistrationController: ['register', 'verify', 'issueTrial'],
  HomeController: ['get'],
  PublicNavigationController: ['get'],
  SeoController: ['organization', 'routes'],
  PublicSiteSettingsController: ['get'],
  NewsletterController: ['subscribe', 'confirm', 'unsubscribe', 'publicConfig'],
  SearchController: ['search'],
  CareersController: ['list', 'detail', 'apply'],
  CmsAuthController: ['login', 'forgotPassword', 'resetPassword'],
  HealthController: ['live', 'ready'],
  ServicesController: ['list', 'detail'],
  SolutionsController: ['list', 'detail'],
  IndustriesController: ['list', 'detail'],
  ProjectsController: ['list', 'detail', 'filters'],
  InsightsController: ['list', 'detail', 'taxonomies'],
  CompanyController: ['get', 'team'],
  PublicMediaController: ['file'],
  PublicPagesController: ['resolve', 'sitemap', 'newsletter'],
  LeadsController: ['options', 'submit'],
};
export function requirePermission(req: CmsRequest, permission: string) {
  if (!hasPermission(req.cmsUser?.role ?? '', permission))
    throw new ForbiddenException(`Permission required: ${permission}`);
}
function publishes(value: unknown): boolean {
  const pending: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  let nodes = 0,
    found = false;
  while (pending.length) {
    const current = pending.pop()!;
    if (!current.value || typeof current.value !== 'object') continue;
    if (++nodes > 10000 || current.depth > 32)
      throw new BadRequestException('Request structure is too complex');
    for (const [key, entry] of Object.entries(current.value)) {
      if (
        (['published', 'publish', 'active'].includes(key) && entry === true) ||
        (['action', 'status'].includes(key) &&
          typeof entry === 'string' &&
          ['publish', 'unpublish', 'published', 'scheduled', 'PUBLISHED'].includes(entry))
      )
        found = true;
      if (entry && typeof entry === 'object')
        pending.push({ value: entry, depth: current.depth + 1 });
    }
  }
  return found;
}
export function enforceEndpoint(controller: string, handler: string, req: CmsRequest) {
  const policies = Object.hasOwn(endpointPermissions, controller)
    ? endpointPermissions[controller]
    : undefined;
  const policy = policies && Object.hasOwn(policies, handler) ? policies[handler] : undefined;
  if (!policy) throw new ForbiddenException('Endpoint has no permission policy');
  const required = typeof policy === 'function' ? policy(req) : policy;
  for (const permission of required) requirePermission(req, permission);
  if (!['GET', 'HEAD'].includes(req.method) && publishes(req.body)) {
    for (const permission of required) {
      const domain = permission.split('.')[0];
      if (!['account', 'users', 'leads', 'workspace'].includes(domain!))
        requirePermission(req, `${domain}.publish`);
    }
  }
}
