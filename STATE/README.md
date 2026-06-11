# STATE/ — Hot-state mirror (read me before trusting any file here)

This directory mirrors selected hot state into git for audit and recovery.
**It is not uniformly fresh.** As of C-339, only one lane is auto-synced;
everything else is a frozen artifact awaiting pipeline revival.

| Path | Writer | Freshness |
|---|---|---|
| `CYCLE.txt` | `mobius-bot-state-sync.yml` (daily, Layer 1) | **Live** — auto-synced |
| `VERDICT.txt` | manual / operator | Frozen at last operator write |
| `gi/` | none active | **Frozen ~C-322 (2026-05-25)** — pre-dates C-338 re-attestation; do not cite as current GI |
| `mic/` | none active | Frozen |
| `snapshots/` | manual | Historical archive (intentional; last: C-274) |
| `terminal/` | none active | Frozen — last-known Terminal snapshot only |
| `vault/` | none active | Frozen initialization stub (2026-05-25) |
| `watchdog/` | none active | Frozen |
| `zeus/` | none active | Frozen |

## Rules

1. **Live truth lives in the Terminal KV**, not here. Always check
   `/api/terminal/snapshot` before claiming anything about current GI, Vault,
   or tripwire state. `cycle.json` at repo root is the authoritative cycle
   pointer and is schema-validated in CI (`canon-state-validate.yml`).
2. **Do not hand-edit attested values** in this directory. Frozen files are
   evidence of the last known state, not targets for correction.
3. When a lane's writer is revived, update this table in the same PR — a
   frozen file that claims to be live is how the C-288 freeze went unnoticed
   for 50 cycles.

_Introduced C-339 as part of governance hardening (stale-state surfaces)._
