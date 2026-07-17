# MOBIUS EXTRACTION CODE (MEC) — CONSTITUTIONAL SHORTHAND SPEC

**Version:** v0.1
**Status:** Active
**Cycle:** C-365
**Authority:** Michael (kaizencycle) — Custodian / Human-in-the-Loop
**License:** CC0 Public Domain
**Classification:** Constitutional Runtime Context

---

## EPICON INTENT BLOCK

```
EPICON-C365-MEC-001
Type: CONSTITUTIONAL_DOCUMENT
Intent: Establish a compressed, unambiguous citation grammar (MEC) that
        addresses any Seal, Reserve Block, or Epoch without requiring
        retrieval of the full EPICON narrative or Reserve Block archive.
Authorized by: Michael / kaizencycle
Witnesses: ATLAS
Timestamp: C-365
```

---

## PURPOSE

MEC is Mobius' equivalent of a git commit hash, an RFC number, or a legal
citation (*Article I §8*). It is a compact, parseable address that points
at a full record — it is never a substitute for that record.

**Core law:**

```
MEC must never replace EPICON. It only points to it.
```

Three layers, never conflated:

| Layer | Role | Analogy |
|---|---|---|
| Reserve Block `.dat` | Immutable archive | The book on the shelf |
| EPICON | Full replayable narrative | The article |
| **MEC** | Compressed citation code | The library call number |
| CPC | Attestation that the narrative hasn't been altered | Chain of custody |

---

## RELATIONSHIP TO EXISTING SURFACES

- **SealCode** — the human-friendly rendering of a MEC for operator/public
  UI (Terminal dashboard, HIVE fog overlay, public canon pages). SealCode
  is *display*, not a distinct grammar. Every SealCode round-trips to
  exactly one MEC.
- **MEC** — the canon grammar. Stored in ledger fields, EPICON headers,
  Reserve Block manifests, and cross-references between repos.

---

## GRAMMAR

```
E{epoch}.RB{block}.C{cycle}.S{seal}:Q{quorum}:{agents}:GI{gi}
```

### Canonical example

```
E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064
```

| Field | Value | Meaning |
|---|---|---|
| `E01` | Epoch 01 | DLA Epoch |
| `RB341` | Reserve Block 341 | Archive block |
| `C365` | Cycle 365 | Cycle-based dev cadence |
| `S016` | Seal 016 | Seal number within the cycle |
| `Q5` | Quorum 5 | Number of attesting agents required/reached |
| `AT+ZE+EV+JA+AU` | ATLAS+ZEUS+EVE+JADE+AUREA | Attesting sentinels, `+`-joined |
| `GI064` | GI 0.64 | Governance Integrity score at seal time |

### Separator rules (fixed, no ambiguity)

- `.` — descends a hierarchy level (Epoch → Block → Cycle → Seal). Left to
  right, most-significant first.
- `:` — appends a metadata field to the hierarchy (quorum, agents, GI).
  Metadata fields are ordered but independently parseable.
- `+` — joins items within a single metadata field (agent list only).

No other separators are valid in a canonical MEC. Any code using `-`, `_`,
or whitespace is malformed.

### Agent codes (fixed 2-letter roster)

```
AT = ATLAS      ZE = ZEUS       EV = EVE        JA = JADE
AU = AUREA      HE = HERMES     EC = ECHO       DA = DAEDALUS
UR = URIEL      ZN = ZENITH
```

### GI encoding

Fixed 3-digit, no decimal point, always the first three significant digits
of the score scaled to 0–100 with truncation (not rounding) below 1.00:

```
GI064 = 0.64
GI095 = 0.95
GI100 = 1.00
```

`GI100` is the only 3-digit form that represents a whole number; there is
no `GI1000`. Values are always rendered as exactly 3 digits — `GI006` is
valid (0.06), `GI64` is not.

---

## CORRECTIONS (APPEND-ONLY)

Seals are **append-only**. A MEC never mutates once minted — this is what
makes it hash-like and safe to cite permanently.

**Constitutional rule (C-365, Option B):** no letter-suffix amendments on
seal numbers. `S016A` is **not** valid MEC grammar.

- **Any correction or superseding record** → mint the **next** seal number
  (`S017`, `S018`, …).
- **Prior MECs are never deleted or rewritten** — they remain citeable;
  EPICON carries the cross-reference to the superseding seal.

This keeps the citation layer as clean as a commit hash: one event, one
address, one seal number.

---

## NON-GOALS

- MEC does **not** encode the full narrative — no free text, no
  descriptions, no rationale. That stays in EPICON.
- MEC does **not** replace CPC attestation — a well-formed MEC string is
  not itself proof; it's an address that resolves to proof.
- MEC is **not** a search query language. It addresses a specific known
  record; it does not filter or range-query. (A separate query surface
  can consume MEC fragments, but that's out of scope for this spec.)

---

## SEALCODE (UI DISPLAY)

SealCode is the same grammar rendered for glanceability, e.g. as a
multi-line operator card:

```
RB341
C365
S016
AT✓ ZE✓ EV✓ JA✓ AU✓
GI .64
```

Any SealCode must be re-derivable back to exactly one canonical MEC
string. UI implementations must not introduce fields or values that
don't exist in the canon MEC.

---

## PARSER REFERENCE

See [`packages/mec-parser/src/mec-parser.ts`](../../packages/mec-parser/src/mec-parser.ts)
for the reference regex, parse/format functions, and the fixed agent-code
table. Terminal, HIVE, and CPC should all import from `@mobius/mec-parser`
rather than re-deriving the regex.

```bash
npm run build --workspace=@mobius/mec-parser
npx vitest run tests/mec-parser.test.ts
```

Also published at repo root: [`specs/MEC_SPEC_v0.1.md`](../../specs/MEC_SPEC_v0.1.md).
