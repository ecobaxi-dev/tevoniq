#!/usr/bin/env python3
"""Local operational checks; credentials and provider responses never enter logs."""
import argparse
import json
import os
import shutil
import subprocess
import time
import urllib.request
from pathlib import Path

CONFIG = Path('/etc/tevoniq-monitor/config.json')
STATE = Path('/var/lib/tevoniq-monitor/state.json')


def run(*args):
    return subprocess.check_output(args, timeout=30, stderr=subprocess.DEVNULL, text=True).strip()


def collect():
    issues = []
    disk = shutil.disk_usage('/home/tevoniq')
    used = (disk.total - disk.free) / disk.total
    if used >= .85 or disk.free < 10 * 1024**3:
        issues.append('Disk space is low: at least 85% used or less than 10 GiB free.')
    for unit in ['tevoniq-backup.service', 'tevoniq-offsite.service']:
        try:
            props = dict(line.split('=', 1) for line in run(
                'systemctl', 'show', unit, '-p', 'Result', '-p', 'ExecMainStatus',
                '-p', 'ExecMainExitTimestamp', '-p', 'ActiveState').splitlines())
            if props.get('Result') != 'success' or props.get('ExecMainStatus') != '0':
                issues.append(unit + ': last execution failed.')
            else:
                stamp = props.get('ExecMainExitTimestamp', '')
                if not stamp or time.time() - int(run('date', '-d', stamp, '+%s')) > 42 * 3600:
                    issues.append(unit + ': no completed execution within 42 hours.')
        except (ValueError, subprocess.SubprocessError, OSError):
            issues.append(unit + ': unable to verify execution.')
    for timer in ['tevoniq-backup.timer', 'tevoniq-offsite.timer']:
        try:
            if run('systemctl', 'is-active', timer) != 'active':
                issues.append(timer + ': inactive.')
        except (subprocess.SubprocessError, OSError):
            issues.append(timer + ': inactive or unavailable.')
    try:
        names = json.loads(run('docker', 'inspect', 'tevoniq-postgres-1', 'tevoniq-api-1', 'tevoniq-web-1'))
        for item in names:
            status = item.get('State', {})
            if not status.get('Running') or status.get('Health', {}).get('Status') != 'healthy':
                issues.append(item['Name'].lstrip('/') + ': not healthy.')
    except (ValueError, KeyError, subprocess.SubprocessError, OSError):
        issues.append('Unable to verify application containers.')
    return sorted(issues)


def notification(issues, previous, now):
    old = previous.get('issues', [])
    if issues:
        if issues != old or now - previous.get('sent_at', 0) >= 6 * 3600:
            return 'TEVONIQ: server attention required', '\n'.join(issues)
    elif old:
        return 'TEVONIQ: server checks recovered', 'All configured local operational checks are healthy again.'
    return None


def send(config, subject, body):
    payload = json.dumps({'from': config['from'], 'to': [config['to']],
                          'subject': subject, 'text': body}).encode()
    request = urllib.request.Request('https://api.resend.com/emails', data=payload,
                                     headers={'Authorization': 'Bearer ' + config['key'],
                                              'Content-Type': 'application/json',
                                              'User-Agent': 'TEVONIQ-Server-Monitor/1'})
    with urllib.request.urlopen(request, timeout=25) as response:
        result = json.load(response)
        if not result.get('id'):
            raise RuntimeError('No message ID')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--test', action='store_true')
    args = parser.parse_args()
    if os.geteuid() != 0:
        raise SystemExit('Run with sudo')
    os.umask(0o077)
    config = json.loads(CONFIG.read_text())
    if args.test:
        send(config, 'TEVONIQ: operational monitor test',
             'Test notification for backup failures, stopped timers, unhealthy containers and low disk space.')
        print('Test notification accepted by email provider. Verify delivery in your inbox.')
        return
    previous = json.loads(STATE.read_text()) if STATE.exists() else {}
    issues = collect()
    now = time.time()
    notice = notification(issues, previous, now)
    if notice:
        send(config, *notice)
        previous = {'issues': issues, 'sent_at': now}
        STATE.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        temporary = STATE.with_suffix('.tmp')
        temporary.write_text(json.dumps(previous))
        temporary.replace(STATE)
    print('Operational checks: %d issue(s); notification %s.' % (len(issues), 'accepted' if notice else 'not needed'))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        # Do not log credential-bearing HTTP headers, configuration, or provider responses.
        raise SystemExit('Operational monitor failed; no secrets logged. Check network, mail configuration and service state.')
