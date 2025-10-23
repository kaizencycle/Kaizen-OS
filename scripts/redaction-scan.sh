#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
FORBIDDEN_FILE="${ROOT}/.redaction/forbidden.regex"
ALLOW_FILE="${ROOT}/.redaction/allowlist.regex"

if [[ ! -f "$FORBIDDEN_FILE" ]]; then
  echo "No .redaction/forbidden.regex found — skipping scan."
  exit 0
fi

FORBIDDEN="$(tr '\n' '|' < "$FORBIDDEN_FILE" | sed 's/|$//')"

ALLOW=""
if [[ -f "$ALLOW_FILE" ]]; then
  ALLOW="$(tr '\n' '|' < "$ALLOW_FILE" | sed 's/|$//')"
fi

echo "🔎 Redaction scan (repo-aware)…"
FAILED=0
# Only scan tracked files; skip vendor & private docs
FILES=$(git ls-files | grep -vE '(^vendor/|^docs/private/)' || true)

for f in $FILES; do
  # Skip binaries by mime where possible
  if file "$f" | grep -qiE 'image|binary'; then
    continue
  fi

  # If file contains forbidden terms…
  if grep -nEi "$FORBIDDEN" "$f" >/tmp/forbidden_hits 2>/dev/null; then
    # …and if allowlist exists, try to subtract allowed matches.
    if [[ -n "$ALLOW" ]] && grep -nEi "$ALLOW" "$f" >/tmp/allow_hits 2>/dev/null; then
      # Filter forbidden hits that are not also allowed
      # (simple line-based exclusion; good enough for docs/code)
      if grep -Fvxf /tmp/allow_hits /tmp/forbidden_hits >/tmp/net_hits || true; then
        if [[ -s /tmp/net_hits ]]; then
          echo "🚫 $f"
          cat /tmp/net_hits
          FAILED=1
        fi
      fi
    else
      echo "🚫 $f"
      cat /tmp/forbidden_hits
      FAILED=1
    fi
  fi
done

if [[ "$FAILED" -eq 1 ]]; then
  echo "❌ Forbidden terms detected. Redact or move to private."
  exit 1
fi

echo "✅ No forbidden terms found."
