# C-379 Re-Audit — Infrastructure Recovery Advanced

**Captured:** 2026-07-21T23:17Z (UTC)  
**Supersedes stale rows in:** [C-379_AUDIT_live-github-review.md](./C-379_AUDIT_live-github-review.md) (2026-07-21T18:56Z)  
**Verdict:** **OPEN — INFRASTRUCTURE RECOVERY ADVANCED / DURABILITY + ZEUS VERIFICATION PENDING**  
**Banner:** `C-379 OPEN — INFRASTRUCTURE RECOVERY ADVANCED / DURABILITY + ZEUS VERIFICATION PENDING`

The MIC wallet incident progressed from "bad `DATABASE_URL`" through seven infrastructure layers. Code-side remediation is now strong; the remaining scientific test is redeploy-survival.

---

## Wallet incident chain (witness sequence)

```
C-379 WALLET INCIDENT
1. Wallet unhealthy
        ↓  cold-start? → disproven
2. DNS error observed
        ↓  stale Postgres DATABASE_URL → fixed (#94–#96)
3. SQLite unable to open DB
        ↓  persistent disk unavailable
4. Code initially allowed ephemeral fallback
        ↓  Codex: "Fail closed." → #98 merged
5. Disk blueprint missing in mic-wallet/render.yaml
        ↓  #99 merged (disk + disk_mounted / data_dir)
6. Directory existence probe too weak
        ↓  #100 merged (os.path.ismount + plan: starter)
7. Render free plan incompatible with disk
        ↓  wallet upgraded to starter
8. Other disk-backed services also free
        ↓  #101 merged (ledger + identity + wallet → starter)
9. Remaining proof:
   WRITE → REDEPLOY → READ SAME DATA
```

---

## MIC wallet (item 6) — PARTIAL CLOSEOUT

| Phase | Status |
|-------|--------|
| DNS diagnostic [#94](https://github.com/kaizencycle/Civic-Protocol-Core/pull/94) | ✅ merged |
| `DATABASE_URL` fix [#95](https://github.com/kaizencycle/Civic-Protocol-Core/pull/95) | ✅ merged |
| SQLite path handling [#96](https://github.com/kaizencycle/Civic-Protocol-Core/pull/96) | ✅ merged |
| Connectivity witness [#97](https://github.com/kaizencycle/Civic-Protocol-Core/pull/97) | ✅ green @ 2026-07-21T22:29Z |
| Fail-closed policy [#98](https://github.com/kaizencycle/Civic-Protocol-Core/pull/98) | ✅ merged |
| Disk blueprint [#99](https://github.com/kaizencycle/Civic-Protocol-Core/pull/99) | ✅ merged |
| Starter plan + `ismount` [#100](https://github.com/kaizencycle/Civic-Protocol-Core/pull/100) | ✅ merged |
| Federation disk-plan fix [#101](https://github.com/kaizencycle/Civic-Protocol-Core/pull/101) | ✅ merged @ 23:11Z |
| **Write survives redeploy** | ⏳ **BLOCKING** |

### Production witnesses

**Connectivity (phase 3)** @ 2026-07-21T22:29:11Z:

```json
{"status":"ok","db_ok":true,"db_write_ok":true,"db_connected":true}
```

**Infrastructure recovery (phase 6)** @ 2026-07-21T23:09:47Z:

```json
{
  "status": "ok",
  "service": "mobius-mic-wallet",
  "db_ok": true,
  "db_write_ok": true,
  "db_connected": true,
  "db_error": null,
  "disk_mounted": true,
  "data_dir": "/var/lib/mic-wallet",
  "timestamp": "2026-07-21T23:09:47.103042"
}
```

| Gate | Verdict |
|------|---------|
| Connectivity | **PASS** |
| Disk configuration in code/blueprint | **PASS** |
| Fail-closed behavior | **PASS** (#98) |
| Real mount detection | **PASS** (#100 `ismount`) |
| Compatible Render tier | **PASS** (#100/#101 starter) |
| Federation disk-backed plans | **PASS** (#101) |
| Durable persistence across redeploy | **UNVERIFIED / BLOCKING** |

**Witness Protocol note:** The 22:29Z green `/health` was correctly **not** treated as full closeout — Codex P1 challenged ephemeral false-green. Item 6 reopened as partial closeout; subsequent PRs addressed that risk. Full closure requires documented write → redeploy → read.

---

## Federation deployment invariant (new)

> **Persistent disk service → must use a compatible Render plan (starter+).**

PR #101 upgrades all disk-backed services in the root blueprint:

| Service | Plan | Disk mount |
|---------|------|------------|
| `civic-ledger-api` | starter | `/var/lib/ledger` |
| `mobius-identity` | starter | `/var/lib/identity` |
| `mobius-mic-wallet` | starter | `/var/lib/mic-wallet` |

Services without disks (`mic-indexer`, `deploy-drift-shim`) remain on `free`.

---

## ZEUS verification — STILL DISPUTED

No newer ZEUS verification replacing the disputed C-379 state was found in this re-audit.

| Category | Status |
|----------|--------|
| `verification_status` | **disputed** |
| `micro_operator_cycle_divergence` | open (C-306 vs C-379) |
| `kv_keys_ok` contradiction | open |

Fresh ZEUS verification should follow P1 fixes (micro cycle, KV resolver).

---

## Open backlog (unchanged categories)

| Item | Status |
|------|--------|
| 21 — Micro cycle C-306 → C-379 | **OPEN** (P1) |
| 22 — `kv_keys.ok` vs `kv_keys_ok` resolver | **OPEN** (P1) |
| 23 — ZEUS / bot dispute disposition | **OPEN** (P2) |
| Track R / Reserve Block reconciliation | **OPEN** (independent) |

Reserve Block: raw vault 360, cold MANIFEST 194, collision pairs 125, canonical count **UNRESOLVED**. `360 − 194 = canon lag` remains **RETRACTED**.

---

## Status board (re-audit)

| Area | Verdict |
|------|---------|
| Cycle writer | GREEN |
| Federation scan | PASS / MERGED |
| C-379 journal | GREEN (refresh pending) |
| Wallet DNS drift | RESOLVED |
| Wallet DB connectivity | VERIFIED |
| Wallet fail-closed policy | MERGED |
| Wallet disk blueprint | MERGED |
| Wallet real mount detection | MERGED |
| Wallet compatible Render tier | MERGED |
| Federation disk-backed plans | MERGED |
| Wallet redeploy persistence | **UNVERIFIED / BLOCKING** |
| ZEUS verification | **DISPUTED** |
| Micro layer | **STALE — C-306** |
| KV health semantics | **CONTRADICTORY** |
| Quorum | 5/5 |
| EPICON candidates | 0 (last verified) |
| Reserve Block canonical count | UNRESOLVED |
| Track R | OPEN |

---

## Recommended priority

```
P0/P1  Wallet durability proof
       WRITE → record value → redeploy → READ → same value? → PASS/FAIL

P1     Micro cycle propagation (C-306 → C-379) — item 21
P1     KV health resolver (kv_keys.ok vs kv_keys_ok) — item 22
P1     Fresh ZEUS verification after above fixes

       Track R — Reserve Block reconciliation (independent)
```

---

## Final verdict

**C-379 remains OPEN.**

Infrastructure recovery for the wallet advanced materially: stale env override → disk path → fail-closed semantics → blueprint disk declaration → mount verification → service-plan compatibility → federation-wide blueprint compatibility.

Until write survives redeploy, item 6 must remain:

**PARTIAL CLOSEOUT — CONNECTIVITY VERIFIED / DURABILITY WITNESS PENDING**

---

*"We heal as we walk." — Mobius Systems*
