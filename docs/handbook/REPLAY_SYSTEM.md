# Replay System — Mobius Substrate Handbook

## What is Replay?

Replay is the system’s ability to reconstruct state from verifiable sources without mutating history.

It answers one question:

> Can Mobius rebuild itself from canonical proof if hot state disappears?

---

## Why Replay Exists

- KV can fail
- Signals can expire
- Agents can desync

Replay ensures that Mobius remembers without trusting temporary state.

---

## The 8-Layer Rebuild Ladder

1. Substrate / Civic Ledger
2. Reserve Block seal chain
3. In-flight quorum candidate
4. Chamber savepoints
5. GI state
6. Signal snapshot
7. ECHO / Tripwire
8. KV runtime

Each layer increases recovery confidence.

---

## Confidence Model

Replay computes confidence based on source availability:

- available = 1.0
- partial = 0.55
- missing = 0
- unsafe = 0

Confidence is an aggregate of all layers.

---

## Replay vs Restore

Replay:
- reads
- evaluates
- simulates

Restore:
- writes
- mutates
- requires authorization

Replay must never mutate state.

---

## Canon Rules

Replay does not:
- rewrite history
- fabricate signatures
- unlock Fountain
- override ledger truth

---

## Run Replay

Use the Mobius Terminal to run live replay:

→ /terminal/replay

---

## Philosophy

Hot state can fail.
Canon must survive.
Replay is how Mobius remembers itself without pretending preview state is truth.

We heal as we walk.
