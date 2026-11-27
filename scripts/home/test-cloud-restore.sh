#!/usr/bin/env bash
# Restore an encrypted cloud archive to a disposable database only.
set -euo pipefail
umask 077
[[ "$EUID" -eq 0 ]] || { echo 'Run with sudo' >&2; exit 1; }
set -a
source /etc/tevoniq-backup/offsite.env
set +a
archive=$(mktemp /tmp/tevoniq-cloud-XXXXXX.dump)
test_db="cloud_restore_$(date +%s)_$RANDOM"
created=false
cleanup() {
  status=$?
  trap - EXIT
  if [[ "$created" == true ]]; then
    if ! docker exec tevoniq-postgres-1 sh -c \
      'dropdb -U "$POSTGRES_USER" "$1"' sh "$test_db"; then
      echo "Could not remove temporary database: $test_db" >&2
      status=1
    fi
  fi
  rm -f -- "$archive"
  exit "$status"
}
trap cleanup EXIT
restic dump --host tevoniq-home --tag tevoniq-postgres \
  latest /database.dump > "$archive"
docker exec tevoniq-postgres-1 sh -c \
  'createdb -U "$POSTGRES_USER" "$1"' sh "$test_db"
created=true
docker exec -i tevoniq-postgres-1 sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$1" --no-owner --no-privileges --exit-on-error' \
  sh "$test_db" < "$archive"
tables=$(docker exec tevoniq-postgres-1 sh -c \
  'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1" -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema = '\''public'\'' AND table_type = '\''BASE TABLE'\'';"' \
  sh "$test_db")
[[ "$tables" =~ ^[0-9]+$ && "$tables" -gt 0 ]] || { echo 'Restored database has no public tables' >&2; exit 1; }
printf 'Cloud restore succeeded. Public tables: %s\n' "$tables"
