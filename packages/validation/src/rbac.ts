import { z } from 'zod';

export const cmsRoles = [
  'SUPER_ADMIN',
  'ADMIN',
  'CONTENT_MANAGER',
  'EDITOR',
  'MARKETING',
  'SALES',
  'HR',
  'VIEWER',
] as const;
export type CmsRoleName = (typeof cmsRoles)[number];
export const cmsRoleSchema = z.enum(cmsRoles);
export const passwordSchema = z.string().min(15).max(128);
export const accountEmailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
export const permissionResources = [
  'pages',
  'services',
  'solutions',
  'industries',
  'projects',
  'blog',
  'media',
  'leads',
  'careers',
  'users',
  'settings',
  'seo',
  'newsletter',
] as const;
export const permissionActions = ['read', 'create', 'update', 'publish', 'delete'] as const;
export type Permission =
  | `${(typeof permissionResources)[number]}.${(typeof permissionActions)[number]}`
  | `careers.applications.${(typeof permissionActions)[number]}`
  | 'users.revoke'
  | 'newsletter.export'
  | 'audit.read'
  | 'account.manage'
  | 'workspace.read';
export const allPermissions: Permission[] = [
  ...permissionResources.flatMap((resource) =>
    permissionActions.map((action) => `${resource}.${action}` as Permission),
  ),
  'users.revoke',
  'newsletter.export',
  'audit.read',
  'account.manage',
  'workspace.read',
  ...permissionActions.map((a) => `careers.applications.${a}` as Permission),
];
const content = [
  'pages',
  'services',
  'solutions',
  'industries',
  'projects',
  'blog',
  'media',
  'careers',
  'seo',
] as const;
const base: Permission[] = [
  'account.manage',
  'workspace.read',
  ...content.map((r) => `${r}.read` as Permission),
];
const grants = (...resources: string[]): Permission[] =>
  allPermissions.filter((p) => resources.includes(p.split('.')[0]!));
export const rolePermissions: Record<CmsRoleName, readonly Permission[]> = {
  SUPER_ADMIN: allPermissions,
  ADMIN: allPermissions.filter((p) => !p.startsWith('users.') || p === 'users.read'),
  CONTENT_MANAGER: [
    ...base,
    ...grants(...content).filter((p) => !p.startsWith('careers.applications.')),
  ],
  EDITOR: [
    ...base,
    'pages.create',
    'pages.update',
    'blog.create',
    'blog.update',
    'media.create',
    'media.update',
  ],
  MARKETING: [
    ...base,
    ...grants('blog', 'media', 'seo', 'newsletter'),
    'pages.create',
    'pages.update',
  ],
  SALES: [...base, 'leads.read', 'leads.update'],
  HR: [...base, ...grants('careers')],
  VIEWER: base,
};
export function hasPermission(role: string, permission: string): boolean {
  return (
    Object.hasOwn(rolePermissions, role) &&
    rolePermissions[role as CmsRoleName].includes(permission as Permission)
  );
}
export function permissionsForRole(role: string): Permission[] {
  return Object.hasOwn(rolePermissions, role)
    ? [...new Set(rolePermissions[role as CmsRoleName])]
    : [];
}
export function moduleResource(module: string): string | undefined {
  const aliases: Record<string, string> = {
    'page-builder': 'pages',
    company: 'pages',
    home: 'pages',
    team: 'pages',
    partners: 'pages',
    testimonials: 'pages',
    navigation: 'pages',
    translations: 'pages',
    insights: 'blog',
    resources: 'blog',
    'media-library': 'media',
    'job-applications': 'careers.applications',
    messages: 'leads',
    'site-settings': 'settings',
    service: 'services',
    solution: 'solutions',
    industry: 'industries',
    project: 'projects',
  };
  return Object.hasOwn(aliases, module)
    ? aliases[module]
    : permissionResources.find((r) => r === module);
}
