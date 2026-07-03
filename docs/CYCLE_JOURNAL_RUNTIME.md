# Cycle Journal Runtime (Mobius)

**Status:** Draft v1.0  
**Cycle:** C-193  
**Owner:** Michael Judan  
**Pattern:** Agents propose → Mobius Bot commits (PR-based canon)

---

## Why this exists

Command Ledgers get heavy as a single thread grows. The Cycle Journal is a canonical, lightweight, auditable layer:

- **Daily memory** — structured rhythm for tracking progress
- **Structured decisions** — explicit rationale with evidence links
- **Stable handoffs** — clean boundaries between agents
- **Easy diffs + PR history** — git-native audit trail
- **No silent edits** — all changes via PR with validation

---

## Core Principle

> **Agents do not directly write canon.**

They produce proposals (diff patches + evidence). A single controlled identity ("Mobius Bot") commits via PR after validation.

This prevents:
- **Drift** — no untracked changes
- **Conflicting overwrites** — single writer pattern
- **Unclear authorship** — every change attributed
- **Untraceable edits** — full git history

---

## Filesystem Layout

```
/journals/cycles/
  C-193.json         # Source of truth
  C-193.md           # Auto-rendered preview
  C-193.morning.json # Optional micro-entries
  C-193.midday.json
  C-193.eod.json

/schemas/
  cycle_journal.schema.json

/prompts/cycle_journal/
  ATLAS.md
  AUREA.md

/docs/
  CYCLE_JOURNAL_RUNTIME.md
  CYCLE_JOURNAL_PUBLISHING.md
```

---

## Cycle Journal Entry (Concept)

Each cycle entry is a **structured civic log**, not a diary.

### Minimum sections

1. **Metadata** — cycle ID, date, timezone, chamber
2. **Signals** — what happened (ECHO layer)
3. **Integrity Readout** — ZEUS-style thresholds
4. **Topology / Dependencies** — ATLAS layer
5. **Systems Frame** — AUREA/JADE compression
6. **Decisions + Rationale** — with evidence links
7. **Action Queue** — next tasks
8. **Seal** — attribution + hash placeholders

---

## Runtime Loop

### 0) Inputs

- Event signals (manual notes, links, screenshots, commit diffs)
- Agent outputs (ATLAS/AUREA proposals)

### 1) Agent Proposal (Read-only)

Agents generate:
- A concise summary
- A JSON patch or unified diff for the cycle file
- Citations/evidence links
- Confidence score
- Risk tags (if any)

**Rule:** Agents MUST NOT overwrite entire entries unless explicitly instructed. They should produce **minimal diffs**.

### 2) Mobius Bot Validation

Mobius Bot validates:
- Schema compliance (`schemas/cycle_journal.schema.json`)
- Formatting rules
- No destructive overwrite unless allowed
- Required fields present
- Evidence links included for factual claims
- Safe language (no defamation, no unverified allegations as fact)

### 3) PR Commit (Write-only)

Mobius Bot:
- Applies patch
- Opens PR with:
  - Title: `C-193: Cycle Journal Update (ATLAS + AUREA)`
  - Body: summary, diff highlights, evidence list
  - Checkboxes for validation

### 4) Human Merge (Commander)

Michael merges after review.

---

## Permission Model (Recommended)

### Branch protections

- `main` protected
- Require PR review (Michael)
- Require CI checks:
  - Schema validate
  - Markdown lint (optional)

### Credentials

| Identity | Access |
|----------|--------|
| **Agents** | No repo write tokens |
| **Mobius Bot** | Repo-scoped token with PR-only permissions |

---

## Real-time without chaos (micro-entries)

During the day, write to:
- `C-193.morning.json`
- `C-193.midday.json`
- `C-193.eod.json`

At end of day, Mobius Bot compacts into:
- `C-193.json` (sealed)

This keeps the canonical daily log stable.

---

## "Seal" Convention (Lightweight)

At the bottom of a sealed cycle:

```json
{
  "seal": {
    "compiled_at": "2026-01-16T23:59:59Z",
    "contributors": ["ATLAS", "AUREA", "ZEUS", "ECHO"],
    "canon_hash": "(optional, filled by CI later)",
    "statement": "I sweep this chamber full of resonance. Memory holds steady."
  }
}
```

---

## Safety + Integrity Rules (Non-negotiable)

1. **If a claim is not verified:** label as "unconfirmed" + include source
2. **Never present rumors as facts**
3. **Separate "signal" from "assessment"**
4. **Evidence links required** for high-impact claims
5. **Trusted domain allowlist** for source URLs

---

## Agent Alignment Check (JADE × ZEUS × HERMES)

Each Cycle Journal includes a quick multi-agent lens check:

### 🟢 JADE — Meaning & Memory
- What improved system clarity today?
- What reduced blind spots?

### ⚡ ZEUS — Risk & Thresholds
- What risks moved closer or farther?
- Any new systemic warning signs?

### 🟡 HERMES — Incentives & Power
- Who benefits from today's developments?
- What incentives shifted?

---

## Issue → PR Command Flow

### Command format

Use these in GitHub Issue comments:

**1) Append an ECHO signal:**
```
/cycle update C-193 add-signal nonce="TOKEN" domain="Markets" confidence=0.80 statement="..." sources="https://..., https://..."
```

**2) Add a ZEUS watch item:**
```
/cycle update C-193 add-watch nonce="TOKEN" indicator="Rule-of-law drift" direction="up" note="..." evidence="https://..."
```

**3) Add an action item:**
```
/cycle update C-193 add-action nonce="TOKEN" priority="P1" task="Draft ZEUS pulse" owner="ZEUS" due="2026-01-16"
```

### Guardrails

| Guardrail | Description |
|-----------|-------------|
| **Issue label required** | Only issues with `cycle-journal` label |
| **Actor allowlist** | Only `kaizencycle` and `MobiusBot` |
| **Nonce token** | Shared secret in command |
| **Trusted domains** | Source URLs validated against allowlist |

---

## Trusted Source Domains

```javascript
const TRUSTED_DOMAINS = [
  // News
  "reuters.com", "apnews.com", "bbc.co.uk", "nytimes.com", "wsj.com", "theguardian.com",
  
  // Government
  "sec.gov", "congress.gov", "supremecourt.gov", "justice.gov", "state.gov",
  
  // Tech/Platform
  "github.com", "substack.com"
];
```

---

## Done Criteria

A cycle journal system is "live" when:

- [ ] Schema exists (`schemas/cycle_journal.schema.json`)
- [ ] PR automation can open a cycle update PR from workflow dispatch
- [ ] Issue → PR flow works with guardrails
- [ ] ATLAS/AUREA prompts produce patch-style updates
- [ ] CI validates schema + renders markdown
- [ ] Michael can merge in under 2 minutes

---

## Related Documentation

- [DVA Runtime Protocol](../06-OPERATIONS/DVA_RUNTIME.md)
- [Cycle Journal Publishing](./CYCLE_JOURNAL_PUBLISHING.md)
- [EPICON Template](./epicon/TEMPLATE_EPICON.md)

---

## Version History

| Version | Cycle | Changes |
|---------|-------|---------|
| v1.0 | C-193 | Initial specification |

---

**Seal:** The journal is the memory. The PR is the proof.  
**Mobius mantra:** *Memory holds. Motion continues.*

---

*Mobius Systems — Continuous Integrity Architecture*  
*"We heal as we walk."*
