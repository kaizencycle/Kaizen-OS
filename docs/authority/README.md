# Mobius Authority Documentation

This directory contains authority-related documentation for the Mobius substrate.

---

## What Lives Here

| Document | Purpose |
|----------|---------|
| Authority declarations | Who can approve what types of changes |
| EPICON authority scopes | Scope envelopes for EPICON declarations |
| Delegation records | How authority is delegated between roles |

---

## Authority Model

Mobius uses a tiered authority model:

### Tier 1: Core Protocol Authority

Changes to EPICON schema, MII formula, MIC issuance rules.

**Required:**
- RFC in `docs/11-SUPPLEMENTARY/rfcs/`
- 72-hour review window
- ≥2 maintainer approvals
- EPICON with full justification

**Holders:**
- `kaizencycle` (primary maintainer)
- `michaeljudan` (primary maintainer)
- `mobius:AUREA` (sentinel reviewer)

### Tier 2: Operational Authority

Changes to thresholds, sign-off requirements, workflow configs.

**Required:**
- EPICON with intent declaration
- ≥2 maintainer approvals

### Tier 3: Documentation Authority

Clarifications, examples, formatting.

**Required:**
- ≥1 maintainer approval
- EPICON optional (recommended for significant changes)

**Daily close seals:** The [EVE Daily Closing Seal EPICON](../epicon/EPICON-C284-EVE-DAILY-SEAL.md) defines documentation-only canonical artifacts (`daily/eve/…`) that record end-of-day synthesis and hash-linked continuity. They are **substrate archive objects**, not grants of runtime authority, MIC issuance, or ledger write scope. Implementation PRs that add cron routes or tokens still require their own EPICON-02 intent and scope envelope.

---

## EPICON Authority Declarations

Every EPICON includes an authority declaration:

```yaml
authority:
  actor: "<GitHub username or agent identity>"
  source: "<CODEOWNERS | RFC | Emergency>"
  scope: "<what this authority covers>"
  expiration: "<ISO 8601 timestamp>"
```

### Scope Envelope

EPICONs declare explicit permission boundaries:

| Permission | Meaning |
|------------|---------|
| `docs.read` | Can read documentation |
| `docs.write` | Can modify documentation |
| `docs.create` | Can create new documentation |
| `code.read` | Can read source code |
| `code.write` | Can modify source code |
| `infra.deploy` | Can deploy infrastructure |
| `governance.modify` | Can change governance rules |

### Example Scope Declaration

```yaml
scope_envelope:
  docs.read: true
  docs.write: true
  docs.create: true
  code.read: false
  code.write: false
  infra.deploy: false
  governance.modify: false
```

---

## Authority Verification

### How to Verify Authority

1. Check CODEOWNERS for path ownership
2. Check EPICON for declared scope
3. Verify approvals match requirements
4. Confirm no scope violations

### Authority Violations

If a change exceeds declared authority:

1. **Block:** PR should not merge
2. **Flag:** Sentinel review should catch
3. **Escalate:** Human review required
4. **Record:** Document violation in EPICON

---

## Delegation

Authority can be delegated via:

1. **CODEOWNERS:** Explicit path ownership
2. **Team membership:** GitHub team assignment
3. **EPICON delegation:** Explicit authority grant in EPICON

### Delegation Limits

- Delegated authority cannot exceed delegator's authority
- Delegation expires with the delegating EPICON
- Emergency delegation requires post-hoc review

---

## Emergency Authority

For urgent security or safety issues:

1. Single maintainer may act with `mode: emergency`
2. Post-merge review required within 72 hours
3. Emergency EPICON must document:
   - Why emergency was necessary
   - What authority was exercised
   - Post-mortem findings

---

## Related Documents

- `docs/GOVERNANCE.md` - Overall governance structure
- `docs/RFC_PROCESS.md` - RFC process for high-signal changes
- `docs/epicon/EPICON-02.md` - EPICON intent publication spec
- `.github/CODEOWNERS` - Code ownership declarations

---

## Authority Index

| Authority Level | Scope | Holders |
|-----------------|-------|---------|
| Core Protocol | EPICON, MII, MIC | kaizencycle, michaeljudan |
| Operational | Thresholds, configs | kaizencycle, michaeljudan |
| Documentation | Docs, examples | All contributors (with review) |
| Sentinel Review | Advisory review | AUREA, ATLAS |

---

*"We heal as we walk." — Mobius Substrate*
