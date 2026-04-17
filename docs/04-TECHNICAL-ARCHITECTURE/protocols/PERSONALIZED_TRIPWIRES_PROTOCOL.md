# Personalized Tripwires Protocol

# Per-Citizen Governance Boundaries on the Browser Shell / PAW

**Cycle:** C-284 (Stage 1 shipped to PAW)
**Status:** Protocol Spec v1 (Stage 1) · Canonical
**CC0 Public Domain**

---

## 0. Purpose

The substrate's global tripwires — EVE's narrative-overreach detectors,
ATLAS's strategic drift monitors, ZEUS's verification floors — are
**universal safeguards**. They protect the substrate *as a whole*.

But a citizen or operator also needs **personal** boundaries: "alert me if
my own reasoning window exceeds duplication threshold X" or "hold my
journal submission if GI drops below Y at commit time." These are not
substrate-level events — they are personal integrity contracts between
the user and their own civic footprint.

This protocol defines the **personalized tripwire** primitive: a
user-owned, locally-managed alert and hold mechanism that runs **beside**
the global substrate safeguards, not against them.

---

## 1. Core doctrine

- **Global tripwires protect the substrate.** They cannot be disabled
  by any individual.
- **Personal tripwires protect the citizen from themselves.** They are
  owned, configured, and mutable by the citizen.
- **Personal tripwires never relax global ones.** They can only be
  stricter, never looser. "My personal GI floor is 0.80" is valid
  when the global EVE floor is 0.70. "My personal GI floor is 0.60"
  is rejected by the client.
- **Personal tripwires are auditable.** Their trigger history is
  recorded in the citizen's own journal, with attested timestamps.
- **Personal tripwires do not halt the substrate.** A personal hold
  pauses only the triggering citizen's own pending actions.

---

## 2. Where it lives

Stage 1 (shipped C-284) lives in **ATLAS-PAW** (`atlas-paw`), the
operator's instrument panel. Stage 2 will generalize to the Browser Shell
(`mobius-browser-shell`) so any citizen running the shell can configure
personal tripwires against their own journal and pending commits.

Implementation surfaces:

| Surface          | Stage | Path (indicative)                       |
|------------------|-------|-----------------------------------------|
| PAW cockpit      | 1     | `apps/atlas-paw/app/tripwires/*`        |
| Browser Shell    | 2     | `apps/mobius-browser-shell/...`         |
| Protocol doc     | 1     | **this file**                           |
| Terminal API     | 2     | `app/api/tripwires/personal/*`          |

Stage 1 is client-side only — PAW stores personal tripwires in its local
Key-Value store (per-user) and renders alerts when thresholds fire. Stage
2 adds a Terminal-backed API so tripwires persist across devices for the
citizen.

---

## 3. Tripwire model

A personal tripwire is a scoped contract:

```
PersonalTripwire {
  id: string                     # uuid
  owner: string                  # citizen_id or operator handle
  label: string                  # "GI floor for my commits"
  scope: "journal" | "commit" | "attestation" | "snapshot"
  trigger: {
    kind: "gi_below" | "mii_below" | "mode_change" | "duplication_above" | "attestation_timeout"
    threshold: number | string   # kind-dependent
    sustain_cycles?: number      # optional: require N cycles at threshold
  }
  action: "alert" | "hold" | "alert_and_hold"
  enabled: boolean
  created_at: string
  last_fired_at: string | null
  fire_count: number
}
```

**Scope** governs what the tripwire is allowed to inspect:

- `journal` — my own pending journal entries
- `commit` — my own outgoing commits (via PAW's commit lane)
- `attestation` — Seals my operator/agent role would attest
- `snapshot` — the substrate snapshot the user is consuming right now

**Action**:

- `alert` — banner + notification, no behavioral change
- `hold` — pause the triggering action, wait for user confirmation
- `alert_and_hold` — both

---

## 4. Global-vs-personal precedence

```
global_safeguard passed?  ──┐
                            ▼
         ┌────────────────────────────────┐
         │ personal_tripwire passes also? │
         └────────────────┬───────────────┘
                          ▼
            both pass ────► proceed
            global fails ─► BLOCK (substrate-level, universal)
            personal fails ► HOLD (only this citizen's action)
```

A personal tripwire **cannot** bypass a global safeguard. It can only add
an additional (stricter) condition. Validation at configuration time
enforces this:

- `gi_below: 0.60` when global floor is `0.70` → **rejected** (too loose)
- `gi_below: 0.80` when global floor is `0.70` → **accepted** (stricter)

---

## 5. Configuration UI (Stage 1, PAW)

PAW ships with four preset tripwires at first run:

1. **GI floor for my commits** — hold my commits if GI < 0.80 for 3
   cycles. Default: `enabled=false`.
2. **Attestation timeout alert** — notify me if any Sentinel times out
   on a Seal I'm tracking. Default: `enabled=true`.
3. **Mode change alert** — notify me when substrate mode transitions
   green↔yellow↔red. Default: `enabled=true`.
4. **Duplication ceiling** — warn if my journal's content_signature has
   appeared > 3 times in the last 5 cycles. Default: `enabled=true`.

All presets are user-editable. Custom tripwires can be added via the PAW
tripwires configuration panel.

---

## 6. Fire history

Every fire of a personal tripwire is recorded:

```
PersonalTripwireFire {
  tripwire_id: string
  owner: string
  fired_at: string
  context_snapshot: {
    cycle: string
    gi: number
    mode: "green" | "yellow" | "red"
    mii_self: number | null
  }
  triggering_event: {
    kind: string                 # matches tripwire.trigger.kind
    observed_value: number | string
    threshold: number | string
  }
  action_taken: "alert" | "hold" | "alert_and_hold"
  resolution: "confirmed" | "dismissed" | "expired" | null
  resolved_at: string | null
}
```

Stage 1: fire history lives in PAW local KV.
Stage 2: mirrored to the citizen's own journal with daily archive to the
Substrate under `journals/citizens/{citizen_id}/tripwires/`.

---

## 7. Relationship to global EVE tripwires

EVE owns substrate-level tripwires:

- narrative-overreach
- cycle-window duplication across all agents
- attestation self-approval prevention
- emergency-mode governance lockout

These are **not user-configurable** and fire independently of any personal
tripwire state. When EVE fires globally, all citizens see it in the
snapshot; their personal tripwires do not "also" fire — they are downstream.

The symmetric relationship: **ATLAS-PAW's personal tripwires are to EVE
what a home smoke alarm is to the city fire department.** Both necessary;
different scopes; they don't replace each other.

---

## 8. API surface (Stage 2 — not yet shipped)

```
GET    /api/tripwires/personal              List mine
POST   /api/tripwires/personal              Create (validates vs global floors)
GET    /api/tripwires/personal/:id          Read one
PATCH  /api/tripwires/personal/:id          Update (validates vs global floors)
DELETE /api/tripwires/personal/:id          Soft-delete
GET    /api/tripwires/personal/:id/fires    Fire history (paginated)
POST   /api/tripwires/personal/:id/resolve  Resolve a held action
```

All authed with citizen session token. Writes are rate-limited per
citizen (10/hour soft, 50/hour hard).

---

## 9. Doctrine (short)

Global safeguards keep the cathedral standing.
Personal tripwires keep the citizen from walking off the edge.

Neither replaces the other.
Both listen; only the citizen configures the second.

---

*"You are allowed to set your own perimeter inside the cathedral's walls."*
