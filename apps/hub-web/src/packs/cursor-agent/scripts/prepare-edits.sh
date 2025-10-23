#!/usr/bin/env bash
set -euo pipefail
shopt -s globstar nullglob
for f in edits/**/*.*; do
  dest="${f#edits/}"
  mkdir -p "$(dirname "$dest")"
  [ -f "$dest" ] && echo "⚠️  overwriting $dest"
  mv "$f" "$dest"
done
