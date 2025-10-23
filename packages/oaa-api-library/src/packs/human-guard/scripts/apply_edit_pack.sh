#!/usr/bin/env bash
set -euo pipefail

EDIT_DIR="${EDIT_DIR:-Lab7-proof-edits}"
ROOT_DIR="$(git rev-parse --show-toplevel)"
WHITELIST_FILE="${WHITELIST_FILE:-${ROOT_DIR}/scripts/edits_whitelist.txt}"
REQUIRE_HUMAN="${REQUIRE_HUMAN:-true}"           # set to 'false' to bypass human gate (not recommended)
HUMAN_TOKEN_FILE="${HUMAN_TOKEN_FILE:-HUMAN_OK.md}"

die(){ echo "ERROR: $*" >&2; exit 1; }

[[ -d "$EDIT_DIR" ]] || die "No $EDIT_DIR folder found."
cd "$ROOT_DIR"

if [[ "${REQUIRE_HUMAN}" == "true" ]]; then
  if [[ ! -f "$HUMAN_TOKEN_FILE" ]]; then
    cat > "$HUMAN_TOKEN_FILE" <<EOF
# Human Review Token
- Update this file with your initials and date to confirm manual review of staged edits.
- Commit this file before running the apply script (or let the script do it automatically).

Example:
- Reviewed by MK on $(date +%Y-%m-%d)
EOF
    git add "$HUMAN_TOKEN_FILE"
    git commit -m "chore(human): add HUMAN_OK.md token (please update with reviewer and date)" || true
    die "Human token file was missing. Added a template HUMAN_OK.md. Please update it with your initials/date, commit, then re-run."
  fi
fi

# Build whitelist regex
DEFAULT_WHITELIST="$(cat <<'WL'
^\.github/workflows/
^docs/
^scripts/
^ops_requests/
^ops_agent/
^render\.ya?ml$
^oaa\.env$
^sentinel_state\.json$
WL
)"
if [[ -f "$WHITELIST_FILE" ]]; then
  WL_REGEX="$(tr '\n' '|' < "$WHITELIST_FILE" | sed 's/|$//')"
else
  WL_REGEX="$(echo "$DEFAULT_WHITELIST" | tr '\n' '|' | sed 's/|$//')"
fi

echo "== Dry run: validating files in $EDIT_DIR against whitelist"
blocked=0
while IFS= read -r -d '' f; do
  rel="${f#$EDIT_DIR/}"
  if ! echo "$rel" | egrep -q "$WL_REGEX"; then
    echo "  ✗ blocked: $rel"
    blocked=1
  else
    echo "  ✓ allowed: $rel"
  fi
done < <(find "$EDIT_DIR" -type f -print0)

[[ $blocked -eq 0 ]] || die "Blocked files detected. Edit scripts/edits_whitelist.txt to allow, or move files."

echo "== Quick secret scan"
if egrep -RInq '(AWS_|SECRET|PRIVATE KEY|BEGIN [A-Z ]+PRIVATE KEY|authorization:|Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*)' "$EDIT_DIR"; then
  die "Potential secret material detected in $EDIT_DIR. Remove/redact before applying."
fi

echo "== Applying edits (rsync)"
rsync -av --delete-after "$EDIT_DIR"/ ./   --exclude ".git" --exclude "$EDIT_DIR" || die "rsync failed"

echo "== Clearing inbox"
rm -rf "$EDIT_DIR"/*

echo "== Committing staged changes"
git add -A
git commit -m "chore(autopulse): apply edit pack from $EDIT_DIR" || true
echo "Done."
