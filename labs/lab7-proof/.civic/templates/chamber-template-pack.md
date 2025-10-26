# Chamber Template Pack
Ready-to-copy templates for consistent cross-thread synchronization

## 1. Chamber Header Template

Copy this to the beginning of every new conversation:

```
[Chamber ID]: {{CHAMBER_NAME}} – {{PURPOSE}}
[Parent]: Command Ledger III
[Cycle]: C-{{CYCLE_NUMBER}}
[Sync]: AUTO
[Timestamp]: {{ISO_TIMESTAMP}}
[Integrity Anchor]: sha256:{{HASH}}
```

## 2. Chamber Sweep Template

Copy this to the end of every chamber session:

```
🕊️ Chamber Sweep — C-{{CYCLE_NUMBER}}
Parent: Command Ledger III
Result: ✅ Complete
Integrity Anchor: SHA256:{{HASH}}
Summary: {{SUMMARY_TEXT}}
Artifacts: {{ARTIFACT_LINKS}}
Morale Delta: {{MORALE_DELTA}}
```

## 3. Change Proposal Template

Use this for any code changes:

```json
{
  "title": "{{CHANGE_TITLE}}",
  "chamber": "{{CHAMBER_ID}}",
  "cycle": "C-{{CYCLE_NUMBER}}",
  "motivation": "{{WHY_THIS_CHANGE}}",
  "scope": ["{{SCOPE_ITEMS}}"],
  "risk": "{{RISK_LEVEL}}",
  "rollback": "{{ROLLBACK_PLAN}}",
  "citations": [
    {
      "url": "{{DOCUMENTATION_URL}}",
      "hash": "sha256:{{HASH}}"
    }
  ],
  "author": "Command Ledger III",
  "timestamp": "{{ISO_TIMESTAMP}}",
  "parent_chamber": "Command Ledger III",
  "integrity_anchor": "sha256:{{HASH}}"
}
```

## 4. Test Specification Template

Use this for test cases:

```json
{
  "chamber": "{{CHAMBER_ID}}",
  "cycle": "C-{{CYCLE_NUMBER}}",
  "test_suite": "civic-patch-tests",
  "tests": [
    {
      "name": "{{TEST_NAME}}",
      "type": "{{TEST_TYPE}}",
      "input": {
        "{{INPUT_DESCRIPTION}}": "{{INPUT_VALUE}}"
      },
      "expected_output": {
        "{{OUTPUT_DESCRIPTION}}": "{{EXPECTED_VALUE}}"
      }
    }
  ],
  "integrity_anchor": "sha256:{{HASH}}",
  "parent_chamber": "Command Ledger III"
}
```

## 5. Sync Log Template

Use this for manual synchronization:

```
🔄 Sync Log — {{CHAMBER_NAME}}
Summary: {{SUMMARY_TEXT}}
Integrity Anchor: {{HASH}}
Status: {{STATUS}}
```

## 6. Release Attestation Template

Use this for deployment records:

```json
{
  "release_id": "v{{VERSION}}",
  "chamber": "{{CHAMBER_ID}}",
  "cycle": "C-{{CYCLE_NUMBER}}",
  "commit_sha": "{{COMMIT_HASH}}",
  "pr_link": "{{PR_URL}}",
  "authors": ["Command Ledger III"],
  "spec_hash": "sha256:{{HASH}}",
  "tests_hash": "sha256:{{HASH}}",
  "gi_score": {{GI_SCORE}},
  "shield_summary": {
    "security_scan": "{{SCAN_RESULT}}",
    "performance_score": {{PERFORMANCE_SCORE}},
    "code_quality": {{CODE_QUALITY}}
  },
  "canary_metrics": {
    "error_rate": {{ERROR_RATE}},
    "p95_latency_ms": {{LATENCY}},
    "throughput_rps": {{THROUGHPUT}}
  },
  "deployment_timestamp": "{{ISO_TIMESTAMP}}",
  "rollback_available": true,
  "integrity_anchor": "sha256:{{HASH}}",
  "parent_chamber": "Command Ledger III"
}
```

## Usage Instructions

1. **For New Conversations**: Start with Chamber Header Template
2. **For Code Changes**: Create change.proposal.json and change.tests.json
3. **For Session End**: Use Chamber Sweep Template
4. **For Manual Sync**: Use Sync Log Template
5. **For Deployments**: Use Release Attestation Template

## Quick Commands

```bash
# Create a new chamber sweep
python .civic/ledger-hook.py --chamber "Lab6" --parent "Command Ledger III" --cycle "C-109" --summary "Security improvements" --sync

# Validate civic schemas
python -c "import json, jsonschema; json.load(open('.civic/change.proposal.json')); print('Valid')"

# Generate integrity anchor
python -c "import hashlib; print('sha256:' + hashlib.sha256(b'content').hexdigest())"
```
