import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir, rm, mkdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { homeConfigIssues } from '../scripts/home/check-env.mjs';
const database = {
  POSTGRES_USER: 'tevoniq',
  POSTGRES_DB: 'tevoniq',
  POSTGRES_PASSWORD: 'a'.repeat(48),
};
const home = {
  SITE_URL: 'https://home-test.tevoniq.com',
  EMAIL_FROM: 'notifications@tevoniq.com',
  RESEND_API_KEY: 'test-only-key',
  TURNSTILE_SITE_KEY: 'production-public-key',
  TURNSTILE_SECRET_KEY: 'production-secret-key',
  TURNSTILE_HOSTNAMES: 'home-test.tevoniq.com',
  LEAD_PROXY_SECRET: 'b'.repeat(64),
};
test('Home settings reject missing protection, wrong hostname and unsafe database URL components', () => {
  assert.deepEqual(homeConfigIssues(database, home), []);
  for (const patch of [
    { LEAD_PROXY_SECRET: '' },
    { RESEND_API_KEY: '' },
    { SITE_URL: 'http://localhost:3000' },
    { TURNSTILE_HOSTNAMES: 'wrong.test' },
    { TURNSTILE_SECRET_KEY: '' },
  ])
    assert.ok(homeConfigIssues(database, { ...home, ...patch }).length);
  assert.ok(homeConfigIssues({ ...database, POSTGRES_PASSWORD: 'password@host' }, home).length);
});
test('Backup writes private archives and preserves old backups; failure leaves no partial archive', async () => {
  const root = await mkdtemp(join(tmpdir(), 'tevoniq-backup-'));
  const bin = join(root, 'bin');
  const backup = join(root, 'backups');
  await mkdir(bin);
  await mkdir(backup);
  await writeFile(join(backup, 'old.dump'), 'old');
  const executable = join(bin, 'docker');
  await writeFile(executable, '#!/usr/bin/env bash\nprintf "PGDMP-test-archive"\n', {
    mode: 0o700,
  });
  try {
    const env = { ...process.env, PATH: bin + ':' + process.env.PATH, BACKUP_DIR: backup };
    const ok = spawnSync('bash', [resolve('scripts/home/backup.sh')], { env, encoding: 'utf8' });
    assert.equal(ok.status, 0, ok.stderr);
    const files = await readdir(backup);
    assert.equal(files.filter((f) => f.endsWith('.dump')).length, 2);
    assert.equal(await readFile(join(backup, 'old.dump'), 'utf8'), 'old');
    const archive = files.find((f) => f !== 'old.dump');
    assert.equal((await stat(join(backup, archive))).mode & 0o777, 0o600);
    assert.equal((await stat(backup)).mode & 0o777, 0o700);
    assert.ok(!files.some((f) => f.endsWith('.partial')));
    await writeFile(executable, '#!/usr/bin/env bash\nprintf "broken"\nexit 1\n', { mode: 0o700 });
    const failed = spawnSync('bash', [resolve('scripts/home/backup.sh')], {
      env,
      encoding: 'utf8',
    });
    assert.notEqual(failed.status, 0);
    assert.equal((await readdir(backup)).length, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
