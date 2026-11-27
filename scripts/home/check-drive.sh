#!/usr/bin/env bash
# Read-only connectivity diagnostics; no credential or repository contents printed.
set -euo pipefail
umask 077
[[ "$EUID" -eq 0 ]] || { echo 'Run with sudo' >&2; exit 1; }
export RCLONE_CONFIG=/root/.config/rclone/rclone.conf
export RESTIC_REPOSITORY=rclone:tevoniq-drive:TEVONIQ-Backups/restic
export RESTIC_PASSWORD_FILE=/etc/tevoniq-backup/restic-password
export RESTIC_CACHE_DIR=/var/cache/tevoniq-restic
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
probe() {
  label=$1; shift
  start=$SECONDS
  if timeout --kill-after=5s 55s "$@" > /dev/null 2> "$work/error"; then
    printf '%s: OK (%ss)\n' "$label" "$((SECONDS-start))"
  else
    code=$?
    printf '%s: FAILED exit=%s (%ss)\n' "$label" "$code" "$((SECONDS-start))"
    python3 - "$work/error" <<'PY'
import re, sys
raw = open(sys.argv[1]).read()
s = raw.lower()
# Only a normal Google error description; never enable verbose/header logging.
match = re.search(r'Error 403: ([^\n]+)', raw, re.I)
if match:
    detail = re.sub(r'https?://\S+', '[URL omitted]', match[1])
    detail = re.sub(r'[\w.+-]+@[\w.-]+', '[email omitted]', detail)
    detail = re.sub(r'[A-Za-z0-9_+/=-]{24,}', '[identifier omitted]', detail)
    print('  Google 403: ' + detail[:600])
if 'invalid_grant' in s or 'invalid token' in s or 'unauthorized' in s:
    print('  Category: authorization rejected')
elif '403' in s or 'permission' in s:
    print('  Category: permission, API limit or quota')
elif 'password' in s and ('wrong' in s or 'no key' in s):
    print('  Category: repository password rejected')
elif 'not found' in s or 'directory not found' in s:
    print('  Category: remote object or path not found')
elif 'timeout' in s or 'deadline' in s:
    print('  Category: network/backend timeout')
else:
    print('  Category: other failure; raw error withheld to protect credentials')
PY
  fi
}
restic version
rclone version | head -n 2
# Both variants read the same small encrypted repository config; never list private Drive files.
probe 'Drive direct / default network' rclone cat tevoniq-drive:TEVONIQ-Backups/restic/config \
  --contimeout 10s --timeout 15s --retries 1 --low-level-retries 1
probe 'Drive direct / IPv4' rclone --bind 0.0.0.0 cat tevoniq-drive:TEVONIQ-Backups/restic/config \
  --contimeout 10s --timeout 15s --retries 1 --low-level-retries 1
if [[ "${1:-}" == --quick ]]; then exit 0; fi
probe 'Restic backend / default network' restic -o rclone.timeout=35s cat config
probe 'Restic backend / IPv4' env RCLONE_BIND=0.0.0.0 restic -o rclone.timeout=35s cat config
systemctl show tevoniq-monitor.timer -p ActiveState -p SubState -p NextElapseUSecMonotonic
systemctl show tevoniq-offsite.service -p ActiveState -p Result -p ExecMainStatus
