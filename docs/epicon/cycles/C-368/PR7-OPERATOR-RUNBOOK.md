# C-368 PR7 — Operator Runbook: Prime Reserve Block Cold Canon

**Witnessed gap (2026-07-10T22:54Z):** ~350 attested **seal records** in terminal KV · 0 `.dat` files on Substrate main.

> **C-370 correction (2026-07-12):** The prime export found **313 attested seals → 194 unique
> `block_number` values** after dedupe (119 duplicate-sequence collisions across chain eras).
> Cold canon counts **unique block_numbers**, not raw seal index cardinality. See
> `docs/epicon/cycles/C-368/C368-PR7_prime-count-clarification.md`.

## Prerequisites

Configure these **GitHub Actions secrets** on `kaizencycle/mobius-civic-ai-terminal`:

| Secret | Source |
|--------|--------|
| `KV_REST_API_URL` | Vercel → terminal project → Storage → KV |
| `KV_REST_API_TOKEN` | Same KV integration |
| `SUBSTRATE_GITHUB_TOKEN` | PAT or Mobius Bot with `contents` + `pull_requests` on Mobius-Substrate |

Optional: `AGENT_SERVICE_TOKEN` (API fallback), `TERMINAL_API_BASE`, `CPC_BASE_URL`.

Configure on **Mobius-Substrate** (for post-merge canon-event):

| Secret | Purpose |
|--------|---------|
| `SUBSTRATE_SERVICE_TOKEN` | POST to terminal `/api/epicon/canon-event` |
| `TERMINAL_API_BASE` | Production terminal URL |

## Phase A+B — One-shot prime (all unique sealed block_numbers)

1. Open **Actions → Reserve Block Canon Export → Run workflow**
2. Inputs:
   - `incremental`: **false**
   - `dry_run`: **false**
   - `open_substrate_pr`: **true**
3. Workflow will:
   - Export all attested seals from KV → dedupe by `block_number` → `blk0000`+ + `MANIFEST.json`
   - Run `node scripts/verify-dat-chain.js canon/reserve-blocks/`
   - Open draft PR on `kaizencycle/Mobius-Substrate` branch `canon/reserve-blocks-prime-c368`
4. Review PR — expect EP-3 Guard I4 warning on `canon/**` (expected, non-blocking)
5. Merge → `reserve-block-canonization.yml` verifies chain on main and posts canon-event

**Acceptance (prime):**

1. Run collision audit on terminal (KV creds):  
   `npx tsx scripts/audit-reserve-block-collisions.ts --json` → record `unique_block_count` and confirm `hash_divergent_collisions === 0`.
2. Verify Substrate MANIFEST matches audited unique count:  
   `C368_PRIME_EXPECTED_BLOCKS=<unique_block_count> ./docs/epicon/cycles/C-368/c368-verify.sh pr7`
3. Chain verify: `node scripts/verify-dat-chain.js canon/reserve-blocks/`

2026-07-12 audited prime: **194** unique blocks / 9,700 MIC (`C368_PRIME_EXPECTED_BLOCKS=194`). **Not** raw `seals_count` from `/api/vault/status`. Re-export without resolving KV collisions reproduces the same deduped count.

## Phase C — Continuous append (after prime)

- **Vercel cron:** `/api/cron/reserve-canon-append` daily at `00:30 UTC` (sole scheduler — no GitHub cron)
- Cron detects `sealed_hot - canonized_cold > 0` and dispatches export with `incremental: true`
- Append-only: new lines go to current `blkNNNN.dat` until full (100 blocks), then next file

Manual trigger:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://mobius-civic-ai-terminal.vercel.app/api/cron/reserve-canon-append?force=true"
```

## Local verification (with KV creds in `.env.local`)

```bash
cd mobius-civic-ai-terminal
npx tsx scripts/canonize-reserve-blocks.ts --dry-run
npx tsx scripts/canonize-reserve-blocks.ts --skip-cpc
node scripts/verify-dat-chain.js canon/reserve-blocks/
```

## Counterfactuals

- **Validation failure:** export aborts with offending `block_number` / `seal_id` — audit KV before retry
- **Secrets missing:** workflow fails fast at preflight; commit is never force-fit
- **Canon-event post fails:** merge still valid — GitHub commit is the attestation
