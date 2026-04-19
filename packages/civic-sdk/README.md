# @civic/sdk

Shared API clients and types for Mobius Systems services.

## IPFS resolver (Phase 1 decentralization stub)

`IpfsResolver` in `src/ipfs-resolver.ts` reads content via the Kubo HTTP API:

- `MOBIUS_IPFS_API_URL` — default `http://127.0.0.1:5001`
- `MOBIUS_IPFS_GATEWAY_URL` — optional HTTP gateway for `/ipfs/{cid}` reads

**Important:** A Postgres `entry_id` that is a SHA-256 hex string is **not** interchangeable with an IPFS CID. Store the CID returned by IPFS when pinning; use this resolver to fetch by CID.

## OAA KV client (C-286)

`OaaKvClient` and `signOaaKvPayload` in `src/oaa-client.ts` / `src/oaa-signing.ts` match the HMAC contract for `POST /api/oaa/kv` on **OAA-API-Library** (implemented in that repo).

## Build

```bash
npm run build --workspace=@civic/sdk
```
