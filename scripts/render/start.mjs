import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { renderEnvironment } from './environment.mjs';
import { bootstrapPreview } from './bootstrap.mjs';

const env = renderEnvironment();
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
if (env.MEDIA_STORAGE !== 'disabled')
  throw new Error(
    'The free preview requires MEDIA_STORAGE=disabled; use the production deployment for persistent media',
  );
const children = new Set();
let stopping = false;
function stop(code, signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill(signal);
  const force = setTimeout(() => {
    for (const child of children) child.kill('SIGKILL');
    process.exit(code);
  }, 10000);
  force.unref();
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop(0, signal));
function launch(file, args, childEnv, cwd) {
  const child = spawn(file, args, { env: childEnv, cwd, stdio: 'inherit' });
  children.add(child);
  child.once('error', () => {
    console.error('A preview process could not start');
    stop(1);
  });
  child.once('exit', (code) => {
    children.delete(child);
    if (!stopping) stop(code || 1);
  });
  return child;
}
async function command(file, args) {
  const child = spawn(file, args, { env, stdio: 'inherit' });
  children.add(child);
  try {
    await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code) =>
        code === 0 ? resolve() : reject(new Error('Initialization command failed')),
      );
    });
  } finally {
    children.delete(child);
  }
}
try {
  // Free Render has no pre-deploy jobs or interactive shell. Migrations and
  // first-run bootstrap run before either listener; restarts preserve edits.
  await command(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'db:deploy']);
  if (stopping) process.exit(0);
  await bootstrapPreview(env);
  if (stopping) process.exit(0);
  const { CMS_ADMIN_PASSWORD: _password, ...runtime } = env;
  void _password;
  const api = launch(
    process.execPath,
    ['--max-old-space-size=160', resolve('apps/api/dist/main.js')],
    { ...runtime, PORT: env.PREVIEW_API_PORT },
  );
  let ready = false;
  for (let attempt = 0; attempt < 90 && !stopping; attempt++) {
    if (api.exitCode !== null) throw new Error('Preview API exited');
    try {
      const response = await fetch(`${env.API_URL}/health/ready`, {
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* API is still starting. */
    }
    await delay(500);
  }
  if (!ready || stopping) throw new Error('Preview API was not ready');
  const { DATABASE_URL: _database, DATABASE_URL_UNPOOLED: _directDatabase, ...webEnv } = runtime;
  void _database;
  void _directDatabase;
  const cwd = resolve('apps/web/.next/standalone');
  launch(
    process.execPath,
    ['--max-old-space-size=192', resolve(cwd, 'apps/web/server.js')],
    { ...webEnv, HOSTNAME: '0.0.0.0' },
    cwd,
  );
  console.log('Preview starting: public web with private loopback API.');
} catch {
  console.error(
    'Preview startup failed. Check database availability, bootstrap settings and deployment logs.',
  );
  stop(1);
}
