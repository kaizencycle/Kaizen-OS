# Mobius Pulses

This directory stores Sentinel-ready JSON snapshots of the repository state.

## What is a Pulse?

A **Mobius Pulse** is a lightweight JSON snapshot that captures:
- Current HEAD commit and branch
- Recent commit history (last 10 commits)
- Changed files since last commit
- Repository structure (directory tree)
- GitHub workflow names
- Turborepo build graph
- MII estimate and cycle label

## Usage

### Generate a Pulse Manually

```bash
cd /path/to/Mobius-Substrate
MOBIUS_CYCLE="C-150" MOBIUS_MII="0.972" ./scripts/mobius_pulse_json.sh > infra/pulses/mobius_pulse_$(date -u +'%Y%m%dT%H%M%SZ').json
```

### Send a Pulse to the Indexer API

```bash
curl -X POST https://your-/api/v1/pulse/ingest?source=manual \
  -H "Content-Type: application/json" \
  --data-binary @infra/pulses/mobius_pulse_latest.json
```

### Nightly Pulses

The GitHub Action `.github/workflows/mobius-pulse-nightly.yml` generates pulses automatically at 4:00 UTC daily. These are uploaded as build artifacts and can be downloaded from the Actions tab.

## File Naming Convention

- `mobius_pulse_YYYYMMDDTHHMMSSZ.json` - Timestamped pulse
- `mobius_pulse_PR-XXX.json` - Pulse attached to a pull request
- `mobius_pulse_C-XXX.json` - Pulse for a specific cycle

## Sentinels

Pulses are designed to be consumed by AI sentinels:
- **ATLAS** - GI scoring, drift detection, security analysis
- **AUREA** - Architecture review, design patterns
- **ECHO** - Logging, cycle scoring, reflection
- **HERMES** - Resource projection, cost analysis
- **EVE** - Ethics compliance, policy alignment
- **ZEUS** - Enforcement, gating decisions

Each sentinel can interpret the same pulse differently based on its role.

## Schema

See `packages/integrity-core/src/pulse/mobiusPulse.ts` for the TypeScript schema.

---

*"We heal as we walk." — Kaizen OS*
