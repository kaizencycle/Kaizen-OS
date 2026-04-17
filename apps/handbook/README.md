# Mobius Handbook Library (Level 3)

Next.js shell for an **interactive** Mobius handbook: live Terminal state, future semantic search, protocol graph, and timelines. The static site at [GitHub Pages](https://kaizencycle.github.io/Mobius-Substrate/) remains the primary handbook; this app is for richer exploration.

## Develop

```bash
# from repo root (after npm ci)
npm run dev --workspace=@mobius/handbook
```

Open `http://localhost:3040`.

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_TERMINAL_BASE` | Terminal origin (default: production Vercel URL) |

## Relationship to MkDocs

- **MkDocs (Levels 1–2):** `docs/assets/js/mobius-proof.js`, claim index, proof chains — ship with GitHub Pages.
- **This app (Level 3):** Same live data ideas; add embeddings, graph layout, auth, and tripwire UX here without bloating the static build.
