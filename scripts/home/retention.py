#!/usr/bin/env python3
"""Prune only old PostgreSQL archives. Dry-run unless --apply is supplied."""
import argparse
import datetime
import re
import time
from pathlib import Path

NAME = re.compile(r"database-(\d{8}T\d{6}Z)-[A-Za-z0-9]+\.dump\Z")


def candidates(directory, now=None):
    now = time.time() if now is None else now
    archives = []
    for path in Path(directory).iterdir():
        match = NAME.fullmatch(path.name)
        if path.is_symlink() or not path.is_file() or not match:
            continue
        try:
            created = datetime.datetime.strptime(match[1], "%Y%m%dT%H%M%SZ").replace(
                tzinfo=datetime.timezone.utc
            ).timestamp()
        except ValueError:
            continue
        with path.open("rb") as archive:
            if archive.read(5) != b"PGDMP":
                continue
        archives.append((created, path))
    archives.sort(key=lambda item: (item[0], item[1].name), reverse=True)
    # Keep the newest two valid archives regardless of age. Both the name and
    # filesystem time must be old, so copied or future-dated files survive.
    return [
        path for created, path in archives[2:]
        if created < now - 14 * 86400 and path.stat().st_mtime < now - 14 * 86400
    ]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("directory")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    paths = candidates(args.directory)
    if args.apply:
        for path in paths:
            path.unlink()
    print(f"Local retention: {len(paths)} archive(s) {'removed' if args.apply else 'eligible (dry-run)'}")
