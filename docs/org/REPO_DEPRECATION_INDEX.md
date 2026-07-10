# Organization Repository Deprecation Index

Tracks superseded, duplicate, or obsolete-terminology repositories under `kaizencycle`.
**Archive — do not delete.** Each deprecated repo gets a README redirect before archival.

## Active deprecation PRs

| Repository | Canonical successor | Status | PR |
|---|---|---|---|
| `mobius-civic-ai-terminal-main` | `mobius-civic-ai-terminal` | Deprecation README pushed | [#1](https://github.com/kaizencycle/mobius-civic-ai-terminal-main/pull/1) |
| `hive` | `mobius-hive` | README template in `docs/org/deprecation-readmes/hive.md` | Owner push required |
| `reflections-app-pr-bundle-founders` | `reflections-app` | README template in `docs/org/deprecation-readmes/reflections-app-pr-bundle-founders.md` | Owner push required |

## GIC-era terminology (MIC is canon)

These names use obsolete **GIC** terminology. Current canon uses **MIC**. Archive after uniqueness check when accessible:

| Repository | Canonical successor | Notes |
|---|---|---|
| `hive_gic` | `mobius-hive` or `Civic-Protocol-Core` | GIC naming — verify deploy refs before archive |
| `Civic-Protocol-Core-gic-indexer` | `Civic-Protocol-Core` | Default branch `feat/gic-indexer-api` — port any unique API work first |

*Not visible in current org API listing (may be private, renamed, or already removed). Re-scan before acting.*

## Not deprecated (drift notes only)

| Repository | Note |
|---|---|
| `atlas-paw` | **Active** — ATLAS sentinel home-base per substrate canon. Branch hygiene: consider `master` → `main` rename separately. |
| `mobius-hive` | Canonical HIVE world layer |
| `Civic-Protocol-Core` | Canonical civic ledger |

## Archive checklist (owner)

1. Merge deprecation README PR
2. Confirm zero Render/Vercel/CI deploy sources point at deprecated repo
3. `gh repo archive kaizencycle/<repo> --yes`
4. Remove from active catalog entries in `Mobius-Substrate/catalog/`

---

*Maintained under C-368 org hygiene. Update when PRs merge or new drift is discovered.*
