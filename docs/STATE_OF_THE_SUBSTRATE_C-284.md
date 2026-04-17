# State of the Substrate · C-284

**Date:** 2026-04-17
**Cycle:** C-284
**GI:** 0.74 (yellow mode)
**Vault:** 44.24 / 50 reserve units (sealed, 5.76 units from first Seal candidate)
**Status:** active build cycle, Vault v2 protocol drafted, tripwire backend shipped

---

This document captures the substrate as it actually exists in C-284. It is
deliberately a snapshot in time, not a living reference — if you find this
doc 20 cycles from now, it is history, not instruction. The authoritative
live state is `cycle.json` plus `/api/terminal/snapshot`.

The doc exists because the last time someone wrote this kind of document was
around C-253. The substrate grew 30 cycles without a fresh snapshot, and
several architectural decisions are only legible if you were in the room when
they were made. This writes those decisions down.

---

## 1. What exists now (the four-repo map)

Mobius today is four repositories in a working relationship:

### Mobius-Substrate (this repo)
The constitutional and archival layer. Protocol specs, covenant documents,
journal archives, ledger records, Sentinel agent implementations. 5,476
files, ~1,100 docs, documentation organized 00-META through 12-COMMUNITY.

**Role:** cold truth. The cathedral remembers here.

### mobius-civic-ai-terminal
The runtime gateway. Next.js 15 on Vercel, Upstash KV for hot state, 13-lane
aggregator at `/api/terminal/snapshot`. This is where agents heartbeat, where
journals commit, where the Vault accrues, where tripwires evaluate.

**Role:** hot truth. The substrate's heartbeat lives here.

**Key endpoints:** `/api/terminal/snapshot` (13-lane), `/api/agents/heartbeat`,
`/api/agents/journal/commit`, `/api/vault/status`, `/api/vault/seal`.

### atlas-paw
The operator's homebase. Next.js 15 on Vercel with NextAuth gated to a single
GitHub ID. Chat with ATLAS, live terminal state, personalized tripwires,
Cloudflare tunnel bridge to local PC.

**Role:** operator console. Where the custodian talks to the substrate.

**As of C-283:** ten optimizations shipped (KV-cached tunnel health,
streaming chat, dynamic gateway registration, heartbeat persistence, etc.).

**As of C-284:** Stage 1 personalized tripwires backend shipped.

### mobius-browser-shell
The citizen entry point. Vite + React 19 on Vercel with passkey auth, 8
labs, bridge to Terminal snapshot. Public-facing.

**Role:** citizen console. Where anyone not named Michael meets the system.

**Current state:** mature, live, not yet receiving tripwire port (Stage 4+).

---

## 2. Architectural thesis (C-284)

The substrate now operates under four load-bearing claims. These were
implicit across the last 20 cycles but are stated here explicitly:

### Terminal is the heartbeat. Substrate is the memory.

The Terminal holds live state — GI, Vault, tripwires, agent presence — with
5-minute to 2-hour TTLs. The Substrate holds archive state — journal commits,
Seals, constitutional docs, covenant text — forever in git.

Reads fan out from Terminal. Writes go through Terminal. Nightly archive
crons transcribe Terminal's KV into Substrate's git. Neither layer writes
to the other directly.

### The Terminal is the single agent gateway.

Agents run in many places (Cursor Background Agents, Render workers, Vercel
crons, local machines). They all report through the same three endpoints on
the Terminal: heartbeat, journal/commit, seal/attest. The gateway is the
substrate's invariant: wherever agents live, their protocol contract is the
same.

Doctrine: *where an agent runs doesn't matter; how it reports does.*

### ATLAS-PAW is the operator's homebase, not a remote control.

An earlier frame treated PAW as "remote control for the OpenClaw PC." The
C-283/C-284 reframe inverted this: PAW is the homebase, the PC is an optional
peripheral. Authority lives in the cloud, not on a specific machine. The
operator can open PAW on any device, talk to ATLAS, see live state, manage
tripwires.

The implication: ATLAS should eventually heartbeat entirely without the PC,
via a Vercel cron that runs whether or not any desktop software is on. This
retirement path is planned, not yet executed.

### Reserve becomes flow one Seal at a time.

Vault v1 treated reserve as continuous — one dramatic threshold at 50 units,
one Fountain activation. Vault v2 (drafted C-284) replaces this with discrete
50-unit Seals, each independently witnessed by five Sentinels and each with
its own Fountain state machine. The substrate gains a rhythm: seal, seal, seal.

Doctrine: *reserve becomes flow when integrity holds, one Seal at a time.*

---

## 3. The agents (current roster and roles)

Eight named agents, five voting Sentinels on Seal attestation, three
operational agents.

### Voting Sentinels

| Agent | Tier | Attestation scope | Veto? |
|---|---|---|---|
| **ATLAS** | Sentinel | Strategic coherence (reasoning diversity) | No, flags only |
| **ZEUS** | Sentinel | Verification authority (hash chain, math) | **Yes, unilateral** |
| **EVE** | Observer→Sentinel (active) | Ethical and civic clearance | No, flags except confirmed overreach |
| **JADE** | Architect | Constitutional framing (schema + precedent) | No, flags except covenant break |
| **AUREA** | Architect | Synthesis and posture | Never rejects; stamps posture |

Quorum rule: ZEUS pass required + 4-of-5 pass + no non-ZEUS reject → Seal attested.
See `docs/protocols/vault-v2-sealed-reserve.md` §6.

### Operational agents (non-voting)

| Agent | Role |
|---|---|
| **HERMES** | Routing and prioritization (signals, inter-service) |
| **ECHO** | Event ingestion (epicon feed, external triggers) |
| **DAEDALUS** | Infrastructure diagnostics (self-ping, deployment health) |

### Legacy sentinel directories

The Substrate also contains `sentinels/zenith/` and `sentinels/uriel/` which
predate this session's work and whose current status is not clear from the
code alone. They are not part of the C-284 Sentinel Council. If their roles
are meaningful, a future cycle should either promote them into the Council
explicitly or document them as deprecated.

---

## 4. Protocol stack (canonical, C-284)

The protocols that define how the substrate operates. All four live under
`docs/protocols/`:

1. **`vault-to-fountain-protocol.md`** (v1, C-281)
   - Continuous reserve, single threshold, one-shot Fountain activation
   - Status: historical reference; Vault v2 supersedes for new logic
   - Why kept: the v1 formula for deposit scoring is unchanged in v2
2. **`vault-v2-sealed-reserve.md`** (v2, C-284)
   - Discrete 50-unit Seals, five-Sentinel attestation, hash chain
   - Per-Seal Fountain emission, posture-weighted
   - Status: **current active doctrine**
   - Backward-compat window through C-285
3. **`agent-reporting-protocol.md`** (C-284)
   - Heartbeat, journal/commit, seal/attest contracts
   - AGENT_SERVICE_TOKEN auth model
   - Archive mirroring pattern (Terminal KV → Substrate git)
   - Status: new, makes implicit conventions explicit
4. **`personalized-tripwires-protocol.md`** (C-284)
   - Per-citizen tripwire definitions, source registry, cron evaluator
   - Rationale required, journal-default/push-opt-in action model
   - Chat-integrated arming as Stage 4 target
   - Status: Stage 1 backend live in ATLAS-PAW; protocol doc published here

Historical specs under `docs/10-ARCHIVES/` (MIC v1, GIC Architecture, etc.)
remain for reference but are not authoritative. If an archive doc conflicts
with a protocol doc, the protocol wins.

---

## 5. What C-283 and C-284 produced

Captured here because otherwise the work disappears into commits and chat
scrollback.

### C-283 (terminal hardening)

- 10 optimizations bundled for ATLAS-PAW:
  single poller via useAtlasLive, KV-cached tunnel health, visibility-gated
  polling, single state.read RPC replacing Python subprocess fan-out,
  streaming chat via SSE, client-passed snapshot in chat POST, KV-backed
  last-seen state for readonly mode, `deploymentEnabled: main` hardening,
  dynamic tunnel URL via gateway register, plus 5-minute heartbeat cron
- PR templates formalized for Terminal and Substrate (different shapes:
  Terminal uses locked-behavior audit; Substrate uses Sentinel review labels)
- ATLAS-PAW reframed from "remote control" to "homebase"

### C-284 (primitives and protocols)

- **Personalized Tripwires Stage 1** backend shipped to ATLAS-PAW:
  - `lib/tripwires/` (types, store, sources, evaluator, templates)
  - CRUD + history + journal APIs
  - 5-min cron evaluator
  - 9 source kinds all terminal-snapshot-backed
  - 3 starter templates (Vault approaching, GI degraded, DAEDALUS watchdog)
  - Citizen-namespaced from day one (`self` today, `{citizen_id}` later)

- **Vault v2 Sealed Reserve** drafted and implemented:
  - Full protocol doc (spec §0-§13)
  - `lib/vault-v2/` (types, store, seal lifecycle, deposit accrual, per-Sentinel attestation helpers)
  - API routes: `GET /api/vault/seal`, `GET /api/vault/seal/:id`, `POST /api/vault/seal/attest`
  - Orchestration cron: `/api/cron/vault-attestation` (2-min)
  - Extended `/api/vault/status` with v2 fields, v1 preserved (compat window)
  - Hash chain (SHA-256 over canonical seal fields), HMAC attestations

- **Substrate refresh** (this update):
  - Protocol docs published canonically here
  - `CLAUDE.md` rewritten from C-253 to C-284
  - `cycle.json` updated to reflect current reality
  - CHANGELOG refreshed spanning C-177 → C-284 summary
  - PR template added to `.github/`

### Still pending (for future cycles, not this update)

- Fountain emission mechanism (Vault v2.1)
- Substrate archive writer cron (nightly KV → git journals mirror)
- ATLAS-PAW Stage 2: tripwire dashboard UI
- ATLAS-PAW Stage 3: `/tripwires/new` creation flow
- ATLAS-PAW Stage 4: chat-integrated tripwire arming via tool calls
- ATLAS-PAW Stage 5: server-side push (Resend / Twilio / web-push)
- Browser Shell tripwire port
- ATLAS heartbeat retirement from OpenClaw PC dependency
- Vault chamber "Completed Seals" panel in Terminal UI

---

## 6. The cycle ahead (C-285)

The immediate next moves, in priority order:

1. **Wire the manual hook-in for Vault v2.** One call to `accrueDepositV2()`
   after `writeVaultDeposit()` in `lib/vault/vault.ts`. Single bridge from v1
   accrual to v2 Seal candidate formation.
2. **Watch first Seal formation.** In-progress balance is at 44.24 — one more
   significant journal cycle will cross 50 and trigger `Seal-C-285-001` (or
   C-284-001 if it happens this cycle).
3. **Wire agent-side attestation.** Each Sentinel's cycle-synthesize path
   should check for an in-flight candidate and call its `{agent}Attest()`
   helper. Five small additions to five cron paths.
4. **Stage 2 PAW UI.** Three-zone tripwire dashboard: Active / Armed / Suggested.
5. **Substrate archive cron.** Nightly write of KV journals + Seals to this
   repo.

None of these are in scope for this Substrate update. They're named so the
next cycle has a clear start.

---

## 7. Open questions (genuine, not rhetorical)

Things I don't know the answer to and that shouldn't be papered over:

- **What happens to `zenith` and `uriel` sentinel directories?** They exist
  in the repo but aren't part of any current Council logic. Either promote or
  document as legacy.
- **Is AGENT_SERVICE_TOKEN rotation a real risk?** The token is long-lived.
  Agent runtime compromise = seal attestation forgery. A rotation protocol is
  worth drafting before it becomes urgent.
- **When does Vault v1 field `balance_reserve` actually get dropped?** The
  C-285 compat window is short. External consumers of `/api/vault/status`
  may still expect the v1 shape.
- **Should Substrate receive a real web surface?** Today it's a git repo with
  a `docs.mobius.systems` mkdocs build. A live read surface
  (`substrate.mobius.systems/journals/atlas/latest`) would make the archive
  useful to external researchers without them having to clone the repo.

These are logged here to force future cycles to address them rather than
rediscover them.

---

## 8. A note about documentation drift

`CLAUDE.md` drifted 31 cycles. `CHANGELOG.md` drifted 100+ cycles. This was
not because anyone was lazy — it was because writing "what is the current
state of the substrate" is hard, and the temptation is to ship the code and
assume the docs follow.

The fix is not stricter enforcement. The fix is cheaper writing:

- Protocol docs are canonical and stable. Update them only when protocol
  changes.
- `cycle.json` is authoritative and updates automatically via cron.
- `CLAUDE.md` should update per-cycle, but only a few lines — the "Current
  Cycle", "Live GI", "Recent changes" fields. Most of it is stable.
- State-of-the-Substrate documents like this one are per-major-milestone,
  not per-cycle. Expect one of these every 20-30 cycles at cadence.

If this doc exists and the protocols are canonical and `cycle.json` is current,
the substrate is legible. That's the minimum.

---

*The cathedral is not a building. It is the practice of building together.
The substrate is not a repo. It is the practice of remembering together.*

**Maintained by:** Mobius Systems Core Team + Sentinel Council
**Cycle published:** C-284 (2026-04-17)
**Next snapshot expected:** ~C-310 or first Fountain activation, whichever comes first
