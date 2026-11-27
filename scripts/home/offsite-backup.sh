#!/usr/bin/env bash
# Runs as root under systemd. Database archives only; never source .env or log secrets.
set -euo pipefail
umask 077
: "${RESTIC_REPOSITORY:?Missing repository configuration}"
: "${RESTIC_PASSWORD_FILE:?Missing encryption password file}"
: "${BACKUP_DIR:?Missing local backup directory}"
[[ -s "$RESTIC_PASSWORD_FILE" ]] || { echo 'Missing recovery password file' >&2; exit 1; }
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
# Serialize backup, verification and retention, including manual runs.
exec 9>"${OFFSITE_LOCK_FILE:-/run/lock/tevoniq-offsite.lock}"
flock -n 9 || { echo 'Another offsite backup is running'; exit 1; }
run_dir=$(mktemp -d)
trap 'rm -rf -- "$run_dir"' EXIT
latest=$(python3 - "$BACKUP_DIR" <<'PY'
import pathlib, re, sys, time
root = pathlib.Path(sys.argv[1])
files = sorted(p for p in root.iterdir() if not p.is_symlink() and p.is_file()
               and re.fullmatch(r'database-\d{8}T\d{6}Z-[A-Za-z0-9]+\.dump', p.name))
if not files:
    raise SystemExit('No completed database archive found')
p = files[-1]
if time.time() - p.stat().st_mtime > 36 * 3600:
    raise SystemExit('Latest database archive is older than 36 hours; local retention skipped')
with p.open('rb') as f:
    if f.read(5) != b'PGDMP':
        raise SystemExit('Invalid archive; local retention skipped')
print(p)
PY
)
# Stable stdin filename makes snapshots independent of local timestamped paths.
restic backup --host tevoniq-home --tag tevoniq-postgres \
  --stdin --stdin-filename database.dump --json < "$latest" > "$run_dir/result.jsonl"
snapshot=$(python3 - "$run_dir/result.jsonl" <<'PY'
import json, re, sys
result = None
for line in open(sys.argv[1]):
    entry = json.loads(line)
    if entry.get('message_type') == 'summary':
        result = entry.get('snapshot_id')
if not isinstance(result, str) or not re.fullmatch(r'[a-f0-9]{8,64}', result):
    raise SystemExit('Backup did not return a snapshot ID; retention skipped')
print(result)
PY
)
# Download and decrypt this exact snapshot; compare bytes before deleting anything.
restic dump "$snapshot" /database.dump > "$run_dir/restored.dump"
cmp -- "$latest" "$run_dir/restored.dump"
restic check
restic forget --host tevoniq-home --tag tevoniq-postgres --group-by host,tags \
  --keep-daily 14 --keep-weekly 8 --keep-monthly 6 --prune
python3 "$repo_dir/scripts/home/retention.py" "$BACKUP_DIR" --apply
printf 'Encrypted offsite backup verified by download and byte comparison.\n'
