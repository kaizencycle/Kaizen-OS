# MEC Spec — Mobius Extraction Code

**Status:** Draft / C-365 canon candidate  
**Surface:** Substrate / Civic Protocol Core / Terminal  
**Public UI name:** SealCode  
**Canon name:** Mobius Extraction Code (MEC)

MEC is the canonical shorthand grammar for addressing sealed Mobius integrity
records. It is a compact citation, not a replacement for the full EPICON
narrative.

> **Rule 0:** MEC must never replace EPICON. MEC only points to EPICON,
> Reserve Blocks, CPC receipts, and replayable seal context.

---

## 1. Layer split

Mobius separates storage, narrative, and citation:

| Layer | Role | Analogy |
| --- | --- | --- |
| Reserve Block `.dat` | Immutable archive | Book on the shelf |
| EPICON | Full replayable narrative | Article / record of intent |
| MEC / SealCode | Compact constitutional address | Library call number / short commit hash |
| CPC | Attestation spine | Receipt that the record was not altered |

MEC exists so humans and agents can refer to constitutional records without
repeating the full narrative every time.

---

## 2. Canonical form

```txt
E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064
```

### Interpretation

```txt
Epoch 01
Reserve Block 341
Cycle 365
Seal 016
Quorum 5
Agents: ATLAS, ZEUS, EVE, JADE, AUREA
GI: 0.64
```

---

## 3. Grammar

MEC uses one separator per axis:

| Separator | Meaning | Example |
| --- | --- | --- |
| `.` | Descend into hierarchy | `E01.RB341.C365.S016` |
| `:` | Append metadata | `:Q5:GI064` |
| `+` | Join list values | `AT+ZE+EV+JA+AU` |

### Required hierarchy

```txt
E<epoch>.RB<reserveBlock>.C<cycle>.S<seal>
```

Example:

```txt
E01.RB341.C365.S016
```

### Optional metadata tail

Metadata fields are colon-delimited and order-stable by convention:

```txt
:Q<quorum>:<agentList>:GI<score>
```

Example:

```txt
:Q5:AT+ZE+EV+JA+AU:GI064
```

---

## 4. Fixed-width fields

All numeric hierarchy fields are fixed-width where practical.

| Field | Width | Example | Meaning |
| --- | ---: | --- | --- |
| Epoch | 2 | `E01` | Epoch 1 |
| Reserve Block | variable, no leading requirement | `RB341` | Reserve Block 341 |
| Cycle | variable, no leading requirement | `C365` | Cycle 365 |
| Seal | 3 | `S016` | Seal 16 |
| GI | 3 | `GI064` | GI 0.64 |

GI uses a three-digit integer with an implied decimal scale of 100.

```txt
GI000 = 0.00
GI064 = 0.64
GI095 = 0.95
GI100 = 1.00
```

Values outside `GI000` through `GI100` are invalid for v1.

---

## 5. Agent abbreviations

MEC uses short, stable Sentinel abbreviations in the metadata tail.

| Code | Agent |
| --- | --- |
| `AT` | ATLAS |
| `ZE` | ZEUS |
| `EV` | EVE |
| `JA` | JADE |
| `AU` | AUREA |
| `HE` | HERMES |
| `EC` | ECHO |
| `DA` | DAEDALUS |
| `UR` | URIEL |
| `ZN` | ZENITH |

Agent lists preserve the attestation display order used by the producing
surface. Parsers should preserve order and should not infer quorum from agent
count when an explicit `Q<n>` field is present.

---

## 6. Append-only amendment rule

MEC identifiers are immutable once emitted.

Canon recommendation:

> **Seals are append-only. Amendments mint new seals. Old MECs never mutate.**

Do **not** treat suffixes such as `S016.v2` as canonical. If a record requires
correction, clarification, reversal, or circuit-breaker replay, mint a new seal
that references the prior MEC in the EPICON narrative.

Example:

```txt
Prior:      E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064
Correction: E01.RB342.C365.S017:Q5:AT+ZE+EV+JA+AU:GI066
```

The new EPICON should include:

```txt
supersedes: E01.RB341.C365.S016
reason: correction | clarification | replay | rejection | quarantine-release
```

---

## 7. Parser contract

A v1 parser must:

1. Split hierarchy and metadata using the first `:`.
2. Split hierarchy by `.`.
3. Require exactly four hierarchy components: Epoch, Reserve Block, Cycle, Seal.
4. Parse optional metadata fields independently.
5. Preserve unknown metadata fields for forward compatibility.
6. Reject malformed fixed-width GI values.
7. Never expand a MEC into truth without fetching the linked EPICON/CPC context.

### Minimal regex

```txt
^E(?<epoch>\d{2})\.RB(?<reserveBlock>\d+)\.C(?<cycle>\d+)\.S(?<seal>\d{3})(?<tail>(?::[^:]+)*)$
```

The regex validates the hierarchy and captures the tail. Metadata parsing should
happen after validation so new metadata fields can be introduced without
breaking older readers.

---

## 8. UI display guidance

The public/operator UI should prefer the term **SealCode**.

Example compact display:

```txt
RB341 · C365 · S016 · Q5 · GI .64
AT✓ ZE✓ EV✓ JA✓ AU✓
```

Expansion should reveal the full MEC, then the EPICON narrative, CPC receipt,
Reserve Block membership, and replay fingerprint.

---

## 9. Non-goals

MEC does not:

- store raw event data;
- replace EPICON;
- prove truth by itself;
- authorize actions;
- mutate historical records;
- collapse unresolved narratives into certainty.

MEC is a constitutional address. The proof lives in the linked record.

---

## 10. Reference examples

```txt
E01.RB331.C361.S007:Q5:AT+ZE+EV+JA+AU:GI095
E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064
E01.RB342.C365.S017:Q3:AT+ZE+EV:GI066
```

---

## 11. C-365 intent block

```txt
Cycle: C-365
Intent: Establish Mobius Extraction Code as constitutional shorthand grammar.
Scope: Documentation plus parser stub for Terminal and SDK consumption.
Risk: Low; additive docs and parser only.
Guardrail: MEC points to EPICON and must never replace replayable narrative.
Doctrine: Canon -> Ledger -> UI.
```
