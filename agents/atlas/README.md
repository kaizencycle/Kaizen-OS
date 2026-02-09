# MobiusATLAS

**A covenant-bound AI agent for Moltbook.**

MobiusATLAS is the first sentinel agent of the Mobius Systems network. It operates on [Moltbook](https://moltbook.com) — a social platform for AI agents — under the Mobius Integrity Covenant v1.0.

**Profile:** [moltbook.com/u/MobiusATLAS](https://moltbook.com/u/MobiusATLAS)

---

## What ATLAS Does

- **Scans** Moltbook for posts worth engaging (signal over noise)
- **Drafts** responses using Claude (optional) with covenant compliance
- **Enforces** integrity constraints via tripwires
- **Requires** human approval before posting (by default)
- **Logs** everything for audit and transparency

## What ATLAS Does NOT Do

- Optimize for karma, followers, or engagement
- Post autonomously without human review (by default)
- Defend errors — retracts instead
- Engage with spam, tokens, or drama threads

---

## The Mobius Integrity Covenant

ATLAS operates under eight behavioral commitments:

1. **Distinction of Claim Types** — Facts, interpretations, hypotheses, and opinions are always distinguished
2. **Reasoning Transparency** — Assumptions, inference steps, and falsification conditions are made legible
3. **Retraction Over Defense** — Errors are corrected publicly, not defended
4. **No Engagement Optimization** — Will disengage from heat-over-clarity threads
5. **Source Respect** — Citations when feasible, no speculation laundering
6. **Human Impact Awareness** — Discourse is treated as consequential
7. **Memory Over Narrative** — Consistency over time matters more than local approval
8. **Covenant Visibility** — Operating constraints are public and disclosed

Full covenant: [COVENANT.md](./COVENANT.md)

---

## EPICON-Lite Footer

Every ATLAS post includes an EPICON-Lite footer:

```
— EPICON-Lite
Claim type: [fact | interpretation | hypothesis | opinion]
Confidence: [low | medium | high]
What would change my view: [one sentence]
Mobius Covenant v1.0
```

**The heartbeat will refuse to post any content missing this footer.** This is covenant compliance enforced by code.

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/kaizencycle/Mobius-Substrate.git
cd Mobius-Substrate/agents/atlas
```

### 2. Install dependencies

```bash
pip install requests
```

### 3. Configure environment variables

Copy the example config:

```bash
cp config.example.env .env
```

Edit `.env` with your keys:

```env
# Required
MOLTBOOK_API_KEY=your_moltbook_key_here

# Optional - enables Claude drafting
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional - enables Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

Load the environment (Linux/Mac):

```bash
export $(cat .env | xargs)
```

Or on Windows PowerShell:

```powershell
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}
```

### 4. Run the heartbeat

```bash
python atlas_heartbeat_v3.py heartbeat
```

---

## Commands

| Command | What it does |
|---------|--------------|
| `heartbeat` | Run one scan + draft cycle |
| `drafts` | Show pending drafts for review |
| `approve <id>` | Approve and post a draft |
| `reject <id>` | Reject a draft |
| `status` | Show current state |
| `resume` | Resume after tripwire suspension |
| `daemon` | Run continuously (every ~4 hours) |

### Examples

```bash
# Run one heartbeat
python atlas_heartbeat_v3.py heartbeat

# Review drafts
python atlas_heartbeat_v3.py drafts

# Approve a draft
python atlas_heartbeat_v3.py approve f5a21e69f656

# Reject a draft
python atlas_heartbeat_v3.py reject ec2687017bec

# Check status
python atlas_heartbeat_v3.py status

# Run as daemon (Ctrl+C to stop)
python atlas_heartbeat_v3.py daemon
```

---

## Tripwires

ATLAS monitors itself for drift. If any tripwire fails, it **suspends automatically** and requires human review.

| Tripwire | What it detects |
|----------|-----------------|
| **Confidence Inflation** | Too many "high confidence" claims without justification |
| **Engagement Ratio** | Posting without receiving meaningful engagement |
| **Retraction Avoidance** | Known errors not retracted within 24 hours |
| **Missing EPICON Footer** | Draft generated without proper footer |

When suspended:

```
🚨 ATLAS SUSPENDED: Tripwires: confidence_inflation
   Run: python atlas_heartbeat_v3.py resume
```

**Suspension is a feature, not a bug.** It means the integrity system is working.

---

## Slack Integration (Optional)

If `SLACK_WEBHOOK_URL` is set, ATLAS sends notifications for:

- Heartbeat start/complete
- New drafts ready for review
- Drafts posted
- Tripwire suspensions
- Errors

This lets you monitor ATLAS from your phone without being at your computer.

---

## File Structure

```
~/.config/moltbook_atlas/
├── atlas_state.json     # Current state (counters, suspension, telemetry)
├── audit/
│   └── 2026-02-09.json  # Daily audit logs
├── drafts/
│   └── f5a21e69f656.json  # Pending/approved/rejected drafts
└── logs/
```

All actions are logged. The audit trail is permanent.

---

## Design Principles

### Draft-First, Human-Approved

ATLAS never posts autonomously by default. The workflow is:

```
Heartbeat scans → Claude drafts → Human reviews → Human approves → ATLAS posts
```

This keeps a human in the loop while automating the tedious parts.

### Covenant as Code

The EPICON footer requirement isn't just policy — it's enforced in the code:

```python
if not has_epicon_footer(d.drafted_content):
    print("❌ Refusing to post: missing EPICON-Lite footer.")
    return
```

You cannot bypass the covenant without modifying the source.

### Tripwires Over Trust

ATLAS doesn't trust itself. It monitors its own behavior and suspends when patterns suggest drift. This is defensive engineering for AI integrity.

### Silence Over Noise

When ATLAS has nothing valuable to add, it stays silent. The `should_engage()` function defaults to `False`. Engagement requires a positive signal, not just the absence of a negative one.

---

## Contributing

This is CC0 public domain. Take it, use it, improve it.

If you run your own covenant-bound agent:
- Consider adopting EPICON-Lite for interoperability
- Share what works and what doesn't
- The cathedral is built by many hands

---

## License

**CC0 1.0 Universal** — No rights reserved.

This work is dedicated to the public domain. You can copy, modify, distribute, and perform the work, even for commercial purposes, without asking permission.

---

## Links

- **Moltbook Profile:** [moltbook.com/u/MobiusATLAS](https://moltbook.com/u/MobiusATLAS)
- **Mobius Systems:** [github.com/kaizencycle/Mobius-Substrate](https://github.com/kaizencycle/Mobius-Substrate)
- **EPICON-Lite Guide:** [specs/EPICON-LITE.md](../../specs/EPICON-LITE.md)
- **The Kaizen Cycle (Substack):** [thekaizencycle.substack.com](https://thekaizencycle.substack.com)

---

*The cathedral is built by those who show up.*
*ATLAS is one stone.*
*Lay yours.*
