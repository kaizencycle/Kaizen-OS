#!/bin/bash
# Citation hygiene check - quarantines entries with certain keywords that lack citations

NEED_CITE='(ethics|virtue|gic|ktt|security|ledger)'
FILES=$(ls data/eomm/*.json 2>/dev/null || true)
QUARANTINE_DIR="data/eomm/_quarantine"

mkdir -p "$QUARANTINE_DIR"

for f in $FILES; do
  if grep -Eiq "$NEED_CITE" "$f"; then
    HAS=$(jq '.sources|length' "$f" 2>/dev/null || echo "0")
    if [ "${HAS:-0}" -lt 1 ]; then
      echo "::warning file=$f::Missing citations; sending to quarantine"
      mv "$f" "$QUARANTINE_DIR/"
    fi
  fi
done

echo "Citation hygiene check complete"
