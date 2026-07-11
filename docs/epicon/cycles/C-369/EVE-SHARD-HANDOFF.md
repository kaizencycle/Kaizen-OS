# ATLAS Handoff — EVE EPICON Sharding and Reserve Block Candidate Pipeline

**Cycle:** C-369 · **Status:** PROPOSED  
**Type:** Protocol + Documentation + Workflow  
**Primary repositories:** Mobius-Substrate, mobius-civic-ai-terminal  
**Depends on:** C-368 canon machine-readable layer (verified closed), EPICON Guard, Reserve Block export lane  
**Human authority:** Michael / kaizencycle  
**Primary agent:** EVE  
**Verification agents:** ATLAS, ZEUS, AUREA, JADE  
**Final authority:** Human-approved seal quorum

## Authority Provenance

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

## 1. Objective

Governed workflow: EVE scans related EPICON records → compresses ethical/civic meaning into a **proposed** Reserve Block shard → verification → human approval → quorum → seal → cold-canon export.

EVE must not seal, canonize, rewrite, or delete original records.

## 2. Architecture

```
GitHub / Terminal / CPC / Local DB
        → EPICON source discovery
        → source-status classification
        → EVE ethical shard compiler
        → Reserve Block candidate JSON
        → ATLAS / ZEUS / AUREA / JADE verification
        → human review
        → seal quorum
        → Civic Ledger attestation
        → Reserve Block inclusion
        → .dat cold-canon export (existing lane only)
```

## 3. Source-status model

```yaml
declared → repository_preserved → ledger_ingested → seal_candidate → sealed → cold_canon_exported
```

Unknown must remain unknown. No stage inferred from labels alone.

## 4. Schema

`docs/06-specifications/schemas/eve-reserve-shard.schema.json` (v0.1)

## 5. Protocol docs

- [EVE_SHARDING_PROTOCOL.md](../../04-TECHNICAL-ARCHITECTURE/epicon/EVE_SHARDING_PROTOCOL.md)
- [EVE_SHARD_SELECTION_POLICY.md](../../04-TECHNICAL-ARCHITECTURE/epicon/EVE_SHARD_SELECTION_POLICY.md)

## 6. Example shard

[examples/SHARD_C-368_EVE_001.yaml](./examples/SHARD_C-368_EVE_001.yaml) — `hold_for_evidence` for closed C-368

## 7. Proposed API (PR 3 — not in PR 1)

```
POST /api/epicon/shards/propose
GET  /api/epicon/shards/[id]
POST /api/epicon/shards/[id]/review
```

Response must never return `sealed: true` from generation alone.

## 8. Proposed file layout (full cycle)

**Substrate PR 1 (this PR):** doctrine, schema, cycle pack, example  
**Substrate PR 2:** `packages/eve-shard-core/` compiler  
**Terminal PR 3:** discovery adapters, proposal endpoints  
**PR 4:** ledger + quorum integration (after 1–3 verified)

## 9. Acceptance criteria (PR 1)

- [x] EVE sharding doctrine documented
- [x] Authority boundaries explicit
- [x] Source persistence states defined
- [x] Compression/omission policy documented
- [x] Seal recommendation advisory only
- [x] Privacy rules documented
- [x] C-368 example shard included
- [x] Versioned JSON schema with required uncertainty + human_review fields
- [ ] Runtime compiler (PR 2)
- [ ] Proposal endpoint (PR 3)

## 10. Validation (PR 2+)

```bash
generate-shard --cycle C-368 > shard-a.json
generate-shard --cycle C-368 > shard-b.json
sha256sum shard-a.json shard-b.json  # source_root_hash must match
```

## 11. Rollback

Docs/schema: revert PR. Runtime: disable proposal endpoint; preserve candidates as deprecated; never rewrite sealed Reserve Blocks.

## 12. Canonical statement

EPICON records. EVE remembers. The council verifies. The human approves. The Vault preserves.

---

*Full handoff archived in cycle opener and protocol docs. C-368 close anchor: [C-368-close.md](../C-368/C-368-close.md).*
