# .gic — Global Integrity Citizen (Alt‑Root Pilot)

Contents:
- contracts/GICRegistry.sol — name → {owner, ipfs CID, integrityProof, expiry}
- contracts/GICResolver.sol — helper to resolve domains
- scripts/register.js, updateContent.js — ethers helpers
- gateway/README.md — HTTP/IPFS resolver notes

## Flow
Citizen/Companion publishes site → pins to IPFS → Civic Ledger emits integrity hash →
call register/update on GICRegistry → gateway resolves <name>.gic to that IPFS CID.

## ICANN Migration
Run this pilot now (ENS/alt-root). When ready, apply for .gic TLD:
- Keep on-chain integrity proofs mirrored as DNS TXT records
- Keep gateway for legacy clients; native DNS will resolve .gic directly
