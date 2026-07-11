# C-368 Close — Canon Machine-Readable Layer

**Status:** CLOSING  
**Extends:** C-367 (Canon Discovery and Machine Authority Layer)  
**Witness:** ATLAS · **Closed:** 2026-07-11

## Authority Provenance

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

- **Actor:** ATLAS (on behalf of kaizencycle)
- **Authority Source:** Cycle documentation — close record and discovery parity
- **Scope Limitation:** `docs/epicon/cycles/C-368/` close doc, verify harness, handbook discovery files
- **Expiration:** 2026-10-08T00:00:00Z

## Summary

C-368 delivered two parallel tracks:

### Track A — Federation optimizations (PR1–PR7)

| PR | Repo | Status | Operator gap |
|----|------|--------|--------------|
| PR1 OAA mint auth | OAA-API-Library | Merged | — |
| PR2 GII canon | OAA-API-Library | Merged | — |
| PR3 CC0 | epicon | Merged | — |
| PR4 epicon-api health | epicon | Merged | — |
| PR5 Guard App wire | epicon [#17](https://github.com/kaizencycle/epicon/pull/17) | Merged | Render redeploy + `APP_ID`/`PRIVATE_KEY` |
| PR6 org dedup | terminal-main [#1](https://github.com/kaizencycle/mobius-civic-ai-terminal-main/pull/1) | README merged | `gh repo archive` pending |
| PR7 reserve canon | terminal [#591](https://github.com/kaizencycle/mobius-civic-ai-terminal/pull/591) | Merged | Operator prime (KV secrets + export workflow) |

Docs witness: Substrate [#367](https://github.com/kaizencycle/Mobius-Substrate/pull/367) merged.

### Track B — Canon discoverability (this handoff)

**Root cause (live verified 2026-07-10):** C-367 canon routes returned HTTP 200 but served the identical CSR homepage shell — invisible to non-JS fetchers.

**Fix:** Static prerender for four canon routes + JSON endpoints + sitemap/llms.txt + Organization JSON-LD + cross-subdomain discovery parity.

**Implementation:** `mobius-browser-shell` PR (branch `cursor/c368-canon-machine-layer-0e02`).

## Phases delivered

| Phase | Deliverable | Repo |
|-------|-------------|------|
| A | Static HTML prerender for `/canon`, `/canon/glossary`, `/canon/misinterpretations`, `/canon/source-of-truth` | browser-shell |
| B | Six JSON endpoints (`.well-known/mobius-canon.json`, `/canon/*.json`) | browser-shell |
| C | `sitemap.xml` + `llms.txt` canon section + retrieval rules | browser-shell |
| D | Organization `@id` JSON-LD graph on homepage | browser-shell |
| E | `robots.txt` + `llms.txt` on handbook; `llms.txt` on epicon; `robots.txt` on terminal | Substrate, epicon, terminal |

## Acceptance verification

Re-run after browser-shell deploy:

```bash
./docs/epicon/cycles/C-368/c368-canon-verify.sh
```

Manual evidence commands (from ATLAS handoff):

```bash
curl -s https://mobius-substrate.com/canon | grep -o '<title>[^<]*</title>'
curl -s https://mobius-substrate.com/canon/glossary | grep -o '<title>[^<]*</title>'
curl -s https://mobius-substrate.com/canon/misinterpretations | grep -o '<title>[^<]*</title>'
curl -s https://mobius-substrate.com/canon/source-of-truth | grep -o '<title>[^<]*</title>'
curl -I https://mobius-substrate.com/.well-known/mobius-canon.json
curl -s https://mobius-substrate.com/canon/current.json
curl -s https://mobius-substrate.com/sitemap.xml | grep canon
curl -s https://mobius-substrate.com/llms.txt | grep -A5 "## Canon"
curl -I https://handbook.mobius-substrate.com/robots.txt
curl -I https://epicon.mobius-substrate.com/llms.txt
```

Each `<title>` must differ from `Mobius Substrate — School of Chambers` and from each other.

## Operator actions (carried forward)

1. **Merge and deploy** browser-shell canon PR → re-run `c368-canon-verify.sh`
2. **PR7 prime:** terminal secrets → Reserve Block Canon Export (`incremental: false`)
3. **PR5 live:** Render redeploy epicon-api with Probot credentials
4. **PR6 close:** archive `mobius-civic-ai-terminal-main`

## Preserve

Canon → Ledger → UI.  
MEC must never replace EPICON. It only points to it.
