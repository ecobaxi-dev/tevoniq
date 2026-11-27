#!/usr/bin/env bash
# Read-only host inventory. Never print environment values, private keys or tunnel tokens.
set -uo pipefail
export SYSTEMD_PAGER=cat
section() { printf '\n=== %s ===\n' "$1"; }
if [[ "$EUID" -ne 0 ]]; then
  echo 'Run with sudo to inspect firewall and effective SSH settings.' >&2
  exit 1
fi
section 'System and disk'
date -u
. /etc/os-release
printf 'OS: %s\n' "$PRETTY_NAME"
uname -r
df -h / /var/lib/docker 2>/dev/null
free -h
section 'Listening TCP ports (IPv4 and IPv6)'
ss -lntp
section 'Firewall'
if command -v ufw >/dev/null; then ufw status verbose; else echo 'UFW not installed'; fi
if [[ -f /etc/default/ufw ]]; then
  sed -n '/^IPV6=/p;/^DEFAULT_INPUT_POLICY=/p;/^DEFAULT_OUTPUT_POLICY=/p;/^DEFAULT_FORWARD_POLICY=/p' /etc/default/ufw
fi
section 'SSH effective settings'
if [[ -x /usr/sbin/sshd ]]; then
  /usr/sbin/sshd -t && echo 'SSH configuration syntax OK'
  /usr/sbin/sshd -T 2>/dev/null | awk '$1 ~ /^(port|listenaddress|permitrootlogin|passwordauthentication|pubkeyauthentication|kbdinteractiveauthentication|permitemptypasswords|maxauthtries|allowtcpforwarding|x11forwarding|usepam)$/ {print}'
  echo 'Match blocks, if any, need separate per-connection review:'
  grep -hE '^[[:space:]]*Match[[:space:]]' /etc/ssh/sshd_config /etc/ssh/sshd_config.d/*.conf 2>/dev/null || true
fi
section 'Service startup and current state (no command lines or tokens)'
for unit in docker.service cloudflared.service ssh.service ssh.socket apt-daily.timer apt-daily-upgrade.timer unattended-upgrades.service tevoniq-backup.timer; do
  printf '%s: ' "$unit"
  systemctl show "$unit" -p ActiveState -p UnitFileState --value 2>/dev/null | tr '\n' ' '
  printf '\n'
done
section 'Automatic update policy'
apt-config dump | grep -E '^APT::Periodic::(Update-Package-Lists|Unattended-Upgrade)|^Unattended-Upgrade::Automatic-Reboot[ ;]' || true
dpkg-query -W -f='${Package} ${Version}\n' openssh-server unattended-upgrades ufw docker-ce 2>/dev/null || true
if [[ -f /var/run/reboot-required ]]; then echo 'Reboot required by installed updates'; fi
printf 'Cached available upgrades (apt lists may be stale): '
apt list --upgradable 2>/dev/null | awk 'NR>1 {n++} END {print n+0}'
section 'Docker published ports'
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
for container in tevoniq-postgres-1 tevoniq-api-1 tevoniq-web-1; do
  docker inspect --format '{{.Name}} user={{.Config.User}} restart={{.HostConfig.RestartPolicy.Name}} privileged={{.HostConfig.Privileged}} security={{json .HostConfig.SecurityOpt}} logging={{json .HostConfig.LogConfig}} ports={{json .HostConfig.PortBindings}}' "$container" 2>/dev/null || true
done
section 'Sensitive file permissions (contents omitted)'
for path in /home/tevoniq/apps/tevoniq/.env /home/tevoniq/apps/tevoniq/.env.home /home/tevoniq/.ssh /home/tevoniq/.ssh/authorized_keys /var/run/docker.sock; do
  if [[ -e "$path" ]]; then stat -c '%a %U:%G %n' "$path"; fi
done
getent group docker || true
section 'Backups'
systemctl list-timers tevoniq-backup.timer --no-pager
systemctl show tevoniq-backup.service -p Result -p ExecMainStatus -p ActiveState --no-pager
backup_dir=/home/tevoniq/backups/tevoniq
if [[ -d "$backup_dir" ]]; then
  stat -c '%a %U:%G %n' "$backup_dir"
  du -sh "$backup_dir"
  find "$backup_dir" -maxdepth 1 -type f -name '*.dump' -printf '%TY-%Tm-%Td %TH:%TM %m %u %s bytes\n' | sort | tail -n 5
fi
section 'Sleep prevention'
for unit in sleep.target suspend.target hibernate.target hybrid-sleep.target; do
  printf '%s: ' "$unit"; systemctl is-enabled "$unit" 2>/dev/null || true
done
section 'Read-only audit complete; no settings changed'
