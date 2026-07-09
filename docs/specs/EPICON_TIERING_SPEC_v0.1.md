# EPICON Tiering Specification

**Version:** 0.1 (Draft)
**Status:** PROPOSED — requires seal quorum (ATLAS, ZEUS, EVE, JADE, AUREA)
**Cycle:** C-366
**Authority:** Michael (kaizencycle) — Custodian / Human-in-the-Loop
**License:** CC0 Public Domain
**Classification:** Constitutional Runtime Context

---

## EPICON INTENT BLOCK

```
EPICON-C366-TIERING-001
Type: CONSTITUTIONAL_DOCUMENT
Intent: Canonize graduated EPICON tiers (EP-1/EP-2/EP-3) as a pre-execution
        constitutional gate — policy-classified, reconstructable, fail-closed
        for consequential actions.
Authorized by: Michael / kaizencycle
Witnesses: ATLAS (drafting)
Timestamp: C-366
```

---

## EPICON Provenance Header

```yaml
EPICON-Version: 1.0
Document-Type: specification
Document-ID: SPEC-EPICON-TIERING-001
Created: 2026-07-08T00:00:00Z
Authors:
  - handle: kaizencycle
    role: principal-architect
  - handle: MobiusATLAS
    role: drafting-sentinel

Claim-Type: interpretation
Confidence: high
Falsifiable: "This specification fails if tier classification can be gamed by
  the acting agent, if EP-3 actions execute without valid attestation, or if
  the constitutional/operational split leaks regulated data to the shared layer."

License: CC0-1.0
```

---

## 1. Purpose

EPICON is the Mobius constitutional principle that **no consequential action
may occur without recorded intent**. This specification defines:

1. Three graduated tiers of EPICON requirement (EP-1, EP-2, EP-3)
2. Policy-based tier classification, separated from the acting agent
3. The distinction between **operational** and **constitutional** EPICONs
4. Reconstructability semantics ("replay") for non-deterministic actors
5. Fail-open / fail-closed behavior per tier
6. Quarantine semantics for denied or unverifiable actions

EPICON is a **precondition gate**, not an audit log written after the fact.
The gate is graduated: the more consequential the action, the stronger the
EPICON requirement. If the required tier cannot be generated and validated,
the action MUST NOT execute.

> Mobius is not the actor. Mobius is the constitutional witness.
> Decision-making remains with humans and authorized AI systems.
> EPICON records, gates, and attests — it does not decide.

## 2. Namespace Disambiguation

This document introduces **EPICON tiers**, notated `EP-1`, `EP-2`, `EP-3`.

| Namespace | Notation | Meaning | Defined in |
|---|---|---|---|
| DVA tiers | T1 / T2 / T3 | Agent roles (Substrate / Sentinel Council / Stabilizers) | `DVA_RUNTIME.md` |
| EPICON tiers | EP-1 / EP-2 / EP-3 | Action consequence classes | this document |
| EPICON-Lite | — | Voluntary discourse footer format | `EPICON-LITE.md` |

The bare terms "Tier 1/2/3" MUST NOT be used unqualified in canon documents
where both namespaces are in scope.

## 3. Definitions

**Action** — any operation proposed by an actor (human, sentinel, external AI,
or automated process) that would be executed against an execution surface
(API, database, ledger, robot, financial rail, physical system).

**Consequential action** — an action that changes the state of a system,
transfers value, affects a person's rights, safety, health, or property, or
modifies the physical world. Consequence is determined by **policy
classification** (§5), never by the acting agent's self-assessment.

**Operational EPICON** — the full pre-execution record, held **locally** by
the organization or node that owns the action. May contain sensitive or
regulated data. Never required to leave local custody.

**Constitutional EPICON** — a compact, fixed-schema commitment derived from
the operational EPICON, suitable for submission to the Mobius ledger. Contains
hashes, fingerprints, policy outcomes, and attestations — **references to
evidence, not the evidence itself**.

**Reconstructability** — the property that an authorized verifier can, from
the operational EPICON, re-derive the evidence chain and integrity hashes of a
past action. This is deliberately weaker than *reproducibility* (§7).

## 4. Tier Definitions

### EP-1 — Low-Risk Record

Actions with negligible external consequence. Read-oriented or trivially
reversible.

- Examples: document summarization, read-only queries, cache refreshes,
  internal draft generation, non-canonical journaling.
- Requirement: minimal EPICON (actor, intent, timestamp, input hash).
- May be generated asynchronously (backfill permitted, §8).
- No attestation required. Local retention only, unless policy elevates.

### EP-2 — Meaningful State Change

Actions that mutate operational state but do not directly affect people,
value, rights, safety, or irreversible system state.

- Examples: writing non-canonical records, deploying to staging, modifying
  configuration, scheduling jobs, opening PRs, updating world-state (HIVE).
- Requirement: full operational EPICON (all fields, §6) generated and
  validated **before** execution.
- Single-attestor validation: any authorized validator (policy engine, DVA
  node, or sentinel) may validate. No quorum required.

### EP-3 — Consequential Action

Actions affecting people, value, rights, safety, infrastructure, or
irreversible system state.

- Examples: transferring funds, deleting or altering records of legal
  significance, deploying to production canon, approving or denying benefits,
  medical or civic determinations, controlling physical actuators, minting
  MIC, sealing Reserve Blocks, amending canon.
- Requirement: full operational EPICON **plus** a constitutional EPICON
  commitment (§9) generated before execution.
- Validation: policy-defined attestation. Within Mobius canon operations this
  is the seal quorum (ATLAS, ZEUS, EVE, JADE, AUREA); external deployments
  define their own authorized attestor set, which MUST be independent of the
  acting agent.
- Human-in-the-loop: required where policy, law, or deployment context
  demands it. Where no human is in the loop, the EP-3 EPICON is the mandatory
  witness substituting for human observation — this is EPICON's primary
  purpose in autonomous-agent environments.

### Tier Criteria Table

| Criterion | EP-1 | EP-2 | EP-3 |
|---|---|---|---|
| Affects a person's rights/safety/health | never | never | yes |
| Transfers or destroys value | never | never | yes |
| Irreversible or physical-world effect | never | never | yes |
| Mutates canonical/ledger state | never | no | yes |
| Mutates operational state | no | yes | — |
| Read-only / reversible-trivially | yes | — | — |
| EPICON timing | may backfill | pre-execution | pre-execution |
| Validation | none | single attestor | attestor set / quorum |
| Constitutional EPICON | no | optional | mandatory |
| Failure mode (§8) | fail-open | quarantine | fail-closed |

## 5. Tier Classification Is Itself Governed

**Rule 5.1 — Separation.** The acting agent MUST NOT classify its own action.
Tier assignment is performed by the policy layer using declarative rules
(action-type registries, allowlists, and matchers) evaluated by a component
independent of the proposer.

**Rule 5.2 — Deny-by-default.** Any action type not present in the policy
registry is classified EP-3 until explicitly registered at a lower tier.
Unknown ≠ harmless.

**Rule 5.3 — Monotonic escalation.** Any authorized party (human, sentinel,
validator, policy engine) may escalate a classification upward at any time.
De-escalation requires a policy amendment, which is itself an EP-3 action.

**Rule 5.4 — Misclassification is an EP-3 violation.** Executing an action
under a tier lower than policy requires is a constitutional violation,
recorded on the ledger, and feeds the responsible agent's MII penalty path.
This closes the Goodhart surface: an agent gains nothing by arguing its
action was "just EP-1."

**Rule 5.5 — Compound actions.** A batch or workflow inherits the tier of its
highest-tier member.

## 6. Operational EPICON — Required Fields

All fields required for EP-2/EP-3; starred fields (\*) only for EP-1.

```yaml
epicon:
  id:                # UUIDv7 *
  tier:              # EP-1 | EP-2 | EP-3 (policy-assigned, with rule ID)
  policy_rule_id:    # which registry rule produced the classification
  actor:             # human civic_id | agent id (e.g. sentinel) *
  proposer_model:    # model id + version + parameters, if AI-proposed
  intent:            # declared purpose *
  evidence:          # list of evidence refs, each with content hash
  inputs_hash:       # SHA-256 over canonical serialization of all inputs *
  confidence:        # proposer-declared, [0,1]
  constraints:       # active policy constraints at decision time
  authority:         # authorization chain (who/what empowered this actor)
  expected_outcome:  # declared expected effect
  timestamp:         # RFC 3339, decision time *
  reconstruction_fingerprint:  # see §7
  ttl:               # validity window; execution after expiry = re-gate
```

Operational EPICONs are stored in the local EPICON store of the owning
organization or node. They MAY contain regulated data (PHI, PII, financial,
classified). They are never required on the shared ledger.

## 7. Reconstructability, Not Reproducibility

Hosted LLMs are non-deterministic and version-drift over time. A bitwise
re-derivation of a past model decision is **not guaranteed and not promised**.
EPICON therefore defines "replay" as **evidence replay**:

The `reconstruction_fingerprint` is:

```
SHA-256(
  inputs_hash ||
  evidence_merkle_root ||
  proposer_model_id ||
  recorded_output_hash ||
  constraints_hash ||
  timestamp
)
```

A verifier confirms that:

1. the recorded inputs and evidence hash to the committed values,
2. the recorded output is the output that was executed,
3. the policy constraints in force at decision time were satisfied,
4. the hash chain from EPICON → attestation → execution receipt is intact.

The verifier does **not** re-run the model and expect an identical answer.
Canon language MUST use *reconstructable*, never *reproducible*, when
describing EPICON replay guarantees. A future amendment MAY define a stronger
`deterministic_replay: true` mode for actors that support pinned seeds and
frozen weights (local models, rule engines), but it is opt-in per actor.

## 8. Failure Modes: Fail-Open / Fail-Closed / Quarantine

The EPICON layer sits in the execution path. Its availability policy must be
explicit, or the gate either becomes decorative (silent fail-open everywhere)
or a single point of failure (silent fail-closed everywhere).

| Condition | EP-1 | EP-2 | EP-3 |
|---|---|---|---|
| EPICON store unavailable | execute; backfill EPICON when store recovers | quarantine | **deny** |
| EPICON generated but validation unavailable | execute; flag for retro-validation | quarantine | **deny** |
| EPICON generation fails (missing fields) | execute; log deficiency | quarantine | **deny** |
| Tier classification unavailable | treat as EP-3 → **deny** | — | — |

**Rule 8.1 — EP-3 always fails closed.** No availability incident, retry
exhaustion, or operator convenience overrides this. If the constitutional
witness cannot exist, the consequential action does not exist.

**Rule 8.2 — Backfill honesty.** EP-1 backfilled EPICONs MUST be marked
`backfilled: true` with both the action timestamp and the record timestamp.
Backfilled records claiming pre-execution generation are a constitutional
violation (Rule 5.4 applies).

**Rule 8.3 — Quarantine is append-only.** Denied and quarantined action
attempts are written to an append-only quarantine store using the same
hash-chain discipline as the ledger (`MOBIUS_RESERVE_BLOCK_DAT.md` format
family). Attempted-but-denied actions are constitutionally significant
evidence and MUST NOT be silently discarded or deletable. Quarantined items
resolve to exactly one of: `retry`, `escalate`, `human_review`, `expire` —
each resolution is itself recorded.

**Rule 8.4 — Watchdog.** EPICON-layer availability is monitored by the same
writer-health-watchdog pattern used for cycle.json drift; sustained EP-3
denial due to layer unavailability is an operational incident, not a normal
state.

## 9. Constitutional EPICON — Commitment Structure

For every EP-3 action (and EP-2 where policy elects), a constitutional EPICON
is derived from the operational EPICON **before execution**:

```yaml
constitutional_epicon:
  id:                        # matches operational epicon id
  tier:                      # EP-2 | EP-3
  policy_rule_id:
  operational_merkle_root:   # Merkle root over canonical field encoding
                             # of the operational EPICON (§9.1)
  reconstruction_fingerprint:
  actor_commitment:          # H(actor_id) or civic_id shard ref — no raw PII
  policy_outcome:            # PASS | PASS_WITH_CONDITIONS
  attestations:              # signatures of the authorized attestor set
  timestamp:
  mec_citation:              # optional; MEC-grammar reference when the
                             # action binds to sealed canon, e.g.
                             # E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064
```

**9.1 Selective disclosure.** The `operational_merkle_root` is computed over
a canonical per-field encoding (field-name || salt || value leaves). This lets
the owning organization later disclose *individual fields* — e.g. `intent`,
`confidence`, `constraints` — with Merkle inclusion proofs, to an auditor or
dispute process, without opening patient records, transactions, or classified
evidence. Salts live in the operational store. This provides a clean upgrade
path to ZK proofs of policy compliance in a later version without changing
the ledger-side schema.

**9.2 Ledger integration.** Constitutional EPICONs are fixed-schema blocks
compatible with the `.dat` cold-canon append-only format (magic bytes family
`MOBIUS01`), chained by SHA-256, and citable via MEC grammar. Mobius holds
custody of the constitutional proof; the organization retains custody of the
operational truth.

**9.3 Validation authority.** "Replay" (reconstruction verification, §7) may
be performed by a human operator, an authorized auditor, another AI acting
under policy, or an automated compliance process. The constitutional
requirement is **authorization**, not human button-pressing. The attestor set
for EP-3 MUST be disjoint from the proposing actor.

JSON Schema: [`schemas/epicon_constitutional_v1.schema.json`](../../schemas/epicon_constitutional_v1.schema.json)

## 10. Liability Posture

EPICON records the decision chain; it does not make decisions. A constitutional
EPICON establishes: who requested, which actor proposed, what evidence was
used, what confidence was declared, under what authority, and why execution
was permitted. Mobius's role is bounded to gating and witnessing. The flight
recorder does not fly the plane — but under this specification, no recorder
means no flight.

## 11. Open Questions (v0.2 candidates)

1. TTL defaults per tier and re-gate semantics on expiry.
2. Cross-org attestation federation (constitutional EPICONs referencing
   EPICONs in another organization's local store).
3. `deterministic_replay` opt-in mode for pinned local models.
4. GI coupling: whether sustained EP-3 misclassification events (Rule 5.4)
   should feed the functional-domain GI input in `DVA_RUNTIME` scoring.
5. Rate/aggregation rules: when many EP-1 actions compose into an EP-3-scale
   effect (slow-drip value transfer), what aggregate matcher catches it.

---

*If the assistant cannot make an EPICON, the action should not be made.*
