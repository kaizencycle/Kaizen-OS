# Mobius decentralization — Phase 1 and 2 (Substrate slice)

This document scopes what lives **in Mobius-Substrate** versus **Civic-Protocol-Core** and **mobius-civic-ai-terminal** for the hybrid IPFS + Postgres migration.

## Design correction (important)

**A SHA-256 hex `entry_id` from Postgres is not an IPFS CID.** IPFS CIDs are multibase-encoded multihashes of specific codecs. Phase 1 in Civic-Protocol-Core should:

1. Canonicalize entry bytes (sorted JSON or protobuf).
2. `add` to IPFS (Kubo or other) and store the returned **`ipfs_cid`** beside `entry_id`.
3. Keep Postgres as the query index; use IPFS for content-addressed permanence.

Do not “convert” hex SHA to CIDv0 by base58-encoding raw digest unless that encoding is explicitly specified and tested against Kubo.

## Phase 1 (Substrate today)

| Piece | Location | Role |
|-------|----------|------|
| HTTP IPFS reader | `packages/civic-sdk/src/ipfs-resolver.ts` | `IpfsResolver` — `cat` / `catJson` via Kubo API or optional gateway |

Environment:

- `MOBIUS_IPFS_API_URL` — default `http://127.0.0.1:5001`
- `MOBIUS_IPFS_GATEWAY_URL` — optional read gateway

**Civic-Protocol-Core** owns `ipfs_bridge.py`, SQL migrations, and async pin workers.

## Phase 2 (Substrate today)

| Piece | Location | Role |
|-------|----------|------|
| CRDT merge stub | `packages/integrity-core/src/crdt/CRDTLedger.ts` | LWW map merge for future mesh sync |
| Mesh node shell | `services/mesh-node/` | `/health`, `/v1/discovery` — libp2p to be added later |

**Terminal** owns `lib/mesh/MeshClient.ts` when that repo adopts mesh reads.

## Rollback

Disable IPFS pins and read Postgres only in Protocol-Core; Substrate SDK callers stop using `IpfsResolver`.

---

*We heal as we walk.*
