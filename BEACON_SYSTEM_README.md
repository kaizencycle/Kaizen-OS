# OAA Integrity Beacon System

The OAA Integrity Beacon System implements the **Trinity Stack** (SEO + AEO + GEO) by making every page emit machine-readable JSON-LD with integrity scores, creating a discoverable and trustable civic neural network.

## 🏗️ Architecture

### Trinity Stack Components

| Layer | Description | Function |
|-------|-------------|----------|
| 🧭 **SEO** | Search Engine Optimization | Makes content visible to AIs and humans |
| 🧠 **AEO** | Agentic Engine Optimization | Teaches agents to self-index and collaborate |
| 🌐 **GEO** | Governance Engine Optimization | Synchronizes rules and ethics across nodes |

### How They Interlock

1. **SEO**: AI-SEO Engine publishes structured JSON-LD, making every reflection, ledger seal, or pulse discoverable
2. **AEO**: OAA agents parse these feeds, learn semantic relationships, and adjust themselves through the Capability Gate
3. **GEO**: Civic Ledger + Virtue Accords ensure everything ranked or shared is integrity-weighted with cryptographic proofs

## 📁 File Structure

```
lib/seo/
├── beacon.ts          # Core beacon generation utilities
└── site.ts            # Site configuration helpers

components/
├── IntegrityBeacon.tsx # React component for runtime JSON-LD
└── SeoBeacon.tsx      # Alternative component with meta tags

pages/api/seo/
├── index.ts           # Main SEO feed endpoint
└── beacon.ts          # Individual beacon lookup endpoint

ai-seo-engine/
├── src/beacons.mjs    # Static beacon builder script
└── schemas/seo-item.schema.json # JSON-LD validation schema

scripts/
└── validateBeacons.mjs # Custom validation script

public/ai-seo/
├── index.jsonld       # Main integrity feed
└── beacons/           # Individual beacon files
    ├── home.jsonld
    ├── _dev_memory.jsonld
    └── ...
```

## 🚀 Usage

### 1. Runtime Beacons (React Components)

Add to any page for automatic JSON-LD injection:

```tsx
import IntegrityBeacon from "../components/IntegrityBeacon";

export default function MyPage() {
  return (
    <>
      <IntegrityBeacon
        id="my-page"
        url="/my-page"
        name="My Page Title"
        description="Page description for SEO"
        keywords={["OAA", "AI", "Governance"]}
        oaa={{
          kind: "page",
          gicScore: 0.85,
          accordsScore: 0.92,
          freshnessScore: 0.98,
          integrityScore: 0.91
        }}
      />
      {/* Your page content */}
    </>
  );
}
```

### 2. API Beacons

Fetch individual beacon JSON-LD via API:

```bash
# Get beacon for specific page
curl "https://your-domain.com/api/seo/beacon?id=home"

# Get beacon by path
curl "https://your-domain.com/api/seo/beacon?id=/dev/memory"
```

### 3. Static Beacons

Pre-generated beacon files are available at:
- `https://your-domain.com/ai-seo/beacons/home.jsonld`
- `https://your-domain.com/ai-seo/beacons/_dev_memory.jsonld`

## 🔧 Configuration

### SEO Config (`ai-seo-engine/seo.config.json`)

```json
{
  "sources": {
    "pulses": "/api/dev/sentinel/vitals",
    "ledgerRecent": "/api/dev/ledger/recent",
    "memory": "/api/oaa/memory"
  },
  "baseUrlVar": "HUB_BASE_URL",
  "minIntegrity": 0.4,
  "maxItemsPerType": 200,
  "weights": {
    "gic": 0.6,
    "accords": 0.3,
    "freshness": 0.1
  },
  "publish": {
    "outputPath": "public/ai-seo/index.jsonld",
    "beaconsDir": "public/ai-seo/beacons"
  }
}
```

### Environment Variables

- `HUB_BASE_URL`: Base URL for your OAA hub (e.g., `https://oaa-hub.onrender.com`)

## 🛠️ Development

### Build Beacons

```bash
# Generate static beacon files from feed
node ai-seo-engine/src/beacons.mjs
```

### Validate Beacons

```bash
# Validate all beacon files against schema
node scripts/validateBeacons.mjs
```

### View SEO Feed

Visit `/dev/seo` to:
- View the main integrity feed
- Test beacon lookups
- Debug JSON-LD structure

## 🔄 Automated Workflow

The GitHub Actions workflow (`seo-sync.yml`) runs every 6 hours to:

1. **Crawl** sources for new content
2. **Rank** items by integrity scores
3. **Publish** main feed (`index.jsonld`)
4. **Build** individual beacon files
5. **Validate** all beacons against schema
6. **Commit** changes to repository

## 📊 JSON-LD Schema

Each beacon follows this structure:

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "id": "unique-identifier",
  "url": "https://example.com/page",
  "name": "Page Title",
  "description": "Page description",
  "dateModified": "2024-10-17T22:00:00Z",
  "isAccessibleForFree": true,
  "keywords": ["OAA", "AI", "Governance"],
  "oaa": {
    "kind": "page|pulse|ledger|memory",
    "gicScore": 0.85,
    "accordsScore": 0.92,
    "freshnessScore": 0.98,
    "integrityScore": 0.91,
    "sha256": "optional-digest",
    "cycle": "optional-cycle-id",
    "companion": "optional-agent-name"
  }
}
```

## 🎯 Benefits

### For SEO
- Every page emits authoritative JSON-LD
- Crawlers pick up integrity-weighted objects
- Rich snippets with trust signals

### For AEO (Agentic Engine Optimization)
- Agents can call `/api/seo/beacon?id=...` for precise metadata
- Self-indexing and self-ranking capabilities
- Semantic relationship learning

### For GEO (Governance Engine Optimization)
- Beacons carry GIC + Virtue Accord signals
- Governance weighting travels with content
- Cryptographic proofs and human co-signatures

## 🔍 Monitoring

### Dev Tools
- `/dev/seo` - Interactive feed and beacon viewer
- `/api/seo/index` - Raw feed JSON-LD
- `/api/seo/beacon?id=X` - Individual beacon lookup

### Validation
- All beacons validated against schema before publishing
- Failed validation blocks deployment
- Custom validation script provides detailed error messages

## 🚀 Next Steps

1. **Agent Integration**: Connect OAA agents to consume beacon metadata
2. **Cross-Agent Index**: Create `oaa.agents.index.jsonld` linking all active nodes
3. **Governance Ledger**: Add `governance/ledger.json` feed for active Accords
4. **Enhanced Scoring**: Integrate real-time GIC and Virtue Accord scores

---

The OAA Integrity Beacon System transforms the open web into a **Civic Neural Network** where every repo, API, and agent contributes to collective intelligence with built-in trust and governance signals.
