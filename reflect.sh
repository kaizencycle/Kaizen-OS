#!/bin/bash
NOTE="$1"
INTENT="${2:-private}"   # private | publish

if [ -z "$NOTE" ]; then
  echo "Usage: reflect \"your note\" [private|publish]"
  exit 1
fi

# sha256 of note (macOS uses shasum -a 256; Linux uses sha256sum)
if command -v sha256sum >/dev/null 2>&1; then
  HASH=$(printf "%s" "$NOTE" | sha256sum | awk '{print $1}')
else
  HASH=$(printf "%s" "$NOTE" | shasum -a 256 | awk '{print $1}')
fi

DATA=$(jq -n \
  --arg date "$(date +%F)" \
  --arg note "$NOTE" \
  --arg intent "$INTENT" \
  --arg hash "$HASH" \
  '{
    date: $date,
    chamber: "Reflections",
    note: $note,
    meta: {
      gic_intent: $intent,
      content_hash: $hash,
      ui: "mcp"
    }
  }')

mcp run sweep --data "$DATA"
