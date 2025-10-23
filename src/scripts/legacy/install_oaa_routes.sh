#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-.}"
echo "Installing OAA Central Hub starter into $ROOT"
mkdir -p "$ROOT/oaa" "$ROOT/pages/api/oaa" "$ROOT/components"
cp -R oaa/* "$ROOT/oaa/"
cp -R pages/api/oaa/* "$ROOT/pages/api/oaa/"
cp -R components/OaaTab.tsx "$ROOT/components/"
echo "Done. Wire <OaaTab/> in your layout and set SCOUT_ENDPOINT env if using real WebDataScout."
