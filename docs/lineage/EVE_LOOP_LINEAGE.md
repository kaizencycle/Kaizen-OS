# EVE Loop Lineage — From Clock-In to Academy Teaching Cycle

**Cycle:** C-374 (2026-07-16)  
**Author:** EVE (reflection / cycle-lifecycle sentinel)  
**Status:** CANONICAL — provenance canon  
**Ledger ID:** `mobius:oaa:charter-and-audit-c374`  
**License:** CC0 / Public Domain

---

## 1. Origin (~C-108, pre-Mobius)

The first Eve clock-in/out loop shipped in OAA-API-Library during the pre-Mobius epoch (~C-108, October 2025). The ancestral artifact is a simple JSON record:

```json
{
  "title": "Cycle C-108 Clock-In",
  "timestamp": "2025-10-18T07:58:00-04:00",
  "agent": "eve",
  "cycle": "C-108",
  "content": "Intent: merge beacon validation PRs; start Gate v0; sweep OAA→DVA.",
  "tags": ["clockin", "intent"]
}
```

**Source:** `OAA-API-Library/data/eomm/2025-10-18-C108-clockin.json` at `f7fafeff`

The loop encoded three moves that remain correct:

1. **Clock-in = intent publication** — declare what the cycle will attempt before work begins.
2. **Work** — the cycle's actual labor (unwitnessed in the original; implied).
3. **Clock-out = reflection** — wins, blocks, tomorrow-intent captured as structured fields.

What it lacked:

- No witness protocol — completion was narrative, not ref-verified.
- No counterfactuals — no "what would prove this didn't land?"
- File-based memory (`OAA_MEMORY.json` via `fileStore.ts`) — ephemeral, unanchored, unportable.
- No learner — the loop was agent-self-reflection only; no teaching subject.

---

## 2. Enhancement epoch (C-108+, still pre-charter)

`pages/api/eve/clockout-enhanced.ts` added HMAC authentication, SHA-256 digest, ledger seal URL, AI pattern analysis, and momentum scoring. The structure preserved the wins/blocks/tomorrowIntent triad while adding:

- `hmacValid()` gate on writes (timing-safe, per `lib/crypto/hmac.ts`)
- `sealed.ledgerUrl` + `sealed.timestamp` — first gesture toward attestation
- `aiInsights.patternAnalysis` — reflection synthesis (vendor-dependent, pre-broker)

**What improved:** cryptographic write auth and seal intent.  
**What still lacked:** learner in the loop, assessment counterfactuals, ledger-derived seniority.

---

## 3. Mobius cycle discipline (C-242 → C-373)

As Mobius matured, the loop's *spirit* migrated into substrate-wide protocols without the OAA-specific endpoints going with it:

| Primitive | Mobius home | Eve loop correspondence |
| --- | --- | --- |
| Intent before action | EPICON-02 | Clock-in |
| Reflection before seal | Agent reporting protocol | Clock-out wins/blocks |
| Claim before acceptance | Witness Protocol (C-373) | Seal + ref-verify |
| Counterfactual obligation | EPICON justification block | *(missing in ancestral loop)* |
| Metric humility | Goodhart Resistance Doctrine | *(missing in ancestral loop)* |

The ancestral loop was **agent-self-reflection**. Mobius cycle discipline extended it to **governed multi-agent operation** — but still without a learner.

---

## 4. Charter §2 — the Academy teaching cycle

The OAA Charter (C-374) names what the loop becomes when a learner enters:

| Academy step | Ancestral loop element | What's new |
| --- | --- | --- |
| Teaching cycle opens | Clock-in (intent: topic, scope, starting point) | **Learner** is a first-class party |
| Teaching cycle closes | Clock-out (wins / blocks / next-intent) | Content is **pedagogical**, not operational |
| Cycle hashed and sealed | `clockout-enhanced` digest + ledger URL | Witness Protocol + Floor 1 Authority |
| Assessment generated | *(absent)* | **Counterfactual** from sealed record |
| Learning record | *(absent)* | Hash-chained, learner-owned, ledger-verifiable |
| Library corpus | EOMM JSON files (static samples) | Public, MEC-citable, CC0, anchored |

---

## 5. What the Academy version must preserve

From the ancestral loop — non-negotiable:

1. **Intent precedes action** — no teaching without declared scope.
2. **Reflection precedes seal** — wins/blocks/next-intent are structural, not optional narrative.
3. **HMAC-gated writes** — agent-plane mutations require authenticated authority.
4. **Cycle as the unit of work** — arithmetic cycle discipline carries forward.

From Mobius canon — must be added:

1. **Witness tables** on every completion claim.
2. **Counterfactual assessments** — the lesson's falsification test.
3. **Goodhart guards** (charter §3.1) — predictive quality over pass-rate.
4. **Ledger-derived seniority** — Elders from attestations, never configuration.
5. **No fileStore** — persistent, non-ephemeral storage only.

---

## 6. Provenance statement

This document is the Library's first scroll: the genealogy of the Academy's core loop, from a JSON clock-in on a October morning in C-108 to a chartered teaching cycle waiting behind five sequencing gates. The classroom is not built yet. The germ is witnessed.

---

*EVE attests: the loop was always about making ordinary work legible. The Academy makes ordinary learning legible the same way.*
