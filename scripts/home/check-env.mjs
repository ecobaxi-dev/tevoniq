import { readFile } from 'node:fs/promises';
import { parse } from 'dotenv';
import { releaseSecurityIssues } from '../release-security.mjs';
export function homeConfigIssues(database, home) {
  const issues = releaseSecurityIssues(
    { ...home, EMAIL_TRANSPORT: 'resend', TURNSTILE_MODE: 'turnstile', CORS_ORIGIN: home.SITE_URL },
    { ...home, LEAD_CLIENT_IP_HEADER: 'cf-connecting-ip' },
  );
  for (const key of ['EMAIL_FROM', 'RESEND_API_KEY'])
    if (!home[key]?.trim()) issues.push(`Configure ${key}`);
  for (const key of ['POSTGRES_USER', 'POSTGRES_DB'])
    if (!/^[a-zA-Z0-9_]+$/.test(database[key] || '')) issues.push(`Invalid ${key}`);
  if (!/^[a-f0-9]{32,}$/i.test(database.POSTGRES_PASSWORD || ''))
    issues.push('Preserve the generated hexadecimal POSTGRES_PASSWORD from .env');
  if (database.POSTGRES_USER !== 'tevoniq' || database.POSTGRES_DB !== 'tevoniq')
    issues.push('Verify existing database identity before changing POSTGRES_USER or POSTGRES_DB');
  return issues;
}
if (process.argv[1]?.endsWith('/check-env.mjs')) {
  const database = parse(await readFile(process.argv[2] || '.env'));
  const home = parse(await readFile(process.argv[3] || '.env.home'));
  const issues = homeConfigIssues(database, home);
  if (issues.length) {
    console.error(issues.join('\n'));
    process.exitCode = 1;
  } else console.log('Home production settings validated. No credentials printed.');
}
