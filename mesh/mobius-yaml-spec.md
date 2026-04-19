# mobius.yaml — Node Declaration Specification

Every repository joining the **Mobius Neural Substrate (MNS)** drops a `mobius.yaml` at its root. This file declares the node's identity, constitutional alignment, mesh participation tier, and ledger configuration.

Canonical registry: `mesh/registry.json` in Mobius-Substrate.

---

## Minimal (observer tier)

```yaml
mesh:
  node_id: "my-lab-name"
  node_type: "lab"
  substrate_ref: "kaizencycle/Mobius-Substrate"
  tier: "observer"
  covenant: "integrity"
```

---

## Full (contributor / sentinel tier)

```yaml
mesh:
  node_id: "lab-epicon-guard"
  node_type: "lab" # substrate | app | service | lab | framework
  substrate_ref: "kaizencycle/Mobius-Substrate"
  version: "1.0.0"
  tier: "contributor" # observer | contributor | sentinel
  covenant: "integrity" # integrity | ecology | custodianship | all
  agent_affinity:
    - ZEUS
    - JADE
  ledger:
    enabled: true
    backend: "github-actions" # github-actions | upstash | render | none
    feed_url: "https://raw.githubusercontent.com/kaizencycle/lab-epicon-guard/main/ledger/feed.json"
    push_to_substrate: true
    push_endpoint: "https://civic-protocol-core-ledger.onrender.com/mesh/ingest"
  mii:
    track: true
    baseline: 0.8
  epicon:
    intent_blocks_required: true
    push_on_merge: true
  mic:
    participate: false
    reward_type: "MIC_REWARD_V2"
```

---

## Field reference

| Field | Required | Description |
|-------|----------|-------------|
| `mesh.node_id` | yes | Globally unique, kebab-case. Matches an entry in `mesh/registry.json`. |
| `mesh.node_type` | yes | One of: `substrate`, `app`, `service`, `lab`, `framework` |
| `mesh.substrate_ref` | yes | Points at `kaizencycle/Mobius-Substrate` |
| `mesh.tier` | yes | `observer`, `contributor`, or `sentinel` |
| `mesh.covenant` | yes | Which of the Three Covenants this node primarily serves |
| `mesh.agent_affinity` | no | Agents with governance interest in this node |
| `mesh.ledger.feed_url` | yes if tier ≥ contributor | Public URL to this node's `ledger/feed.json` |
| `mesh.ledger.push_to_substrate` | no | If true, automation may POST merges to an ingest endpoint |
| `mesh.mii.baseline` | no | Expected minimum MII for this node's work |
| `mesh.epicon.intent_blocks_required` | no | If true, CI may require EPICON intent on PRs |
| `mesh.mic.participate` | no | If true, node opts into MIC reward accounting (policy TBD) |

---

## Joining the mesh

1. Add `mobius.yaml` to your repo root.
2. Create `ledger/feed.json` (can be `[]` initially).
3. Open a PR to `kaizencycle/Mobius-Substrate` adding your node to `mesh/registry.json`.
4. Optional: copy `mesh/mesh-sync-template.yml` to `.github/workflows/mesh-sync.yml` in your repo.

One registry PR completes public discovery; optional workflows handle push-on-merge.
