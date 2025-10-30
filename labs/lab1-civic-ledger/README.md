# Lab 1 — Civic Ledger Core

Purpose: Integrity proofs, GIC minting, and public audit trail.

Where to look in this repo:
- apps/ledger-api — FastAPI services for GI/indexing and mint flows
- packages/gic-registry-contracts — Solidity (GIC, GICGovernor, deploy)
- packages/integrity-core — GI calculation/middleware
- docs/GIC_Whitepaper_Final.md — Economic model
- docs/GIC_Foundation_Up_Economics_Addendum.md — Foundation-Up addendum
- docs/constitution/custos-charter.md — Governance anchor

Getting started:
1) Review contracts in `packages/gic-registry-contracts/contracts/`
2) Run API in `apps/ledger-api` and wire to contracts
3) Integrate GI calc from `packages/integrity-core`

Status: Active — integrates with Guardian/Ceremonial Summons logs.


