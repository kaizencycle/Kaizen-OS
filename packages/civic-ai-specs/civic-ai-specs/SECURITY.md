# Security Policy

## Contact
Report vulnerabilities to: **security@kaizencycle.org**  
GPG key available in `/keys/SECURITY.asc`

## Disclosure Window
- **90 days** for coordinated disclosure (we aim for faster)
- Do not test against production without prior written consent
- Bounties: good-faith reports that lead to a patch may receive GIC rewards

## Scope
- OAA-API-Library (public repo)
- Specs, schemas, client SDKs
- Public examples and reference implementations

## Out of Scope
- Private infrastructure, deployment secrets, third-party services
- Operational playbooks and admin-only endpoints
- Red-team scenarios and exploit reproductions until patched

## Hardening
- All incoming content is validated against JSON schemas
- Ledger attestations require signature verification and replay-nonce
- Rate limiting on all public endpoints
- No secrets committed to this repository

## Reporting Process
1. Email security@kaizencycle.org with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested remediation (if any)

2. We will respond within 48 hours
3. We will work with you on coordinated disclosure
4. Qualifying reports may earn GIC (Global Integrity Credit) rewards

© 2025 Kaizen Cycle / Michael Judan — Civic AI Standard
