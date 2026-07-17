# EVE Sharding Protocol — Reserve Block Candidate Pipeline

**Version:** 0.1 · **Cycle:** C-369 · **Status:** PROPOSED  
**Authority:** Michael / kaizencycle — Human-in-the-Loop  
**Primary agent:** EVE

## Canonical rule

EVE may compress EPICONs into ethical memory shards. She may recommend sealing, but she may **never** declare canon alone.

## Authority chain

```
EPICON declaration
  → repository record
  → ledger attestation
  → EVE shard proposal
  → verification (ATLAS, ZEUS, AUREA, JADE)
  → human approval
  → seal quorum
  → Reserve Block
  → cold-canon export (.dat)
```

No stage may be inferred from a later-looking label alone.

## Agent responsibilities

| Agent | Role |
|-------|------|
| **EVE** | Produces proposed ethical memory shard; identifies meaning, uncertainty, dissent |
| **ATLAS** | Verifies structural completeness and Cycle scope |
| **ZEUS** | Verifies truth claims, contradictions, evidence integrity |
| **AUREA** | Verifies strategic coherence and institutional implications |
| **JADE** | Verifies memory continuity and loss-aware compression |
| **Human** | Approves, clarifies, quarantines, or rejects before quorum |

## What EVE may do

- Scan a bounded Cycle or explicit EPICON set
- Classify source persistence status (`declared` → `repository_preserved` → `ledger_ingested` → `sealed` → `cold_canon_exported`)
- Compress consequential meaning into a candidate shard JSON
- Declare omissions explicitly
- Recommend seal tier (advisory only)

## What EVE must not do

- Seal, canonize, or write cold `.dat` files
- Modify source EPICONs
- Infer `ledger_ingested` from `ledger_id` alone
- Infer seal from merge or generation success
- Copy raw private evidence into public canon
- Omit dissent, failure, or uncertainty to simplify narrative
- Replace EPICON with MEC or SealCode

## Source-status model

Every source EPICON must carry or derive explicit persistence:

```yaml
declared: true
repository_preserved: true
ledger_ingested: false   # or unknown — never inferred
sealed: false
cold_canon_exported: false
```

## Pipeline states

`PROPOSED` · `NEEDS_EVIDENCE` · `CLARIFY` · `QUARANTINED` · `REJECTED` · `APPROVED_FOR_QUORUM` · `SEALED` · `EXPORT_PENDING` · `COLD_CANON_VERIFIED`

## Seal quorum (unchanged)

- ZEUS pass required
- ≥4 of 5 Seal Sentinels pass (ATLAS, ZEUS, EVE, JADE, AUREA)
- No non-ZEUS rejection

This protocol does not modify quorum mathematics.

## Schema

`docs/06-specifications/schemas/eve-reserve-shard.schema.json`

## Related

- [EVE Shard Selection Policy](./EVE_SHARD_SELECTION_POLICY.md)
- [Vault v2 Seal and Quorum](../protocols/VAULT_V2_SEALED_RESERVE.md)
- [C-368 Close](../../epicon/cycles/C-368/C-368-close.md)
- [Canonical Definitions](../../00-START-HERE/CANONICAL_DEFINITIONS.md)

## Compact doctrine

EPICON records. EVE remembers. The council verifies. The human approves. The Vault preserves.
