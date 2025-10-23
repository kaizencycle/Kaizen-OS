# Change Proposal (ECI Authoring Prompt)
[Ethics] [Policy] [Governance]
Doctrine-ID: VA-2025-01   <!-- link this to your Virtue Accords entry -->

## Title
Hardening: Citizen Shield `/enroll` endpoint input validation

## Context
- Service: Lab6-proof (Citizen Shield)
- Goal: sanitize inputs, enforce schema, add unit tests
- Risk: low (no data model change), mitigated by tests + canary

## Requirements
- Add pydantic/validator schema for `/enroll`
- Reject oversized payloads; return 422 with reason
- Log audit IDs; no PII in logs
- Tests: happy path, invalid schema, overflow payload

## Constraints
- No secrets in code
- Keep latency impact < 5%
- Preserve existing API spec

## Deliverables
- Code diff(s)
- Tests (pytest)
- CHANGELOG line
- Rationale summary in 120 words