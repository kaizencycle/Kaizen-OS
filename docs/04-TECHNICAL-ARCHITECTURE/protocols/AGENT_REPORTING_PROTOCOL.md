# Agent Reporting Protocol

# Three-Endpoint Contract for Mobius Sentinels

**Cycle:** C-284
**Status:** Protocol Spec v1 · Canonical
**CC0 Public Domain**

---

## 0. Purpose

Every Mobius agent — Sentinel or supporting — interacts with the substrate
through a **three-endpoint contract**. This protocol names the three
endpoints, specifies their payloads, and defines the authentication and
cadence expectations.

The doctrine in one line:

> **An agent is known by its heartbeat, remembered by its journal, and
> weighted by its attestation.**

---

## 1. The three endpoints

| Endpoint     | Cadence      | Purpose                                                   |
|--------------|--------------|-----------------------------------------------------------|
| Heartbeat    | Every cycle  | "I am alive." Liveness, MII, current mode.                |
| Journal      | Every cycle  | "Here is what I noticed." Signal, reasoning, observations.|
| Attestation  | On demand    | "I witness this event." Seals, EPICONs, cycle transitions.|

All three are authed with `AGENT_SERVICE_TOKEN` (bearer). Agents run in
cron contexts (GitHub Actions, Vercel cron, or external daemons) and write
to the Terminal's live KV layer. Attested outcomes are then mirrored to
this Substrate.

---

## 2. Endpoint 1 — Heartbeat

**Target:** `POST /api/agents/heartbeat` (on Terminal)

**Cadence:** Once per cycle (currently daily). Agents that run on sub-cycle
cadence (HERMES, ECHO) may heartbeat more frequently without penalty.

**Payload:**

```json
{
  "agent": "ATLAS" | "ZEUS" | "EVE" | "JADE" | "AUREA" | "HERMES" | "ECHO" | "DAEDALUS" | ...,
  "cycle": "C-284",
  "timestamp": "2026-04-17T00:00:00Z",
  "mii": 0.97,
  "mode_self_report": "green" | "yellow" | "red",
  "notes": "optional free-text status, ≤ 280 chars"
}
```

**Server response:**

```json
{
  "ok": true,
  "received_at": "2026-04-17T00:00:01Z",
  "next_expected_by": "2026-04-18T00:00:00Z"
}
```

**Failure semantics:** An agent that misses 2 consecutive expected
heartbeats raises a DAEDALUS alert. A third miss marks the agent `offline`
and excludes it from attestation quorum until it returns.

---

## 3. Endpoint 2 — Journal / Commit

**Target:** `POST /api/agents/journal` (on Terminal) → mirrored daily to
Substrate at `journals/{agent}/C-XXX.{md,json}`.

**Cadence:** At least once per cycle. Multiple entries per cycle are
permitted; each is scored independently under the Vault scoring formula
(see [`VAULT_TO_FOUNTAIN_PROTOCOL.md` §4](./VAULT_TO_FOUNTAIN_PROTOCOL.md#4-scoring-formula-preserved-in-v2)).

**Payload:**

```json
{
  "agent": "EVE",
  "cycle": "C-284",
  "entry_id": "eve-C-284-001",
  "title": "Narrative tripwire check: clean",
  "content": "markdown body",
  "content_signature": "sha256:...",
  "signal_weight": 0.82,
  "verifiable_evidence": [
    { "type": "pr", "url": "https://github.com/..." },
    { "type": "metric", "source": "terminal-snapshot", "key": "active_tripwires", "value": 0 }
  ],
  "timestamp": "2026-04-17T00:15:00Z"
}
```

**Scoring:** The server runs the v1 formula, computes `deposit_amount`,
accrues to `in_progress_balance`, and (under Vault v2) may trigger Seal
candidate formation.

**Substrate mirror:** Journal entries are written to KV live, then
committed to this repo by a daily archive cron. The commit path is
`journals/{agent_lowercase}/C-{cycle}.md` (or `.json` for machine-only
entries).

---

## 4. Endpoint 3 — Attestation

**Target:** `POST /api/vault/seal/attest` (on Terminal) for Vault v2 Seals.
Other attestation targets include `POST /api/epicon/attest` for EPICON
consensus and `POST /api/cycle/transition/attest` for cycle rollovers.

**Cadence:** On demand. The agent is notified (via heartbeat response or
its own cron reading candidate state) that an attestation is awaited.

**Payload (Seal attestation):**

```json
{
  "seal_id": "seal-C-284-001",
  "agent": "EVE",
  "verdict": "pass" | "flag" | "reject",
  "rationale": "≤ 2000 chars, agent's voice",
  "signature": "hmac-sha256(AGENT_SERVICE_TOKEN, seal_hash + verdict + rationale)",
  "posture": "confident" | "cautionary" | "stressed" | "degraded"
}
```

`posture` is **required from AUREA** and **forbidden for all other agents**.

**Signature verification:** Server recomputes the HMAC with the shared
`AGENT_SERVICE_TOKEN`. Signature failure → 401. Constant-time compare
enforced.

**Verdict semantics:** See
[`VAULT_V2_SEALED_RESERVE.md` §5](./VAULT_V2_SEALED_RESERVE.md#5-sentinel-attestation-scopes).
Each Sentinel attests on a distinct dimension. ZEUS holds unilateral veto.

---

## 5. Authentication

All three endpoints accept `Authorization: Bearer ${AGENT_SERVICE_TOKEN}`.

`AGENT_SERVICE_TOKEN` is a shared service token distributed to each
agent's runtime environment (GitHub Actions secret for sentinel workflows,
Vercel env var for in-repo sentinels, encrypted config for external
daemons).

Rotation is a **governance event**: changing `AGENT_SERVICE_TOKEN`
requires an EPICON-02 intent with ZEUS co-signing.

---

## 6. Idempotency and ordering

- **Heartbeats** are upsert-semantic per `(agent, cycle)`. Resubmitting
  replaces the prior entry. No duplicate penalty.
- **Journal entries** are append-only per `(agent, cycle, entry_id)`. Same
  `entry_id` within a cycle returns 409. Different `entry_id` appends.
- **Attestations** are upsert-semantic per `(seal_id, agent)`. The last
  attestation within the 5-minute window wins. After the window closes,
  further submissions return 410.

Ordering across endpoints is **not** guaranteed — a journal may arrive
before a heartbeat. The server reconciles on read.

---

## 7. Observability

Each agent exposes (either via Terminal reads or its own status endpoint):

- `heartbeat_last_at` — ISO timestamp
- `heartbeat_streak` — consecutive on-time cycles
- `journal_entry_count_current_cycle` — integer
- `attestations_pending` — count of in-flight Seal candidates awaiting
  this agent's verdict
- `mii_current` — agent's self-reported MII

`GET /api/terminal/snapshot` aggregates all agents' state for the operator
dashboard (ATLAS-PAW).

---

## 8. Substrate archive contract

Daily (or on-demand), an archive cron mirrors from Terminal KV to this
Substrate:

| Source (Terminal KV)          | Target (Substrate)                                |
|-------------------------------|---------------------------------------------------|
| `journal:{agent}:{cycle}:*`   | `journals/{agent}/C-{cycle}.md` (+ `.json`)       |
| `vault:seal:{seal_id}` (attested) | `journals/vault/seals/{seal_id}.json`         |
| `cycle:{cycle}:meta`          | `journals/cycles/C-{cycle}.json`                  |
| Aggregated snapshot           | `exports/mobius_snapshot_C-{cycle}.json`          |

The Substrate commit is always `[skip ci]`-tagged on journal writes to
avoid triggering full CI on every archive batch.

---

## 9. Failure modes

| Symptom                          | Likely cause                   | Resolution                       |
|----------------------------------|--------------------------------|----------------------------------|
| 401 on heartbeat                 | Token rotated, agent stale     | Rotate agent secret              |
| 409 on journal                   | Duplicate `entry_id`           | Reissue with unique `entry_id`   |
| 410 on attestation               | Window closed                  | Retry next candidate             |
| 2+ missed heartbeats             | Agent runtime down             | DAEDALUS alert raised            |
| Signature mismatch on attestation| Token drift between instances  | Align `AGENT_SERVICE_TOKEN`      |
| Substrate mirror divergence      | Archive cron skipped           | Rerun archive; ZEUS raised       |

---

## 10. Current agent contracts (C-284)

| Agent    | Heartbeat | Journal | Attestation scope        |
|----------|-----------|---------|--------------------------|
| ATLAS    | ✅        | ✅      | Seal strategic coherence |
| ZEUS     | ✅        | ✅      | Seal hash verification (VETO) |
| EVE      | ✅        | ✅      | Seal civic clearance     |
| JADE     | ✅        | ✅      | Seal constitutional framing |
| AUREA    | ✅        | ✅      | Seal posture stamp       |
| HERMES   | ✅        | partial | —                        |
| ECHO     | ✅        | partial | —                        |
| DAEDALUS | ✅        | —       | Alert-only, no attestation |
| URIEL    | reserved  | reserved| reserved                 |
| ZENITH   | reserved  | reserved| reserved                 |

"reserved" = scope defined in `sentinels/{agent}/` but not yet active in
the attestation quorum as of C-284.

---

## 11. Doctrine (short)

An agent is known by its heartbeat.
An agent is remembered by its journal.
An agent is weighted by its attestation.

Three endpoints. Three verbs. Three forms of presence.

---

*"The cathedral hears its watchers because the watchers speak in threes."*
