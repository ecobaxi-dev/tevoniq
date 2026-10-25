import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

// Next standalone output deliberately omits static assets. Copy the generated
// assets into its runtime layout so E2E exercises the same production server
// that the Docker image starts.
await cp(
  resolve('apps/web/.next/static'),
  resolve('apps/web/.next/standalone/apps/web/.next/static'),
  { recursive: true },
);
await cp(resolve('apps/web/public'), resolve('apps/web/.next/standalone/apps/web/public'), {
  recursive: true,
});

const child = spawn(process.execPath, [resolve('apps/web/.next/standalone/apps/web/server.js')], {
  cwd: resolve('apps/web/.next/standalone'),
  env: process.env,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.once('exit', (code) => process.exit(code ?? 1));
