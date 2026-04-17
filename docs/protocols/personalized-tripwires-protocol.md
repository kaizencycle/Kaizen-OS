# Personalized Tripwires Protocol

# Mobius Civic AI — Per-Citizen Sentinel Framework

**Cycle draft:** C-284
**Status:** Protocol Spec v1 (Stage 1 shipped in ATLAS-PAW; Stage 2+ planned)
**Author:** kaizencycle
**CC0 Public Domain**

---

## 0. Purpose

Mobius already has two kinds of tripwires:

1. **System-level tripwires** — the Terminal's self-monitoring against its own
   covenants (`confidence_inflation`, `engagement_ratio`, etc.). These
   protect the substrate from itself.
2. **Agent behavioral tripwires** — internal checks each Sentinel runs on its
   own outputs. These protect the substrate from individual agents drifting.

This protocol adds a third kind:

3. **Personalized tripwires** — per-citizen definitions of "watch this and tell
   me when it changes." These extend ATLAS's custodial role from "sentinel
   for the substrate" to "sentinel for both the substrate and its
   custodian." A citizen can ask ATLAS to watch specific conditions, and
   ATLAS reports back when they trip.

The Sentinel tier, by original definition, includes custodial responsibility
toward operators. Personalized tripwires are how that responsibility becomes
mechanical rather than aspirational.

---

## 1. Core doctrine

- **A tripwire is a standing observation request.** It does not demand action
  from the agent — it asks the agent to notice something on the operator's
  behalf.
- **A tripwire carries its own rationale.** Every tripwire records *why* it
  was armed, in the operator's or agent's voice, so when it fires later,
  the context is preserved.
- **A tripwire is per-citizen, not per-substrate.** System-level tripwires
  belong to Terminal. Personalized tripwires belong to the person.
  They live in separate stores under separate namespaces.
- **A tripwire can be suggested by an agent or armed by an operator.** Both
  flows are first-class. A tripwire suggested by ATLAS during conversation
  and one-tap armed is no different from one the operator wrote manually.
- **A tripwire is not noise by default.** Default action is `journal-only`:
  the trip is recorded but the operator is not interrupted. Push
  notifications are opt-in per tripwire. This prevents the tripwire
  dashboard from becoming a spam pipe.

---

## 2. Main objects

### Tripwire definition

A standing observation rule with a source, condition, action, and rationale.
Identified by a tripwire id. Citizen-namespaced.

### Trip event

A record of a tripwire firing. Includes the observed value at the time, the
context, and a summary. Retained in per-tripwire history.

### Source registry

A named catalog of data sources the tripwire evaluator can query. v1 sources
all read from the Terminal snapshot. Later sources (RSS, URL fetch, calendar)
add as registry entries.

### Evaluator

Cron-driven loop that resolves each armed tripwire's source, tests the
condition, and records trips when conditions match.

### Push queue

Per-citizen list of trip events flagged for interruption. The client
(dashboard) consumes and fires browser Notifications. Cleared on consume.

### Quarantine

Tripwires that fire in suspicious patterns (rapid oscillation, source
resolution failures across multiple cycles) may be auto-quarantined for
operator review. Not yet implemented in Stage 1.

---

## 3. Citizen namespacing

Every tripwire belongs to a citizen scope. Scope shapes:

- **`self`** — single-operator instance (ATLAS-PAW today)
- **`{citizen_id}`** — multi-citizen instance (Browser Shell after Stage 4)

KV keys are always scope-prefixed:

```
atlas:paw:tripwires:{scope}:index         array of tripwire ids
atlas:paw:tripwires:{scope}:def:{id}      definition
atlas:paw:tripwires:{scope}:history:{id}  per-tripwire trip events (cap 100)
atlas:paw:tripwires:{scope}:journal       aggregate trip events (cap 200)
atlas:paw:tripwires:{scope}:push-queue    unread push events
atlas:paw:tripwires:{scope}:last-observed map of {id: value} for `changed` ops
```

Stage 1 uses only `self`. Migration to per-citizen is a schema-compatible
prefix change — same shape, more scopes.

---

## 4. Tripwire definition structure

```
TripwireDefinition {
  id: string                       # "tw_lxyz_abc12345"
  label: string                    # human-readable, <= 120 chars
  rationale: string                # why this exists, <= 2000 chars, REQUIRED
  source: TripwireSourceRef
  condition: TripwireCondition
  action: { journal: bool, push: bool }
  cooldown_seconds: number         # min time between firings
  status: "armed" | "tripped" | "disabled"
  created_at: string
  updated_at: string
  last_tripped_at: string | null
  last_reset_at: string | null
}

TripwireSourceRef {
  kind: enum                       # see §6
  param?: string                   # source-specific (lane key, agent name, domain)
}

TripwireCondition = one of:
{ op: "lt" | "lte" | "gt" | "gte", threshold: number }
{ op: "eq" | "neq", threshold: string | number | boolean }
{ op: "in", threshold: Array }
{ op: "changed" }                # fires on any change from last observation
```

### Rationale is required

Empty rationale = 400 Bad Request. A tripwire that cannot explain itself
shouldn't exist. This is deliberate friction — the 30 seconds of typing a
rationale prevents the dashboard from becoming a graveyard of tripwires
nobody remembers arming.

### Default action

`{ journal: true, push: false }`. Quiet record by default. Push is opt-in per
tripwire at creation time, modifiable via PATCH.

### Default cooldown

3600 seconds (1 hour). Prevents rapid re-firings from a noisy source.
Configurable per tripwire.

---

## 5. Trip event structure

```
TripEvent {
  tripwire_id: string
  timestamp: string                # ISO
  observed_value: any              # source-dependent
  observed_context: object         # source-attached context
  summary: string                  # human-readable, evaluator-generated
}
```

Trip events are immutable. They are the historical record that a tripwire
fired, and tampering would break the point. If a tripwire is deleted, its
history is retained (as a practical garbage-collection choice — orphan
histories are cheap, and re-creating a tripwire with the same id is
probabilistically impossible given id generation).

---

## 6. Source registry (v1)

All v1 sources read from the Terminal's `/api/terminal/snapshot-lite`. The
evaluator fetches the snapshot once per cron tick and reuses it across all
tripwires in that batch.

| Source kind | Returns | Takes param |
|---|---|---|
| `terminal:integrity.gi` | number 0–1 | no |
| `terminal:integrity.mode` | "green" \| "yellow" \| "red" | no |
| `terminal:vault.balance` | number | no |
| `terminal:vault.status` | "sealed" \| "preview" \| "activating" | no |
| `terminal:signal.composite` | number 0–1 | no |
| `terminal:lane.state` | "healthy" \| "degraded" \| "stale" etc. | yes (lane key) |
| `terminal:micro-agent.value` | number | yes (agent name, e.g. "ATLAS-µ1") |
| `terminal:epicon.backlog` | number | no |
| `terminal:sentiment.domain` | number 0–1 | yes (domain, e.g. "civic") |

Adding a new source kind later = one entry in the server-side resolver
registry + one enum case in the client-side source kind list. No evaluator
changes.

<mobius-proof endpoint="snapshot-lite" path="integrity.gi" label="GI (tripwire sources use snapshot)"></mobius-proof>

### Planned sources (later stages)

- `rss` — fetch RSS feed, fire on keyword match
- `url-fetch` — fetch URL, evaluate JSONPath expression
- `calendar` — upcoming event window, missed event alert
- `vault.seal` — fire on specific Seal status transition
- `vault.fountain` — fire on Fountain activation for a Seal

---

## 7. Evaluator loop

Runs every 5 minutes via Vercel cron. For each scope in `listScopes()`:

1. Fetch terminal snapshot (one call, cached for this run)
2. Load last-observed map (for `changed` conditions)
3. For each non-disabled tripwire in the scope's index:
   a. Resolve the source → `{ok, value, context, display}`
   b. Evaluate the condition against the observed value
   c. If matched + not in cooldown + armed → fire (record trip, dispatch)
   d. If not matched + currently tripped → reset to armed
4. Persist updated last-observed map

### Dispatch

On fire, the evaluator:

- Appends a `TripEvent` to per-tripwire history (cap 100)
- Appends to aggregate journal (cap 200)
- If `action.push`, appends to push queue (cap 50)
- Stamps `last_tripped_at` on the definition and sets status to `tripped`

### Reset

When a previously-tripped tripwire's condition clears, status returns to `armed`
with `last_reset_at` stamped. This is what enables a tripwire to fire again
later — each fire-then-reset cycle is a separate event.

---

## 8. Cooldown and dedup

A tripwire that matches its condition but was last-tripped within
`cooldown_seconds` is skipped with `skip_reason: "cooldown"`. This prevents
a tripwire like "GI < 0.7" from firing every 5 minutes during a degraded
window — one trip per cooldown window.

Cooldowns are distinct from status. A tripwire can be `tripped` (status) and
also in cooldown (time-based). A second match within cooldown doesn't fire
a second event but also doesn't reset the tripwire.

---

## 9. Action semantics

### Journal (default)

Every fire appends to two KV lists: per-tripwire history and scope-level
aggregate journal. No interruption, no push, no email. The dashboard reads
these on load to show the operator "what did ATLAS notice since I last
looked."

### Push (opt-in)

Fires add to a push queue. The client (dashboard) calls
`GET /api/tripwires/journal?consume=push` on load to drain the queue and
fire browser `Notification` events for each. At-most-once delivery — the
client is responsible for actually calling the Notification API when the
permission is granted.

Server-side web-push (for delivery when the dashboard is closed) is a Stage 5
addition, not in scope for v1.

### Future actions

The action schema is extensible. Candidates:

- `email` — via Resend
- `sms` — via Twilio
- `webhook` — POST to operator-provided URL
- `journal-to-substrate` — in addition to KV record, open a PR against
  `Mobius-Substrate/operator-journals/{citizen_id}.json`

Each future action becomes one boolean field in `action` plus one dispatch
handler in the evaluator.

---

## 10. Chat-integrated arming (Stage 4)

The richest flow is the one the operator doesn't think of as "arming a
tripwire" at all. It's conversational:

> Operator: "I'm worried about the sentiment lane hiding real GI drops."
>
> ATLAS (in chat): "Want me to watch for that? I can fire when GI drops
> below 0.70 while the sentiment lane is degraded. That way you'll know when
> the two coincide."
>
> Operator: [tap "Arm"]
>
> ATLAS: "Armed. Watching GI and sentiment lane together. I'll let you
> know."

Under the hood, this is a tool call from the chat to `POST /api/tripwires`
with a pre-filled definition that ATLAS composed from the conversation.
The tool call includes the conversation excerpt as the rationale, so future
review of the tripwire remembers the moment that armed it.

Implementation: extend the chat system prompt to include tripwire arming as a
callable capability. When the model's output includes a tool call, the PAW
UI renders an inline "Arm" button. Tap → POST → confirmation.

---

## 11. Starter templates (v1 shipped)

Three templates ship with Stage 1 to seed new citizens:

1. **Vault approaching threshold** — `vault.balance >= 45`, journal + push,
   24h cooldown. Gets the operator ready for the Seal moment.
2. **GI below yellow band** — `integrity.gi < 0.70`, journal + push, 1h
   cooldown. Immediate notice when substrate materially degrades.
3. **DAEDALUS-µ5 self-ping** — `micro-agent.value[DAEDALUS-µ5] < 0.8`,
   journal-only, 6h cooldown. Infrastructure quirk surfacing, not
   interrupt-worthy.

Templates are suggestions, not defaults. Nothing is auto-armed. An empty
dashboard is the honest state for a brand-new citizen; templates are there
as a "one-tap starter kit."

---

## 12. Anti-gaming rules

Standard substrate anti-gaming principles apply:

1. **Tripwires cannot self-modify.** A tripwire firing cannot change another
   tripwire's definition. (Actions are limited to journal / push / future
   notification channels.)
2. **Tripwire creation is rate-limited.** A single citizen cannot create more
   than 50 tripwires in an hour. Prevents dashboard-bombing.
3. **Push queue is size-capped.** 50 unread events max per scope. Overflow
   drops oldest. Prevents push-queue DoS.
4. **Source resolution errors are not fires.** A tripwire whose source
   returns `{ok: false}` is skipped with `skip_reason: "source-error"`, not
   fired. An error-prone source creates a tripwire that seems quiet — the
   operator can tell something is wrong because the tripwire's
   `last_observed` in the skip log is `null`.

---

## 13. Migration path from ATLAS-PAW to Browser Shell

ATLAS-PAW is Stage 1's deployment target — single operator, `self` scope.
When the feature matures, it ports to the Browser Shell as a per-citizen
service.

Migration steps:

1. **Citizen namespacing proven.** Already done — KV keys use `self` but
   the shape generalizes.
2. **Scope resolver.** Replace `listScopes() → ["self"]` with a read from a
   citizen index key that the Browser Shell's auth layer populates.
3. **Auth-scoped endpoints.** Every `POST /api/tripwires` accepts whatever
   citizen session the Browser Shell presents, not a hardcoded GitHub session.
4. **Tripwire portability.** A citizen's tripwires move with their
   passkey-derived `citizen_id`, not with a specific device. Logging in on
   a new device restores the dashboard state.
5. **Per-citizen rate limits.** Hourly creation cap is per-citizen, not
   global.
6. **Aggregate substrate telemetry.** Opt-in metrics on which sources are
   most-watched, which conditions fire most often. Useful for understanding
   how citizens are actually using the system.

The Browser Shell gains a new tab — **Sentinel** — that renders the
tripwire dashboard. Adjacent to OAA, Reflections, Citizen Shield, HIVE,
Wallet. Each citizen has their own ATLAS watching their own things.

---

## 14. Summary (short)

- A tripwire is a standing observation rule with required rationale
- All reads go through the Terminal; all personalized state is in KV
- Default action is journal-only; push is opt-in
- Runs on a 5-minute cron, source registry is one-entry-per-source
- Scoped per-citizen from day one; single-operator today, Browser Shell later
- Chat-integrated arming is Stage 4; it's where the product feels alive

---

*The substrate watches itself. Each citizen asks it to watch one more thing.*
