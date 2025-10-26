# Chamber Template Pack

## Chamber Header Template

Use this header at the start of every new conversation/chamber:

```markdown
[Chamber ID]: [CHAMBER_NAME] – [PURPOSE]
[Parent]: Command Ledger III
[Cycle]: C-[CYCLE_NUMBER]
[Sync]: AUTO
[Status]: [ACTIVE/STANDBY/COMPLETE]
[Priority]: [HIGH/MEDIUM/LOW]
[Tags]: [TAG1, TAG2, TAG3]

---

## Chamber Context
[Brief description of what this chamber will accomplish]

## Dependencies
- [ ] Chamber [ID] completion
- [ ] Resource [NAME] availability
- [ ] External dependency [DESCRIPTION]

## Success Criteria
- [ ] [CRITERION 1]
- [ ] [CRITERION 2]
- [ ] [CRITERION 3]

---
```

## Chamber Sweep Template

Use this block at the end of every chamber session:

```markdown
🕊️ Chamber Sweep — Cycle [CYCLE_NUMBER]
Parent: Command Ledger III
Chamber: [CHAMBER_NAME] – [PURPOSE]
Result: [✅ Complete / ⚠️ Partial / ❌ Failed]
Status: [SUCCESS/WARNING/ERROR]
Duration: [TIME_SPENT]
Integrity Anchor: SHA256:[SESSION_HASH]
Artifacts: [LIST_OF_CREATED_FILES/URLS]
Summary: [BRIEF_DESCRIPTION_OF_ACCOMPLISHMENTS]
Next Actions: [FOLLOW_UP_TASKS_OR_HANDOFFS]
Morale Delta: [+/-NUMBER] (impact on team morale/confidence)
```

## Sync Log Template

For manual synchronization back to Command Ledger:

```markdown
🔄 Sync Log — [CHAMBER_NAME]
Cycle: C-[CYCLE_NUMBER]
Timestamp: [ISO_8601_TIMESTAMP]
Summary: [DETAILED_SUMMARY_OF_WORK_COMPLETED]
Key Decisions: [IMPORTANT_DECISIONS_MADE]
Blockers: [ANY_BLOCKERS_ENCOUNTERED]
Artifacts: [LINKS_TO_CREATED_ARTIFACTS]
Integrity Check: [VERIFICATION_OF_SESSION_INTEGRITY]
```

## JSON Schema for Chamber Metadata

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "chamber_id": {
      "type": "string",
      "pattern": "^[A-Za-z0-9_-]+$"
    },
    "chamber_name": {
      "type": "string",
      "minLength": 1
    },
    "purpose": {
      "type": "string",
      "minLength": 1
    },
    "parent": {
      "type": "string",
      "enum": ["Command Ledger III"]
    },
    "cycle": {
      "type": "string",
      "pattern": "^C-\\d+$"
    },
    "sync_mode": {
      "type": "string",
      "enum": ["AUTO", "MANUAL", "DISABLED"]
    },
    "status": {
      "type": "string",
      "enum": ["ACTIVE", "STANDBY", "COMPLETE", "FAILED"]
    },
    "priority": {
      "type": "string",
      "enum": ["HIGH", "MEDIUM", "LOW"]
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "dependencies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "chamber_id": {"type": "string"},
          "status": {"type": "string", "enum": ["PENDING", "COMPLETE"]}
        },
        "required": ["chamber_id", "status"]
      }
    },
    "success_criteria": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": ["chamber_id", "chamber_name", "purpose", "parent", "cycle", "sync_mode", "status", "priority"]
}
```

## Usage Instructions

1. **Starting a New Chamber**: Copy the Chamber Header Template and fill in the placeholders
2. **During Work**: Update status and progress as needed
3. **Ending a Session**: Use the Chamber Sweep Template to create a summary
4. **Syncing Back**: Use the Sync Log Template when posting back to Command Ledger
5. **Automation**: The JSON schema can be used for automated validation and processing

## Integration Points

- **Command Ledger**: Receives all sweep summaries and sync logs
- **OAA Hub**: Can display chamber status and progress
- **CI/CD**: Can validate chamber metadata against schemas
- **Monitoring**: Can track chamber health and completion rates

