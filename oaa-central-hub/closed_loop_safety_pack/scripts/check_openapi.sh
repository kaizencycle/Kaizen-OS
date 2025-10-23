#!/usr/bin/env bash
set -euo pipefail
echo "Lint OpenAPI"
npx -y @redocly/cli@latest lint openapi.yaml
echo "Diff against previous"
if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
  npx -y openapi-diff@3.0.5 --fail-on-changes HEAD~1:openapi.yaml openapi.yaml
else
  echo "No previous commit; skipping diff."
fi
