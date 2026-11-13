/** Return configuration field names only; never values or credentials. */
export function releaseSecurityIssues(api, web) {
  const issues = [];
  if (api.TURNSTILE_MODE !== 'turnstile') issues.push('TURNSTILE_MODE must be turnstile');
  for (const key of ['TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY', 'TURNSTILE_HOSTNAMES'])
    if (!api[key]?.trim()) issues.push(`Configure ${key}`);
  if (
    /^[123]x00000000000000000000/.test(api.TURNSTILE_SITE_KEY || '') ||
    /^[123]x0000000000000000000000000000000/.test(api.TURNSTILE_SECRET_KEY || '')
  )
    issues.push('Replace Turnstile testing keys with production keys');
  if (!['smtp', 'resend'].includes(api.EMAIL_TRANSPORT))
    issues.push('Enable a real email transport');
  if (
    !api.LEAD_PROXY_SECRET ||
    api.LEAD_PROXY_SECRET.length < 32 ||
    api.LEAD_PROXY_SECRET !== web.LEAD_PROXY_SECRET
  )
    issues.push('Configure matching 32+ character LEAD_PROXY_SECRET on API and web');
  const header = web.LEAD_CLIENT_IP_HEADER;
  if (!header || !/^[a-z0-9-]+$/i.test(header))
    issues.push('Configure an ingress-overwritten LEAD_CLIENT_IP_HEADER');
  if (
    header?.toLowerCase() === 'x-forwarded-for' &&
    !/^[1-9]$|^10$/.test(web.LEAD_TRUSTED_PROXY_HOPS || '')
  )
    issues.push('Set the verified LEAD_TRUSTED_PROXY_HOPS for x-forwarded-for');
  try {
    const site = new URL(web.SITE_URL);
    if (
      site.protocol !== 'https:' ||
      site.origin !== web.SITE_URL ||
      api.CORS_ORIGIN !== site.origin
    )
      issues.push('Use matching exact HTTPS SITE_URL and CORS_ORIGIN');
    if (
      !(api.TURNSTILE_HOSTNAMES || '')
        .split(',')
        .map((v) => v.trim().toLowerCase())
        .includes(site.hostname)
    )
      issues.push('TURNSTILE_HOSTNAMES must include the public SITE_URL hostname');
  } catch {
    issues.push('Configure a valid SITE_URL');
  }
  return issues;
}
export function assertReleaseSecurity(api, web) {
  const issues = releaseSecurityIssues(api, web);
  if (issues.length) throw new Error('Release configuration incomplete: ' + issues.join('; '));
}
