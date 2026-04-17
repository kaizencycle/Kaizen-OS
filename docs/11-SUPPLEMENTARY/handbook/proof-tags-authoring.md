# Proof tags authoring (MkDocs)

Use **raw HTML** in Markdown (enabled via `md_in_html` in `mkdocs.yml`) so custom elements are not escaped.

## Single tile

```html
<mobius-proof endpoint="snapshot-lite" path="integrity.gi" label="Live GI"></mobius-proof>
```

## Strip (several tiles)

```html
<div class="mobius-proof-strip">
  <mobius-proof endpoint="snapshot-lite" path="integrity.gi" label="Live GI"></mobius-proof>
  <mobius-proof endpoint="snapshot-lite" path="integrity.mode" label="Mode"></mobius-proof>
  <mobius-proof endpoint="vault-status" label="Vault (JSON)"></mobius-proof>
</div>
```

## Proof chain (Level 2)

1. Add or reuse a claim in `docs/assets/data/handbook-claim-index.json` (`claims[].id`).
2. In the doc:

```html
<div class="mobius-proof-chain" data-claim-id="your-claim-id">
  <button type="button" class="mobius-proof-chain__toggle" aria-expanded="false">Show proof chain</button>
  <div class="mobius-proof-chain__panel"></div>
</div>
```

## Endpoints

| `endpoint` value | Fetches |
|------------------|---------|
| `snapshot-lite` | `/api/terminal/snapshot-lite` |
| `vault-status` | `/api/vault/status` |
| `vault-seal` | `/api/vault/seal` |
| `agents-status` | `/api/agents/status` |

## Conventions

- Prefer **snapshot-lite** for GI/mode to reduce payload size.
- Put tiles **after** the sentence they verify.
- Do not put secrets or authenticated-only endpoints in proof tags; this layer is **public read-only**.
