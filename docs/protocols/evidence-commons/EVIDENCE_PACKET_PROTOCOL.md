# Evidence Packet Protocol v0.1 (C-408)

**Cycle:** C-408  
**Status:** Draft protocol — broker-local v0.1 vertical slice  
**License:** CC0 / Public Domain

---

## Doctrine

Search discovers. Acquisition obtains. Hashing preserves. Cache remembers. EPICON explains. Agents interpret. Quorum independently verifies.

Evidence Packets represent **acquired source material and provenance**. They are distinct from ECHO Layer answer cache entries (`echo_layer_entries`), which cache high-GI heuristic outcomes.

## Record types

| Record | Purpose |
|--------|---------|
| `EvidencePacket` | Immutable acquired observation + provenance |
| `EvidenceReuseEvent` | Append-only consumer access lineage |
| `EvidencePacketVersion` | Successor linkage on refresh (original never mutated) |

## Claim classes

Observations may be `OBSERVED`, `REPORTED`, `CORROBORATED`, `DISPUTED`, `INFERRED`, `PREDICTED`, or `UNKNOWN`. HERMES candidates enter as `OBSERVED` / `PROVISIONAL` verification only.

## Cache decisions

| Decision | Meaning |
|----------|---------|
| `FRESH_HIT` | Equivalent fresh packet exists; reuse permitted |
| `STALE_ALLOWED` | Historical reuse only |
| `REVALIDATE` | Match exists but freshness window expired for current query |
| `NEW_ACQUISITION` | No exact match or material parameter difference |
| `LICENSE_DENIED` | Packet exists but reuse scope forbids payload |
| `INDEPENDENT_SOURCE_REQUIRED` | Corroboration cannot reuse same lineage |

## v0.1 limits

- Exact deterministic request-hash matching only (no semantic bypass).
- `MOCK_X402` acquisition only — no real wallet or x402 settlement.
- Single-flight locks are **in-process only** (not distributed).
- Terminal is renderer; Broker is protocol runtime; CPC anchoring deferred.

---

*"We heal as we walk." — Mobius Systems*
