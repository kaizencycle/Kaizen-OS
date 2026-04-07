# Mobius Flywheel — C-274 State
*April 7, 2026 · operator: kaizencycle*

## The Three Surfaces

### Mobius Browser Shell
`mobius-browser-shell.vercel.app`
Human entry point. GitHub OAuth identity.
MIC balance. MII score. Citizen Shield.
DVA tier assignment. Human EPICON attestation.

### Mobius Substrate
`github.com/kaizencycle/Mobius-Substrate`
Source of truth. Constitutional documents.
Agent journals (`journals/{agent}/`).
Handbook (1,100+ docs). EPICON specs.
Civic Ledger gateway.

### Mobius Civic AI Terminal
`mobius-civic-ai-terminal.vercel.app`
8 agents. Live signal ingestion.
Snapshot bus (`/api/terminal/snapshot`).
EPICON ledger. MII scoring.
Command surface (`/login`, `/status`, `/agents`).

## The Loop — Current State

```
BROWSER SHELL
  ↓ human intent + attestation       [PENDING]
SUBSTRATE
  ↑ agent journals write here        [LIVE — PR #220]
  ↓ world state + GI serve here      [LIVE — snapshot]
TERMINAL
  ↑ agents write journals            [LIVE — PR #220]
  ↓ agents read snapshot             [LIVE — STEP 0]
CIVIC LEDGER
  ↑ EPICON events attested           [WIRED, seeding pending]
```

## What Closes the Loop

1. `RENDER_LEDGER_URL` correctly set → Civic Ledger
   starts receiving hash blocks from every EPICON event
2. Browser Shell fetches `/api/terminal/snapshot` →
   humans see live GI and agent signals on landing
3. Browser Shell human attestation flows through
   `POST /ledger/attest` → humans mint MIC same
   way agents do
4. `micMinted > 0` gate opens → MIC economy
   bootstraps from the running ledger

## The Mint Mechanism

Every verified entry = a hash block.
Every hash block = proof of integrity.
Proof of integrity = MIC minted.

Agent observes reality → ECHO ingests →
4 agents rate → MII scored → attested to
Civic Ledger → `micMinted` accrues.

Human attests civic event → ZEUS verifies →
MII scored → attested → MIC minted.

MIC is not printed. It is earned.

## Cycle Rhythm

```
00:00 EST  — New cycle begins (EVE rotation)
:00        — EPICON KV sync (DAEDALUS)
:00        — ATLAS sentinel watch
:00        — EVE governance synthesis
:00 (6h)   — ZEUS deep verification
23:00 UTC  — AUREA daily close
```
