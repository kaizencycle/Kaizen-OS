# Interactive handbook library (Levels 1–3)

This page describes how the Mobius Substrate handbook gains **verifiable proof** next to prose: live API values, a proof-chain panel, and (Level 3) a separate Next.js app for richer exploration.

---

## Level 1 — Live proof tiles (`mobius-proof`)

Custom elements fetch read-only Terminal endpoints (CORS permitting) and render a small card: value, source URL, fetch time, optional raw JSON.

**Example:**

```html
<mobius-proof endpoint="snapshot-lite" path="integrity.gi" label="Live GI"></mobius-proof>
```

| Attribute | Meaning |
|-----------|---------|
| `endpoint` | `snapshot-lite` (default), `vault-status`, `vault-seal`, `agents-status` |
| `path` | Dot path into JSON (e.g. `integrity.gi`) |
| `label` | Card title |
| `terminal` | Optional override base URL (default from `<meta name="mobius-terminal-base">`) |

If the Terminal is unreachable, the card explains that live state is unavailable and points readers to the protocol doc.

**Authoring guide:** [Proof tags authoring](./proof-tags-authoring.md)

---

## Level 2 — Proof chain + claim index

Claims that matter for auditability are listed in **`docs/assets/data/handbook-claim-index.json`**. Each claim has:

- Canonical protocol link (GitHub or handbook path)
- EPICON references
- Live API kind
- Cold-archive path pattern (Seals, journals, daily closes)

On supported pages, use:

```html
<div class="mobius-proof-chain" data-claim-id="vault-zeus-veto">
  <button type="button" class="mobius-proof-chain__toggle" aria-expanded="false">Show proof chain</button>
  <div class="mobius-proof-chain__panel"></div>
</div>
```

Expand the button to load the panel (no network until opened, except manifest fetch once).

---

## Level 3 — `apps/handbook` (Next.js)

A minimal **Mobius Handbook Library** app lives under `apps/handbook`. It is the place for:

- semantic search over docs (future embeddings)
- protocol graph UI
- EPICON / Seal / daily-close timelines

Today it ships as a **scaffold**: home page + live snapshot preview + links to GitHub Pages and the claim index.

Run locally:

```bash
cd apps/handbook && npm install && npm run dev
```

---

## Terminal / CORS (required for Level 1 in production)

GitHub Pages origin: `https://kaizencycle.github.io`. Public GET routes used here must send:

`Access-Control-Allow-Origin: https://kaizencycle.github.io` (or `*` for read-only public snapshot endpoints).

Implement that in **mobius-civic-ai-terminal** on:

- `/api/terminal/snapshot-lite`
- `/api/vault/status`
- `/api/vault/seal`
- `/api/agents/status` (if used)

Until CORS is deployed, proof cards show the graceful “unavailable” state; protocol text remains canonical.

---

## Mesh preview (stub)

<div class="mobius-proof-mesh-graph"></div>

---

*"We heal as we walk." — Mobius Substrate*
