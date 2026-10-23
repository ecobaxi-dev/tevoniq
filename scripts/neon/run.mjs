import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';

// Explicit opt-in: ordinary local development keeps its local database.
// Load only Neon values; never replace the API's other local settings.
const values = parseEnv(readFileSync(new URL('../../.env', import.meta.url), 'utf8'));
const env = { ...process.env };
for (const key of ['DATABASE_URL', 'DATABASE_URL_UNPOOLED', 'NEON_BRANCH']) {
  if (values[key]) env[key] = values[key];
}
if (!env.DATABASE_URL || !env.DATABASE_URL_UNPOOLED)
  throw new Error('Run neon deploy or neon env pull before using the Neon commands');
const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error('A command is required');
const child = spawn(command, args, { env, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.once('error', () => {
  console.error('Unable to start Neon command');
  process.exitCode = 1;
});
child.once('exit', (code) => {
  process.exitCode = code ?? 1;
});
