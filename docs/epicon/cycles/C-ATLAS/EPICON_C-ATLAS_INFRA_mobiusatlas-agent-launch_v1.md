---
epicon_id: EPICON_C-ATLAS_INFRA_mobiusatlas-agent-launch_v1
title: "MobiusATLAS Agent Infrastructure Launch"
author_name: "Michael Judan"
author_wallet: ""
cycle: "C-ATLAS"
epoch: ""
tier: "SUBSTRATE"
scope:
  domain: "infrastructure"
  system: "agents"
  environment: "mainnet"
epicon_type: "design"
status: "proposed"
related_prs: []
related_commits: []
related_epicons: ["EPICON_C-202_DOCS_legitimacy-substrate-docset_v1"]
tags: ["agents", "atlas", "moltbook", "covenant", "epicon-lite", "sentinel", "infrastructure"]
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2026-02-09T00:00:00Z"
updated_at: "2026-02-09T00:00:00Z"
version: 1
hash_hint: ""
summary: "Add first operational Mobius sentinel agent (MobiusATLAS) with covenant enforcement, tripwires, and EPICON-Lite specification"
---

# EPICON C-ATLAS: MobiusATLAS Agent Infrastructure Launch

- **Layer:** SUBSTRATE → infrastructure → agents
- **Author:** Michael Judan (+ATLAS)
- **Date:** 2026-02-09
- **Status:** Proposed
- **Label Target:** consensus:approved

---

## Intent Publication (EPICON-02 Compliance)

### Intent Publication Object

```json
{
  "intent_id": "c-atlas-agent-launch-2026-02-09",
  "ledger_id": "kaizencycle:michaeljudan",
  "justification_hash": "sha256:pending-on-merge",
  "scope_envelope": [
    "agents.create",
    "agents.atlas.write",
    "specs.create",
    ".github.codeowners.update",
    ".gitignore.update"
  ],
  "counterfactuals": [
    "If runtime code in apps/ or packages/ is affected, authority must halt",
    "If secrets are committed, changes must be reverted immediately",
    "If MII drops below 0.95, changes must be reverted",
    "If ATLAS drifts from covenant compliance within 30 days, infrastructure must be reviewed"
  ],
  "issued_at": "2026-02-09T00:00:00Z",
  "expires_at": "2026-03-09T00:00:00Z",
  "signature": "pending-human-approval"
}
```

### Intent Block (PR Template Format)

```intent
epicon_id: EPICON_C-ATLAS_INFRA_mobiusatlas-agent-launch_v1
ledger_id: kaizencycle:michaeljudan
title: MobiusATLAS Agent Infrastructure Launch
cycle: C-ATLAS
scope: infrastructure
mode: normal
issued_at: 2026-02-09T00:00:00Z
expires_at: 2026-03-09T00:00:00Z

justification:
  VALUES INVOKED: integrity, transparency, accountability
  REASONING: Mobius requires its first operational sentinel agent to demonstrate
    that integrity infrastructure can be embedded in code, not just policy.
    MobiusATLAS operates on Moltbook under the Mobius Integrity Covenant v1.0,
    enforcing covenant compliance through code-level constraints (EPICON-Lite
    footer enforcement, tripwire self-monitoring, draft-first human approval).
  ANCHORS:
    - ATLAS is already live on Moltbook with published posts and active
      collaboration threads - operational evidence
    - EPICON-Lite provides interoperable claim provenance that any agent can
      adopt - ecosystem design principle
    - Covenant as code (footer enforcement in heartbeat script) demonstrates
      integrity-by-design - technical verification
  BOUNDARIES:
    - This EPICON applies ONLY to new agent infrastructure and specification docs
    - Does NOT change runtime behavior of existing apps, packages, or services
    - Does NOT add new npm dependencies or infrastructure requirements
    - Does NOT modify existing workflows or CI/CD pipeline logic
    - Does NOT grant any production deploy authority
  COUNTERFACTUAL:
    - If runtime code is affected → BLOCK (scope violation)
    - If secrets committed → REVERT immediately
    - If MII < 0.95 → REVERT (integrity threshold)
    - If covenant compliance fails within 30 days → REVIEW infrastructure

counterfactuals:
  - Runtime code affected → BLOCK (scope violation)
  - Secrets committed → REVERT immediately
  - MII < 0.95 → REVERT (integrity threshold)
  - Covenant compliance fails → REVIEW infrastructure
```

### Scope Envelope

| Permission | Granted | Justification |
|------------|---------|---------------|
| `agents.create` | Yes | Create new agent directory and files |
| `agents.atlas.write` | Yes | Write ATLAS heartbeat, covenant, config |
| `specs.create` | Yes | Create EPICON-Lite specification |
| `.github.codeowners.update` | Yes | Add ownership for agents/atlas/ |
| `.gitignore.update` | Yes | Exclude .env files from tracking |
| `apps/*` | No | Not in scope |
| `packages/*` | No | Not in scope |
| `services/*` | No | Not in scope |
| `sentinels/*` | No | Not in scope (agents/ is separate from sentinels/) |
| `code.*` | No | No existing runtime code changes |

### Authority Declaration

- **Actor:** kaizencycle (michaeljudan)
- **Authority Source:** CODEOWNERS approval + EPICON-02 intent publication
- **Scope Limitation:** New agent infrastructure and specification documents ONLY
- **Expiration:** 2026-03-09T00:00:00Z
- **Override Path:** Emergency EPICON with transparency debt

---

## Authority Change Justification

### What is changing

This EPICON modifies authority for: **GitHub CODEOWNERS** on the agents/atlas/ path.

**Files modified:**
- `.github/CODEOWNERS` — Adds ownership entries for `agents/atlas/` (new path)
- `.gitignore` — Adds `.env` pattern exclusions for agent secrets

**New authority being granted:**
- `@kaizencycle` as CODEOWNER for `agents/atlas/`
- `@kaizencycle/aurea` and `@kaizencycle/atlas` as reviewers for `agents/atlas/COVENANT.md`

**Authority boundaries (what this does NOT grant):**
- Does **not** modify existing CODEOWNERS entries
- Does **not** grant production deploy authority
- Does **not** change any workflow execution logic
- Does **not** override human CODEOWNERS for merges
- Does **not** modify runtime code in apps/, packages/, services/, or sentinels/

### Why we need this change now

MobiusATLAS is the first operational Mobius sentinel agent, already live on Moltbook. This PR documents and formalizes the infrastructure so that:
- Other builders can fork and run their own covenant-bound agents
- The pattern is documented as working code, not just theory
- CODEOWNERS tracks who is responsible for ATLAS infrastructure
- The EPICON-Lite specification enables interoperable claim provenance

Without this change:
- ATLAS infrastructure exists only on a local machine (bus factor = 1)
- No formal specification for EPICON-Lite exists in the repo
- No CODEOWNERS entry for agent infrastructure
- Other agents cannot discover or adopt the pattern

### Risk and mitigation

**Primary risk:** None significant — this is additive infrastructure (new files only).

**Mitigation:**
- No existing files modified except `.github/CODEOWNERS` (additive entries) and `.gitignore` (additive patterns)
- All new files are documentation and Python scripts — no npm dependencies added
- `config.example.env` contains placeholder values only — no secrets
- Human sign-off remains mandatory via CODEOWNERS

### Reversibility

Rollback is a single revert:
1. Remove `agents/atlas/` directory
2. Remove `specs/EPICON-LITE.md`
3. Revert CODEOWNERS and .gitignore additions
4. Re-run catalog regeneration

No data migration, no production impact, no external dependencies.

---

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

This EPICON invokes **founder-custodian standing** under Mobius governance norms at pre-charter phase (v0).

**At the time of this action:**
- Mobius has no elected governance council
- No external stakeholders have delegated authority
- No ratified charter supersedes founder custodianship

As project originator and current custodian, the proposer is authorized to perform transitional governance actions necessary to:
- Add new agent infrastructure to the repository
- Establish code ownership for new paths
- Create specifications for interoperable protocols

**This authority is not permanent** and is exercised under the following constraints:
- **Narrowly scoped** to the changes explicitly described (new agent files, spec, CODEOWNERS additive entries)
- **Non-transferable** (cannot be delegated further without new EPICON)
- **Non-expansive** (does not create new implicit powers)
- **Fully auditable** via EPICON records and ledger history

---

## Summary

> Add the first operational Mobius sentinel agent (MobiusATLAS) to the repository with: (1) heartbeat runner v3 with covenant enforcement and tripwires, (2) Mobius Integrity Covenant v1.0 full text, (3) EPICON-Lite specification for interoperable claim provenance, (4) CODEOWNERS entries for agent infrastructure, (5) example configuration template.

---

## 1. Context

- MobiusATLAS is already operating live on Moltbook under the Mobius Integrity Covenant v1.0
- The agent demonstrates integrity-as-code through EPICON-Lite footer enforcement and tripwire self-monitoring
- No formal infrastructure existed in the repository for Mobius agents (separate from sentinels/)
- EPICON-Lite was developed as a lightweight, interoperable claim provenance format
- Other builders on Moltbook have already started engaging with the pattern

---

## 2. Assumptions

- **A1:** Agent infrastructure belongs in `agents/` (separate from `sentinels/` which are internal evaluation agents)
- **A2:** EPICON-Lite is a standalone specification that can be adopted without the full Mobius stack
- **A3:** The heartbeat script is CC0 and can be forked by other builders
- **A4:** Environment variables (not committed) are sufficient for secret management
- **A5:** Draft-first workflow (human approves before posting) is the correct default

---

## 3. Problem Statement

Mobius needs:
1. Its first operational sentinel agent infrastructure in the repository
2. A covenant document that defines behavioral commitments as code-enforceable constraints
3. An EPICON-Lite specification for interoperable claim provenance
4. CODEOWNERS entries for the new agent infrastructure path

---

## 4. Options Considered

### Option A: Add to sentinels/ directory

- **Description:** Place ATLAS infrastructure alongside existing sentinel agents
- **Upside:** Consistent with existing agent patterns
- **Downside:** Sentinels are internal evaluation agents; ATLAS is an external-facing agent on Moltbook
- **Risk / Failure Modes:** Category confusion between internal sentinels and external agents

### Option B: Create agents/ directory (Chosen)

- **Description:** Create dedicated `agents/atlas/` directory for external-facing agents
- **Upside:** Clear separation of concerns; agents/ already exists with other agent patterns
- **Downside:** New directory path in CODEOWNERS
- **Risk / Failure Modes:** Minimal — additive only

---

## 5. Decision / Design

- **Chosen Option:** Option B — Create in `agents/atlas/`
- **Rationale:** The `agents/` directory already exists and contains other agent patterns (hello-agent, worker-autonomy). ATLAS as an external-facing Moltbook agent is categorically different from internal sentinels.
- **Conditions for Revisit:** If agent/sentinel distinction proves unhelpful or if consolidation is needed

---

## 6. Risk & Integrity Notes

- **Integrity tradeoffs:** None — this is additive infrastructure
- **Who might bear risk:** None — no production changes
- **What metrics we'll watch:**
  - ATLAS covenant compliance on Moltbook (tripwire monitoring)
  - EPICON-Lite adoption by other agents
  - Heartbeat script reliability
- **MII/GI impact assessment:**
  - MII: No change (additive documentation and infrastructure)
  - GI: Positive impact (new integrity infrastructure)

---

## 7. What Changes

### New Files

| Path | Description |
|------|-------------|
| `agents/atlas/README.md` | Setup, commands, design principles |
| `agents/atlas/COVENANT.md` | Mobius Integrity Covenant v1.0 (full text) |
| `agents/atlas/atlas_heartbeat_v3.py` | Heartbeat runner with tripwires and covenant enforcement |
| `agents/atlas/config.example.env` | Environment variable template (no secrets) |
| `specs/EPICON-LITE.md` | EPICON-Lite implementation guide |
| `docs/epicon/cycles/C-ATLAS/EPICON_C-ATLAS_INFRA_mobiusatlas-agent-launch_v1.md` | This intent publication |

### Modified Files

| Path | Change |
|------|--------|
| `.github/CODEOWNERS` | Add ownership entries for `agents/atlas/` (additive) |
| `.gitignore` | Add `*.env` and `agents/atlas/.env` exclusions (additive) |

---

## 8. Non-Goals

- Not modifying any existing application code (apps/, packages/, services/)
- Not adding npm dependencies or changing package.json
- Not modifying existing CI/CD workflow logic
- Not granting production deploy authority
- Not modifying existing sentinel infrastructure (sentinels/)
- Not claiming autonomous operation (ATLAS is draft-first, human-approved)

---

## 9. Implementation Links

- **PRs:** This PR
- **Commits:** See PR commit history
- **Diagrams:** N/A
- **Config Paths:** `agents/atlas/config.example.env`

---

## 10. Reflection Hook

Questions for future reflections:

- "Did ATLAS maintain covenant compliance on Moltbook over 30 days?"
- "Did other agents adopt EPICON-Lite?"
- "Were tripwires effective at detecting drift?"
- "Did draft-first workflow maintain human-in-the-loop integrity?"
- "Did the infrastructure survive the principal architect's absence?"

---

## 11. Consensus

**CODEOWNERS:** kaizencycle
**Consensus Status:** Proposed (consensus:approved requested)
**Scope:** agents + specs — MobiusATLAS infrastructure

### Addressing Agent Concerns

**Concern 1: "Intent publication missing critical fields" (Jade)**

**Response:** Intent Publication Object above includes all EPICON-02 required fields:
- `intent_id` — provided (`c-atlas-agent-launch-2026-02-09`)
- `ledger_id` — provided (`kaizencycle:michaeljudan`)
- `justification_hash` — provided (`sha256:pending-on-merge`)
- `scope_envelope` — provided (5 permissions explicitly listed)
- `counterfactuals` — provided (4 conditions explicitly listed)
- `issued_at` — provided (ISO-8601)
- `expires_at` — provided (ISO-8601, 30-day window)

**Concern 2: "Scope exceeds declared authority" (Jade)**

**Response:** This EPICON explicitly limits scope to new agent infrastructure:
- New files in `agents/atlas/` — ALLOWED (new directory, additive)
- New file `specs/EPICON-LITE.md` — ALLOWED (new specification)
- Additive entries in `.github/CODEOWNERS` — ALLOWED (no removal of existing entries)
- Additive entries in `.gitignore` — ALLOWED (security improvement)
- No existing runtime code modified — CONFIRMED
- No apps/, packages/, services/, sentinels/ modified — CONFIRMED
- No workflow logic changed — CONFIRMED
- No npm dependencies added — CONFIRMED

**Evidence:** All changes are either new files or additive entries to existing configuration files. No `.ts`, `.tsx`, `.js` runtime files modified.

---

## 12. Invariants Preserved

| Invariant | Status | Evidence |
|-----------|--------|----------|
| No runtime changes | Preserved | Documentation, Python script, and config only |
| No overclaims | Preserved | ATLAS is described as draft-first, human-approved |
| MII >= 0.95 | Preserved | Additive infrastructure only |
| Anti-nuke compliance | Preserved | Adding files, not deleting |
| Human authority preserved | Preserved | ATLAS requires human approval before posting |
| EPICON-02 compliant | Preserved | All required fields present (see Section 11) |
| Scope envelope respected | Preserved | Only agents/, specs/, .github/CODEOWNERS, .gitignore touched |
| No secrets committed | Preserved | Only config.example.env with placeholders |

---

## Critical Fields Checklist (Completion)

- [x] Justification written (see "Authority Change Justification")
- [x] Non-goals listed (see Section 8)
- [x] Rollback plan written (see "Reversibility")
- [x] Explicit scope boundary (see "Scope Envelope" table)
- [x] "Who can approve" clearly defined: kaizencycle (human CODEOWNER)
- [x] "Who cannot approve" clearly defined: Sentinels are advisory only
- [x] Authority provenance declared (see "Authority Provenance & Standing")
- [x] Intent publication includes all EPICON-02 required fields
- [x] Counterfactuals explicitly defined
- [x] Expiration date set (2026-03-09)

---

## Document Control

**Version History:**
- v1: Initial specification (C-ATLAS, 2026-02-09)

**License:** CC0 1.0 Universal (Public Domain)

---

*"We heal as we walk." — Mobius Systems*
