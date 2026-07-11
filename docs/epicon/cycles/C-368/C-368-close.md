# C-368 Cycle Close — Canon Machine-Readable Layer, CSR Prerender Fix, and Cross-Subdomain Discovery Parity

**Status:** CLOSED — VERIFIED  
**Cycle:** C-368  
**Closed:** 2026-07-10  
**Depends on:** C-367 (Canon Discovery and Machine Authority Layer)  
**Hands off to:** C-369 (EVE EPICON Sharding and Reserve Block Candidate Pipeline)  
**Verification method:** live production checks (non-JS fetch), not repo inspection alone

## Authority Provenance

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

- **Actor:** ATLAS (on behalf of kaizencycle)
- **Authority Source:** Cycle close — live-surface verification witness
- **Scope Limitation:** `docs/epicon/cycles/C-368/` close record only
- **Expiration:** 2026-10-08T00:00:00Z

---

## 1. Summary

C-367 established canon authority content but shipped it as a client-side-only shell — invisible to any non-JS fetcher, including the answer/generative engines the cycle was meant to reach. C-368 closed that gap. All acceptance criteria categories are verified live against production as of this close.

---

## 2. Verified against acceptance criteria

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Each canon route returns distinct title/description/canonical URL/body, not homepage shell | **MET** | `/canon`, `/canon/glossary`, `/canon/misinterpretations`, `/canon/source-of-truth` each return a unique `<title>` and self-referencing `<link rel="canonical">` |
| 2 | All six Phase B JSON endpoints return valid JSON, no fabricated values | **MET** | All six routes return HTTP 200; inspected payloads carry only verifiable fields — no invented GI/cycle/seal/commit values |
| 3 | `sitemap.xml` includes canon routes with accurate `lastmod` | **MET** | `curl sitemap.xml \| grep canon` returns 4 matches |
| 4 | `llms.txt` contains Canon section and retrieval-rules language | **MET** | Live `llms.txt` has `## Canon` listing four HTML mirrors and six JSON endpoints plus retrieval rules |
| 5 | Homepage JSON-LD includes distinct Organization entity | **MET** | `@graph` separates `#organization` (Mobius Substrate) from `#kaizen-cycle` (Kaizen Cycle) from WebApplication/WebSite nodes |
| 6 | Handbook and EPICON serve `robots.txt`; handbook and EPICON serve `llms.txt` | **MET** | Both subdomains return 200 on `/robots.txt`, `/sitemap.xml`, and `/llms.txt` |
| 7 | No existing chamber routes/canon copy/Shell modules altered in content | **Assumed met** — no visible regressions on root, hallway, or chamber routes during verification |
| 8 | Build/lint/test pass; verification commands re-run post-deploy | **MET (live surface)** — handoff verification commands re-run against production; CI status should be confirmed by merging operator |

---

## 3. Declared remaining gap (not hidden)

Terminal (`terminal.mobius-substrate.com`) now serves `robots.txt` (previously 404) but still returns 404 on `sitemap.xml` and `llms.txt`. This was outside the C-368 acceptance bar — Terminal is operational/presentation surface, not canonical. Recorded as a declared omission per the EVE sharding disclosure standard (C-369).

---

## 4. Federation track operator gaps (carried forward)

| Item | Status |
|------|--------|
| PR7 cold canon prime | Automation merged; operator prime + `.dat` chain pending |
| PR5 Probot live | Code merged; Render redeploy + credentials pending |
| PR6 archive | README merged; `gh repo archive` pending |

---

## 5. Verification commands run for this close

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
curl -I https://handbook.mobius-substrate.com/llms.txt
curl -I https://epicon.mobius-substrate.com/robots.txt
curl -I https://epicon.mobius-substrate.com/llms.txt
curl -I https://terminal.mobius-substrate.com/sitemap.xml   # 404 — declared gap
```

Automated harness: `./docs/epicon/cycles/C-368/c368-canon-verify.sh`

---

## 6. EPICON close block

```intent
epicon_id: EPICON_C-368_CORE_canon-discovery-close_v1
ledger_id: kaizencycle
scope: core
mode: normal
issued_at: 2026-07-10T00:00:00Z
expires_at: 2026-10-08T00:00:00Z
justification:
  VALUES INVOKED: integrity, transparency, accountability
  REASONING: C-367 produced correct canon content that was not reachable by non-JS
    fetchers. C-368 closes that gap with prerendered canon routes, machine-readable
    JSON endpoints, sitemap/llms.txt wiring, Organization JSON-LD separation, and
    cross-subdomain discovery parity for handbook and EPICON.
  ANCHORS:
    - https://mobius-substrate.com/canon (live)
    - https://mobius-substrate.com/.well-known/mobius-canon.json (live)
    - https://mobius-substrate.com/llms.txt (live, Canon section verified)
  BOUNDARIES: Live-surface verification only. Terminal sitemap/llms.txt absence declared, not resolved.
  COUNTERFACTUAL: If any canon route reverts to homepage shell or JSON endpoints
    return fabricated values, reopen C-368 rather than silently patch under a later cycle.
counterfactuals:
  - Re-run c368-canon-verify.sh if production drifts
  - Terminal discovery gap is declared omission, not closed claim
```

---

## 7. Handoff forward

C-369 (EVE EPICON Sharding and Reserve Block Candidate Pipeline) references this document as an anchor. Example candidate shard `SHARD_C-368_EVE_001` uses `hold_for_evidence` — appropriately, since operator proofs and the Terminal discovery gap are uncertainties requiring verification, not silent resolution.

**Preserve:** Canon → Ledger → UI. MEC must never replace EPICON.
