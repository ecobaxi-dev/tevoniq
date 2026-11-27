#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ "$EUID" -eq 0 ]] || { echo 'Run with sudo' >&2; exit 1; }
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
[[ "$repo_dir" == /home/tevoniq/apps/tevoniq ]] || { echo 'Unexpected project path' >&2; exit 1; }
install -d -m 700 /etc/tevoniq-monitor /var/lib/tevoniq-monitor
config=$(mktemp /etc/tevoniq-monitor/config-XXXXXX)
trap 'rm -f -- "$config"' EXIT
# Extract only the existing mail credentials into a root-only local file, never the terminal.
docker exec tevoniq-api-1 node -e '
const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
if (!key || !from) process.exit(1);
process.stdout.write(JSON.stringify({key, from, to: "ecobaxi@gmail.com"}));
' > "$config"
python3 - "$config" <<'PY'
import json, sys
c = json.load(open(sys.argv[1]))
assert all(isinstance(c.get(k), str) and c[k].strip() for k in ['key', 'from', 'to'])
PY
install -m 600 "$config" /etc/tevoniq-monitor/config.json
for kind in service timer; do
  install -m 644 "$repo_dir/scripts/home/tevoniq-monitor.$kind" "/etc/systemd/system/tevoniq-monitor.$kind"
done
systemctl daemon-reload
python3 "$repo_dir/scripts/home/monitor.py" --test
systemctl start tevoniq-monitor.service
systemctl enable --now tevoniq-monitor.timer
systemctl show tevoniq-monitor.service -p Result -p ExecMainStatus
systemctl list-timers tevoniq-monitor.timer --no-pager
