"""Package source and public assets; exclude local data and runtime secrets."""
from pathlib import Path
import hashlib
import json
import tarfile

root = Path(__file__).resolve().parents[1]
output = root / 'artifacts/release'
output.mkdir(parents=True, exist_ok=True)
archive = output / 'tevoniq-source.tar.gz'
allowed = [
    'apps', 'packages', 'content', 'scripts', 'docs', 'tests', 'package.json',
    'package-lock.json', 'Dockerfile', 'compose.yaml', 'README.md', 'ARCHITECTURE.md',
    'DEPLOYMENT.md', 'SECURITY.md', 'PROJECT_REQUIREMENTS.md', 'eslint.config.mjs',
    'playwright.config.ts', 'render.yaml', '.nvmrc', '.dockerignore', '.gitignore', '.env.example',
    '.env.production.example', '.prettierrc.json', '.prettierignore',
]
blocked = {'node_modules', 'dist', '.next', '.data', '.npm-cache', '.git',
           'coverage', 'test-results', 'playwright-report', '__pycache__'}


def include(path):
    relative = path.relative_to(root)
    if any(part in blocked for part in relative.parts) or path.is_symlink():
        return False
    if relative.parts[:4] == ('apps', 'api', 'src', 'generated'):
        return False
    if path.name.startswith('.env') and path.name not in ('.env.example', '.env.production.example'):
        return False
    return path.name != '.DS_Store' and not path.name.endswith(('.log', '.tsbuildinfo', '.pem', '.key'))


names = []
with tarfile.open(archive, 'w:gz') as bundle:
    for item in allowed:
        path = root / item
        if not path.exists():
            continue
        paths = sorted(path.rglob('*')) if path.is_dir() else [path]
        for file in paths:
            if file.is_file() and include(file):
                name = str(file.relative_to(root))
                bundle.add(file, arcname='tevoniq/' + name, recursive=False)
                names.append(name)

digest = hashlib.sha256(archive.read_bytes()).hexdigest()
(output / 'SHA256SUMS').write_text(digest + '  ' + archive.name + '\n')
(output / 'manifest.json').write_text(json.dumps({
    'files': len(names), 'sha256': digest,
    'excluded': 'local environments, backups, credentials, dependencies and build outputs',
}, indent=2))
with tarfile.open(archive) as bundle:
    packed = set(bundle.getnames())
    assert 'tevoniq/apps/web/public/brand/generated/workflow.png' in packed
    assert 'tevoniq/apps/api/.env' not in packed
    assert not any('/node_modules/' in name or '/.data/' in name for name in packed)
print(f'Source bundle verified: {len(names)} files; {archive.stat().st_size / 1024 / 1024:.1f} MiB')
