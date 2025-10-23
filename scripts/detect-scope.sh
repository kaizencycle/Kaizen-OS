#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
GLOBAL="${HOME}/.config/kaizen/scope-map.regex"
LOCAL="${ROOT}/.commit-scope.map.regex"

# Gather staged files
FILES="$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)"
[ -z "$FILES" ] && exit 0

# Read rules from (LOCAL first, then GLOBAL)
read_rules() {
  local file="$1"
  [ -f "$file" ] || return 0
  # normalize: trim, skip comments/blank
  awk '
    /^[[:space:]]*#/ { next }
    /^[[:space:]]*$/ { next }
    {
      # Keep raw line
      print $0
    }' "$file"
}

RULES="$(read_rules "$LOCAL"
        echo
        read_rules "$GLOBAL")"

# Parse rules into regex|scope|weight
# Lines: REGEX => scope [; weight=NN]
parse_rule() {
  local line="$1"
  local regex scope weight
  regex="$(echo "$line" | awk -F'=> ' '{print $1}' | xargs)"
  scope="$(echo "$line" | awk -F'=> ' '{print $2}' | awk -F';' '{print $1}' | xargs)"
  weight="$(echo "$line" | awk -F'weight=' '{print $2}' | xargs 2>/dev/null || true)"
  [ -z "${weight:-}" ] && weight=50
  # output: regex|scope|weight
  echo "${regex}|${scope}|${weight}"
}

# Score matches: for each rule, if any FILE matches regex -> candidate
CANDIDATES=""
while IFS= read -r line; do
  [ -z "${line// }" ] && continue
  parsed="$(parse_rule "$line")"
  IFS='|' read -r rx sc wt <<<"$parsed"
  # test against all staged files
  if echo "$FILES" | grep -E -q "$rx"; then
    # specificity: regex length (longer = more specific)
    spec=${#rx}
    echo "${rx}|${sc}|${wt}|${spec}"
  fi
done <<< "$RULES" | sort -u > /tmp/scope_candidates.$$ || true

# Pick best: highest weight, then highest specificity
if [ -s /tmp/scope_candidates.$$ ]; then
  BEST="$(sort -t'|' -k3,3nr -k4,4nr /tmp/scope_candidates.$$ | head -n1)"
  IFS='|' read -r rx sc wt spec <<<"$BEST"
  echo "$sc"
fi

rm -f /tmp/scope_candidates.$$ 2>/dev/null || true
