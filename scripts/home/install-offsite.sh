#!/usr/bin/env bash
# Requires an authenticated, least-privilege rclone remote first.
set -euo pipefail
umask 077
[[ "$EUID" -eq 0 ]] || { echo 'Run with sudo' >&2; exit 1; }
for tool in rclone restic python3 flock openssl; do command -v "$tool" >/dev/null; done
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
[[ "$repo_dir" == /home/tevoniq/apps/tevoniq ]] || { echo 'Unexpected project path' >&2; exit 1; }
export RCLONE_CONFIG=/root/.config/rclone/rclone.conf
[[ -f "$RCLONE_CONFIG" ]] || { echo 'Configure the tevoniq-drive remote first' >&2; exit 1; }
# Refuse broader Drive scopes; do not print access/refresh tokens.
python3 - "$RCLONE_CONFIG" <<'PY'
import configparser, sys
c = configparser.ConfigParser(interpolation=None)
c.read(sys.argv[1])
r = c['tevoniq-drive'] if c.has_section('tevoniq-drive') else {}
if r.get('type') != 'drive' or r.get('scope') != 'drive.file' or not r.get('token'):
    raise SystemExit('Configure tevoniq-drive as Google Drive with drive.file scope and OAuth first')
if r.get('team_drive') or r.get('root_folder_id'):
    raise SystemExit('Use a private My Drive root, without shared-drive or custom-folder settings')
PY
chmod 600 "$RCLONE_CONFIG"
install -d -m 700 /etc/tevoniq-backup /var/cache/tevoniq-restic
if [[ ! -e /etc/tevoniq-backup/restic-password ]]; then
  openssl rand -hex 32 > /etc/tevoniq-backup/restic-password
fi
chmod 600 /etc/tevoniq-backup/restic-password
[[ -s /etc/tevoniq-backup/restic-password ]] || { echo 'Recovery password is empty' >&2; exit 1; }
export RESTIC_REPOSITORY=rclone:tevoniq-drive:TEVONIQ-Backups/restic
export RESTIC_PASSWORD_FILE=/etc/tevoniq-backup/restic-password
export RESTIC_CACHE_DIR=/var/cache/tevoniq-restic
# Initialization is explicit; never overwrite an existing repository on access failure.
case "${1:-}" in
  --init) restic init ;;
  '') restic cat config >/dev/null ;;
  *) echo 'Usage: install-offsite.sh [--init]' >&2; exit 1 ;;
esac
cat > /etc/tevoniq-backup/offsite.env <<'CONFIG'
RESTIC_REPOSITORY=rclone:tevoniq-drive:TEVONIQ-Backups/restic
RESTIC_PASSWORD_FILE=/etc/tevoniq-backup/restic-password
RESTIC_CACHE_DIR=/var/cache/tevoniq-restic
RCLONE_CONFIG=/root/.config/rclone/rclone.conf
BACKUP_DIR=/home/tevoniq/backups/tevoniq
CONFIG
chmod 600 /etc/tevoniq-backup/offsite.env
install -m 644 "$repo_dir/scripts/home/tevoniq-offsite.service" /etc/systemd/system/tevoniq-offsite.service
install -m 644 "$repo_dir/scripts/home/tevoniq-offsite.timer" /etc/systemd/system/tevoniq-offsite.timer
systemctl daemon-reload
# Do not enable unattended retention before recovery material is saved off-host.
echo 'Repository configured. Timer is not enabled by this installer.'
echo 'Save /etc/tevoniq-backup/restic-password securely off this laptop before enabling the timer.'
