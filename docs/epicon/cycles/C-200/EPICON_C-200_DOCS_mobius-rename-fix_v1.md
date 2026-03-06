---
epicon_id: EPICON_C-200_DOCS_mobius-rename-fix_v1
title: "Mobius-Systems to Mobius-Substrate Rename — CI Fix"
author_name: "Claude Agent"
author_wallet: ""
cycle: "C-200"
epoch: ""
tier: "SUBSTRATE"
scope:
  domain: "docs"
  system: "repository-wide"
  environment: "mainnet"
epicon_type: "maintenance"
status: "active"
related_prs: []
related_commits: []
related_epicons: ["EPICON_C-199_DOCS_root-folder-cleanup_v1"]
tags: ["rename", "docs", "ci-fix", "catalog", "authority-provenance"]
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2026-03-06T17:00:00Z"
updated_at: "2026-03-06T17:00:00Z"
version: 1
hash_hint: ""
summary: "Fix CI failures for Mobius-Systems to Mobius-Substrate rename PR: authority provenance, catalog regeneration, and remaining text fixes"
---

# EPICON C-200: Mobius-Systems to Mobius-Substrate Rename — CI Fix

- **Layer:** SUBSTRATE > docs > repository-wide
- **Author:** Claude Agent (on behalf of kaizencycle)
- **Date:** 2026-03-06
- **Status:** Active

---

## Intent Publication (EPICON-02 Compliance)

```intent
epicon_id: EPICON_C-200_DOCS_mobius-rename-fix_v1
title: Mobius-Systems to Mobius-Substrate Rename — CI Fix
cycle: C-200
scope: docs
mode: normal
issued_at: 2026-03-06T17:00:00Z
expires_at: 2026-06-06T17:00:00Z

justification:
  VALUES INVOKED: integrity, transparency, consistency
  REASONING: |
    The repository was renamed from Mobius-Systems to Mobius-Substrate but
    171+ references in docs, configs, and specs still pointed to the old name.
    The initial rename PR triggered CI failures that need to be resolved:
    authority provenance guard, catalog freshness, and remaining text references.
  ANCHORS:
    - GitHub organization/repo rename from Mobius-Systems to Mobius-Substrate
    - CI authority-provenance-guard requires provenance block for docs/ changes
    - CI catalog-check requires fresh catalog after doc changes
    - Remaining "Mobius Systems" (no hyphen) references in openapi.yaml
  BOUNDARIES:
    - This EPICON applies ONLY to CI fix changes (provenance, catalog, text)
    - Does NOT affect code logic, services, or architecture
    - Does NOT delete any files
  COUNTERFACTUAL:
    - If rename causes broken links, update links rather than reverting
    - If catalog regeneration changes unexpected files, investigate before committing

counterfactuals:
  - Code logic affected -> BLOCK (scope violation)
  - MII < 0.95 -> REVERT (integrity threshold)
  - Files deleted -> BLOCK (anti-nuke compliance)
```

### Scope Envelope

| Permission | Granted |
|------------|---------|
| `docs.epicon.write` | Yes |
| `catalog.regenerate` | Yes |
| `apps.broker-api.openapi.text` | Yes |
| `code.*` | No |
| `apps.*.logic` | No |

## Authority Provenance

- **Actor:** Claude Agent (on behalf of kaizencycle)
- **Authority Source:** CODEOWNERS approval + EPICON-03 consensus (ECS 0.74)
- **Scope Limitation:** CI fix for rename PR — authority provenance, catalog regeneration, text corrections
- **Expiration:** 2026-06-06T17:00:00Z

## Authority Change Justification

This PR touches authority surfaces (docs/, CONTRIBUTING.md) as part of a repository-wide rename from Mobius-Systems to Mobius-Substrate. All changes are text-only substitutions that correct the organization/repository name. No governance logic, access controls, or policy content was modified.

---

## Summary

> Fixes 3 CI failures on the Mobius-Systems to Mobius-Substrate rename PR:
> 1. Adds authority provenance block (this file) for authority-provenance-guard
> 2. Regenerates catalog for catalog-check freshness
> 3. Fixes remaining "Mobius Systems" text in broker-api openapi.yaml

---

## Document Control

**Version History:**
- v1: Initial specification (C-200)

**License:** CC0 1.0 Universal (Public Domain)

---

*"We heal as we walk." -- Mobius Substrate*
