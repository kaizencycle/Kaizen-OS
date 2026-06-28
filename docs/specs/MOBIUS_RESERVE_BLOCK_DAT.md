# Reserve Block `.dat` Format — Canon Specification

## Version: 1.0 | Cycle: C-357 | Status: RATIFIED

**CC0 Public Domain — kaizencycle/Mobius-Substrate**

---

## Purpose

Reserve Block `.dat` files are the **cold canon** storage format for sealed Mobius Reserve Blocks. Modeled on Bitcoin's `blk*.dat` append-only pattern, they provide permanent, hash-verified storage on GitHub as the distributed append-only ledger.

**Architecture principle:**

```
KV   = hot state (ephemeral, bandwidth-limited)
.dat = cold canon (permanent, GitHub-hosted, hash-chained)
CPC  = hash anchor store (proofs only, not data)
GitHub = distributed append-only ledger (source of truth for cold blocks)
```

This NDJSON batched format (C-357) complements the per-block MOBIUS01 binary format (C-355) in Civic-Protocol-Core.

---

## File Naming

```
canon/reserve-blocks/
├── blk0000.dat          # blocks 001–100
├── blk0001.dat          # blocks 101–200
├── blk0002.dat          # blocks 201–319
├── MANIFEST.json        # SHA-256 inventory + chain tip
└── CANONIZATION_LOG_C357.json
```

Each file contains up to 100 blocks (`BLOCKS_PER_DAT_FILE = 100`).

---

## Record Format

Each `.dat` file is **NDJSON**: one JSON object per line, sorted by `block_number` ascending.

```json
{
  "block_id": "seal-C-356-125",
  "block_number": 319,
  "mic_value": 50.00,
  "sealed_at": "2026-06-28T15:30:50.408Z",
  "cycle": "C-356",
  "seal_quorum": ["ATLAS","ZEUS","EVE","JADE","AUREA"],
  "gi_at_seal": 0.76,
  "source_entries": 81810,
  "prev_hash": "sha256:...",
  "block_hash": "sha256:..."
}
```

---

## Hash Formula

```
preimage   = JSON.stringify(record_without_block_hash)
block_hash = "sha256:" + SHA256(preimage + prev_hash)
```

- Genesis `prev_hash` = `"0".repeat(64)`
- Hash chains **cross file boundaries**

---

## CPC Integration

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/canon/reserve-blocks/anchor` | AGENT_SERVICE_TOKEN | Store file hash anchor |
| `GET /api/canon/reserve-blocks/manifest` | public | Chain state |
| `GET /api/canon/reserve-blocks/verify` | public | Range continuity check |

---

## Verification

```bash
node scripts/verify-dat-chain.js canon/reserve-blocks/
```

Expected: `✓ CHAIN VALID — safe to commit to Mobius-Substrate`

---

## Attestation Model

| | Old path (broken) | New path (.dat canon) |
|---|---|---|
| Storage | Upstash Redis KV | GitHub |
| Integrity | No hash chain | SHA-256 hash chain |
| Attestation | `/ledger/attest` (JWT broken) | `/api/canon/reserve-blocks/anchor` |
| Audit | Requires live terminal | Any `git clone` + verify script |

A GitHub commit to `canon/reserve-blocks/` **is** the substrate attestation for historical blocks.

---

*CC0 1.0 Universal — No rights reserved.*
