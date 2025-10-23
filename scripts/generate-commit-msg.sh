#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"

# Detect scope
SCOPE="$(scripts/detect-scope.sh || true)"

# Collect staged diff
DIFF="$(git diff --cached -U0 || true)"

# If nothing staged, return a trivial message
if [ -z "$DIFF" ]; then
  if [ -n "$SCOPE" ]; then
    echo "chore(${SCOPE}): update"
  else
    echo "chore: update"
  fi
  exit 0
fi

# Optional: simple type hints from file types/paths
TYPE_HINT=""
if git diff --cached --name-only | grep -qE '\.test\.(js|ts|py)$'; then TYPE_HINT="Prefer type: test"; fi
if git diff --cached --name-only | grep -qE 'package\.json|pyproject\.toml|Dockerfile|^\.github/'; then
  TYPE_HINT="${TYPE_HINT}\nPrefer type: build/ci"
fi

read -r -d '' PROMPT <<EOF
You are an expert at Conventional Commits.
Given a unified diff, produce a concise commit message:

Rules:
- Format: type(scope): subject
- Use this scope if provided: ${SCOPE:-<infer>}
- Subject ≤ 72 chars, imperative mood
- Add 0-3 bullet points only if truly helpful
- No trailing period
- Common types: feat, fix, refactor, chore, docs, test, build, ci, perf, style

${TYPE_HINT}

Return ONLY the final commit text.

DIFF:
EOF

MODEL="${MODEL:-llama3}"  # export MODEL=qwen2.5, codellama, etc. to change
MSG="$(printf "%s\n%s\n" "$PROMPT" "$DIFF" | ollama run "$MODEL" 2>/dev/null || true)"
MSG="$(echo "$MSG" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"

# Fallbacks
if [ -z "${MSG// }" ]; then
  if [ -n "$SCOPE" ]; then
    MSG="chore(${SCOPE}): update"
  else
    MSG="chore: update"
  fi
fi

echo "$MSG"
