import { spawnSync } from 'node:child_process';
import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { renderEnvironment } from './environment.mjs';
const env = renderEnvironment();
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
  env,
  stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status ?? 1);
// Next standalone deliberately excludes these assets.
const destination = 'apps/web/.next/standalone/apps/web';
await cp(resolve('apps/web/.next/static'), resolve(destination, '.next/static'), {
  recursive: true,
});
await cp(resolve('apps/web/public'), resolve(destination, 'public'), { recursive: true });
console.log('Render build ready: standalone web assets and API compiled.');
