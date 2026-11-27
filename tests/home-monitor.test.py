import importlib.util
import unittest
import tempfile
import json
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('monitor', Path(__file__).resolve().parents[1] / 'scripts/home/monitor.py')
monitor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(monitor)


class MonitorTests(unittest.TestCase):
    def test_initial_healthy_does_not_send(self):
        self.assertIsNone(monitor.notification([], {}, 100000))

    def test_issue_sends_and_recovery_sends(self):
        self.assertIsNotNone(monitor.notification(['disk'], {}, 100000))
        self.assertIsNotNone(monitor.notification([], {'issues': ['disk']}, 100000))

    def test_same_issue_throttles_but_changed_issue_sends(self):
        previous = {'issues': ['disk'], 'sent_at': 100000}
        self.assertIsNone(monitor.notification(['disk'], previous, 100001))
        self.assertIsNotNone(monitor.notification(['disk'], previous, 121600))
        self.assertIsNotNone(monitor.notification(['backup'], previous, 100001))

    def test_collect_reports_disk_failed_backup_and_stopped_timer(self):
        def run(*args):
            if args[:2] == ('systemctl', 'show'):
                return 'Result=exit-code\nExecMainStatus=1\nActiveState=failed\nExecMainExitTimestamp='
            if args[:2] == ('systemctl', 'is-active'):
                return 'inactive'
            if args[0] == 'docker':
                return '[{"Name":"/api","State":{"Running":false}}]'
            raise AssertionError(args)
        with patch.object(monitor, 'run', run), patch.object(monitor.shutil, 'disk_usage', return_value=type('Disk', (), {'total': 100*1024**3, 'free': 5*1024**3})()):
            issues = monitor.collect()
        self.assertEqual(len(issues), 6)
        self.assertTrue(any('Disk space' in x for x in issues))

    def test_failed_email_does_not_suppress_next_attempt(self):
        with tempfile.TemporaryDirectory() as directory:
            config = Path(directory) / 'config.json'
            state = Path(directory) / 'state.json'
            config.write_text(json.dumps({'from': 'test@example.com', 'to': 'test@example.com', 'key': 'fixture'}))
            with patch.object(monitor, 'CONFIG', config), patch.object(monitor, 'STATE', state), patch.object(monitor.os, 'geteuid', return_value=0), patch.object(monitor, 'collect', return_value=['backup failed']), patch.object(monitor, 'send', side_effect=RuntimeError('offline')), patch('sys.argv', ['monitor.py']):
                with self.assertRaises(RuntimeError):
                    monitor.main()
                self.assertFalse(state.exists())

    def test_stale_successful_execution_alerts(self):
        def run(*args):
            if args[:2] == ('systemctl', 'show'):
                return 'Result=success\nExecMainStatus=0\nActiveState=inactive\nExecMainExitTimestamp=old'
            if args[0] == 'date':
                return '1'
            if args[:2] == ('systemctl', 'is-active'):
                return 'active'
            if args[0] == 'docker':
                return '[{"Name":"/api","State":{"Running":true,"Health":{"Status":"healthy"}}}]'
            raise AssertionError(args)
        with patch.object(monitor, 'run', run), patch.object(monitor.shutil, 'disk_usage', return_value=type('Disk', (), {'total': 100*1024**3, 'free': 50*1024**3})()):
            issues = monitor.collect()
        self.assertEqual(len(issues), 2)
        self.assertTrue(all('42 hours' in issue for issue in issues))


if __name__ == '__main__':
    unittest.main()
