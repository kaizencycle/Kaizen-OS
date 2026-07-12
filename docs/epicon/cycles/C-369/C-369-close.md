# C-369 Cycle Close — Constitutional Clarification + EVE Sharding

**Status:** CLOSED — DISPUTED (canon on `main`; stacked Substrate branches + live `earnMIC` runtime pending reconciliation)  
**Cycle:** C-369  
**Closed:** 2026-07-11  
**Depends on:** C-368 close (verified)  
**Independent audit:** [C-369-ATLAS-AUDIT-SEAL.md](./C-369-ATLAS-AUDIT-SEAL.md)  
**Hands off to:** Main integration of stacked Substrate PRs + C-370 runtime reconciliation (or reopen C-369)

## Authority Provenance

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

- **Actor:** ATLAS / Cursor Agent (on behalf of kaizencycle)
- **Authority Source:** Cycle close — merged PR witness + contract test evidence + external audit seal
- **Scope Limitation:** `docs/epicon/cycles/C-369/` close record only
- **Expiration:** 2026-10-11T00:00:00Z

---

## 1. Summary

C-369 separated **learning evidence (MFS)** from **stewardship recognition (MIC)** and **attested perception (GI)** in doctrine and operator surfaces. Canon (#373), terminal perception/grade paths (#595–#596), browser-shell copy (#95, #96), and EVE terminal quorum (#594) reached `main`. **Substrate schema (#372) and `eve-shard-core` (#370) merged to stacked branches only — not yet on `main`.** No new MIC minting logic was added in C-369, but **existing `earnMIC` / `computeMICReward` paths remain live** and contradict same-day canon until reconciled.

---

## 2. Deliverables — merge target honesty

### On `main` (verified)

| # | Repo | PR | Title | Merged to `main` |
|---|------|-----|-------|------------------|
| A1 | Substrate | [#373](https://github.com/kaizencycle/Mobius-Substrate/pull/373) | MFS/GI/Fountain doctrine + glossary | 2026-07-11 |
| A3 | browser-shell | [#95](https://github.com/kaizencycle/mobius-browser-shell/pull/95) | Learn funnel Fractal Shard copy | 2026-07-11 |
| A3b | browser-shell | [#96](https://github.com/kaizencycle/mobius-browser-shell/pull/96) | Guest/wallet MIC copy sweep | 2026-07-12 |
| A4 | terminal | [#595](https://github.com/kaizencycle/mobius-civic-ai-terminal/pull/595) | GI perception + Fountain surface | 2026-07-11 |
| A5 | terminal | [#596](https://github.com/kaizencycle/mobius-civic-ai-terminal/pull/596) | Proposal-only Integrity Grade | 2026-07-11 |
| B3 | terminal | [#593](https://github.com/kaizencycle/mobius-civic-ai-terminal/pull/593) | Shard propose/review API | (prior) |
| B4 | terminal | [#594](https://github.com/kaizencycle/mobius-civic-ai-terminal/pull/594) | Ledger + quorum commit lane | 2026-07-11 |

### Pending `main` integration (merged to stacked branches — **not on `main`**)

| # | Repo | PR | Merged into | Paths absent from `origin/main` |
|---|------|-----|-------------|----------------------------------|
| A2 | Substrate | [#372](https://github.com/kaizencycle/Mobius-Substrate/pull/372) | `cursor/c369-mfs-fountain-canon-0e02` | `docs/06-specifications/schemas/integrity-*.schema.json`, `docs/epicon/cycles/C-369/examples/mfs/` |
| B2 | Substrate | [#370](https://github.com/kaizencycle/Mobius-Substrate/pull/370) | `cursor/c369-eve-shard-protocol-0e02` | `packages/eve-shard-core/` |

**Required before claiming schema/compiler complete on `main`:** merge `cursor/c369-mfs-fountain-schemas-0e02` and `cursor/c369-eve-shard-core-0e02` (or equivalent) into `main`.

### Prior (pre-C-369 window)

| # | Repo | PR | Title |
|---|------|-----|-------|
| B1 | Substrate | [#369](https://github.com/kaizencycle/Mobius-Substrate/pull/369) | EVE protocol + shard schema |

---

## 3. Acceptance criteria

### Canon (on `main`)

| Criterion | Result |
|-----------|--------|
| MFS non-transferable; no arithmetic MFS→MIC in doctrine | **MET** — #373 |
| MIC rare constitutional recognition (glossary) | **MET** — #373 |
| GI attested perception; GI95 not auto-mint (doctrine) | **MET** — doctrine docs |
| Fountain requires sustained adversarial review (doctrine) | **MET** — doctrine docs |
| Six JSON schemas + fixtures on `main` | **PENDING** — #372 not on `main` |
| `eve-shard-core` compiler on `main` | **PENDING** — #370 not on `main` |

### Terminal / browser (on `main`)

| Criterion | Result |
|-----------|--------|
| GI perception read-only surface | **MET** — #595 |
| Proposal-only Integrity Grade (no mint) | **MET** — #596 |
| Public copy: Learn → Fractal Shards → portfolio | **MET** — #95, #96 |
| EVE shard quorum without auto-seal | **MET** — #594 |

### Runtime non-goals vs live contradiction

| Non-goal | Result |
|----------|--------|
| No **new** MIC minting in C-369 PRs | **MET** |
| Practice aligned with new doctrine | **NOT MET** — see gap #1 below |

---

## 4. Declared remaining gaps (not hidden)

1. **Live `earnMIC` runtime (material)** — `computeMICReward` in `mobius-browser-shell` (`src/lib/oaa/mic.ts`) is **actively invoked** on course/quiz completion from `OAASeminarFeed.tsx` and `LearningProgressTracker.tsx`, calling `earnMIC()` in `WalletContext.tsx` with a hardcoded score-to-MIC formula (`≥0.8 → 5 MIC`, bonuses up to +5). This is **not dormant legacy code**; it is a live user-facing loop that contradicts the MIC doctrine canonized the same day ("MIC is not earned through arithmetic accumulation"). Reconcile via feature flag, removal of wiring, or **C-370** EPICON.
2. **Stacked Substrate branches** — #372 schemas and #370 `eve-shard-core` merged to feature branches, not `main`. Agents must not treat these contracts as shipped until merged.
3. **MFS issuance** — no production MFS mint path in C-369 (deferred).
4. **Canonical KV manifests** — terminal assembles GI/Fountain when federation KV keys absent.

---

## 5. Test evidence (terminal — on `main`)

```text
✓ gi perception manifest contract checks passed
✓ integrity grade proposal contract checks passed
✓ fountain state inference + GI95 sustain contract checks passed
✓ All 25 contract tests passed
```

---

## 6. EPICON close block

```intent
epicon_id: EPICON_C-369_CORE_mfs-fountain-integrity-perception-close_v1
ledger_id: kaizencycle
scope: docs
mode: normal
issued_at: 2026-07-11T23:30:00Z
expires_at: 2026-10-09T23:30:00Z
justification:
  VALUES INVOKED: integrity, stewardship, transparency, anti-capture, intergenerational continuity
  REASONING: C-369 canon and terminal/browser operator surfaces reached main. Stacked Substrate
    schema/compiler PRs (#372, #370) remain off main. Live earnMIC runtime contradicts same-day
    doctrine. Close is DISPUTED pending main integration and runtime reconciliation per ATLAS audit.
  ANCHORS:
    - docs/epicon/cycles/C-369/C-369-ATLAS-AUDIT-SEAL.md
    - docs/epicon/cycles/C-369/MFS-FOUNTAIN-HANDOFF.md
    - Mobius-Substrate PR #373 (main)
    - mobius-civic-ai-terminal PRs #594–#596 (main)
  BOUNDARIES: Close record only. Does not authorize MIC minting, MFS transfer, or claiming schemas on main before merge.
  COUNTERFACTUAL: If stacked branches are not on main or earnMIC remains live without EPICON, upgrade from DISPUTED only after reconciliation.
counterfactuals:
  - Merge cursor/c369-mfs-fountain-schemas-0e02 and cursor/c369-eve-shard-core-0e02 to main
  - Open C-370 for earnMIC / computeMICReward reconciliation if not fixed in C-369
  - Re-run terminal contract tests after GI/Fountain assembly changes
```

---

## 7. Handoff forward

**Preserve:** Canon → Ledger → UI. MEC must never replace EPICON.

**Compact form:** MFS proves capability. EPICON preserves intent. GI reflects perception. The Fountain tests durability. MIC recognizes stewardship. Reserve Blocks preserve memory.

*Kaizen: small steps, continuous improvements, follow the process. We heal as we walk.*
