# Spec: Example UBI read endpoints (consensus seed)

## Goals
- Public read-only endpoints proxied by OAA.

## Acceptance
- `GET /ubi/summary` → 200 JSON
- `GET /ubi/:userId` → 200 JSON (if exists) / 404 otherwise
