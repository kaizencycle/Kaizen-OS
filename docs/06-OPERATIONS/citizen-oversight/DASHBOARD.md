# Citizen Oversight Dashboard

Wireframes and layout specifications for the citizen-facing oversight interface.

**Design Principle:** Intentionally boring, legible, and civic. No dopamine UI. No panic UX.

---

## 1. HOME — Integrity at a Glance

### Purpose

Answer in 10 seconds:

> "Is this AI system behaving responsibly right now?"

### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ MOBIUS ▸ Citizen Oversight                    [About] [FAQ] │
├─────────────────────────────────────────────────────────────┤
│ Mobius Integrity Index (MII)                                │
│                                                             │
│        🟢 0.97  —  STABLE                                   │
│        Integrity has remained stable for 42 days            │
│                                                             │
│  Thresholds:  🟢 Stable ≥0.95   🟡 Watch 0.90–0.94   🔴 <0.90│
├─────────────────────────────────────────────────────────────┤
│  [ Integrity Trend ]   [ Intent Transparency ]   [ Alerts ] │
│                                                             │
│  30d ▸ 90d ▸ 1y        Declared: 1284        🔔 0 Critical  │
│  ────────────         Executed: 1271        ⚠️ 2 Review     │
│  ────────              Blocked: 13           ℹ️ 5 Info      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Design Intent

- One number
- One sentence
- No interpretation required

### Header Strip (Always Visible)

| Element | Display |
|---------|---------|
| MII Value | Large, color-coded |
| Status | STABLE / WATCH / BREACH |
| Days Stable | Running count |

### Status Colors

| Status | Color | Condition |
|--------|-------|-----------|
| Stable | 🟢 Green | MII ≥ 0.95 |
| Watch | 🟡 Yellow | MII 0.90–0.94 |
| Breach | 🔴 Red | MII < 0.90 |

---

## 2. ACTIVITY — What Changed?

### Purpose

Answer:

> "What actually happened, and why should I care?"

### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ ACTIVITY LOG                                                │
├─────────────────────────────────────────────────────────────┤
│ 🕘 Jan 26 — Policy Update Executed                          │
│  • Declared intent: Improve safety filter reliability       │
│  • Risk level: Medium                                       │
│  • Approvals: 1 human steward                               │
│  • Integrity impact: Neutral                                │
│  • Status: Completed                                        │
│                                                             │
│  [ Expand details ▾ ]                                       │
├─────────────────────────────────────────────────────────────┤
│ 🕘 Jan 24 — Action Blocked                                  │
│  • Reason: Missing justification                            │
│  • Integrity impact: Positive                               │
│  • Status: Prevented                                        │
│                                                             │
│  [ Expand details ▾ ]                                       │
└─────────────────────────────────────────────────────────────┘
```

### Key Rule

No code. No internal identifiers. Only: **what / why / risk / outcome**.

### Event Fields

| Field | Description |
|-------|-------------|
| Timestamp | When it happened |
| Summary | One-line description |
| Intent | Declared justification |
| Risk | Low / Medium / High |
| Impact | Integrity effect |
| Status | Completed / Blocked / Pending |

### Filters

- By risk level
- By system component
- By date range
- By "blocked actions only"

---

## 3. OVERSIGHT — Early Warning, Not Panic

### Purpose

Give citizens early warning, not panic.

### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ OVERSIGHT SIGNALS                                           │
├─────────────────────────────────────────────────────────────┤
│ Intent Coverage        🟢 Normal                            │
│ Review Latency         🟡 Slightly Elevated                 │
│ Repeated Overrides     🟢 None Detected                     │
│ Integrity Drift Risk   🟢 Low                               │
├─────────────────────────────────────────────────────────────┤
│ PATTERN WATCH                                               │
│ • No recurring emergency actions                            │
│ • No decline in explanation quality                         │
│ • No acceleration of review bypass                          │
│                                                             │
│ Confidence: High                                            │
└─────────────────────────────────────────────────────────────┘
```

### Signals Panel

| Signal | Description |
|--------|-------------|
| Intent Coverage | Are actions being justified? |
| Review Latency | Are reviews happening on time? |
| Repeated Overrides | Are emergencies recurring? |
| Drift Risk | Is there a concerning trend? |

### Pattern Watch

Shows **patterns**, not incidents:

- Repeated emergency overrides
- Declining explanation quality
- Increasing blocked actions
- Shortened review cycles

Each pattern has:
- Explanation
- Historical comparison
- Confidence level

### Prevention Goals

- Single-incident hysteria
- Social media pile-ons
- Reactionary conclusions

---

## 4. CITIZEN ACTION — Act, Carefully

### Purpose

Oversight without mobs or vigilantism.

### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ CITIZEN ACTION                                              │
├─────────────────────────────────────────────────────────────┤
│ What would you like to do?                                  │
│                                                             │
│ [ View reports ]   [ Subscribe ]   [ Flag concern ]         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ FLAG A CONCERN (Auditor)                                    │
│                                                             │
│ What are you seeing?  [__________________________]          │
│ Pattern or incident? ( ) Pattern  ( ) Incident              │
│ Why does this matter? [__________________________]          │
│                                                             │
│ ⚠️ Reports are recorded. Bad-faith use reduces trust score. │
│                                                             │
│ [ Submit ]                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Action Options (Role-Based)

| Role | Actions |
|------|---------|
| Observer | Read reports, subscribe, share |
| Auditor | Flag anomaly, attach evidence |
| Steward | Review escalations, vote on thresholds |

### Important

Friction is intentional. Oversight ≠ outrage.

---

## 5. MEMORY — No Amnesia

### Purpose

Prevent institutional amnesia.

### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM MEMORY                                               │
├─────────────────────────────────────────────────────────────┤
│ Total actions recorded:     18,402                          │
│ Total blocked actions:         214                          │
│ Integrity breaches:              2 (resolved)               │
│ Longest stable period:        123 days                      │
├─────────────────────────────────────────────────────────────┤
│ HISTORICAL NOTES                                            │
│ • "Review process strengthened after Jan 2025 incident"     │
│ • "Thresholds adjusted after citizen audit"                 │
└─────────────────────────────────────────────────────────────┘
```

### Memory Snapshot

| Metric | Description |
|--------|-------------|
| Actions Recorded | Total logged actions |
| Blocked Actions | Prevention count |
| Breaches | With resolution status |
| Stable Period | Longest clean run |

### Public Annotations

Citizens and stewards can attach notes:

> "This change later caused X issue."
> "This was resolved after Y intervention."

Think public margin notes, not comments.

---

## 6. GOVERNANCE — Who Is Responsible?

### Purpose

Accountability without harassment.

### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ GOVERNANCE MAP                                              │
├─────────────────────────────────────────────────────────────┤
│ Decisions requiring human approval:                         │
│ • Production deployment                                     │
│ • Integrity threshold changes                               │
│ • MIC mint/burn logic                                       │
│                                                             │
│ Oversight path:                                             │
│ Citizen → Auditor → Steward → Public record                 │
│                                                             │
│ No single entity has unilateral authority.                  │
└─────────────────────────────────────────────────────────────┘
```

### Governance Map Contents

- What decisions require human approval
- What thresholds trigger escalation
- Who reviews what (roles, not names)
- How disputes are resolved

### Clear Statement

> "No single person or model has unilateral authority."

---

## 7. SAFETY FOOTER (Always Visible)

```
┌─────────────────────────────────────────────────────────────┐
│ Mobius does not monitor individuals.                        │
│ Mobius does not access private data.                        │
│ Mobius does not censor content.                             │
│                                                             │
│ Mobius records behavior and justification — nothing more.   │
└─────────────────────────────────────────────────────────────┘
```

This protects trust.

---

## 8. MOBILE MODE

Mobile view collapses into:

1. MII status
2. "What changed today?"
3. Alerts (if any)
4. One-tap "Learn more"

**No dense charts on mobile.**

---

## First-Time User Prompt

Shown once, on first visit:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Mobius does not tell you what to think.                   │
│   It shows you what is happening.                           │
│                                                             │
│   Oversight works when citizens act carefully, not loudly.  │
│                                                             │
│                    [ I understand ]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Users must click to continue.

---

*"A dashboard that lets citizens see institutional drift before it becomes irreversible."*
