# Citizen Trust Scores

The anti-brigading mechanism that prevents Mobius oversight from becoming a weapon.

---

## Purpose

Trust Scores exist to ensure that:
- Oversight tools remain useful
- Bad-faith actors cannot weaponize the system
- Legitimate concerns receive appropriate attention
- The system rewards accuracy over volume

---

## What Trust Scores ARE

- A **behavioral reputation** tied to actions inside Mobius
- **Transparent** — you can see your own score
- **Appealable** — disputes can be reviewed
- **Decay-based** — old actions matter less over time

---

## What Trust Scores ARE NOT

- ❌ Not social credit
- ❌ Not ideological ranking
- ❌ Not permanent blacklisting
- ❌ Not public shaming
- ❌ Not tied to identity outside Mobius

Trust is about **reliability of contributions**, not agreement with conclusions.

---

## Trust Levels

### T0 — Observer

**Access:** Read-only

**Capabilities:**
- View all public dashboards
- Read activity logs
- Subscribe to updates
- Share public links

**Requirements:** None (default level)

---

### T1 — Auditor

**Access:** Read + Flag

**Capabilities:**
- Submit concern flags
- Attach evidence to flags
- Receive flag outcome notifications

**Requirements:**
- Account age ≥ 7 days
- No previous trust violations
- Accepted civic guidelines

---

### T2 — Verified Auditor

**Access:** Read + Flag + Pattern Analysis

**Capabilities:**
- Submit pattern-level concerns
- Request steward review
- Annotate historical records
- Higher flag priority

**Requirements:**
- T1 status for ≥ 30 days
- ≥ 5 validated flag submissions
- No false positive pattern

---

### T3 — Steward

**Access:** Full oversight participation

**Capabilities:**
- Vote on threshold changes
- Review escalated concerns
- Publish official explanations
- Moderate flag submissions
- Access governance tools

**Requirements:**
- T2 status for ≥ 90 days
- Demonstrated pattern recognition accuracy
- Steward nomination and approval
- Signed steward attestation

---

## Trust Score Calculation

### Base Score

All accounts start at **100 points**.

### Score Range

| Score | Level | Status |
|-------|-------|--------|
| 100+ | T3 eligible | Excellent standing |
| 70-99 | T2 eligible | Good standing |
| 40-69 | T1 | Standard |
| 20-39 | T0 | Restricted |
| <20 | Suspended | Under review |

---

## How Trust Is GAINED

| Action | Points | Conditions |
|--------|--------|------------|
| Validated flag (accurate) | +10 | Flag confirmed by review |
| Pattern analysis adopted | +25 | Analysis led to action |
| Governance participation | +15 | Voted in official process |
| Historical annotation cited | +5 | Annotation referenced in decision |
| Account age bonus | +1/month | Maximum +12 |
| Consistent activity | +2/week | Maximum +8/month |

### Key Rule

Trust grows **slowly**. Rushing trust is a red flag.

---

## How Trust Is LOST

| Action | Points | Conditions |
|--------|--------|------------|
| Invalid flag (inaccurate) | -5 | Flag rejected after review |
| Bad-faith flag | -20 | Determined to be intentionally misleading |
| Pattern false alarm | -15 | Pattern claim unsupported by data |
| Harassment attempt | -50 | Targeting individuals, not systems |
| Coordinated brigading | -100 | Participation in organized abuse |
| Policy violation | -30 | Any conduct policy breach |

### Key Rule

Trust **decays faster than it grows**. One bad-faith action undoes months of good work.

---

## Decay Mechanics

### Positive Action Decay

- Good actions decay by 10% per quarter
- Ensures recent behavior matters most
- Prevents "banking" old reputation

### Negative Action Decay

- Bad actions decay by 5% per quarter
- Slower decay than positive actions
- Serious violations have longer impact

### No Activity Decay

- 6 months of inactivity: -10 points
- 12 months of inactivity: return to T0

---

## Appeal Process

### Who Can Appeal

Any user with score reduction ≥ 10 points.

### Appeal Requirements

1. Written explanation of dispute
2. Evidence supporting appeal
3. Acknowledgment of review finality

### Appeal Timeline

- Initial review: 7 days
- Steward review (if escalated): 14 days
- Final decision: binding

### Appeal Outcomes

| Outcome | Effect |
|---------|--------|
| Upheld | Points restored |
| Partially upheld | Partial restoration |
| Denied | No change |
| Abuse of appeal | Additional penalty |

---

## Transparency Requirements

### Visible to User

- Current trust score
- Trust level
- Recent score changes
- Decay timeline

### Visible to Public

- Aggregate trust level distribution
- System-wide flag accuracy rate
- Appeal outcome statistics

### Never Visible

- Individual user scores (except own)
- Individual flag history (except own)
- Personal identifying information

---

## Anti-Gaming Measures

### Detection Patterns

- Rapid flag submission
- Coordinated flag timing
- Copy-paste flag content
- New account flag bursts
- Cross-referencing external coordination

### Automatic Responses

| Pattern | Response |
|---------|----------|
| Rapid submission | Rate limit + review |
| Coordination detected | Flags held for steward review |
| New account burst | Flags delayed 24h |
| Copy-paste content | Merged into single review |

---

## Trust Score Display

### User Dashboard

```
┌─────────────────────────────────────────┐
│ Your Trust Score                        │
├─────────────────────────────────────────┤
│ Score: 78 / 100                         │
│ Level: T2 (Verified Auditor)            │
│                                         │
│ Recent Activity:                        │
│ • Validated flag: +10 (Jan 28)          │
│ • Participation: +15 (Jan 25)           │
│ • Decay: -3 (quarterly)                 │
│                                         │
│ Next milestone: T3 at 100 points        │
└─────────────────────────────────────────┘
```

### Microcopy

**Tooltip:**
> "Trust reflects how reliably your past actions contributed to understanding — not agreement."

**Level description:**
> "Verified Auditors have demonstrated accurate pattern recognition over time."

---

## Integration with MIC

Trust scores interact with MIC incentives:

| Trust Level | MIC Earning Rate |
|-------------|-----------------|
| T0 | No MIC earnings |
| T1 | 50% base rate |
| T2 | 100% base rate |
| T3 | 150% base rate |

Low trust = reduced or no rewards.
High trust = enhanced rewards.

---

## Edge Cases

### New Users

- Start at T0 with 100 points
- 7-day waiting period before T1
- Cannot skip levels

### Returning Users

- Inactivity decay applies
- Can regain levels through activity
- Historical record preserved

### Disputed Actions

- Score changes paused during appeal
- Resolution applies retroactively
- No double jeopardy

---

## Governance

Trust score policies are set by:
- Steward council vote
- RFC for major changes
- EPICON for threshold adjustments

Changes require:
- 72-hour notice
- Majority steward approval
- Public rationale

---

*"Trust is about reliability, not ideology. Accuracy matters more than agreement."*

*We heal as we walk. — Mobius Substrate*
