import { hasPermission } from '@tevoniq/validation';
// UI convenience only; the API independently authorizes every protected request.
export const can = (user: { role: string } | null | undefined, permission: string) =>
  !!user && hasPermission(user.role, permission);
export class CmsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
export async function cmsApi(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`/api/cms/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
  });
  const data = (await response.json()) as Record<string, unknown>;
  if (response.status === 401 && typeof window !== 'undefined')
    window.dispatchEvent(new Event('cms-session-expired'));
  if (!response.ok)
    throw new CmsApiError(
      typeof data.message === 'string' ? data.message : 'The request could not be completed',
      response.status,
    );
  return data;
}
export const canManageContent = (role: string) =>
  ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'].includes(role);
