# EPICON Guard v1.1

**Tag:** `v1.1`  
**Date:** 2026-07-10

Trusted base-policy loading for pull requests — closes the self-classification
bypass where a PR could weaken `.github/epicon-policy.json` in the same diff.

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

Michael (kaizencycle) exercises **founder–custodian standing** to vendor EPICON
Guard v1.1 on Mobius-Substrate (C-367 follow-up). Scope is limited to the CI
composite action, workflow wiring, and release documentation listed here — not
runtime application code, deployment surfaces, or federation repo policy
registries.

## Upgrade

```yaml
- uses: kaizencycle/epicon@v1.1
  with:
    mode: enforce
    policy-ref: base   # default on pull_request when omitted
```

No `actions/checkout` or shell pin step required. The action loads the tier
registry from the PR **base SHA** via the GitHub Contents API; changed files
still come from the PR files API.

## New inputs

| Input | Default | Description |
|-------|---------|-------------|
| `policy-ref` | `base` on PR events | `base` · `workspace` · explicit ref/SHA |
| `policy-path` | `.github/epicon-policy.json` | Path to tier registry JSON |

## Migration from v1 + shell pin

**Before (v1 workaround):**

```yaml
- uses: actions/checkout@v4
- name: Pin tier policy to base revision
  run: |
    git fetch --depth=1 origin "${{ github.event.pull_request.base.sha }}"
    git show "${{ github.event.pull_request.base.sha }}:.github/epicon-policy.json" > .github/epicon-policy.json || rm -f .github/epicon-policy.json
- uses: kaizencycle/epicon@v1
```

**After (v1.1):**

```yaml
- uses: kaizencycle/epicon@v1.1
  with:
    mode: enforce
```

## Backward compatibility

- `@v1` unchanged — consumers must keep the shell pin or accept the bypass risk.
- `policy-ref: workspace` restores v1 filesystem behaviour (checkout required).
