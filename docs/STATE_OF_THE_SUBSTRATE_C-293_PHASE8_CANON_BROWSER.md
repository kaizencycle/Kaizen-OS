# State of the Substrate · C-293 Phase 8 Canon Browser

**Date:** 2026-04-26  
**Cycle:** C-293  
**Scope:** Substrate Canon Browser + Reserve Block Attestation Viewer  
**Status:** architecture history savepoint  

> This document records the C-293 Phase 8 architecture sweep and Canon Browser milestone.
> It is additive history, not a replacement for live runtime state.

---

## 1. Architecture sweep summary

A scan across the accessible `kaizencycle` repository set identified the active Mobius architecture spine:

| Repo | Role | Current interpretation |
|---|---|---|
| `mobius-civic-ai-terminal` | Operator terminal | Hot runtime surface for Vault, Sentinel, Canon Browser, GI, journal, replay, and rollback inspection. |
| `Mobius-Substrate` | Substrate canon | Cold truth layer for protocol specs, architecture history, mesh memory, and system constitution. |
| `Civic-Protocol-Core` | Civic ledger | Durable append-only civic event store and ledger anchor for signed/verified state. |
| `mobius-browser-shell` | Human shell | Citizen-facing shell/lab container that displays state but should not decide economics. |
| `OAA-API-Library` | Warm memory bridge | Sovereign memory and KV fallback lane for verified system continuity. |
| `lab4-proof` | Reflections API | Lab4 proof surface feeding memory/reflection events into ledgered civic state. |
| `lab6-proof` | Citizen Shield API | Shield proof surface for civic safety and privacy-preserving attestations. |
| `mobius-hive` / `hive` | HIVE world layer | Game/world expression layer that can consume and reflect canon state. |
| `epicon` | Intent/event canon | Standalone EPICON semantic/proof grammar surface. |
| `atlas-paw` | Sentinel home-base | ATLAS operating/changelog surface for agent watch and coordination. |

The spine is now:

```txt
Browser Shell / public surfaces
        ↓
Mobius Civic AI Terminal / hot operator truth
        ↓
Mobius-Substrate / cold canon + protocol memory
        ↓
Civic-Protocol-Core / durable ledger events
```

---

## 2. C-293 PR sequence captured

The Terminal advanced through the following C-293 phases:

| PR | Phase | Canon effect |
|---|---|---|
| #429 | Phase 3 — Agent Registry + Scope Cards | Agents gained explicit role/scope boundaries. |
| #430 | Phase 4 — Agent Signature Layer + atomic dedupe | Agents sign actions; dedupe prevents replay/spam. |
| #431 | Phase 5 — Replay / Rebuild Dry Run | Mobius can reconstruct remembered state without mutation. |
| #434 | Phase 6 — Incident + Rollback Protocol | Rollback requires proof, operator consent, and preserved incident history. |
| #435 | Phase 7 — Historical Reserve Block Back-Attestation | Historical attestations validate stored proof without rewriting live history. |
| #436 | Phase 8 — Substrate Canon Browser | Users can inspect Reserve Blocks, signatures, substrate pointers, and canon timeline. |

---

## 3. Phase 8 architecture

Phase 8 added a read-only Canon Browser layer to the Terminal.

### New Terminal components

```txt
lib/substrate/canon.ts
GET /api/substrate/canon
GET /api/substrate/canon?type=reserve_blocks
GET /api/substrate/canon?seal_id=<seal_id>
/terminal/canon
```

### Canon Browser responsibilities

The Canon Browser exposes historical proof without executing authority:

- Reserve Block history
- seal identity and hash-chain pointers
- GI/mode/cycle at seal
- Sentinel attestation state
- historical vs live signature visibility
- missing agents
- substrate attestation pointer
- canon timeline events
- incident-grade substrate errors where present

### Canon Browser non-responsibilities

The Canon Browser must not:

- mutate seals
- trigger agent signatures
- perform back-attestation
- trigger rollback
- unlock Fountain
- rewrite or reinterpret history

---

## 4. Reserve Block canon state

Reserve Blocks are 50 MIC reserve parcels.

Important rules:

1. A Reserve Block can complete before Fountain unlock.
2. Fountain remains locked until GI sustain rules pass.
3. Historical attestation validates stored proof only.
4. Historical attestation does not rewrite history.
5. Historical attestation does not pretend agents signed live at the time.
6. Historical attestation does not unlock Fountain by itself.
7. Completed non-attested blocks may await historical back-attestation.

Current conceptual Vault state at chamber handoff:

```txt
Blocks 1-3: finalized non-attested, awaiting historical back-attestation
Block 4: compat complete
Block 5: in progress
Reserve Block size: 50 MIC
```

---

## 5. Canon laws reinforced

The C-293 Phase 8 milestone reinforces these system laws:

- Quorum is signed agreement over one shared state.
- Agents do not merely speak; they attest.
- Signatures prevent impersonation.
- Atomic dedupe prevents replay/spam.
- Scope prevents authority drift.
- Replay lets Mobius remember.
- Rollback lets Mobius survive.
- Substrate canon exposes past EPICON, Journal, Reserve Blocks, incidents, signatures, and ledger proofs.
- No rollback without proof, operator consent, and preserved incident history.

---

## 6. Architecture implication

Mobius is not merely becoming a blockchain clone.

It is becoming a verifiable memory system for agentic infrastructure:

```txt
transactions alone      → blockchain-like ledger
transactions + context  → civic ledger
context + signatures    → proof of integrity
proof + replay          → recoverable memory
proof + canon browser   → inspectable truth
```

Phase 8 marks the point where Mobius can show users not only that something happened, but also:

- who attested to it
- whether they were authorized
- whether the proof was live or historical
- what hash chain it belongs to
- what substrate pointer preserves it
- whether an incident exists in the chain

---

## 7. Next recommended phases

### Phase 9 — Canon Replay Layer

Click a block and reconstruct:

- deposits
- hash order
- attestation order
- GI context at seal
- replay/rebuild dry-run result

### Phase 10 — Incident + Rollback Viewer

Expose:

- incident trigger
- rollback plan
- operator consent state
- preserved incident history
- post-rollback proof continuity

### Phase 11 — Public Canon

Expose a public, read-only proof surface:

- no private data
- no mutation
- only inspectable hashes, statuses, and attestations

---

## 8. Savepoint note

This document should be treated as the Substrate memory record for the C-293 Phase 8 handoff.

The Terminal contains the hot implementation.  
Mobius-Substrate preserves the architecture canon.  
Civic-Protocol-Core preserves ledger intent and durable event semantics.

We heal as we walk.
