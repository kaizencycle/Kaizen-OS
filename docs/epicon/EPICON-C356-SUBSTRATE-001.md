# EPICON — C-356 Unified Substrate PR: Cycle Sync Recovery + Writer Health Watchdog

**ID:** EPICON-C356-SUBSTRATE-001
**Cycle:** C-356 (2026-06-28)
**Actor:** Claude Code, operating under operator identity (kaizencycle)
**Consequence class:** Infrastructure recovery + monitoring — additive workflows, state file correction
**Status:** proposed (PR #330)

---

## Intent

Advance `STATE/CYCLE.txt` from C-348 to C-356 (lagging while `cycle.json` was
already correct). Add upstream writer-health canary detection missing from the
C-348 unified PR (#325). Patch `mobius-bot-state-sync` to stamp a health
canary file on every run. Add `writer-health-watchdog.yml` to detect writer
failure before drift accumulates.

Root cause of issue #327: `mobius-bot-state-sync` writer scheduling lapsed.
The detector (`canon-drift-tripwire`) ran correctly 18 times but no upstream
alert existed for the writer itself — only for its output. This PR closes that gap.

## Scope

**Changed files:**
- `STATE/CYCLE.txt` — advanced C-348 → C-356
- `journals/cycles/C-356.json` — stub created (bot overwrites on first run)
- `state/writer-health.json` — seeded for watchdog bootstrap
- `.github/workflows/mobius-bot-state-sync.yml` — added writer-health canary write step
- `.github/workflows/writer-health-watchdog.yml` — new Layer 1 detector workflow
- `catalog/mobius_catalog.json` — regenerated

**Not touched:** cycle.json (already C-356), ledger, vault, journal content,
attestation records, constitutional docs, Tier-3 protected paths.

## Two-Layer Detection After This Ships

| Layer | Workflow | Fires when | Threshold |
|-------|----------|------------|-----------|
| 1 (NEW) | `writer-health-watchdog` | Writer silent 14+ days | Before drift |
| 2 (existing) | `canon-drift-tripwire` | cycle.json drifts 2+ cycles | After drift |

## Authority Provenance

Authority declared using EPICON_FOUNDER_STANDING.md

Michael / kaizencycle holds Custodian authority (DVA.02 — Founder Standing).
Changes are infrastructure recovery and monitoring additions — no canon
mutations, no attested values modified, no governance surfaces touched.
Founder Standing applies. Workflow additions (`.github/workflows/`) are
operational tooling, not constitutional changes.

## Witnesses

ATLAS · ZEUS

## Authorization

Michael / kaizencycle (Custodian, DVA.02)

## Refs

- Closes #327 (canon-drift-tripwire: cycle.json C-348 → C-356)
- Follows C-348 PR #325 (unified substrate PR pattern)
