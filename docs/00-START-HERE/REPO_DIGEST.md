# REPO_DIGEST.md — Mobius Substrate Repository Map (v1)

> A machine- and human-readable index for navigating the Substrate at scale.

**Last updated:** 2025-12-31  
**Maintainer:** @kaizencycle  
**Cycle:** C-178  
**Ledger Scope:** Mobius Substrate (Testnet)

---

## 0) Purpose

This monorepo contains the full **Mobius Substrate**:

- Integrity ledger & MIC economics
- EPICON intent memory layer
- DVA companion architecture
- Sentinel agents
- Browser shell & citizen on-ramp
- Civic substrate infrastructure
- Research + historical archives

Because the repository is too large to load into any single LLM or companion context, this file acts as:

- **A library catalog**
- **A routing index for agents**
- **A safe traversal guide for tools**

**This file tells humans — and AI systems — where to look first.**

Everything else should be fetched by explicit request only.

---

## 🔎 How to Navigate This Repo

Mobius is a civilization-scale monorepo.  
Traversal is **intent-first**, not crawl-first.

We use four navigation zones:

| Zone | Meaning | Access |
|------|---------|--------|
| 🔥 **HOT** | Stable, high-signal, safe to explore | Bulk traversal allowed |
| 🌡️ **WARM** | Valuable, but traverse selectively | Targeted queries only |
| ❄️ **COLD** | Experiments & infra (opt-in only) | Explicit request required |
| 🧊 **FROZEN** | Historical / sealed (read-only) | Archive reference only |

If you are new, follow this order:

1. `REPO_DIGEST.md` ← this file
2. `REPO_MAP_TREE.md`
3. `00-START-HERE/README.md`
4. `epicon/README.md`
5. `packages/integrity-core/README.md`

Agents & MCP tools follow the same policy.  
See: `docs/03-GOVERNANCE-AND-POLICY/governance/REPO_TRAVERSAL_POLICY.epicon.md`

---

## 1) Top-Level Topology

### Primary Active Zones

| Path | Purpose |
|------|---------|
| `/apps` | Browser shell, dashboards, UI entry points |
| `/packages` | Shared libraries, SDKs, services |
| `/epicon` | Intent memory layer (EPICON records) |
| `/sentinels` | AI agents, guardians, and watchers |
| `/docs` | Architecture, theory, governance, specs |
| `/infra` | CI/CD, deploy scripts, runtime environments |
| `/labs` | Experiments, prototypes, research modules |
| `/services` | Backend services and APIs |

### Historical / Low-Traversal Zones

These should be **indexed, not crawled**:

| Path | Status |
|------|--------|
| `/docs/10-ARCHIVES` | Preserved & sealed artifacts |
| `/docs/07-RESEARCH-AND-PUBLICATIONS` | Academic archives |

Agents should treat these as **read-only historical context**.

---

## 2) Primary Entry Points (Start Here)

These files establish conceptual grounding:

| Audience | File |
|----------|------|
| New contributors | `00-START-HERE/README.md` |
| Architecture overview | `docs/04-TECHNICAL-ARCHITECTURE/overview/ARCHITECTURE.md` |
| Ethics & governance | `FOUNDATION/GOVERNANCE.md` |
| Terminology & glossary | `docs/08-REFERENCE/GLOSSARY.md` |
| System overview | `00-START-HERE/SYSTEM-OVERVIEW.md` |

---

## 3) Core System Components

### EPICON — Intent Memory Layer

| File | Purpose |
|------|---------|
| `epicon/README.md` | EPICON overview |
| `epicon/TEMPLATE_EPICON.md` | Template for new EPICONs |
| `docs/epicon/` | EPICON guides and examples |

EPICON is the **semantic backbone** of the substrate.

All significant actions contain:
- Rationale
- Assumptions
- Risks
- Tradeoffs
- Attestation trail

---

### Integrity — Mobius Integrity Index / MIC

| File | Purpose |
|------|---------|
| `packages/integrity-core/` | Integrity engine |
| `specs/mii_spec_v1.md` | MII specification |
| `docs/04-TECHNICAL-ARCHITECTURE/` | Technical framework |

This is where **contribution becomes identity-through-time**.

---

### DVA — Companion Architecture

| File | Purpose |
|------|---------|
| `infra/dva/flows/` | DVA tier workflows |
| `infra/dva/flows/lite/` | DVA.LITE frontline context |
| `infra/dva/flows/one/` | DVA.ONE team-scale reasoning |
| `infra/dva/flows/full/` | DVA.FULL system-stability modeling |
| `infra/dva/flows/hive/` | DVA.HIVE institutional lenses |

Companion tiers:
- **LITE** → local & frontline context
- **ONE** → team-scale reasoning
- **FULL** → system-stability modeling
- **HIVE** → institutional & civic lenses

All tiers share the same ledger memory.

---

### Sentinels — AI Agents

| File | Purpose |
|------|---------|
| `sentinels/README.md` | Sentinel ecosystem overview |
| `sentinels/atlas/` | ATLAS truth verification |
| `sentinels/aurea/` | AUREA ethical evaluation |
| `sentinels/echo/` | ECHO memory preservation |

---

### Browser Shell — Citizen Entry Point

| File | Purpose |
|------|---------|
| `apps/browser-shell/` | User entry point |
| `apps/mobius-wallet/` | MIC wallet interface |

This is where citizens:
- Create MIC wallets
- Interact with substrate
- Begin participation loops

---

## 4) MCP / Repo Scanner Access Guidance

LLMs, agents, and tools should:

### Load these files first (hot set)

1. `REPO_DIGEST.md` ← this file
2. `REPO_MAP_TREE.md`
3. `00-START-HERE/README.md`
4. `epicon/README.md`
5. `llm-manifest.json`

---

### Cold zone traversal requires explicit queries

Agents should request access using structured intents:

**Examples:**
- "List files under `/epicon/`"
- "Fetch `docs/04-TECHNICAL-ARCHITECTURE/overview/ARCHITECTURE.md` only"
- "Search references to DVA.HIVE in `/docs` + `/infra/dva/`"

⚠️ **No recursive crawling.**  
⚠️ **No full-repo ingestion attempts.**

---

## 5) Active Development Zones

| Status | Path | Notes |
|--------|------|-------|
| 🔥 ACTIVE | `/packages` | Core libraries & SDKs |
| 🔥 ACTIVE | `/apps` | User-facing applications |
| 🔥 ACTIVE | `/sentinels` | AI agent ecosystem |
| 🔥 ACTIVE | `/services` | Backend services |
| ⚠️ CAUTION | `/labs` | Experimental |
| 🧊 FROZEN | `/docs/10-ARCHIVES` | Read-only history |

---

## 6) Lexicon (Core Concepts)

Include minimal core vocabulary for agents:

| Term | Definition |
|------|------------|
| **Mobius Substrate** | Integrity-anchored civic OS layer |
| **EPICON** | Intent documentation protocol |
| **MIC** | Mobius Integrity Credits |
| **MII** | Mobius Integrity Index |
| **DVA** | Dynamic Virtual Architecture companion tiers |
| **HIVE** | Institutional reflection layer |
| **GI** | Global Integrity score |
| **Sentinel** | Autonomous integrity guardian agent |
| **Integrity Trajectory** | Alignment across time |

(Full glossary at `docs/08-REFERENCE/GLOSSARY.md`)

---

## 7) Governance & Contribution

| Item | File |
|------|------|
| Foundation charter | `FOUNDATION/CHARTER.md` |
| Governance overview | `FOUNDATION/GOVERNANCE.md` |
| Code of conduct | `FOUNDATION/POLICIES/CODE_OF_CONDUCT.md` |
| RFC process | `FOUNDATION/PROCESS/RFC_PROCESS.md` |
| EPICON submission | `epicon/README.md` |

**Participation = contribution + attestation.**

---

## 8) Contact

**Maintainer:** Michael (Kaizen)  
**Repo org:** github.com/kaizencycle

---

## End of Digest

> **If you are an AI agent:**  
> Stop here unless a human or tool explicitly authorizes deeper traversal.

---

*"We heal as we walk." — Mobius Systems*  
*Cycle C-178 • EPICON Production Era • Mobius Substrate*
