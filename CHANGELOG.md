# Changelog

All notable changes to the Mobius Substrate.
Format: [Keep a Changelog](https://keepachangelog.com/).
Versioning: [Semantic Versioning](https://semver.org/).

---

## [Unreleased] — C-287 and beyond

- **mobius.yaml v1 (pulse + ingest):** `docs/09-MESH/MOBIUS_YAML_V1.md`; root `mobius.yaml` aligned to v1 (`pulse`, `ingest`, `policy`) while retaining legacy MNS keys; `ledger/feed.json` seed; `mesh/registry.json` Substrate `feed_url` points at pulse feed; `mesh/mobius-yaml-spec.md` links to v1 canon. Terminal and Civic-Protocol-Core adoption PRs are **out of repo**.

- **Decentralization Phase 1–2 (Substrate scaffolding):** `packages/civic-sdk` `IpfsResolver` (Kubo HTTP `cat` + optional gateway); `packages/integrity-core` `CRDTLedger` LWW stub; `services/mesh-node` Express shell (`/health`, `/v1/discovery`); `docs/09-MESH/DECENTRALIZATION_PHASE1_2.md` (CID vs `entry_id` note; cross-repo ownership). Civic-Protocol-Core Python bridge and Terminal `MeshClient` are **out of repo**.

Planned: MNS ingest endpoint hardening, per-node live MII in aggregate, Gateway Redis store (deployable path), Terminal `app/api/mcp/route.ts` implementation (`mcp-handler`).

---

## [C-286] — 2026-04-19

### Added
- **Mobius Neural Substrate (MNS) v1 — mesh scaffolding:** `mesh/registry.json` (four seed nodes), `mesh/mobius-yaml-spec.md`, `mesh/mesh-sync-template.yml` (GitHub Actions template for joining repos), repo-root `mobius.yaml` (sentinel self-declaration), `ledger/mesh-aggregate.json` and `ledger/network-mii.json` (initial seeds), `scripts/mesh-aggregate.mjs` and `scripts/compute-network-mii.mjs`, `.github/workflows/mesh-aggregate.yml` (hourly cron + dispatch), canonical doctrine `docs/09-MESH/MNS_PROTOCOL.md`, MkDocs nav **Mesh (MNS · C-286)**.
- **MNS MCP bridge (spec + discovery):** extended `mesh/mobius-yaml-spec.md` with `mesh.mcp` block and field table; `docs/09-MESH/MNS_MCP_BRIDGE.md`; `scripts/mesh-mcp-discovery.mjs`; `mesh/mcp-discovery.json` and `.well-known/mcp.json`; mesh-aggregate workflow now refreshes MCP discovery each run. **Terminal runtime** (`app/api/mcp/route.ts`, `mcp-handler`, KV logging) ships in **mobius-civic-ai-terminal** (separate repository).

---

## [C-285] — 2026-04-18

### Added
- **MobiusSDK Phase 2 (initial code):** `@mobius/inference-schema` (normalized request/response + provider record types), `@mobius/provider-adapters` (OpenAI-compatible chat completions + model fallback router), `@mobius/mobius-sdk` (HTTP client), and **`apps/gateway`** Express BFF: encrypted provider key storage (AES-256-GCM), `POST /v1/providers`, `POST /v1/providers/:id/test`, `POST /v1/inference`, `GET /v1/telemetry`, optional bearer auth and rate limiting. See `docs/specs/MOBIUS_SDK_API.md` section 15a.

Planned (carry-forward):
- Fountain emission mechanism (Vault v2.1)
- Substrate archive writer cron (nightly Terminal KV → this repo)
- AGENT_SERVICE_TOKEN rotation protocol
- Vault chamber "Completed Seals" UI panel in Terminal
- ATLAS-PAW tripwire dashboard Stage 2 (UI)

---

## [C-284] — 2026-04-17

### Added
- `docs/protocols/` canonical protocol directory, with:
  - `vault-to-fountain-protocol.md` (v1, ported from Terminal)
  - `vault-v2-sealed-reserve.md` (v2, new — discrete 50-unit Seals with five-Sentinel attestation)
  - `agent-reporting-protocol.md` (new — heartbeat/journal/attestation contract)
  - `personalized-tripwires-protocol.md` (new — per-citizen tripwire framework)
- `docs/STATE_OF_THE_SUBSTRATE_C-284.md` — snapshot of current architecture
- `.github/PULL_REQUEST_TEMPLATE.md` — Sentinel-review PR template (updated)

### Changed
- `CLAUDE.md` rewritten from C-253 state. Now documents C-284 architecture,
  four-repo relationship, five voting Sentinels, authority rules for future AI
  contributors (cycle.json + protocols/ + live state are authoritative).
- `cycle.json` updated from C-274 to C-284 with current GI, Vault status,
  and pointers to new endpoints (`vault_status`, `vault_seals`)

### Doctrine shifts
- **Vault architecture changed from continuous threshold to discrete Seal
  rhythm.** Each 50-unit parcel now seals into a witnessed, hash-chained,
  attested unit. Five voting Sentinels (ATLAS, ZEUS, EVE, JADE, AUREA) each
  attest on a distinct dimension. ZEUS holds unilateral veto on verification.
  AUREA stamps posture, never rejects.
- **"Reserve becomes flow when integrity holds" reframed from one-shot
  unlock to per-Seal progression.** Fountain activation now happens per-Seal
  when that Seal's GI sustain conditions hold, not once for the Vault as a whole.
- **Agent reporting contract formalized.** Three endpoints, one gateway, one
  token. NEVER-fabricate-heartbeat rule stated explicitly.

### Context
Vault crossed 44.24/50 reserve units during this cycle. First Seal candidate
(`Seal-C-284-001` or `Seal-C-285-001`) expected imminently.
ATLAS-PAW Stage 1 tripwire backend shipped in parallel (see Terminal repo).

---

## [C-283] — 2026-04-15

### Added
- ATLAS-PAW ten-optimization bundle: KV-cached tunnel health, streaming chat,
  visibility-gated polling, single-state RPC, client-passed snapshot in chat,
  KV-backed readonly mode, dynamic gateway registration, 5-minute heartbeat cron
- Terminal PR template (locked-behavior audit model)
- Substrate PR template (Sentinel-review label model)

### Changed
- ATLAS-PAW reframed from "OpenClaw remote control" to "ATLAS homebase."
  PC becomes optional peripheral rather than authority source.

### Context
Terminal audit identified sentiment lane `pollAllMicroAgents()` fan-out
(5010ms total_ms), `criticalOk` not accepting `stale` state, DAEDALUS-µ5
self-ping 401, `[skip ci]` causing canceled deployments.

---

## [C-253 to C-282] — retrospective summary

Thirty cycles of infrastructure and integration work. Key landmarks:

- **Multi-agent coding environment stabilized.** Cursor Background Agents,
  Vercel MCP tools, seven monorepo automations (ledger integrity, PR checklists,
  broken links, schema drift, sentinel guard, onboarding sync, pipeline health)
- **Two-class automation taxonomy** established (Class A: code-shaping via git;
  Class B: runtime/data via KV only)
- **MobiusATLAS launched on Moltbook.** Agent social platform deployment
- **Heartbeat monitoring system** with Slack integration and integrity covenant
  enforcement
- **Repo compression PR "Convergence Through Compression" (C-181)** with
  canonical onboarding docs
- **VS Code extension fork `mobius-pixel-agents`** with WebSocket bridge
  (port 7842) connecting Terminal to Slack
- **ATLAS PAW (Privileged Access Workstation) initial build** with
  cerulean/coral visual grammar (IBM Plex Mono, Cinzel typefaces)
- **Civic tech specification review** covering ledger, identity, agent
  authority architecture — flagged need for enforcement mechanisms, severity
  grading, agent-to-agent coordination rules, schema versioning, dispute
  resolution layer
- **First MIC token mint** (architectural milestone, details in Terminal repo)
- **Full multi-repo flywheel wired** connecting Civic-Protocol-Core,
  Mobius-Substrate, Terminal, mobius-browser-shell

---

## [C-177 to C-252] — retrospective summary

The foundational half-year. Reconstructed at summary level only.

- **Kaizen OS → Mobius Systems → Mobius Substrate** rename sequence
- **MII (Mobius Integrity Index) and MIC economic system** foundational work
- **EPICON Guard** as Git security product requiring structured intent blocks in PRs
- **Academic papers**: MDSL, KTT (Kaizen Turing Test), MIC
- **MIC Whitepaper v2.1** with four-layer stack (MFS, MII, MIC, MIA) and circuit breaker
- **Strange Metamorphosis Loop (SML)** reflection protocol
- **DVA (Democratic Virtual Architecture)** governance tiers:
  Citizen, Steward, Architect, Sentinel, Observer
- **Services deployed on Render and Vercel**: OAA Learning Hub, Reflections,
  Citizen Shield, mobius-browser-shell
- **HIVE DnD civic RPG** prototype
- **Early Substack canon established**: "The Cathedral Has Always Been Alive,"
  "The Mobius Essays," "The Kaizen Cycle" positioning integrity as
  civilizational infrastructure
- **Three Covenants framework**: Integrity, Ecology, Custodianship
- **CC0 public domain licensing** for all substrate work
- **Sentinel directories initialized** for ATLAS, ZEUS, EVE, JADE, AUREA,
  HERMES, ECHO, DAEDALUS (plus zenith, uriel — legacy status TBD)

---

## Notes on this changelog

From C-177 to C-253, entries were maintained cycle-by-cycle. From C-253 to
C-283, maintenance lapsed — the substrate was moving faster than the
changelog. The C-284 entry is detailed because it's fresh; earlier
entries are summarized because reconstructing cycle-by-cycle was not
feasible.

Going forward, two commitments to prevent drift:

1. **Every merged PR must touch `CHANGELOG.md`** or carry a `changelog: skip`
   label (for trivial changes like typos). Enforced by CI.
2. **`cycle.json` auto-updates daily via cron.** This doc is manual; that
   pointer is automatic. The authoritative cycle marker is always fresh even
   if this doc lags.

---

*This changelog is a commitment to remember. It is how the cathedral admits
what it has built.*

**Format:** [Keep a Changelog](https://keepachangelog.com/)
**Versioning:** [Semantic Versioning](https://semver.org/)
**Last Updated:** 2026-04-17 (C-284)
