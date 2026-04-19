# Mobius Neural Substrate Protocol v1 (C-286)

## What it is

The **Mobius Neural Substrate (MNS)** is a mesh of integrity nodes where each repository acts as a weighted participant in a network-wide integrity state. It is not a blockchain. It is not a distributed database. It is a **civic attestation mesh**: repositories that recognize each other's EPICON-style entries, share MII accountability, and contribute to a common constitutional record held in Mobius-Substrate.

## The analogy

Classical neural networks: weighted signals, forward pass, backpropagation, optimize for prediction accuracy.

MNS: integrity-weighted attestations, mesh aggregation, EPICON chain, optimize for verified civic integrity across the ecosystem.

| Neural network | Mobius Neural Substrate |
|----------------|-------------------------|
| Neuron | Repository (node) |
| Synapse | EPICON entry / attestation |
| Weight | MII score |
| Activation function | GI threshold gate |
| Backpropagation | EPICON intent chain |
| Loss function | GI drift |
| Inference | Terminal snapshot |
| Training | Continuous civic operation |

## How a node joins

1. Add `mobius.yaml` at repo root (see `mesh/mobius-yaml-spec.md` in this repo).
2. Create `ledger/feed.json` (can be `[]` initially).
3. Open a PR to `kaizencycle/Mobius-Substrate` adding your node to `mesh/registry.json`.
4. Optionally copy `mesh/mesh-sync-template.yml` to `.github/workflows/mesh-sync.yml` in your repo.

That is the full join protocol for discovery. Observer tier needs steps 1–3 only.

## Signal flow (informative)

```text
[any mesh node]
    |
    | EPICON-style entry on merge (optional mesh-sync workflow)
    v
ledger/feed.json (local, in that repo)
    |
    | optional POST /mesh/ingest (when ledger implements ingest)
    v
civic-protocol-core (example host)
    |
    | hourly pull by Substrate mesh-aggregate workflow
    v
Mobius-Substrate/ledger/mesh-aggregate.json
    |
    | Terminal and handbook may read public URLs
    v
Operator and Sentinel awareness
```

## Tier rights and responsibilities

**Observer:** Passive. The Substrate aggregator pulls from your public `feed_url`. No auth required for the pull. Entries appear with observer tier metadata.

**Contributor:** Active when wired. Automation may push to an ingest endpoint on merge. Entries can surface in live feeds with `source: mesh-node`. ZEUS can verify remotely against your public feed.

**Sentinel:** Full participant in the doctrine: agent affinity declared; participates in MIC and seal storylines as those protocols evolve. Seal records may link into Vault v2 proof chains when implemented.

## Constitutional constraints

Nodes that join MNS inherit the **Three Covenants** (integrity, ecology, custodianship). Additive-first changes, EPICON intent on significant edits, and CC0 posture for substrate-facing artifacts remain in force for this repository.

## One-line canon

**The network does not route data alone. It routes integrity.**

---

*See also:* `mesh/registry.json`, `mobius.yaml` (Substrate root), `scripts/mesh-aggregate.mjs`.

*We heal as we walk.*
