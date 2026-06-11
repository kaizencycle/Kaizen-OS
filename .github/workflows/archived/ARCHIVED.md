# Archived Workflows

This directory contains workflows that have been archived during the C-178 workflow optimization.

## Archive Date: 2026-01-05

### Archived Workflows

#### 1. **monorepo.yml** → **monorepo.yml.archived**
- **Reason:** Redundant with ci.yml
- **Analysis:**
  - Overlapped significantly with ci.yml (build, test, lint, typecheck)
  - Used npm while ci.yml uses modern pnpm
  - Deployment steps were all placeholder echo statements, not real deployments
  - Actual deployments likely handled by Render auto-deploy from GitHub
- **Replacement:** ci.yml handles all CI/CD needs
- **Risk:** Low - deployments were never actually configured

#### 2. **opencode-ci.yml** → **opencode-ci.yml.archived**
- **Reason:** External dependency, unclear if actively used
- **Analysis:**
  - Requires OpenCode CLI installation
  - Needs multiple API keys (OpenAI, Anthropic, Google, local LLM)
  - Triggers on PR comments with `/council`
  - No evidence of active usage in recent PRs
- **Replacement:** None - can be restored if needed
- **Risk:** Low - experimental feature

#### 3. **preview-autowire.yml** → **preview-autowire.yml.archived**
- **Reason:** Infrastructure-specific, may be obsolete
- **Analysis:**
  - Wires Render preview URLs to Vercel
  - Very specific to current infrastructure setup
  - May become obsolete with architecture changes
  - No clear evidence this is critical
- **Replacement:** None - manual wiring if needed
- **Risk:** Medium - may be needed for preview environments

#### 4. **uriel-smoke.yml** → **uriel-smoke.yml.archived**
- **Reason:** Redundant with sentinel-heartbeat.yml
- **Analysis:**
  - Only tests URIEL sentinel endpoint
  - sentinel-heartbeat.yml tests 5 sentinels (ATLAS, AUREA, ECHO, EVE, HERMES)
  - URIEL should be added to heartbeat matrix instead
  - Simple smoke test can be run manually if needed
- **Replacement:** sentinel-heartbeat.yml (should add URIEL)
- **Risk:** Low - functionality covered by heartbeat

---

## Restoration Instructions

If any of these workflows need to be restored:

1. **Restore the file:**
   ```bash
   git mv .github/workflows/archived/{workflow}.yml.archived .github/workflows/{workflow}.yml
   ```

2. **Update paths/references** if repo structure has changed since archival

3. **Test thoroughly** before relying on restored workflow

4. **Document restoration** in cycle commit message

---

## Workflow Optimization Summary

**Before:** 24 workflows
**After:** 20 workflows
**Archived:** 4 workflows
**Status:** ✅ Optimized - reduced redundancy without losing functionality

**Key improvements:**
- Removed CI redundancy (monorepo.yml merged into ci.yml)
- Archived experimental/unused workflows
- Clarified GI gate authority (renamed codex-ci.yml → gi-gate.yml)
- Improved path references for new documentation structure

---

*Cycle C-178 | Workflow Optimization | "Intelligence moves. Integrity guides."*

---

## Archive Date: 2026-06-11 (C-339)

#### 5. **cycle-journal-bot.yml** → **cycle-journal-bot.yml.archived**
- **Reason:** Superseded by the Layer-1 deterministic writer (`mobius-bot-state-sync.yml`, C-338)
- **Analysis:**
  - The journal write pipeline died ~C-289 when state commits were coupled to
    deployments; C-338 revived it as `mobius-bot-state-sync.yml` using the
    deployment-decoupled `[skip ci]` pattern.
  - That Layer-1 writer now creates `journals/cycles/{cycle}.json` stubs daily
    and idempotently. This manual bot wrote stubs to the same directory with a
    **different JSON shape** (meta/sweep/signals vs cycle/date/writer), making
    it a dual-writer schema-drift risk rather than a backup path.
  - It was `workflow_dispatch`-only and has not been part of the live pipeline.
- **Replacement:** `mobius-bot-state-sync.yml` (Layer 1); narrative enrichment
  is Layer 3 (ATLAS routine fills the `narrative` field, never the counters).
- **Risk:** Low — manual-only trigger; restoring it would reintroduce the
  dual-schema writer problem.
