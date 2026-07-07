# EPICON — C-365 Mobius Extraction Code (MEC)

**ID:** EPICON-C365-MEC-001
**Cycle:** C-365 (2026-07-07)
**Actor:** Michael (kaizencycle), Custodian / Human-in-the-Loop
**Witnesses:** ATLAS
**Consequence class:** Constitutional — citation grammar, additive
**Status:** active

---

## Intent

Establish **Mobius Extraction Code (MEC)** as constitutional citation shorthand:
a compact, parseable address for any Seal, Reserve Block, or Epoch without
replacing the full EPICON narrative or Reserve Block archive.

**Core law:** MEC must never replace EPICON. It only points to it.

## Constitutional decision (ZEUS / Custodian)

**Option B ratified:** no letter-suffix amendments on seal numbers (`S016A` is
**not** valid MEC). Seals are append-only. A correction or superseding record
mints the **next** seal number (`S017`). The prior MEC remains permanently
citeable; EPICON carries the cross-reference.

## Scope

**Changed files (Mobius-Substrate):**

- `docs/specs/MEC_SPEC_v0.1.md` — constitutional grammar
- `docs/epicon/EPICON-C365-MEC-001.md` — this document
- `packages/mec-parser` — `@mobius/mec-parser` reference implementation
- `journals/cycles/C-365.json` — cycle journal
- `docs/00-START-HERE/CANONICAL_DEFINITIONS.md` — MEC / SealCode glossary

**Canonical example:**

```
E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064
```

## What this does NOT do

- Does not implement `expandMEC` ledger resolution (stub only)
- Does not change Vault v2 seal minting or quorum rules
- Does not wire Terminal / HIVE / CPC UI (follow-up P2)

## Seal

```
EPICON-C365-MEC-001
Type: CONSTITUTIONAL_DOCUMENT
Authorized by: Michael / kaizencycle
Witnesses: ATLAS
Timestamp: C-365
```

*"We heal as we walk."*
