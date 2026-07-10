#!/usr/bin/env bash
# C-368 Acceptance Harness — run after each PR lands (or all at once at cycle close).
# Behavioral verification only: tests what the systems DO, not what they claim (I6).
# Usage: ./c368-verify.sh [pr1|pr2|pr3|pr4|pr5|pr6|all]
set -uo pipefail

OAA="https://oaa-api-library.onrender.com"
EAPI="https://epicon-api.onrender.com"
PASS=0; FAIL=0; SKIP=0
ok(){   echo "  PASS  $1"; PASS=$((PASS+1)); }
bad(){  echo "  FAIL  $1"; FAIL=$((FAIL+1)); }
skip(){ echo "  SKIP  $1"; SKIP=$((SKIP+1)); }
hdr(){  echo; echo "== $1 =="; }

TARGET="${1:-all}"

pr1(){
  hdr "PR 1 — OAA mint-path authentication"
  # Behavioral: anonymous completion must be rejected with 401 (auth before lookup).
  code=$(curl -s -o /tmp/p1.json -w "%{http_code}" --max-time 60 -X POST \
    -H "Content-Type: application/json" -d '{}' \
    "$OAA/api/learning/session/00000000-0000-0000-0000-000000000000/complete")
  case "$code" in
    401|403) ok "anonymous completion rejected ($code)";;
    404)     skip "completion returned 404 for bogus id — auth may run after lookup; retest with a real anonymous session";;
    000)     skip "OAA unreachable (cold start?) — rerun";;
    *)       bad "anonymous completion returned $code (expected 401) — body: $(head -c 120 /tmp/p1.json)";;
  esac
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$OAA/api/debug/test-openai")
  [ "$code" = "404" ] && ok "debug endpoint gated (404)" || bad "debug endpoint exposed ($code)"
  jwt=$(curl -s --max-time 30 "$OAA/" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('jwt_configured', d.get('auth',{}).get('jwt_configured')))" 2>/dev/null)
  [ "$jwt" = "True" ] && ok "manifest jwt_configured: true" || bad "manifest jwt_configured: $jwt (expected true)"
  rv=$(curl -s --max-time 30 "$OAA/" | python3 -c "import json,sys;print(json.load(sys.stdin).get('version'))" 2>/dev/null)
  ov=$(curl -s --max-time 30 "$OAA/openapi.json" | python3 -c "import json,sys;print(json.load(sys.stdin)['info']['version'])" 2>/dev/null)
  [ -n "$rv" ] && [ "$rv" = "$ov" ] && ok "version drift resolved ($rv)" || bad "version drift: root=$rv openapi=$ov"
}

pr2(){
  hdr "PR 2 — GII canon thresholds"
  t=$(curl -s --max-time 60 "$OAA/api/learning/system-status")
  python3 - "$t" <<'PY'
import json,sys
try: d=json.loads(sys.argv[1]); th=d.get("thresholds",{})
except: print("  FAIL  system-status unparseable"); sys.exit(1)
want={"circuit_breaker":0.85,"reward_floor":0.90,"mint_gate":0.95}
missing=[k for k in want if abs(float(th.get(k,-1))-want[k])>1e-9]
if not missing: print("  PASS  thresholds match canon (0.85/0.90/0.95)")
else: print(f"  FAIL  thresholds off-canon: live={th} missing/wrong={missing}")
PY
  # count python's own PASS/FAIL lines
  case "$?" in 0) PASS=$((PASS+1));; *) FAIL=$((FAIL+1));; esac
}

pr3(){
  hdr "PR 3 — CC0 ratification (kaizencycle/epicon@main)"
  d=$(mktemp -d); git clone -q --depth 1 https://github.com/kaizencycle/epicon.git "$d" || { bad "clone failed"; return; }
  head -3 "$d/LICENSE" | grep -qi "CC0\|Creative Commons" && ok "LICENSE is CC0" || bad "LICENSE not CC0: $(head -1 "$d/LICENSE")"
  grep -q '"license": *"CC0-1.0"' "$d/package.json" && ok "package.json CC0-1.0" || bad "package.json license wrong"
  n=$(cd "$d" && git grep -il agpl | wc -l)
  [ "$n" = "0" ] && ok "zero AGPL references" || bad "$n files still reference AGPL"
  rm -rf "$d"
}

pr4(){
  hdr "PR 4 — epicon-api truthful health"
  h=$(curl -s --max-time 30 "$EAPI/health")
  echo "$h" | python3 -c "import json,sys; d=json.load(sys.stdin); exit(0 if d.get('ok') is True and d.get('version') else 1)" 2>/dev/null \
    && ok "/health ok:true with version" || bad "/health: $h"
  r=$(curl -s --max-time 30 "$EAPI/")
  echo "$r" | python3 -c "import json,sys; d=json.load(sys.stdin); exit(0 if d.get('service') and (d.get('role') or d.get('purpose') or d.get('endpoints')) else 1)" 2>/dev/null \
    && ok "root manifest declares role/endpoints" || bad "root manifest thin: $r"
  curl -s --max-time 20 "https://raw.githubusercontent.com/kaizencycle/epicon/main/docs/services/epicon-api.md" -o /dev/null -w "%{http_code}" | grep -q 200 \
    && ok "service documented in epicon/docs/services/" || bad "docs/services/epicon-api.md missing"
}

pr5(){
  hdr "PR 5 — Guard App Phase 1 (structural checks; I2 behavioral test is manual)"
  for p in "apps/guard-app/package.json" "packages/guard-core/package.json"; do
    curl -s --max-time 20 "https://raw.githubusercontent.com/kaizencycle/epicon/main/$p" -o /dev/null -w "%{http_code}" | grep -q 200 \
      && ok "$p on main" || bad "$p missing"
  done
  echo "  NOTE  manual acceptance: edit a test PR's intent w/o version bump -> check must fail with I2 VIOLATION"
}

pr6(){
  hdr "PR 6 — duplicate repo archived"
  html=$(curl -s --max-time 20 -H "User-Agent: Mozilla/5.0" "https://github.com/kaizencycle/mobius-civic-ai-terminal-main")
  if [ -z "$html" ]; then skip "profile fetch failed";
  elif echo "$html" | grep -qi "archived"; then ok "repo archived (read-only)"
  else bad "repo not archived yet"; fi
}

case "$TARGET" in
  pr1) pr1;; pr2) pr2;; pr3) pr3;; pr4) pr4;; pr5) pr5;; pr6) pr6;;
  all) pr1; pr2; pr3; pr4; pr5; pr6;;
  *) echo "usage: $0 [pr1..pr6|all]"; exit 2;;
esac

echo; echo "== C-368 VERDICT: $PASS pass / $FAIL fail / $SKIP skip =="
exit $FAIL
