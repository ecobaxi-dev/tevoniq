import { readFile } from 'node:fs/promises';
import { parse } from 'dotenv';
import { webEnvironmentSchema } from '@tevoniq/validation';
import { validateEnvironment } from '../apps/api/dist/config/environment.js';
const args = process.argv.slice(2);
if (args.length !== 2)
  throw new Error('Usage: node scripts/check-release-env.mjs <api-env-file> <web-env-file>');
const [api, web] = await Promise.all(args.map(async (file) => parse(await readFile(file))));
const issues = [];
for (const [name, values] of [
  ['API', api],
  ['web', web],
]) {
  for (const [key, value] of Object.entries(values)) {
    if (/replace[-_ ]with|your[-_ ]|example\.com/i.test(value))
      issues.push(`${name}: configure ${key}`);
  }
}
try {
  validateEnvironment(api);
} catch {
  issues.push('API environment validation failed; check required fields and storage settings');
}
if (!webEnvironmentSchema.safeParse(web).success) issues.push('Web environment validation failed');
if (api.NODE_ENV !== 'production') issues.push('API NODE_ENV must be production');
if (web.SITE_URL !== 'https://tevoniq.com') issues.push('Web SITE_URL must be https://tevoniq.com');
if (api.CORS_ORIGIN !== web.SITE_URL) issues.push('API CORS_ORIGIN must match web SITE_URL');
if (!api.CV_CLAMAV_HOST)
  issues.push('Configure private CV_CLAMAV_HOST before enabling job uploads');
if (
  web.LEAD_CLIENT_IP_HEADER &&
  (!web.LEAD_PROXY_SECRET || web.LEAD_PROXY_SECRET !== api.LEAD_PROXY_SECRET)
)
  issues.push('Trusted client IP forwarding requires the same secret on API and web');
if (api.EMAIL_TRANSPORT !== 'smtp')
  issues.push(
    'Email is disabled; enable SMTP and verify delivery before accepting public enquiries',
  );
if (issues.length) {
  console.error(issues.map((issue) => `- ${issue}`).join('\n'));
  process.exitCode = 1;
} else
  console.log(
    'Environment structure checked. Verify actual database, S3, scanner, mail delivery, HTTPS and backups before launch.',
  );
