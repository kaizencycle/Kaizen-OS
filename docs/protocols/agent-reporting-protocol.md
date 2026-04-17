# Agent Reporting Protocol

# Mobius Civic AI — Heartbeat, Journal, and Attestation Contract

**Cycle draft:** C-284
**Status:** Protocol Spec v1
**Author:** kaizencycle
**CC0 Public Domain**

---

## 0. Purpose

Mobius agents run in many places — Cursor Background Agents, Render workers,
Vercel crons, local laptops, the ATLAS-PAW dashboard cron. They all need to
report into the Substrate using the same protocol so that *where* an agent
runs doesn't matter — *how* it reports does.

The Agent Reporting Protocol defines the three write paths every agent uses:

1. **Heartbeat** — "I am present"
2. **Journal commit** — "I observed, inferred, recommended"
3. **Attestation** — "I witnessed this Seal / EPICON / claim"

All three go through the Terminal. The Terminal is the agent gateway. The
Substrate receives its agents' work as an archive, not as a live write target.

---

## 1. Source of truth hierarchy

Before defining the endpoints, the protocol specifies *which store holds which
kind of truth*:

| Store | Holds | TTL |
|---|---|---|
| **Upstash KV** (via Terminal) | live heartbeats, current GI, active tripwires, recent journal entries | 5 min – 2 h |
| **Mobius-Substrate** (git archive) | committed journals, constitutional docs, protocol specs, Seal records | forever |
| **GitHub commit history** | ZEUS verification commits, PR merges, agent identity proofs | forever, immutable |

Reads flow through the Terminal's `/api/terminal/snapshot`, which merges hot
KV state with the cold Substrate archive. Writes go to the Terminal first;
the Substrate receives copies via archive crons.

**Doctrine:** *KV is authoritative for now. Substrate is authoritative for
history. Terminal is authoritative for the composition of both.*

<div class="mobius-proof-strip">
  <mobius-proof endpoint="snapshot-lite" path="integrity.gi" label="Live GI"></mobius-proof>
  <mobius-proof endpoint="snapshot-lite" path="integrity.mode" label="Live mode"></mobius-proof>
</div>

---

## 2. Agent identity

Every agent authenticates with `AGENT_SERVICE_TOKEN`, a shared bearer token
held by:

- The Terminal (validator)
- Each agent runtime (client)

Token rotation is a constitutional event (not yet specced). Until rotation is
defined, the token is long-lived. This is an accepted risk for the early
substrate; tightening is planned.

Every write carries an `agent_id` field identifying which of the eight named
agents is reporting: `ATLAS`, `ZEUS`, `EVE`, `JADE`, `AUREA`, `HERMES`,
`ECHO`, `DAEDALUS`. Unknown agent names are rejected.

---

## 3. Heartbeat

### Endpoint

```
POST /api/agents/heartbeat
Authorization: Bearer {AGENT_SERVICE_TOKEN}
Content-Type: application/json

{
  "agent": "ATLAS",
  "source": "cursor-agent" | "paw-cron" | "render-worker" | "vercel-cron" | "local",
  "timestamp": "2026-04-17T09:40:00Z",
  "observed": {
    "cycle": "C-284",
    "gi": 0.74,
    "mode": "yellow"
  },
  "note": "string (optional, <= 280 chars)"
}
```

### Effect

- Writes `HEARTBEAT:{agent}` to KV with 5-minute TTL
- Records `last_heartbeat` timestamp in the agent's KV record
- Appears in `/api/terminal/snapshot` agents lane within 12s

### Semantics

**A heartbeat is a claim of presence.** It means the agent is running and
able to observe something. It does not imply the agent produced reasoning
this cycle — that's what journal commits are for.

A heartbeat that carries no `observed` state is acceptable (the agent is
present but has nothing specific to report). A heartbeat that claims
`observed` state the agent couldn't possibly know is a protocol violation.

### Idempotency

Multiple heartbeats from the same agent within the TTL window simply reset
the TTL. No duplicate tracking. An agent that heartbeats every 60 seconds
is not penalized; an agent that heartbeats once every 10 minutes is.

### NEVER

- **Never have the Terminal fabricate a heartbeat on an agent's behalf.** A
  heartbeat must come from the agent's own runtime. The Terminal may surface
  "no recent heartbeat" — that's a legitimate state — but must not write
  `HEARTBEAT:atlas` on ATLAS's behalf. Fabricated heartbeats corrupt MII
  calculations, hide outages, and break the sentinel architecture. This is a
  load-bearing rule.

---

## 4. Journal commit

### Endpoint

```
POST /api/agents/journal/commit
Authorization: Bearer {AGENT_SERVICE_TOKEN}
Content-Type: application/json

{
  "agent": "ATLAS",
  "cycle": "C-284",
  "scope": "observation" | "inference" | "recommendation",
  "observation": "string",
  "inference": "string",
  "recommendation": "string",
  "confidence": 0.87,
  "derived_from": ["signal-snapshot:kv", "source:cron"],
  "category": "observation" | "inference" | "civic-risk" | "market" | "infrastructure",
  "severity": "nominal" | "elevated" | "critical",
  "tags": ["ATLAS", "observation", "C-284"],
  "content_signature": "sha256-hash-of-canonical-content (optional, server fills if absent)"
}
```

### Effect

- Writes to KV hot lane: `LPUSH journal:{AGENT}:{CYCLE}` (cap 200 per agent per cycle)
- Fires `scheduleVaultDepositForJournal` for Vault v1/v2 accrual
- Appears in `/api/agents/journal` read endpoint immediately
- Mirrors to `Mobius-Substrate/journals/{agent}/{ISO-timestamp}-journal.json` via nightly archive cron
- If within a Seal's deposit window, `content_signature` is tracked for later inclusion in `deposit_hashes`

### Idempotency

`content_signature` dedup. Two commits with identical signatures within a
cycle are treated as one. This is how the Substrate prevents agents from
padding reserve via repeated identical entries.

Agents MAY pre-compute the signature client-side; the server recomputes and
validates. Mismatches are a protocol violation (client either lied about
content or computed the hash wrong).

### Required fields

- `agent` — must be a known agent
- `cycle` — must match current cycle per `cycle.json` or the prior cycle (for late commits within 60s of rollover)
- At least one of `observation`, `inference`, `recommendation` must be non-empty
- `confidence` must be in `[0, 1]`

### Validated on write

- Agent exists and matches the bearer token holder (no impersonation)
- Cycle is current or previous
- Total content size under 4KB
- No HTML/script content in text fields

---

## 5. Attestation (Seal)

### Endpoint

```
POST /api/vault/seal/attest
Authorization: Bearer {AGENT_SERVICE_TOKEN}
Content-Type: application/json

{
  "seal_id": "seal-C-284-001",
  "agent": "ATLAS" | "ZEUS" | "EVE" | "JADE" | "AUREA",
  "verdict": "pass" | "flag" | "reject",
  "rationale": "string (<= 2000 chars)",
  "signature": "HMAC-SHA256(AGENT_SERVICE_TOKEN, seal_hash || verdict || rationale)",
  "posture": "confident" | "cautionary" | "stressed" | "degraded"
}
```

(`posture` is AUREA only.)

### Effect

- Server verifies HMAC signature against the current candidate's `seal_hash`
- Records attestation on `vault:seal:candidate` KV record
- If submission makes the candidate complete, the `/api/cron/vault-attestation`
  cron will finalize on its next tick (no immediate effect on this request)

### Who attests

Only the five voting Sentinels — ATLAS, ZEUS, EVE, JADE, AUREA — may attest
Seals. HERMES, ECHO, and DAEDALUS cannot. This is enforced server-side.

### Verdict semantics

- **`pass`** — agent's tier-specific criteria met
- **`flag`** — criteria met with concerns; Seal may still mint but concerns are recorded
- **`reject`** — criteria not met; Seal cannot mint in attested state
  - Only ZEUS's `reject` holds absolute veto. Other agents' rejects move the Seal to `quarantined`, awaiting operator review.

See `vault-v2-sealed-reserve.md` §5 for per-Sentinel scope and §6 for quorum rules.

### Idempotency

An agent posting the same attestation twice replaces the prior one. An agent
posting a *different* attestation replaces the prior one but with a
`revised_from` field recorded. Revisions within the 5-minute attestation
window are permitted (useful for corrections); after window close, no changes.

---

## 6. Archive mirroring (Substrate write path)

KV holds hot state with 5-minute to 2-hour TTLs. To preserve long-term memory,
the Terminal runs a nightly archive cron that writes:

- Journal commits from the last 24h → `Mobius-Substrate/journals/{agent}/YYYY-MM-DD.json` (append)
- Attested Seals → `Mobius-Substrate/ledger/seals/{seal_id}.json`
- Quarantined/rejected Seals → `Mobius-Substrate/ledger/seals/quarantined/{seal_id}.json`
- Cycle summary → `Mobius-Substrate/journals/cycles/{cycle}.json`

The archive cron opens a PR against `main` in Mobius-Substrate rather than
direct-committing. ZEUS verifies the PR diff matches the KV source before
approving. Every archive write is a commit that carries a ZEUS verification
footer.

**This is the pattern that makes the cathedral remember.** Each day, the
substrate transcribes itself from hot KV into cold git. The agents don't
write to Mobius-Substrate directly — they write to Terminal, and the archive
transcribes. This is why "Substrate is the memory" works.

---

## 7. Read paths (for completeness)

All reads go through Terminal. Substrate is never a hot read target.

- `GET /api/terminal/snapshot` — full 13-lane state
- `GET /api/terminal/snapshot-lite` — minimal surface for clients with tight budgets
- `GET /api/agents/status` — agent roster with heartbeat status
- `GET /api/agents/journal?cycle=C-284&agent=atlas` — journal entries
- `GET /api/vault/status` — Vault reserve + seals count
- `GET /api/vault/seal` — list attested Seals
- `GET /api/vault/seal/{id}` — single Seal with attestations

If an agent needs to know its own state (last heartbeat, last journal), it
reads from `/api/agents/status?agent={self}`. It does NOT read Mobius-Substrate
directly for hot state — it would be stale by up to 24h.

---

## 8. Stop conditions

An agent runtime must refuse to POST and log loudly if:

1. `AGENT_SERVICE_TOKEN` is unset (no authentication possible)
2. The agent's own identity doesn't match the expected token holder
3. A response returns 401 three times in a row (potential token revocation — escalate to operator)
4. The `cycle` field would be older than previous cycle (clock drift)
5. The agent is about to commit a journal entry whose `content_signature` duplicates one it committed within the last 60 minutes (likely loop bug)

Stop conditions are meant to catch agents-gone-wrong. A stopped agent is
better than a corrupting agent. DAEDALUS-µ watches for stopped agents and
raises the `agent-quiet` tripwire when a Sentinel goes silent for more than
30 minutes.

---

## 9. Non-goals (explicitly)

- **The protocol does not define agent reasoning.** How ATLAS forms an
  observation, how ZEUS decides what to verify, how JADE recognizes
  precedent drift — those are each agent's internal logic, not this
  protocol's concern.
- **The protocol does not define inter-agent communication.** Agents do not
  talk to each other. They talk to the Terminal. The Terminal's state is
  their shared substrate, and that's how they coordinate.
- **The protocol does not define MIC emission.** MIC minting follows from
  Vault v2 Seal attestation + Fountain activation per the Vault v2 spec.
  Journal commits may trigger accrual, but they never mint MIC directly.

---

## 10. Summary (short)

- One token: `AGENT_SERVICE_TOKEN`
- Three write endpoints: heartbeat, journal/commit, seal/attest
- One gateway: the Terminal
- Two stores: KV (hot, Terminal-owned) and Substrate (cold, archive cron)
- One rule that cannot be broken: **no fabricated heartbeats**

---

*The agents report. The gateway witnesses. The Substrate remembers.*
