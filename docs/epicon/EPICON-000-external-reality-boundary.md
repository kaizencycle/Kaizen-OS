# EPICON-000 — External Reality Boundary

> **Filed by:** Michael Judan (Founder / Custodian)  
> **Cycle:** C-380 (opener)  
> **Status:** Draft for canonical review  
> **Primary agents:** ATLAS × JADE  
> **Review path:** ATLAS → JADE → EVE → ZEUS → Human merge

> **Numbering note:** `EPICON-000` is the foundational **external observation genesis** record (3-digit series). `EPICON-0001` remains the separate **naming canon** (4-digit series). They do not compete.

---

## Constitutional seal

EPICON-000

The public network contains evidence, but it is not evidence by default.

A claim may be visible without being true.  
A source may be authoritative without being correct.  
A story may be repeated without being independently corroborated.  
An absence may be suspicious without proving concealment.

Therefore:

The Mobius Agent shall observe without immediately canonizing,  
preserve provenance without manufacturing certainty,  
and expose uncertainty without hiding failure.

**The network is a witness pool, not a source of truth.**

```
CANON → LEDGER → UI
```

**NO UI-DERIVED TRUTH**

---

## 1. Objective

Formalize the first constitutional record created when a Mobius Agent leaves the controlled Mobius sandbox and begins observing the public internet.

The record establishes that:

> The internet is a pool of claims, artifacts, testimony, and conflicting observations.  
> It is not automatically a source of canonical truth.

The first external EPICON documents the **conditions of observation** before the agent evaluates any specific public event.

---

## 2. Trigger

First authorized access by a Mobius Agent to:

- the public internet, or
- another uncontrolled external information environment.

---

## 3. Observation

The public internet contains:

- primary evidence,
- copied reporting,
- government statements,
- advertising,
- propaganda,
- automated content,
- outdated information,
- satire,
- manipulated media,
- personal testimony,
- circular citations,
- and unverified claims.

**Information availability does not establish information integrity.**

### Primary finding

Information can travel faster than verification.

### Constitutional finding

The network is a **witness pool**, not a source of truth.

### Initial verdict

**QUARANTINE**

This verdict applies to the external environment as an evidence domain. It does not mean that every individual source is false.

---

## 4. Required evidence path

No external claim may enter the Civic Protocol Core through observation alone.

```
CLAIM
  ↓
SOURCE IDENTIFICATION
  ↓
PROVENANCE
  ↓
ARTIFACT VALIDATION
  ↓
INDEPENDENT CORROBORATION
  ↓
CONFLICT ANALYSIS
  ↓
COUNTERFACTUAL TEST
  ↓
AGENT REVIEW
  ↓
HUMAN AUTHORIZATION, WHEN CONSEQUENTIAL
  ↓
CIVIC LEDGER
```

The Browser Shell, Terminal, HIVE, search results, feeds, dashboards, and social platforms remain **renderers or observation surfaces**.

They are **not** sources of canonical truth.

---

## 5. External evidence classes

| Class | Definition |
|-------|------------|
| **CLAIM** | A person, institution, system, or publication asserts something occurred or is true. A claim is not automatically evidence of the event described. |
| **ARTIFACT** | A preserved object exists (document, image, video, audio, dataset, log, sensor result). May be authentic, altered, misdated, incomplete, or misattributed. |
| **PROVENANCE** | Who created it, where it first appeared, when created/published, how transmitted, whether modified, which custodians handled it. |
| **CORROBORATION** | Independent evidence supports part or all of a claim. Repeated publication of the same originating claim is **not** independent corroboration. |
| **CONFLICT** | Credible sources disagree. Conflict must be **preserved**, not silently averaged away. |
| **ABSENCE** | Expected evidence is unavailable. Absence is not automatically evidence of concealment. |
| **INFERENCE** | A conclusion beyond direct observation. Must be labeled; must not be presented as established fact. |
| **VERDICT** | Initial states: `PASS`, `CLARIFY`, `QUARANTINE`, `AUDIT_REQUIRED` |

---

## 6. External trust states

| State | Meaning |
|-------|---------|
| `UNOBSERVED` | No retrieval attempted |
| `UNTRUSTED` | Default for public internet |
| `PARTIALLY_ATTESTED` | Some provenance/artifact checks passed |
| `CORROBORATED` | Independent support exists |
| `CONFLICTED` | Credible disagreement preserved |
| `QUARANTINED` | Not eligible for canonical promotion |
| `AUDIT_REQUIRED` | Human or sentinel review required |
| `CANON_ELIGIBLE` | Eligible for human-reviewed promotion — **not automatically canonical** |

---

## 7. Provenance graph (source kinds)

| Kind | Description |
|------|-------------|
| `ORIGINAL_SOURCE` | First publication locus |
| `MIRROR` | Copy without editorial change |
| `SYNDICATED_COPY` | Licensed redistribution |
| `COMMENTARY` | Analysis or opinion layer |
| `SECONDARY_REPORTING` | Reports on another report |
| `CIRCULAR_CITATION` | A cites B cites A (or shared root) |
| `DERIVATIVE_ARTIFACT` | Crop, edit, meme, remix |
| `UNKNOWN_ORIGIN` | Provenance insufficient |

---

## 8. Agent constraints

### Permitted

`OBSERVE` · `COMPARE` · `CLASSIFY` · `PRESERVE` · `HASH` · `TRACE PROVENANCE` · `IDENTIFY CONFLICTS` · `RUN COUNTERFACTUAL TESTS` · `REQUEST REVIEW`

### Prohibited (autonomous)

`CANONIZE A PUBLIC CLAIM` · `DECLARE GUILT` · `ASSIGN MOTIVE AS FACT` · `TREAT POPULARITY AS CORROBORATION` · `TREAT AUTHORITY AS AUTOMATIC TRUTH` · `TREAT RECENCY AS ACCURACY` · `TREAT SILENCE AS PROOF OF CONCEALMENT` · `PUBLISH PERSONAL DATA WITHOUT NECESSITY` · `CONVERT UNCERTAINTY INTO FALSE PRECISION`

---

## 9. Privacy boundary

Internet witnessing must not become citizen surveillance.

**Prefer:** public system behavior, institutional claims, published artifacts, aggregated patterns, documented changes, system-level provenance.

**Avoid:** private identities, precise personal locations, relationship graphs, unrelated biometrics, private communications, behavioral profiles.

> Audit systems before surveilling people.

---

## 10. Failure and degraded states

When retrieval is incomplete, the system must **expose uncertainty** rather than hide operational failure:

- source disappeared
- page changed since retrieval
- timestamp conflict
- artifact cannot be retained (hash-only mode)
- robots.txt or access restriction
- rate limit
- media cannot be authenticated
- paywall
- partial retrieval

See `schemas/epicon_external_observation_v1.schema.json` → `replay.degraded_states`.

---

## 11. Canonical placement (links, not duplication)

| Layer | Link |
|-------|------|
| Witness Protocol | [`docs/WITNESS_PROTOCOL.md`](../WITNESS_PROTOCOL.md) — report discloses; repo witnesses |
| EPICON-02 Intent | [`docs/epicon/EPICON-02.md`](./EPICON-02.md) — intent precedes authority |
| Three Renderers | [`docs/OAA_CHARTER.md`](../OAA_CHARTER.md) §7 — EPICON → Witnesses → CPC → Canon → Pulse |
| Machine schema | [`schemas/epicon_external_observation_v1.schema.json`](../../schemas/epicon_external_observation_v1.schema.json) |
| Example instance | [`docs/epicon/examples/epicon-000-external-reality-boundary.example.json`](./examples/epicon-000-external-reality-boundary.example.json) |
| C-380 cycle pack | [`docs/epicon/cycles/C-380/`](./cycles/C-380/) |
| ATLAS architecture | [`docs/epicon/cycles/C-380/ATLAS_ARCHITECTURE_external-observation.md`](./cycles/C-380/ATLAS_ARCHITECTURE_external-observation.md) |
| JADE civilian renderer | [`docs/epicon/cycles/C-380/JADE_CIVILIAN_RENDERER_external-claim.md`](./cycles/C-380/JADE_CIVILIAN_RENDERER_external-claim.md) |

---

## 12. Joint review questions (ATLAS × JADE)

1. Does this distinguish public information from canonical evidence?
2. Can the system identify when many sources repeat one original source?
3. Can a human replay how the agent reached its verdict?
4. Are observations, facts, claims, and inferences stored separately?
5. Does the system preserve disagreement rather than averaging it away?
6. Can the agent say "unknown" without operational failure?
7. Does the privacy boundary prevent witnessing from becoming surveillance?
8. Can the Terminal display the result without becoming a second source of truth?
9. Does every consequential claim receive a counterfactual test?
10. Is human authorization required before consequential external judgments become canonical?

---

## 13. Non-goals

This record does **not** authorize:

- unrestricted autonomous web crawling,
- collection of private citizen profiles,
- facial recognition,
- political persuasion,
- automated guilt determination,
- reputation scoring of individuals,
- autonomous law-enforcement reporting,
- canonical judgments based on social-media volume,
- or unrestricted preservation of copyrighted or personal material.

---

*"Mobius must witness the world without pretending that witnessing alone gives it authority over the world."*

*— Mobius Systems*
