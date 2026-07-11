#!/usr/bin/env bash
# C-368 Canon discoverability verification — run post-deploy against production.
set -uo pipefail

ORIGIN="${ORIGIN:-https://mobius-substrate.com}"
PASS=0; FAIL=0

ok()   { echo "  PASS  $1"; PASS=$((PASS+1)); }
bad()  { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }
hdr()  { echo; echo "== $1 =="; }

HOME_TITLE='Mobius Substrate — School of Chambers'

hdr "Phase A — distinct canon titles (no JS)"
for path in /canon /canon/glossary /canon/misinterpretations /canon/source-of-truth; do
  title=$(curl -s --max-time 20 "${ORIGIN}${path}" | grep -o '<title>[^<]*</title>' | head -1)
  if [ -z "$title" ]; then
    bad "${path}: no title"
  elif [ "$title" = "<title>${HOME_TITLE}</title>" ]; then
    bad "${path}: still homepage CSR shell ($title)"
  else
    ok "${path}: $title"
  fi
done

hdr "Phase B — JSON endpoints"
for path in /.well-known/mobius-canon.json /canon/index.json /canon/current.json /canon/glossary.json /canon/deprecations.json /canon/citations.json; do
  code=$(curl -s -o /tmp/canon.json -w "%{http_code}" --max-time 20 "${ORIGIN}${path}")
  if [ "$code" = "200" ] && python3 -c "import json; json.load(open('/tmp/canon.json'))" 2>/dev/null; then
    ok "${path} → 200 valid JSON"
  else
    bad "${path} → ${code} (expected 200 JSON)"
  fi
done

hdr "Phase C — sitemap + llms.txt"
if curl -s --max-time 20 "${ORIGIN}/sitemap.xml" | grep -q '/canon'; then
  ok "sitemap.xml lists canon routes"
else
  bad "sitemap.xml missing canon routes"
fi
if curl -s --max-time 20 "${ORIGIN}/llms.txt" | grep -q '## Canon'; then
  ok "llms.txt has Canon section"
else
  bad "llms.txt missing Canon section"
fi

hdr "Phase E — cross-subdomain (optional)"
for url in https://handbook.mobius-substrate.com/robots.txt https://epicon.mobius-substrate.com/llms.txt; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 -I "$url")
  [ "$code" = "200" ] && ok "$url → 200" || bad "$url → $code"
done

echo
echo "Results: ${PASS} passed, ${FAIL} failed"
[ "$FAIL" -eq 0 ]
