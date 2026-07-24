# C-382 — Federation Scan: 20 Optimizations

**Cycle:** C-382  
**Status:** Planning artifact — scan complete, implementation not started  
**Method:** Live `git clone` of all five federation repos (not `web_fetch` on rendered GitHub pages), per [verification preference](../C-381/I7_WITNESS_TABLE_ENFORCEMENT.md) codified in C-381.

## Provenance

The initial scan was produced in a custodian orchestration session (Claude) with direct bash clones of `Mobius-Substrate`, `mobius-civic-ai-terminal`, `Civic-Protocol-Core`, `mobius-browser-shell`, and `mobius-hive`.

**Finding #9 (CPC identity vs wallet/ledger durability)** was refined in the same cycle via **joint verification**: Claude’s session (including operator-supplied Render dashboard evidence for `mobius-mic-wallet-service`) and an independent **Cursor agent clone** of `Civic-Protocol-Core` at `main`, comparing `identity/app/main.py`, `mic-wallet/app/main.py`, and `ledger/app/db.py` side by side. The sharpened wording below reflects that comparison — not the scan’s first draft alone.

Until this file landed on `main`, the scan existed only in chat/sandbox output (**not** versioned under `docs/epicon/cycles/C-382/`).

---

## What’s already fine (worth stating)

- **Terminal docs freshness:** `CURRENT_STATE.md` and `CURRENT_CYCLE.md` auto-generate from `scripts/gen-cycle-docs.mjs` and both show **C-382**. The C-381 `INDEX.md` staleness issue was Substrate-handbook-specific, not federation-wide.
- **Substrate `workflows/archived/*.yml.archived`:** Inert — GitHub Actions only parses `.yml`/`.yaml`.
- **KV cron staggering on Substrate:** `mobius-pulse-unified.yml` and `mobius-sync-unified.yml` carry inline `C-303: staggered` comments; collision class already addressed once.

---

## 20 optimizations

### CI / workflow hygiene (Substrate: ~36 workflow files)

1. **Collapse no-path-filter PR gates** — `anti-nuke.yml`, `epicon-guard.yml`, `gi-gate.yml`, `mobius-auto-consensus-label.yml`, `mobius-merge-gate.yml` fire on every PR with no `paths:` filter. Consider one `pr-gates.yml` with parallel jobs.
2. **Move archived workflows out of `.github/workflows/`** — e.g. `.github/archived-workflows/` or `docs/archive/workflows/` (avoid accidental `.yml` restore).
3. **Audit `c360-constitutional-gates.yml` on `README.md`** — confirm intentional scope vs leftover trigger.
4. **Standardize cron comment convention federation-wide** — adopt Substrate’s `C-303: staggered…` pattern on Terminal and CPC.

### Dependency & supply-chain

5. **Dependabot on four repos missing it** — only Substrate has `.github/dependabot.yml` today.
6. **`engines` on `mobius-civic-ai-terminal/package.json`** — browser-shell and hive pin Node ≥20; Terminal does not.

### Access control

7. **CODEOWNERS on CPC, browser-shell, hive** — only Substrate and Terminal have one today; CPC is highest sensitivity.
8. **Wire Approval Agent routing to CODEOWNERS** once #7 exists (policy assumes CODEOWNERS on all five; only two today).

### Infra durability (highest real-world severity)

9. **Port proven wallet/ledger durability pattern to CPC identity (not “fix all CPC SQLite”).**

   **Verified joint finding:**

   | Service | Behavior | Evidence (Civic-Protocol-Core `main`) |
   |---------|----------|----------------------------------------|
   | **mic-wallet** | Fail-closed; `os.path.ismount()`; `MIC_WALLET_ALLOW_EPHEMERAL` for dev only | `mic-wallet/app/main.py` — `is_persistent_data_mount()`, `resolve_database_url()` |
   | **ledger** | `assert_persistent_storage()` / `is_ephemeral_path()` in production | `ledger/app/db.py`, `ledger/app/main.py` |
   | **identity** | Weaker: if `DATABASE_URL` unset, uses disk SQLite when `os.path.isdir("/var/lib/identity")`, else **silent** `sqlite:///./identity.db` — **no `ismount` check, no fail-closed guard** | `identity/app/main.py` (`resolve_database_url`, ~L85–91) |

   **Important distinction:** A live Render disk on **mobius-mic-wallet** (operator dashboard, snapshots) does **not** prove **mobius-identity** mount health — separate claims. Identity can pass `isdir` while not genuinely mounted (`ismount`), which is a sharper failure mode than “no check at all.”

   **Infra:** `identity/render.yaml` and `mic-wallet/render.yaml` both declare persistent disks (`/var/lib/identity`, `/var/lib/mic-wallet`). Gap is **startup logic on identity**, not necessarily missing blueprint.

   **Work item:** Port mic-wallet’s pattern (+ tests like `tests/test_mic_wallet_health.py`) to identity; confirm identity service disk in Render dashboard (operator — **STALE** until checked).

   **Orthogonal:** Broken **Postgres `DATABASE_URL`** / DNS only applies when operators set `DATABASE_URL` to an unresolvable host — not the same as disk-backed SQLite when unset.

10. **Confirm identity Render disk mounted in production** — mirror operator verification already done for wallet.

### Documentation

11. **Audit `mobius-browser-shell` env examples** — six `.env*.example` variants; existence confirmed, **content drift not yet diff’d** (**STALE**).
12. **Extend Substrate Docs Guard pattern** to Terminal and browser-shell `docs/` trees.

### Naming & structure

13. **Terminal `CURRENT_STATE.md` vs `CURRENT_CYCLE.md`** — same generator today; define distinct scopes or merge to prevent future divergence.
14. **`mobius-hive` lean `package.json`** — confirm intentional (vanilla JS) vs undeclared requires.

### Security scanning

15. **CodeQL only on Substrate** — extend to Terminal (large TS) and CPC (Python identity/ledger).
16. **Gitleaks / `secret-scan.yml` only on Substrate** — prioritize CPC and browser-shell.

### Process consistency

17. **Extend I7 witness-table enforcement** beyond Substrate `.github/actions/epicon-guard/`.
18. **EPICON-02 intent template availability** — ensure `ATLAS_HANDOFF_TEMPLATE.md` (or equivalent) is referenced from other repos’ PR templates.

### Observability

19. **`mobius-divergence-dashboard.yml` vs `sentinel-heartbeat.yml`** — staggered (+10m) but confirm no duplicate data pull (**STALE** until deeper audit).
20. **Baseline security trio** — Dependabot + CodeQL + gitleaks on the four repos lacking them addresses #5, #15, and #16 in one motion.

---

## Priority read (if five items this cycle)

1. **#9** — Identity fail-closed / `ismount` port (small, proven pattern).
2. **#5 / #15 / #16 / #20** — Baseline security workflows on non-Substrate repos.
3. **#7** — CODEOWNERS on CPC.
4. **#1** — Substrate PR gate consolidation (custodian for workflow edits).
5. **#11** — browser-shell env-example drift audit (scope before implement).

---

## ATLAS handoff (findings only)

**From:** Orchestration support (Claude + Cursor verification pass)  
**To:** Michael / next C-382 implementer  
**Scope:** No implementation in this document — scan and prioritize only.

Execute as **separate small PRs** per repo/tier. Per Approval Agent policy (draft), workflow and enforcement paths require human/custodian review; Dependabot/CODEOWNERS additions are lower risk when confined to EP-1 paths.

---

## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| Five repos inspected via clone, not PR web UI | TRUE | Session method; Cursor: `git clone` / workspace copies under `repos/` |
| Substrate ~36 workflows; five PR gates without `paths:` | TRUE | `ls .github/workflows/`; inspect `anti-nuke.yml`, `epicon-guard.yml`, etc. |
| Wallet + ledger durability pattern hardened | TRUE | `Civic-Protocol-Core/mic-wallet/app/main.py`, `ledger/app/db.py` on `main` |
| Identity silent fallback to `./identity.db` when disk path absent | TRUE | `Civic-Protocol-Core/identity/app/main.py` `resolve_database_url()` |
| Wallet live disk healthy proves identity disk healthy | **FALSE** | Separate services; wallet dashboard ≠ identity mount witness |
| This scan was versioned on `main` before this commit | **FALSE** | Prior state: chat/sandbox only; this file is the first canon copy |
| browser-shell six env examples drifted from each other | **STALE** | `find` confirms files; diffs not run |
| Items #11 and #19 ready to implement verbatim | **STALE** | Need deeper audit before PRs |

---

*"We heal as we walk." — Mobius Systems*
