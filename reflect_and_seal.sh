#!/bin/bash
NOTE="$1"
INTENT="${2:-private}"
WINS="${3:-logged reflections}"
BLOCKS="${4:-none}"
TOMORROW="${5:-iterate}"

./reflect.sh "$NOTE" "$INTENT" >/dev/null

mcp run seal --data "$(jq -n \
  --arg d "$(date +%F)" \
  --arg w "$WINS" \
  --arg b "$BLOCKS" \
  --arg t "$TOMORROW" \
  '{date:$d,wins:$w,blocks:$b,tomorrow_intent:$t}')"
