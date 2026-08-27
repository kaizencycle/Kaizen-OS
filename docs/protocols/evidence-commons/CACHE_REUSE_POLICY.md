# Evidence Commons — Cache Reuse Policy v0.1

## Economic rule

An agent must not pay to rediscover what the network already knows. A new acquisition is required only when evidence is missing, stale, materially different, independently required, or outside license scope.

## Identity

Cache keys derive from a **normalized request** including:

- provider identity
- resource / endpoint class
- normalized query text
- normalized parameters (stable key order)
- format, locale, jurisdiction
- license scope fingerprint

Raw URL or query text alone is insufficient.

## Freshness

| Status | Current query | Historical query |
|--------|---------------|------------------|
| FRESH | Reuse (`FRESH_HIT`) | Reuse with `STALE_ALLOWED` label |
| STALE | `REVALIDATE` | `STALE_ALLOWED` only when caller accepts historical boundary |
| SUPERSEDED / DISPUTED | Never presented as current | Provenance preserved |

## Independence

`independentSourceCount` increments only for **distinct provider/source lineages**, not reader count. Multiple agents reading one packet do not increase corroboration.

## Public vs private

Public provenance does not imply public payload. License scope gates payload return separately from metadata.
