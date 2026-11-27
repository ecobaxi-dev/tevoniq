#!/usr/bin/env bash
# Private server configuration is encrypted by Restic before leaving the host.
set -euo pipefail
umask 077
: "${RESTIC_REPOSITORY:?Missing repository}"
: "${RESTIC_PASSWORD_FILE:?Missing recovery password file}"
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
[[ "$EUID" -eq 0 && "$repo_dir" == /home/tevoniq/apps/tevoniq ]] || { echo 'Run on the home server with sudo' >&2; exit 1; }
exec 9>/run/lock/tevoniq-offsite.lock
flock -n 9 || { echo 'Another offsite operation is running'; exit 1; }
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
# Explicit allowlist; never include the Restic decryption password in its own repository.
paths=(home/tevoniq/apps/tevoniq/.env home/tevoniq/apps/tevoniq/.env.home
  home/tevoniq/apps/tevoniq/compose.home.yaml home/tevoniq/apps/tevoniq/Dockerfile
  home/tevoniq/apps/tevoniq/scripts/home etc/tevoniq-backup/offsite.env
  root/.config/rclone/rclone.conf etc/systemd/system/tevoniq-backup.service
  etc/systemd/system/tevoniq-backup.timer etc/systemd/system/cloudflared.service)
for path in "${paths[@]}"; do [[ -e "/$path" ]] || { echo 'A required recovery configuration is missing' >&2; exit 1; }; done
for path in etc/tevoniq-monitor etc/systemd/system/tevoniq-offsite.service \
  etc/systemd/system/tevoniq-offsite.timer etc/systemd/system/tevoniq-monitor.service \
  etc/systemd/system/tevoniq-monitor.timer etc/systemd/logind.conf.d etc/ufw; do
  [[ ! -e "/$path" ]] || paths+=("$path")
done
tar -C / --exclude='__pycache__' -cf "$work/server-config.tar" "${paths[@]}"
restic backup --host tevoniq-home --tag tevoniq-config --stdin \
  --stdin-filename server-config.tar --json < "$work/server-config.tar" > "$work/result.jsonl"
snapshot=$(python3 - "$work/result.jsonl" <<'PY'
import json, re, sys
snapshot = None
for line in open(sys.argv[1]):
    data = json.loads(line)
    if data.get('message_type') == 'summary': snapshot = data.get('snapshot_id')
if not isinstance(snapshot, str) or not re.fullmatch('[a-f0-9]{8,64}', snapshot):
    raise SystemExit('No configuration snapshot ID returned')
print(snapshot)
PY
)
restic dump "$snapshot" /server-config.tar > "$work/verified.tar"
cmp -- "$work/server-config.tar" "$work/verified.tar"
restic check
restic forget --host tevoniq-home --tag tevoniq-config --group-by host,tags \
  --keep-daily 14 --keep-weekly 8 --keep-monthly 6 --prune
echo 'Encrypted server configuration verified by download and byte comparison.'
