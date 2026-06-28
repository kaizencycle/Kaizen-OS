# Reserve Block `.dat` Format — Canon Specification
## Version: 1.0 | Cycle: C-357 | Status: RATIFIED
**CC0 Public Domain — kaizencycle/Mobius-Substrate**

---

## Purpose

Reserve Block `.dat` files are the **cold canon** storage format for sealed
Mobius Reserve Blocks. Modeled on Bitcoin's `blk*.dat` append-only pattern,
they provide permanent, hash-verified, zero-cost storage on GitHub as the
distributed append-only ledger.

**Architecture principle:**
```
KV     = hot state  (ephemeral, bandwidth-limited)
.dat   = cold canon (permanent, GitHub-hosted, SHA-256 hash-chained)
CPC    = hash anchor store (proofs only, not block data)
GitHub = distributed append-only ledger (source of truth for cold blocks)
```

---

## File Naming

```
canon/reserve-blocks/
├── blk0000.dat          # blocks 001–100
├── blk0001.dat          # blocks 101–200
├── blk0002.dat          # blocks 201–319
├── ...                  # future blocks (100 per file)
├── MANIFEST.json        # SHA-256 inventory + chain tip
└── CANONIZATION_LOG_C357.json  # one-time migration result log
```

File index is zero-padded to 4 digits: `blkNNNN.dat`.
Each file contains up to 100 blocks (`BLOCKS_PER_DAT_FILE = 100`).

---

## Record Format

Each `.dat` file is **NDJSON** (Newline-Delimited JSON): one JSON object per
line, one block per line, sorted by `block_number` ascending.

```jsonc
// One line per block. All fields required.
{
  "block_id":       "seal-C-356-125",  // maps to vault seal_id
  "block_number":   319,               // 1-indexed, strictly ascending
  "mic_value":      50.00,             // always 50.00 (1 Reserve Block = 50 MIC)
  "sealed_at":      "2026-06-28T15:30:50.408Z",  // ISO 8601 UTC
  "cycle":          "C-356",           // Mobius cycle at time of seal
  "seal_quorum":    ["ATLAS","ZEUS","EVE","JADE","AUREA"],  // 5 required
  "gi_at_seal":     0.76,              // Global Integrity score at seal (0–1)
  "source_entries": 81810,             // ledger entry count at seal
  "prev_hash":      "sha256:abc...",   // block_hash of previous record
  "block_hash":     "sha256:def..."    // see Hash Formula below
}
```

---

## Hash Formula

```
preimage   = JSON.stringify(record_without_block_hash)
block_hash = "sha256:" + SHA256(preimage + prev_hash)
```

Where:
- `record_without_block_hash` = the full record object with `block_hash` key omitted
- `prev_hash` of the first block (`block_number=1`) = `"0".repeat(64)` (genesis)
- `prev_hash` of all subsequent blocks = `block_hash` of the immediately preceding block
- Hash chains **cross file boundaries**: last block of `blk0000.dat` is the
  `prev_hash` of the first block of `blk0001.dat`

**Tamper detection:** Changing any field in any block invalidates all subsequent
`block_hash` values. Detectable by `scripts/verify-dat-chain.js`.

---

## MANIFEST.json

```jsonc
{
  "version": "1.0",
  "generated_at": "2026-06-28T22:42:17.414Z",
  "total_blocks": 319,
  "total_mic": 15950.0,
  "chain_tip_hash": "sha256:...",    // block_hash of the very last block
  "files": {
    "blk0000.dat": {
      "range": [1, 100],
      "sha256": "sha256:...",        // SHA-256 of entire file content
      "block_count": 100
    },
    "blk0001.dat": {
      "range": [101, 200],
      "sha256": "sha256:...",
      "block_count": 100
    },
    "blk0002.dat": {
      "range": [201, 319],
      "sha256": "sha256:...",
      "block_count": 119
    }
  }
}
```

---

## CPC Integration

CPC (`Civic-Protocol-Core`) stores **hash proofs only** — never full block data.

```
CPC table: dat_hash_anchors
  - dat_file            (e.g. "blk0000.dat")
  - file_hash           (SHA-256 of file content)
  - block_range_start
  - block_range_end
  - block_count
  - chain_tip_hash      (block_hash of last record in this file)
  - manifest_hash       (SHA-256 of MANIFEST.json, final file only)
  - version
  - canonized_at
```

API:
- `POST /api/canon/reserve-blocks/anchor`   — store anchor (service-token auth)
- `GET  /api/canon/reserve-blocks/manifest` — public chain state
- `GET  /api/canon/reserve-blocks/verify`   — public integrity check

---

## Attestation Model

This `.dat` architecture **replaces** the live `/ledger/attest` path for
historical blocks. The broken JWT path (C-338–C-353 root cause) is not
repaired — it is routed around.

| | Old path (broken) | New path (.dat canon) |
|---|---|---|
| Storage | Upstash Redis KV (ephemeral) | GitHub (permanent) |
| Integrity | KV TTL — no hash chain | SHA-256 hash chain |
| Attestation | CPC `/ledger/attest` (JWT broken) | CPC `/api/canon/reserve-blocks/anchor` |
| Audit | Requires live terminal | Any `git clone` + verify script |
| KV bandwidth | Counted against quota | Zero |
| Reversibility | KV eviction = data loss | GitHub history = permanent |

A GitHub commit to `canon/reserve-blocks/` IS the substrate attestation.
The GitHub Action verifies chain integrity before posting the EPICON event.

---

## Verification

```bash
# Verify full chain locally
node scripts/verify-dat-chain.js canon/reserve-blocks/

# Expected output on success:
#   ✓ blk0000.dat  blocks 1–100  (100 records)
#   ✓ blk0001.dat  blocks 101–200  (100 records)
#   ✓ blk0002.dat  blocks 201–319  (119 records)
#   Chain tip: sha256:abc12345678... ✓
#   Blocks verified: 319/319
#   ✓ CHAIN VALID — safe to commit to Mobius-Substrate
```

---

## Canon Law Reference

This specification implements:
- **Reserve Block Architecture** (established C-355)
- **KV Sovereignty Principle** (KV = disposable projection cache, not source of truth)
- **Anti-Goodhart Architecture**: block counts in .dat are hash-verified, not asserted
- **Sentinel Asymmetry Principle**: 5-sentinel seal quorum preserved in every record

Filed under: `MOBIUS_CANON_LAWS.md` section: "Reserve Block .dat Cold Canon"

---

*CC0 1.0 Universal — No rights reserved.*
*This document is freely usable without restriction.*
