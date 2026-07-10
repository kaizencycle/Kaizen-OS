# EPICON Guard composite action (v1.1)

Interim host for `policy-ref: base` until `kaizencycle/epicon@v1.1` is tagged.

## Consumer workflow

```yaml
- uses: kaizencycle/Mobius-Substrate/.github/actions/epicon-guard@5e02b84d
  with:
    mode: enforce
    policy-ref: base
```

After `kaizencycle/epicon@v1.1` ships, switch to:

```yaml
- uses: kaizencycle/epicon@v1.1
  with:
    mode: enforce
    policy-ref: base
```

## Publish v1.1 to epicon repo

The canonical implementation lives here until pushed to `kaizencycle/epicon`.
Apply `docs/releases/v1.1.md` and tag `v1.1` on merge.
