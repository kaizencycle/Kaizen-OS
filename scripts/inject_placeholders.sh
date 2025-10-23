#!/usr/bin/env bash
# Replace placeholder tokens in deploy-render-hardcoded.yml with your real values.
# Usage:
#   ./inject_placeholders.sh #     __LAB7_BACKEND_SERVICE_ID__ srv-xxxx #     __LAB7_BACKEND_HEALTH_URL__ https://your-api.onrender.com/v1/health #     __LAB7_FRONTEND_SERVICE_ID__ srv-yyyy #     __LAB7_FRONTEND_HEALTH_URL__ https://your-web.onrender.com/

set -euo pipefail
FILE=".github/workflows/deploy-render-hardcoded.yml"

if [[ ! -f "$FILE" ]]; then
  echo "File $FILE not found. Place it in .github/workflows/ first."; exit 1
fi

while [[ $# -gt 1 ]]; do
  token="$1"; value="$2"; shift 2
  sed -i.bak "s|$token|$value|g" "$FILE"
done

echo "Updated $FILE"
