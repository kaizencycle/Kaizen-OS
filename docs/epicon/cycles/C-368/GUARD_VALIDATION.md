# C-368 Guard validation manifest
**Validated:** 2026-07-10 · **Validator:** `epicon/src/validate.mjs` (live Guard v0) · **Mode:** enforce

| PR brief | epicon_id | Verdict | Errors | Warnings |
|---|---|---|---|---|
| C368-PR1_oaa-mint-auth.md | EPICON_C-368_CORE_oaa-mint-auth_v1 | PASS | 0 | 1 |
| C368-PR2_oaa-gii-canon.md | EPICON_C-368_CORE_oaa-gii-canon-alignment_v1 | PASS | 0 | 1 |
| C368-PR3_epicon-cc0.md | EPICON_C-368_DOCS_license-cc0-ratification_v1 | PASS | 0 | 1 |
| C368-PR4_epicon-api-truthful-health.md | EPICON_C-368_INFRA_epicon-api-truthful-health_v1 | PASS | 0 | 1 |
| C368-PR5_guard-app-phase1.md | EPICON_C-368_CORE_guard-app-phase1_v1 | PASS | 0 | 1 |
| C368-PR6_org-dedup.md | EPICON_C-368_DOCS_org-dedup-terminal-main_v1 | PASS | 0 | 1 |

The single warning per file is the expected `No token available — skipping changed-file analysis`
notice when validating intent structure offline (no `GITHUB_TOKEN`). Non-blocking.

Reproduce:

```bash
cd epicon
for f in PR1 PR2 PR3 PR4 PR5 PR6; do
  body=$(cat "../Mobius-Substrate/docs/epicon/cycles/C-368/C368-${f}"*.md)
  node -e "require('fs').writeFileSync('/tmp/ev.json', JSON.stringify({pull_request:{number:1,body:require('fs').readFileSync(0,'utf8')}}))" <<< "$body"
  GITHUB_EVENT_PATH=/tmp/ev.json GITHUB_REPOSITORY=kaizencycle/Mobius-Substrate node src/validate.mjs
done
```
