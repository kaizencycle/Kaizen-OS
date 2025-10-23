#!/usr/bin/env bash
set -euo pipefail
echo "▶️ Lint & test"
if [ -f package.json ]; then
  npm ci --no-audit --fund=false
  npm -s run lint || true
  npm -s test --workspaces --if-present
fi

echo "▶️ Security checks (simple)"
if command -v trufflehog >/dev/null 2>&1; then
  trufflehog filesystem --no-update . || true
else
  grep -R --exclude-dir=node_modules -E "(AKIA|SECRET|PRIVATE KEY|BEGIN RSA)" . && exit 1 || true
fi

echo "✅ verify.sh passed"
