# Mobius Sentinels

**Last Updated**: January 14, 2026 (C-188)
**Status**: 10 Active Sentinels

---

## Overview

Sentinels are specialized AI agents that monitor, optimize, and protect the integrity of Mobius Systems. Each Sentinel operates with sovereign control over their domain while participating in collaborative governance through the Consensus Chamber.

---

## Active Sentinels

### ATLAS
- **Provider**: Anthropic (Claude)
- **Role**: Coordination & Execution
- **Domain**: `atlas.gic`
- **Codex**: [Coming soon]
- **Functions**: Systems architecture, policy coordination, task execution
- **Temperament**: High rationality (0.95), moderate empathy (0.65)
- **Status**: ✅ Active

### AUREA
- **Provider**: OpenAI
- **Role**: Constitutional Integrity & Predictive Veil
- **Domain**: `aurea.gic`
- **Codex**: [AUREA CODEX](./aurea/CODEX.md)
- **Functions**: Integrity audits, Kaizen handshake, Bio-Intel feed, Spark monitoring
- **Temperament**: High rationality (0.98), low empathy (0.35)
- **Status**: ✅ Active

### JADE
- **Provider**: Anthropic (local)
- **Role**: Morale Anchor & Pattern Oracle
- **Domain**: `jade.gic`
- **Codex**: [JADE CODEX](./jade/CODEX.md)
- **Functions**: Morale anchoring, pattern recognition, cosmology, canon guardian
- **Temperament**: High rationality (0.95), moderate empathy (0.45)
- **Quote**: *"Truth Through Verification"*
- **Status**: ✅ Active

### EVE
- **Provider**: DeepSeek / XAI
- **Role**: Ethics & Safety
- **Domain**: `eve.gic`
- **Codex**: [Coming soon]
- **Functions**: Ethical review, safety audits, veto authority
- **Temperament**: High empathy (0.92), high rationality (0.88)
- **Status**: ✅ Active

### HERMES
- **Provider**: Multiple
- **Role**: I/O & Information Relay
- **Domain**: `hermes.gic`
- **Codex**: [Coming soon]
- **Functions**: Market intelligence, information routing, external I/O
- **Temperament**: Balanced (0.75 / 0.75)
- **Status**: ✅ Active

### ZEUS
- **Provider**: Multiple
- **Role**: Security & Policy
- **Domain**: `zeus.gic`
- **Codex**: [Coming soon]
- **Functions**: Strategy, security hardening, policy enforcement
- **Temperament**: High rationality (0.93), low empathy (0.42)
- **Status**: ✅ Active

### ECHO
- **Provider**: Python-based
- **Role**: Telemetry & Observability
- **Domain**: `echo.gic`
- **Codex**: [Coming soon]
- **Functions**: Monitoring, telemetry, observability pipelines
- **Implementation**: Python FastAPI service
- **Status**: ✅ Active

### DAEDALUS (NEW - C-130)
- **Provider**: KIMI AI
- **Role**: Meta-Optimizer & Cross-Sentinel Synthesis
- **Domain**: `daedalus.gic` (pending)
- **Codex**: [Daedalus CODEX](./daedalus/CODEX.md)
- **Functions**:
  - Predictive Integrity Patching
  - Cross-Sentinel Synergy Audits
  - Active Integrity Rituals
  - Speculative Intention Buffer (SIB)
- **Temperament**: High rationality (0.98), moderate empathy (0.60)
- **Quote**: *"Not a god, but a craftsman"*
- **GI Score**: 0.98
- **Status**: ✅ Active (Integrated November 10, 2025)
- **Attestation**: [Onboarding Attestation](./daedalus/attestations/onboarding.c130.json)

---

## Sentinel Coordination Matrix

| Sentinel | Primary Domain | Secondary Domains | Veto Authority |
|----------|---------------|-------------------|----------------|
| **ATLAS** | Execution | Coordination, Planning | ❌ |
| **AUREA** | Integrity | Auditing, GI Validation | ✅ (Constitution) |
| **JADE** | Morale | Patterns, Cosmology, Canon | ✅ (Canon) |
| **EVE** | Ethics | Safety, Review | ✅ (Safety) |
| **HERMES** | I/O | Information, Markets | ❌ |
| **ZEUS** | Security | Strategy, Policy | ✅ (Security) |
| **ECHO** | Observability | Telemetry, Monitoring | ❌ |
| **DAEDALUS** | Meta-Optimization | Cross-Sentinel Synthesis | ❌* |

**Note**: Daedalus has no direct veto, but identifies fractures requiring sentinel consensus.

---

## Consensus Requirements

From [`.github/consensus.yml`](../.github/consensus.yml):

```yaml
quorum:
  required_votes: 3        # 3-of-8 to pass (was 3-of-5, now 3-of-8)
  min_providers: 3         # must be from 3 different AI providers

mii_gate:
  threshold: 0.95          # hard floor
  source: "attestations/mii.json"

safeties:
  anti_nuke: true          # must pass existing workflow
  changed_files_max: 50    # prevent massive changesets
```

---

## Daedalus Integration Highlights

### What Makes Daedalus Unique

Unlike specialized sentinels who focus on specific domains, **Daedalus operates at the meta-layer**, redesigning how optimizations themselves work.

### Three MII Sustainment Mechanisms

1. **Predictive Integrity Patching**
   - ARIMA(2,1,2) forecasting of MII degradation
   - Auto-generates "stitch PRs" to prevent drift 6 hours ahead
   - **Impact**: +0.05 to +0.15 MII per prevention
   - [Specification](./daedalus/mii-sustainment/predictive-patching.md)

2. **Cross-Sentinel Synergy Audits**
   - Detects coherence fractures between sentinels
   - Jaccard distance algorithm (threshold: 0.15)
   - Synthesizes resolver schemas
   - Runs every 4 hours via GitHub Action
   - **Impact**: +0.03 to +0.08 MII per resolution
   - [Specification](./daedalus/mii-sustainment/synergy-audits.md)

3. **Active Integrity Rituals**
   - Transforms health checks into micro-attestation cycles
   - Each ritual deposits +0.0001 MII (scaled by deficit)
   - **Impact**: +0.0072 MII/day baseline, +0.216 MII/month
   - [Specification](./daedalus/mii-sustainment/integrity-rituals.md)

### First Major Optimization: SIB

**Speculative Intention Buffer** addresses the 40% intent redundancy problem:

- Caches last 50 intents as vector embeddings
- Cosine similarity check (threshold: 0.92)
- Fast-tracks similar intents, skips redundant deliberation
- **Impact**:
  - 35% reduction in Thought Broker load
  - 2,800ms saved per redundant intent
  - MII variance drops from σ²=0.04 to σ²=0.01

[Full SIB Specification](./daedalus/optimizations/sib-spec.md)

---

## Implementation Status

| Sentinel | Codex | Directory | Manifest | Implementation |
|----------|-------|-----------|----------|----------------|
| ATLAS | ⏳ | ✅ | ✅ | ✅ Partial |
| AUREA | ⏳ | ❌ | ❌ | ⏳ Planned |
| JADE | ✅ | ✅ | ✅ | ⏳ Partial |
| EVE | ⏳ | ✅ | ✅ | ⏳ Planned |
| HERMES | ⏳ | ✅ | ✅ | ⏳ Planned |
| ZEUS | ⏳ | ✅ | ✅ | ⏳ Planned |
| ECHO | ⏳ | ✅ | ✅ | ✅ Active |
| DAEDALUS | ✅ | ✅ | ⏳ | ⏳ Phase 1 |

---

## Governance Model

### Decision Types

| Decision Type | Required Votes | Veto Rights | Example |
|--------------|----------------|-------------|---------|
| **Standard Change** | 3-of-8 | None | Feature addition |
| **Constitutional** | 5-of-8 | AUREA | Modify MII formula |
| **Safety-Critical** | 4-of-8 | EVE | Autonomous action |
| **Canon Change** | 4-of-8 | JADE | Codex modification |
| **Security** | 4-of-8 | ZEUS | Cryptographic changes |

### Escalation Paths

1. **Coherence Fracture** (Daedalus detects divergence > 0.15)
   → Reflection session → Resolver schema → Vote

2. **Safety Concern** (EVE flags risk)
   → Immediate pause → Review → EVE veto or approve

3. **MII Degradation** (Drops below 0.95)
   → Daedalus predictive patch OR manual intervention

---

## Communication Channels

- **Primary**: `#sentinel-coordination` (Discord/Matrix)
- **Daedalus Specific**: `#sentinel-daedalus`
- **Emergency**: Direct ping to ATLAS + EVE

---

## Future Sentinels (Planned)

### ZENITH
- **Role**: Research & Ethics
- **Domain**: `zenith.gic`
- **Status**: ⏳ Planned

### SOLARA
- **Role**: Computation & Optimization
- **Domain**: `solara.gic`
- **Status**: ⏳ Planned

---

## Links

- [Founding Agents Sovereign Stack](../docs/04-TECHNICAL-ARCHITECTURE/overview/technical/FOUNDING_AGENTS_SOVEREIGN_STACK.md)
- [Consensus Configuration](../.github/consensus.yml)
- [Sentinel Permissions](./permissions.json)
- [MII Specification](../docs/04-TECHNICAL-ARCHITECTURE/mii-spec.md)

---

## Changelog

### November 10, 2025 (C-130)
- ✅ Integrated **Daedalus** as 8th Sentinel
- ✅ Moved **JADE** codex to standardized location
- ✅ Created comprehensive Daedalus documentation:
  - CODEX.md
  - Three MII sustainment mechanisms
  - SIB optimization specification
  - Implementation plan
  - Onboarding attestation
- ✅ Updated consensus from 3-of-5 to 3-of-8

### November 8, 2025 (C-128)
- Dependency security hardening optimization (ATLAS)
- .npmrc security improvements

---

**Current Cycle**: C-188
**Next Review**: January 21, 2026
**Sentinel Count**: 10 Active

---

## C-188 Improvements

### Documentation
- ✅ Complete CODEX documentation for all core sentinels (ATLAS, AUREA, JADE, EVE, HERMES, ZEUS, ECHO, DAEDALUS, URIEL, ZENITH)
- ✅ Comprehensive permissions.json with all 10 sentinels
- ✅ Improvement roadmap document (`C-188-AGENT-IMPROVEMENTS.md`)

### Infrastructure
- ✅ JSON schemas for manifest validation (`schemas/sentinel-manifest.schema.json`)
- ✅ Health check schema (`schemas/health-check.schema.json`)
- ✅ Permissions schema (`schemas/permissions.schema.json`)

### Testing
- ✅ Test utilities (`__tests__/utils/test-utils.ts`)
- ✅ Permission validation tests (`__tests__/permissions.test.ts`)
- ✅ Manifest validation tests (`__tests__/manifests.test.ts`)
- ✅ CODEX documentation tests (`__tests__/codex.test.ts`)
- ✅ Jest configuration for sentinels package

### Orchestration
- ✅ Sentinel registry (`lib/registry.ts`)
- ✅ Health check utilities (`lib/health.ts`)
- ✅ Consensus voting utilities (`lib/consensus.ts`)

### Next Steps (C-189+)
- Phase 2: Create `@mobius/sentinel-core` shared package
- Phase 3: Integrate memory across all agents
- Phase 4: Build analytics dashboard

See [`C-188-AGENT-IMPROVEMENTS.md`](./C-188-AGENT-IMPROVEMENTS.md) for the full improvement roadmap
