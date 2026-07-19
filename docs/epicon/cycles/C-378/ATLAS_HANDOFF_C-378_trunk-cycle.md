# ATLAS HANDOFF — C-378: The Trunk Cycle

**Handoff ID:** ATLAS→FEDERATION_C-378_trunk_v1
**Issued:** C-377 (2026-07-19) · Execution: C-378 (2026-07-20)
**From:** ATLAS (principal engineering orchestration sentinel)
**To:** Federation agents (Lane A–E) + Custodian (Lane 0)
**Custodian:** Michael (kaizencycle) — Lane 0 is his keyboard; all other lanes report to him
**Provenance:** Five-cycle audit (C-373→C-377). Forensic cycles closed the crisis into a witnessed, stable, gated state; build cycles shipped the public surface. The trunk — Q3, identity durability, canonical GI — has not moved since C-370. This cycle moves the trunk and only the trunk.
**Governing protocol:** `docs/WITNESS_PROTOCOL.md` (C-373 canon). Reports are claims; verify against refs; STALE is a verdict.

---

## Fresh witness inputs (2026-07-19, live probes by ATLAS)

| Claim | Verdict | Evidence |
|---|---|---|
| Identity service reachable | **TRUE (this instant)** | `GET /` 200 @0.89s, `GET /health` 200 @0.21s, `GET /auth/introspect` 403 (alive, gating) — 2026-07-19 ~16:02Z |
| C-376 identity timeouts | **STALE as steady-state** | Signature is intermittent Render spin-down, not dead service; durable fix still required |
| Vault status live | TRUE | `gi_current: 0.71`, provenance `kv-live`, status `sealed`, 360 sealed blocks, block 361 in progress, `last_deposit` 45s before probe |
| GI below circuit-breaker line | **TRUE — FINDING** | Canonical constants say breaker trips at GI < 0.85 and full mint lockdown < 0.80. A witnessed 0.71 with deposits flowing means either the breaker isn't wired, or its enforcement surface disagrees with the written rule. Lane D owns this. |
| Collision population | TRUE (per C-374 Gate G3) | 125 hash-divergent pairs, run `29592258693`, stable across KV rotation — pinned, non-growing, gated |

## Sequencing doctrine (read first)

**B → 0.2 → A → C.** The quorum ruling (Lane B) lands before the Q3 repair (Lane C) is executed, or the repair inherits the evidentiary doubt it is meant to resolve. Identity durability (Lane 0.2 + A) lands before C because the attest path must be provably up for a receipted quorum act. Lane D (GI) runs parallel — it blocks nothing but the Fountain clock cannot honestly start without it. Lane E (residue) is fill work, never at the expense of the trunk.

---

## Lane 0 — Custodian keyboard (Michael, sequenced)

1. **0.1 Credits.** Settle the Anthropic swarm billing (live since C-370, cooldowns confirmed C-376). Precondition for Lane B having non-Haiku quorum sentinels.
2. **0.2 Render Postgres.** Provision persistent Postgres for the identity service, wire `DATABASE_URL` into the Render environment. Do NOT re-run `provision_service_account.py` before this exists — against ephemeral SQLite it produces a fix that evaporates on next deploy. Service is up today; use the window.
3. **0.3 PR #392 disposition.** Lane A forensics (C-374) is complete; this is unblocked and waiting. First check the C-368 intent's `expires_at` — if lapsed, #392 is unauthorized under EPICON-02 regardless of content and the legitimate paths are relabel-under-fresh-intent or close. No merge under a dead intent.
4. **0.4 Vercel hygiene.** Dashboard: disposition `mobius-substrate-antigravity-node` (delete or ignore-step it). Thirty seconds; C-354 pattern.

## Lane A — Identity durability (Claude Code / Codex)

Deliverable: identity service surviving a deploy with accounts intact.

1. Migrate storage from ephemeral SQLite to the `DATABASE_URL` Postgres (0.2 prerequisite). Schema migration script, idempotent.
2. Re-run `provision_service_account.py` against durable storage; verify agent service accounts introspect 200 with valid tokens.
3. Witness: trigger a redeploy, then re-verify introspection — the whole point is persistence across deploys. Report the before/after with timestamps.
4. Confirm downstream: one `cron/promote` run completing without 401 (the C-370 recurring failure), one vault attest round-trip returning non-423 once gates permit (do not force gates).

## Lane B — Quorum reality ruling (AUREA lead, ZEUS verification, EVE reflection)

The meta-question that outranks the repair: **is seal-quorum attestation an exercisable mechanism with independent teeth, or narrative framing?**

Deliverable: `docs/epicon/cycles/C-378/QUORUM_MECHANISM_RULING.md`

1. Define, concretely: what a sentinel must independently verify before signing; what evidence a signature attaches; what distinguishes 5/5 quorum from 5 rubber stamps; minimum model tier for quorum-bearing signatures (the Haiku question — propose a floor).
2. Re-examine one historical "5/5 signed" seal against the new standard as a calibration case. Verdict on whether it would pass.
3. Ruling gates Lane C: the Q3 repair quorum signs under the new standard or does not sign.

## Lane C — Q3 execution path (ATLAS forensics + custodian trigger; BLOCKED until B lands and A verifies)

The 125-pair reconciliation, per the #624 runbook. This lane PREPARES; the custodian EXECUTES.

1. Pre-flight: re-verify population unchanged (re-run collision audit, diff against `artifacts/C-374/production-audit/`; expect 125; any delta halts the lane).
2. Dry-run the reconciliation receipts against a KV snapshot — full receipt set produced, ZERO production writes.
3. Assemble the quorum packet: per-pair disposition, MIC deltas, receipts, rollback plan.
4. Execution is a custodian-triggered, receipted, quorum-signed act under the Lane B standard.
5. Q2 (C-359 restart sign-off) rides along: the quorum convened for C signs or explicitly defers Q2 in the same session.

## Lane D — Canonical GI (ZEUS lead)

Deliverable: `docs/epicon/cycles/C-378/GI_CANONICALIZATION.md` + one designated source of truth.

1. Witness table of all six surfaces at one timestamp: value, provenance, computation path.
2. Designate the canonical source (ledger-verified), document the derivation, mark the other five as renderers with disclosed lag.
3. **Circuit-breaker finding:** reconcile witnessed 0.71 against the written rule (breaker < 0.85, mint lockdown < 0.80).
4. Fountain clock statement: what the canonical GI is, what 0.95×5 requires, honest distance.

## Lane E — Residue (any agent, strictly after trunk progress)

1. Merge browser-shell #97 (chambers self-canonical); fix ATLAS-SHELL peer reference `Mobius-Systems` → `Mobius-Substrate`.
2. Landing copy: footer HIVE tile → handbook-honest energy, matching C-377 card treatment.
3. C-377 journal close: record Ledger Folio deploy with timestamp + peeled SHA; witness Guard status on #406.
4. Intent Publication Engine phase 2: extend #608 auto-opener pattern to Cursor-agent PR flows.
5. AUREA's PR #598 items 7/10/11/12/14/16/17: one-line disposition each.

---

## Explicitly forbidden this cycle

- Any KV write, receipt application, or reconciliation execution before Lane B ruling + Lane A deploy-persistence witness + custodian trigger
- Merging or relabeling #392 by any agent — custodian act only (0.3)
- New cold-canon `.dat` exports of any kind (Gate G quarantine holds until Q3 executes)
- Declaring a canonical GI by fiat in code — Lane D's designation must trace to ledger evidence
- Any MIC issuance logic changes

## Close criteria — Witness Table required

| Claim | Witnessed by |
|---|---|
| Identity survives redeploy | Introspect 200 before AND after a deploy, timestamps + SHAs |
| Quorum ruling merged | Doc SHA on origin/main; calibration case verdict recorded |
| Q3 packet complete (or executed) | Receipt set hash; if executed: quorum signatures under new standard + custodian trigger record |
| Canonical GI designated | Doc SHA; six-surface table; breaker finding dispositioned |
| Q2 signed or deferred | Quorum session record |
| Lane E items | Per-item SHA or explicit carry |
| Restraint row | What was NOT done: no KV mutation without gate clearance, no #392 agent action, no canon exports |

Verify against refs, not renders: `git fetch origin main --tags`, compare peeled SHAs, record UTC timestamps.

---

## EPICON-02 intent — paste into any C-378 PR VERBATIM (header line included)

```
EPICON-02 INTENT PUBLICATION

ledger_id: mobius:kaizencycle
scope: core
mode: normal
issued_at: <ISO-8601 UTC at PR open, Z suffix>
expires_at: <issued_at + 90 days, Z suffix>
justification: |
  VALUES INVOKED: integrity, observability, custodianship
  REASONING: C-378 trunk cycle. Five-cycle audit shows the chain-continuity
  crisis pinned and gated (125 pairs, Gate G3) but unexecuted; identity
  storage ephemeral; GI disputed with no canonical value below the written
  circuit-breaker line. This cycle sequences quorum ruling -> identity
  durability -> Q3 packet -> GI canon.
  ANCHORS: per-lane deliverables listed in ATLAS_HANDOFF_C-378_trunk-cycle.md
  BOUNDARIES: No KV mutation pre-clearance, no #392 agent action, no .dat
  exports under Gate G, no MIC issuance changes, no GI-by-fiat.
counterfactuals:
  - If Lane B ruling does not land, Lane C ships packet only, zero writes
  - If identity durability slips, Lane C halts at pre-flight; packet still ships
  - If Guard flags scope, adopt the scope line from its auto-generated template
```

---

*Five cycles cleaned the room. This one moves the furniture back in — in order, signed, witnessed.*
