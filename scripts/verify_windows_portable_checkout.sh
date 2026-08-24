#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Verify top-level tree excludes Windows-invalid path '...'"
if git ls-tree --name-only HEAD | grep -Fx '...'; then
  echo "FAIL: top-level '...' still tracked in HEAD" >&2
  exit 1
fi

echo "==> Fresh clone checkout (no sparse-checkout workaround)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
git clone --quiet "$ROOT" "$TMP/clone"

if [[ -e "$TMP/clone/..." ]]; then
  echo "FAIL: cloned worktree contains top-level '...'" >&2
  exit 1
fi

if [[ -n "$(git -C "$TMP/clone" status --porcelain)" ]]; then
  echo "FAIL: cloned worktree is not clean" >&2
  git -C "$TMP/clone" status --porcelain >&2
  exit 1
fi

echo "PASS: Windows-portable checkout guard"
