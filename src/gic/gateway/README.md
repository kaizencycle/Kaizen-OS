# .gic Gateway (alt-root)
Resolve https://<label>.gic by reading the on-chain registry:
1) Extract <label>
2) Call registry.getDomain(label)
3) If ipfsHash present, redirect to https://ipfs.io/ipfs/<cid> (or your IPFS node)
4) Include 'x-gic-ledger-proof: 0x...' header with integrity hash for clients to verify
