# 🌐 Website Creator — Civic .gic Domain Builder

**Build beautiful websites for your `.gic` domains!** 

Create sovereign **Civic Homes** that bind a `name.gic` to a DID, profile JSON-LD, and ledger proofs. This is the public-facing tool for anyone to create their own `.gic` website in the Civic OS ecosystem.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

**Create your first .gic website in minutes!**

## Key routes
- `POST /api/names/register` → reserve a name (mock reservation, returns reservation_id)
- `POST /api/names/commit` → publish DID + content root (writes mock ledger hash)
- `GET  /api/resolve/[name]` → resolve public profile bundle for SSR

After reserving + committing, visit `http://localhost:3000/<name>` to see the **Civic Home**.

## Env
Copy `.env.example` to `.env.local` and set:
- `LEDGER_API_BASE` — your Civic Ledger base URL
- `NAMES_SERVICE_TOKEN` — bearer token for registry writes
- `IPFS_GATEWAY` — public IPFS gateway (optional)
- `APP_ORIGIN` — e.g., http://localhost:3000 for SSR fetch in Edge/Node

## Wire to your Ledger
Replace functions in `lib/ledger.ts` to call your real endpoints:
- `POST {LEDGER_API_BASE}/names/register`
- `POST {LEDGER_API_BASE}/names/commit`
- `GET  {LEDGER_API_BASE}/resolve/:name`
- `POST {LEDGER_API_BASE}/attest`

## Security notes
- Add auth & rate-limits to `register/commit` before production.
- Enforce **timelocks** and **multisig** for destructive ops on the ledger side.
- Cache `/api/resolve` at the edge; purge on commit.

Generated 2025-10-19T21:09:49.333180Z
