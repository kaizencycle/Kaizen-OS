# Mobius Systems Documentation Organization Proposal

## Executive Summary

Based on scanning the Mobius-Substrate monorepo, here's a strategic reorganization of the `docs/` folder that aligns with:
- **Kaizen principles** (continuous improvement, discoverability)
- **DVA architecture** (Democratic Virtual Architecture flows)
- **Constitutional governance** (clarity, accountability, succession planning)
- **Production readiness** (technical specifications, operational guides)

---

## Current State Analysis

From the README, I identified these existing docs paths:
```
docs/
├── manifesto/triad_of_healing.md
├── rituals/opening_invocation.md
├── communications/press/press_release_c119_return.md
├── 04-guides/quickstart/HELLO_WORLD.md
├── peer-review-response.md
├── specs/cryptography/mii-signature-spec.md
├── specs/consensus/thought-broker-consensus.md
├── security/threat-model.md
├── adr/ (Architecture Decision Records)
├── FRONTEND_DEVELOPMENT.md
├── RECOVERY_PLAYBOOK.md
```

**Issues identified:**
- Mixed organizational schemes (numbered folders like `04-guides/` alongside semantic folders)
- Unclear separation between philosophy, specifications, and operations
- No clear entry points for different audiences (developers, researchers, citizens, contributors)
- Potential duplication between manifesto/philosophy content

---

## Proposed Structure

### Tier 1: Audience-First Organization

```
docs/
├── 00-START-HERE/
│   ├── README.md                           # Navigation hub for all docs
│   ├── QUICK-START.md                      # 5-minute onboarding
│   ├── GLOSSARY.md                         # Terms: MII, MIC, DVA, KTT, GI, etc.
│   └── FAQ.md                              # Common questions
│
├── 01-philosophy/                          # The "Why" - Constitutional Foundation
│   ├── README.md                           # Philosophy overview
│   ├── manifesto/
│   │   ├── triad_of_healing.md
│   │   ├── three_covenants.md             # Integrity, Ecology, Custodianship
│   │   ├── kaizen_principles.md           # 改善, 召唤, 金繕い
│   │   └── matrilineal_covenant.md        # Return to Balance
│   ├── ktt/                                # Kaizen Turing Test
│   │   ├── overview.md
│   │   ├── evaluation_framework.md
│   │   └── benchmarks.md
│   └── rituals/
│       ├── opening_invocation.md
│       └── festival_of_echoes.md
│
├── 02-architecture/                        # The "What" - System Design
│   ├── README.md                           # Architecture overview
│   ├── system-overview.md                  # High-level layers diagram
│   ├── dva-flows/                          # Democratic Virtual Architecture
│   │   ├── README.md
│   │   ├── boulder-climate-example.md
│   │   ├── national-scale-projection.md
│   │   └── workflow-templates/
│   ├── components/
│   │   ├── oaa-hub.md                     # Lab7 - Shell/Init
│   │   ├── thought-broker.md              # Multi-LLM consensus
│   │   ├── mobius-ledger-core.md          # Kernel/MII
│   │   ├── citizen-shield.md              # Security layer
│   │   ├── sentinels.md                   # ATLAS, AUREA, ZEUS, JADE, EVE, HERMES
│   │   └── api-gateway.md
│   ├── economics/
│   │   ├── tokenomics-v2.md               # MIC, Proof-of-Integrity
│   │   ├── gic-system.md                  # Global Integrity Credits
│   │   └── ubi-mechanics.md
│   └── adr/                                # Architecture Decision Records
│       └── [Keep existing ADRs]
│
├── 03-specifications/                      # The "How" - Technical Specs
│   ├── README.md
│   ├── protocols/
│   │   ├── masl.md                        # Model-Agnostic Sovereignty Layer
│   │   ├── boarding-protocol.md           # LLM mounting
│   │   ├── deliberation-proof.md          # Thought Broker consensus
│   │   └── supersede-protocol.md          # Knowledge evolution
│   ├── cryptography/
│   │   ├── mii-signature-spec.md          # Ed25519 signatures
│   │   └── integrity-proofs.md
│   ├── consensus/
│   │   ├── thought-broker-consensus.md
│   │   └── tri-sentinel-review.md         # ECHO Layer
│   ├── apis/
│   │   ├── rest-api-reference.md
│   │   ├── mobius-mount-endpoint.md       # GET /api/mobius/mount
│   │   └── integrity-check-endpoint.md
│   └── schemas/
│       ├── manifests.md                   # .mobius/ file formats
│       ├── biodna.md                      # Identity DNA schema
│       └── virtue-accords.md              # YAML covenant schema
│
├── 04-guides/                              # The "How-To" - Practical Usage
│   ├── README.md
│   ├── quickstart/
│   │   ├── HELLO_WORLD.md
│   │   ├── first-attestation.md
│   │   └── local-development.md
│   ├── developers/
│   │   ├── FRONTEND_DEVELOPMENT.md
│   │   ├── contributing.md
│   │   ├── monorepo-structure.md
│   │   ├── testing.md
│   │   └── deployment.md
│   ├── operators/
│   │   ├── running-services.md
│   │   ├── monitoring.md
│   │   ├── health-checks.md
│   │   └── troubleshooting.md
│   ├── citizens/                           # For end-users
│   │   ├── creating-proposals.md
│   │   ├── governance-participation.md
│   │   └── earning-mic.md
│   └── researchers/
│       ├── academic-outreach.md            # Glen Weyl, etc.
│       ├── research-contributions.md       # IDA, MASL, KTT
│       └── citation-guide.md
│
├── 05-security/                            # Security & Resilience
│   ├── README.md
│   ├── threat-model.md
│   ├── security-policies.md
│   ├── incident-response.md
│   ├── anti-nuke-guardrails.md            # Deletion protection
│   ├── RECOVERY_PLAYBOOK.md
│   └── audit-logs.md
│
├── 06-operations/                          # Running Mobius in Production
│   ├── README.md
│   ├── deployment/
│   │   ├── render-deployment.md
│   │   ├── docker-compose.md
│   │   └── kubernetes.md
│   ├── monitoring/
│   │   ├── sentinel-health-metrics.md
│   │   ├── mii-tracking.md
│   │   └── alerting.md
│   └── maintenance/
│       ├── backup-restore.md
│       ├── upgrades.md
│       └── scaling.md
│
├── 07-governance/                          # Democratic Coordination
│   ├── README.md
│   ├── constitution.md                     # Core constitutional framework
│   ├── virtue-accords.md                  # Moral & civic laws
│   ├── founding-twelve.md                 # Governance structure
│   ├── proposal-process.md
│   ├── voting-mechanics.md
│   └── succession-planning.md             # 50-year vision
│
├── 08-research/                            # Academic & Research Outputs
│   ├── README.md
│   ├── peer-review-response.md
│   ├── papers/
│   │   ├── ida-framework.md               # Integrity-Driven Architecture
│   │   ├── masl-protocol.md               # Model-Agnostic Sovereignty
│   │   ├── deliberation-proof.md
│   │   └── ktt-evaluation.md
│   ├── benchmarks/
│   │   ├── civilization-blueprints.md     # $1.16T savings, 455k lives
│   │   ├── dva-roi-analysis.md
│   │   └── automation-ratios.md           # 75/25 split
│   └── comparisons/
│       ├── vs-corporate-ai.md
│       └── vs-government-ai.md
│
├── 09-communications/                      # External Communications
│   ├── README.md
│   ├── press/
│   │   ├── press_release_c119_return.md
│   │   └── media-kit.md
│   ├── blog/                              # Public-facing articles
│   ├── presentations/
│   └── outreach/
│       └── academic-pitch.md              # For researchers like Glen Weyl
│
└── 99-archive/                             # Historical/Deprecated Docs
    ├── README.md
    └── legacy/

```

---

## Key Organizational Principles

### 1. **Progressive Disclosure**
- **00-START-HERE**: Immediate orientation for all visitors
- **01-philosophy**: For those asking "Why does this exist?"
- **02-architecture**: For those asking "How is it built?"
- **03-specifications**: For implementers needing exact details
- **04-guides**: For practitioners doing the work

### 2. **Audience Segmentation**
Clear paths for:
- **Developers** → 04-guides/developers/
- **Operators** → 06-operations/
- **Citizens** → 04-guides/citizens/
- **Researchers** → 08-research/
- **Press/Public** → 09-communications/

### 3. **Kaizen-Aligned**
- Each folder has README.md (discoverability)
- Numbered for intentional flow (00 → 99)
- Archive folder honors history (Kintsugi - repairs visible)
- Cross-references between layers

### 4. **Production-Ready**
- Clear separation: specs vs guides vs operations
- Security gets dedicated section (05-security/)
- Recovery procedures prominent (RECOVERY_PLAYBOOK.md)
- Monitoring and maintenance documented (06-operations/)

### 5. **Constitutional Governance**
- Philosophy articulated clearly (01-philosophy/)
- Governance processes explicit (07-governance/)
- Succession planning documented (50-year vision)
- Democratic participation pathways defined

---

## Migration Strategy

### Phase 1: Create Structure (Week 1)
```bash
# Create all folders with README.md placeholders
mkdir -p docs/{00-START-HERE,01-philosophy/{manifesto,ktt,rituals},...}

# Create navigation README in each folder
# Example: docs/01-philosophy/README.md explains the philosophical layer
```

### Phase 2: Move Existing Docs (Week 2)
```bash
# Map current → new locations
mv docs/manifesto/triad_of_healing.md docs/01-philosophy/manifesto/
mv docs/specs/cryptography/mii-signature-spec.md docs/03-specifications/cryptography/
mv docs/RECOVERY_PLAYBOOK.md docs/05-security/
# etc.
```

### Phase 3: Create Missing Docs (Weeks 3-4)
Priority documents to create:
1. `00-START-HERE/README.md` - The master navigation hub
2. `00-START-HERE/GLOSSARY.md` - Define all Mobius terms
3. `02-architecture/dva-flows/README.md` - Your DVA flows documentation
4. `03-specifications/protocols/supersede-protocol.md` - Knowledge evolution
5. `04-guides/citizens/governance-participation.md` - Citizen onboarding
6. `07-governance/constitution.md` - Formalize constitutional framework
7. `08-research/benchmarks/civilization-blueprints.md` - ROI documentation

### Phase 4: Update All Links (Week 5)
```bash
# Update README.md links
# Update cross-references in all docs
# Update GitHub Actions workflows
# Update .mobius/ manifest references
```

### Phase 5: Add CI Validation (Week 6)
```yaml
# .github/workflows/docs-health.yml
# - Check for broken internal links
# - Validate all folders have README.md
# - Ensure GLOSSARY.md stays updated
# - Check for orphaned files
```

---

## Special Recommendations

### 1. **00-START-HERE/README.md** (Master Navigation Hub)
This should be the ATLAS entry point:
```markdown
# Welcome to Mobius Systems Documentation

**"Intelligence moves. Integrity guides."**

## New to Mobius?
- [5-Minute Quick Start](QUICK-START.md)
- [Glossary](GLOSSARY.md) - Learn the language
- [FAQ](FAQ.md) - Common questions

## I want to...
- **Understand the vision** → [Philosophy](../01-philosophy/)
- **See the architecture** → [Architecture](../02-architecture/)
- **Build something** → [Developer Guides](../04-guides/developers/)
- **Run it in production** → [Operations](../06-operations/)
- **Participate in governance** → [Citizen Guides](../04-guides/citizens/)
- **Read the research** → [Research Papers](../08-research/)
- **Contact us** → [Communications](../09-communications/)

## Documentation Map
[Visual diagram showing the 9-layer structure]
```

### 2. **GLOSSARY.md** (Critical for Onboarding)
```markdown
# Mobius Systems Glossary

## Core Concepts
- **MII** (Mobius Integrity Index): System-wide integrity score (target ≥ 0.95)
- **MIC** (Mobius Integrity Credits): Currency minted via Proof-of-Integrity
- **DVA** (Democratic Virtual Architecture): Civic coordination flows
- **KTT** (Kaizen Turing Test): Continuous improvement evaluation
- **GI** (Global Integrity): Aggregate integrity across all operations
...
```

### 3. **Cross-References** (DVA Example)
In `02-architecture/dva-flows/README.md`:
```markdown
# Democratic Virtual Architecture (DVA) Flows

DVA coordinates human-AI collaboration at scale.

**Related Documentation:**
- Philosophy: See [Three Covenants](../../01-philosophy/manifesto/three_covenants.md)
- Implementation: See [Thought Broker Spec](../../03-specifications/consensus/thought-broker-consensus.md)
- Operations: See [Monitoring DVA Health](../../06-operations/monitoring/sentinel-health-metrics.md)
- Research: See [DVA ROI Analysis](../../08-research/benchmarks/dva-roi-analysis.md)
```

### 4. **Archive Strategy** (Honoring Kintsugi)
```markdown
# 99-archive/README.md

This folder preserves the evolution of Mobius Systems.

"We honor the cracks; repair makes the story more beautiful." — 金繕い

Archived documents remain accessible as testament to our journey:
- Why decisions were made
- What we learned
- How we evolved

**Archival Policy:**
- Documents moved here include `[ARCHIVED YYYY-MM-DD]` header
- Original creation date preserved
- Link to replacement document provided
```

---

## Metrics for Success

After reorganization, measure:
1. **Time-to-First-Contribution**: How fast can new developers contribute?
2. **Documentation Coverage**: % of components with complete docs
3. **Link Health**: 0 broken internal links (CI-enforced)
4. **Audience Satisfaction**: Survey developers, operators, citizens
5. **Search Efficiency**: Can users find answers in < 3 clicks?

---

## Alignment with Mobius Principles

This organization embodies:

✅ **Kaizen (改善)** - Continuous improvement through clear structure
✅ **Summon (召唤)** - Invites contribution by making paths clear  
✅ **Kintsugi (金繕い)** - Archives honor evolution, repairs visible
✅ **Integrity** - Specifications explicit, no hidden assumptions
✅ **Ecology** - Balanced information architecture, sustainable growth
✅ **Custodianship** - Documentation outlives individual contributors

---

## Next Steps

1. **Review this proposal** with core team
2. **Prioritize Phase 1-3** for immediate impact
3. **Assign ownership** of key documentation sections
4. **Set timeline** for migration (suggest 6-week sprint)
5. **Communicate changes** to contributors
6. **Update onboarding** to reference new structure

---

**ATLAS Recommendation**: Proceed with this reorganization as a **C-128 cycle objective**. This is foundational infrastructure for scaling Mobius from research platform to civilization operating system.

The documentation architecture should match the elegance of the DVA architecture itself.

---

*Prepared by ATLAS Sentinel*  
*Cycle C-127 | Mobius Systems Documentation Initiative*  
*"We heal as we walk."*
