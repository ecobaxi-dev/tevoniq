import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readdir,
  readFile,
  rm,
  utimes,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'tevoniq-offsite-'));
  const backups = join(root, 'backups');
  const bin = join(root, 'bin');
  await mkdir(backups);
  await mkdir(bin);
  const current = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d+Z$/, 'Z');
  const newest = `database-${current}-current.dump`;
  for (const name of [
    'database-20200101T000000Z-old1.dump',
    'database-20200102T000000Z-old2.dump',
    'database-20200103T000000Z-old3.dump',
    newest,
  ]) {
    await writeFile(join(backups, name), 'PGDMP-test-archive');
    if (name !== newest)
      await utimes(join(backups, name), new Date('2020-01-01'), new Date('2020-01-01'));
  }
  await writeFile(join(root, 'password'), 'test-fixture-only');
  const env = {
    ...process.env,
    PATH: bin + ':' + process.env.PATH,
    BACKUP_DIR: backups,
    RESTIC_REPOSITORY: 'local-test-only',
    RESTIC_PASSWORD_FILE: join(root, 'password'),
    OFFSITE_LOCK_FILE: join(root, 'lock'),
    ACTION_LOG: join(root, 'actions'),
    ARCHIVE: join(backups, newest),
  };
  for (const [name, body] of Object.entries({
    flock: '#!/bin/sh\nexit 0\n',
    restic: `#!/bin/sh
printf '%s\\n' "$1" >> "$ACTION_LOG"
case "$1" in
 backup) [ "\${FAIL_STAGE:-}" != backup ] || exit 1; cat >/dev/null; printf '{"message_type":"summary","snapshot_id":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}\\n' ;;
 dump) if [ "\${FAIL_STAGE:-}" = dump ]; then printf 'corrupt'; else cat "$ARCHIVE"; fi ;;
 check) [ "\${FAIL_STAGE:-}" != check ] || exit 3 ;;
 forget) exit 0 ;;
 *) exit 2 ;;
esac
`,
  }))
    await writeFile(join(bin, name), body, { mode: 0o700 });
  return { root, backups, env };
}

test('Retention defaults to dry-run, preserves newest two, unknown files, invalid archives and symlink targets', async () => {
  const f = await fixture();
  try {
    const external = join(f.root, 'external');
    await writeFile(external, 'PGDMP-external');
    await symlink(external, join(f.backups, 'database-20190101T000000Z-link.dump'));
    await writeFile(join(f.backups, 'database-20180101T000000Z-bad.dump'), 'broken');
    await writeFile(join(f.backups, 'notes.dump'), 'PGDMP-do-not-delete');
    const before = await readdir(f.backups);
    const dry = spawnSync('python3', [resolve('scripts/home/retention.py'), f.backups]);
    assert.equal(dry.status, 0, dry.stderr.toString());
    assert.deepEqual(await readdir(f.backups), before);
    const apply = spawnSync('python3', [
      resolve('scripts/home/retention.py'),
      f.backups,
      '--apply',
    ]);
    assert.equal(apply.status, 0, apply.stderr.toString());
    const after = await readdir(f.backups);
    assert.equal(after.length, before.length - 2);
    assert.ok(after.includes('database-20200103T000000Z-old3.dump'));
    assert.ok(after.includes('database-20180101T000000Z-bad.dump'));
    assert.equal(await readFile(external, 'utf8'), 'PGDMP-external');
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});

for (const stage of ['backup', 'dump', 'check'])
  test(`Offsite ${stage} failure never runs retention`, async () => {
    const f = await fixture();
    try {
      const before = await readdir(f.backups);
      const r = spawnSync('bash', [resolve('scripts/home/offsite-backup.sh')], {
        env: { ...f.env, FAIL_STAGE: stage },
        encoding: 'utf8',
      });
      assert.notEqual(r.status, 0);
      assert.deepEqual(await readdir(f.backups), before);
      assert.ok(!(await readFile(f.env.ACTION_LOG, 'utf8')).includes('forget'));
    } finally {
      await rm(f.root, { recursive: true, force: true });
    }
  });

test('Offsite verifies exact downloaded snapshot before scoped remote and local retention', async () => {
  const f = await fixture();
  try {
    const r = spawnSync('bash', [resolve('scripts/home/offsite-backup.sh')], {
      env: f.env,
      encoding: 'utf8',
    });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual((await readFile(f.env.ACTION_LOG, 'utf8')).trim().split('\n'), [
      'backup',
      'dump',
      'check',
      'forget',
    ]);
    assert.equal((await readdir(f.backups)).length, 2);
    assert.ok(!r.stdout.includes('test-fixture-only'));
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
