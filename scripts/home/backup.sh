#!/usr/bin/env bash
# Database-only backup. Never deletes old backups, database files or Docker volumes.
set -euo pipefail
umask 077
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_dir"
backup_dir="${BACKUP_DIR:-$HOME/backups/tevoniq}"
mkdir -p -- "$backup_dir"
chmod 700 "$backup_dir"
backup_tmp="$(mktemp "$backup_dir/database-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX.partial")"
trap 'rm -f -- "$backup_tmp"' EXIT
# Compose reads only the existing local database configuration; never Neon.
docker compose -f compose.yaml exec -T postgres sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_tmp"
if [[ "$(head -c 5 "$backup_tmp")" != PGDMP ]]; then
  echo 'Backup failed: invalid PostgreSQL archive.' >&2
  exit 1
fi
backup_file="${backup_tmp%.partial}.dump"
mv -- "$backup_tmp" "$backup_file"
trap - EXIT
printf 'Database backup saved: %s\n' "$backup_file"
