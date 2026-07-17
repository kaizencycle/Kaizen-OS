# REPO_MAP_TREE.md — Mobius Substrate File Tree (High-Level)

> Compact, curated file tree for humans + agents.  
> This is NOT a full listing. It's a navigation map.

**Last updated:** 2025-12-31  
**Cycle:** C-178

---

```
/
├── REPO_DIGEST.md          # Repository navigation entrypoint
├── REPO_MAP_TREE.md        # This file - high-level file tree
├── llm-manifest.json       # Machine-readable agent manifest
│
├── 00-START-HERE/          # 🔥 HOT - Onboarding
│   ├── README.md           # Welcome & path selection
│   ├── SYSTEM-OVERVIEW.md  # Architecture overview
│   └── MOBIUS_PULSE.md     # Current state snapshot
│
├── FOUNDATION/             # 🔥 HOT - Governance Core
│   ├── CHARTER.md          # Foundation charter
│   ├── GOVERNANCE.md       # Governance overview
│   ├── BYLAWS.md           # Foundation bylaws
│   ├── LEGAL/              # CLA, entity agreements
│   ├── LICENSES/           # License & trademark policy
│   ├── POLICIES/           # Code of conduct, security, privacy
│   └── PROCESS/            # RFC, versioning, release policy
│
├── GOVERNANCE/             # 🔥 HOT - Participation Framework
│   ├── ROLES.md            # Role definitions + responsibility gradients
│   ├── ROLE_MAP.json       # DVA tier mapping + progression model
│   └── REPO_AUTHORITY_POLICY.md  # Anti-capture + plurality guarantees
│
├── epicon/                 # 🔥 HOT - Intent Memory Layer
│   ├── README.md           # EPICON overview
│   ├── TEMPLATE_EPICON.md  # Template for new records
│   └── (cycle directories) # Cycle-specific EPICONs
│
├── apps/                   # 🔥 HOT - Applications
│   ├── browser-shell/      # Citizen browser entry point
│   │   ├── README.md
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── mobius-wallet/      # MIC wallet interface
│   ├── aurea-site/         # AUREA dashboard
│   └── (other apps…)
│
├── packages/               # 🌡️ WARM - Shared Libraries
│   ├── core/               # Core utilities
│   ├── integrity-core/     # Integrity engine
│   ├── atlas-sentinel/     # ATLAS sentinel package
│   ├── mii-sdk/            # MII SDK
│   └── (other packages…)
│
├── sentinels/              # 🌡️ WARM - AI Agents
│   ├── README.md           # Sentinel ecosystem
│   ├── atlas/              # ATLAS - truth verification
│   ├── aurea/              # AUREA - ethical evaluation
│   ├── echo/               # ECHO - memory preservation
│   └── (other sentinels…)
│
├── services/               # 🌡️ WARM - Backend Services
│   ├── atlas-sentinel/     # ATLAS service
│   ├── gi-ledger/          # GI ledger service
│   ├── epicon-api/         # EPICON API
│   └── (other services…)
│
├── mcp/                    # 🌡️ WARM - MCP Tools
│   └── mobius-repo-scanner/
│       ├── README.md
│       ├── src/
│       │   ├── index.ts
│       │   └── routes.config.ts  # Traversal routing rules
│       └── tests/
│
├── docs/                   # 🌡️ WARM - Documentation
│   ├── 00-START-HERE/      # Quick start guides
│   ├── 01-INTRODUCTION/    # System introduction
│   ├── 02-THEORETICAL-FOUNDATIONS/
│   ├── 03-GOVERNANCE-AND-POLICY/
│   │   ├── civic/          # 🔥 HOT - Civic Covenants (VALIDATOR_CHARTER.md, ATTESTOR_OATH.txt)
│   │   ├── governance/
│   │   │   └── REPO_TRAVERSAL_POLICY.epicon.md
│   │   └── (other governance docs)
│   ├── 04-TECHNICAL-ARCHITECTURE/
│   │   └── overview/
│   │       └── ARCHITECTURE.md
│   ├── 05-IMPLEMENTATION/
│   ├── 06-OPERATIONS/
│   ├── 07-RESEARCH-AND-PUBLICATIONS/  # ❄️ COLD
│   ├── 08-REFERENCE/
│   │   └── GLOSSARY.md
│   ├── 09-APPENDICES/
│   ├── 10-ARCHIVES/        # 🧊 FROZEN - Historical
│   ├── 11-SUPPLEMENTARY/
│   └── epicon/             # EPICON guides
│
├── infra/                  # ❄️ COLD - Infrastructure
│   ├── dva/
│   │   └── flows/
│   │       ├── lite/       # DVA.LITE flows
│   │       ├── one/        # DVA.ONE flows
│   │       ├── full/       # DVA.FULL flows
│   │       ├── hive/       # DVA.HIVE flows
│   │       └── templates/
│   ├── docker/
│   ├── db/migrations/
│   └── observability/
│
├── labs/                   # ❄️ COLD - Experiments
│   ├── README.md
│   ├── experiments/
│   └── prototypes/
│
├── specs/                  # 🌡️ WARM - Specifications
│   ├── mii_spec_v1.md
│   ├── civic-ledger/
│   └── openapi/
│
├── schemas/                # 🌡️ WARM - JSON Schemas
│   └── (schema files…)
│
├── configs/                # ❄️ COLD - Configuration
│   └── (config files…)
│
├── scripts/                # ❄️ COLD - Build/Deploy Scripts
│   └── (script files…)
│
├── FOR-ACADEMICS/          # 🌡️ WARM - Academic Path
├── FOR-ECONOMISTS/         # 🌡️ WARM - Economic Path
├── FOR-GOVERNMENTS/        # 🌡️ WARM - Policy Path
│   └── DIPLOMACY/          # Diplomatic materials & world leader letters
├── FOR-PHILOSOPHERS/       # 🌡️ WARM - Ethics Path
│
└── (other directories…)
```

---

## Traversal Notes (for agents)

### Priority Order

1. Start with: `REPO_DIGEST.md` → `00-START-HERE/README.md`
2. Load manifest: `llm-manifest.json`
3. Check intent layer: `epicon/README.md`

### Prefer Hot Paths

- `00-START-HERE/**`
- `FOUNDATION/**`
- `epicon/**`
- `apps/browser-shell/**`
- `docs/04-TECHNICAL-ARCHITECTURE/**`

### Zone Rules

| Zone | Rule |
|------|------|
| 🔥 HOT | Bulk traversal allowed |
| 🌡️ WARM | Targeted queries only |
| ❄️ COLD | Explicit opt-in required |
| 🧊 FROZEN | Read-only, never bulk scan |

### Do NOT

- ❌ Recursively crawl entire repo
- ❌ Fetch by glob without depth limits
- ❌ Treat `docs/10-ARCHIVES/` as current truth

---

*"We heal as we walk." — Mobius Systems*
