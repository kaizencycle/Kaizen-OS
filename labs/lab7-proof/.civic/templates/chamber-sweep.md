# Chamber Sweep Template

```
🕊️ Chamber Sweep — {{cycle_id}}
Parent: {{parent_chamber}}
Result: {{result_status}}
Integrity Anchor: SHA256:{{session_hash}}
Summary: {{summary_text}}
Artifacts: {{artifact_links}}
Morale Delta: {{morale_delta}}
```

## Usage
Post this block at the end of every chamber session to generate cross-session checksums and enable Command Ledger synchronization.

## Example
```
🕊️ Chamber Sweep — Cycle 109
Parent: Command Ledger III
Result: ✅ Complete
Integrity Anchor: SHA256:def456...
Summary: Patched security schema v3 → current
Artifacts: /ledger/sweeps/C109/lab6-proof.json
Morale Delta: +0.15 (security improvements)
```