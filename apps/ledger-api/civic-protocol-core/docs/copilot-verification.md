# Copilot Verification System

This document describes the Copilot verification workflow implemented across the Civic Protocol repositories.

## Overview

The Copilot verification system ensures that AI-generated code suggestions are properly tracked, verified, and sealed to the Civic Ledger. This creates an immutable record of AI assistance in the development process.

## Architecture

### Core Repository (civic-protocol-core)
- **Reusable Workflow**: `.github/workflows/reusable-copilot-verify.yml`
- **Verification Script**: `scripts/verifyCopilotDiff.mjs`
- **Policy Configuration**: `policies/copilot-verify.json`
- **Pre-commit Hook**: `scripts/capture-suggestions.mjs`

### App Repositories (OAA-API-Library, Lab7-proof, etc.)
- **Caller Workflow**: `.github/workflows/copilot-verify.yml`
- **Suggestions File**: `.copilot/suggestions.json` (auto-generated)

## How It Works

1. **Development Phase**:
   - Developers use Copilot/Cursor for code suggestions
   - Pre-commit hook captures suggestions in `.copilot/suggestions.json`
   - Suggestions are committed alongside code changes

2. **CI/CD Phase**:
   - GitHub Actions triggers on PR/push
   - Reusable workflow checks out code and suggestions
   - Verification script compares suggestions against actual code changes
   - Calculates overlap score (0.0 to 1.0)
   - Optionally seals proof to Civic Ledger

3. **Policy Enforcement**:
   - Configurable minimum overlap score (default: 0.35)
   - Optional build failure on low scores
   - Artifact retention for audit trail

## Setup Instructions

### 1. Core Repository Setup

The core repository already contains all necessary files. No additional setup required.

### 2. App Repository Setup

For each app repository (OAA-API-Library, Lab7-proof, etc.):

#### A. Add the verification script
```bash
# Copy the verification script
cp civic-protocol-core/scripts/verifyCopilotDiff.mjs scripts/
chmod +x scripts/verifyCopilotDiff.mjs
```

#### B. Add the caller workflow
```yaml
# .github/workflows/copilot-verify.yml
name: copilot-verify
on: [pull_request, push]
jobs:
  verify:
    uses: civic-protocol/core/.github/workflows/reusable-copilot-verify.yml@main
    secrets: inherit
    with:
      min_score: "0.35"
      fail_on_low: "false"
```

#### C. Set up pre-commit hook (optional)
```bash
# Copy the capture script
cp civic-protocol-core/scripts/capture-suggestions.mjs scripts/
chmod +x scripts/capture-suggestions.mjs

# Set up pre-commit hook
node scripts/setup-precommit.mjs
```

### 3. GitHub Configuration

#### A. Repository Variables
Set these in GitHub repository settings:
- `LEDGER_BASE_URL`: URL of the Civic Ledger API
- `LEDGER_ADMIN_TOKEN`: Admin token for ledger access

#### B. Organization Secrets
For organization-wide configuration:
- `LEDGER_ADMIN_TOKEN`: Shared admin token

## Configuration

### Policy Configuration (`policies/copilot-verify.json`)

```json
{
  "min_score": 0.35,
  "fail_on_low": false,
  "enforce_on": ["main", "release/*"],
  "settings": {
    "suggestions_required": false,
    "ledger_sealing_enabled": true,
    "artifact_retention_days": 30
  }
}
```

### Workflow Inputs

- `min_score`: Minimum overlap score required (default: 0.35)
- `fail_on_low`: Whether to fail build on low scores (default: false)

## Verification Process

### Overlap Score Calculation

The verification script calculates an overlap score by:

1. Extracting code changes from git diff
2. Comparing each suggestion against the actual changes
3. Calculating percentage of suggestion text that appears in changes
4. Averaging across all suggestions

### Proof Generation

Each verification generates a proof containing:

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "base_ref": "abc123",
  "head_ref": "def456",
  "overlap_score": 0.75,
  "suggestions_checked": 5,
  "changes_detected": 12,
  "status": "verified",
  "ledger_proof": {
    "transaction_id": "tx_123",
    "block_height": 1000,
    "sealed_at": "2024-01-01T12:00:00Z"
  }
}
```

## Ledger Integration

When configured, proofs are automatically sealed to the Civic Ledger:

- **Event Type**: `copilot_verification`
- **Data**: Repository, commit, scores, timestamps
- **Authentication**: Bearer token via `LEDGER_ADMIN_TOKEN`
- **Endpoint**: `{LEDGER_BASE_URL}/api/events`

## Troubleshooting

### Common Issues

1. **No suggestions found**
   - Ensure `.copilot/suggestions.json` exists
   - Check pre-commit hook is working
   - Verify file permissions

2. **Low overlap scores**
   - Review suggestion quality
   - Check if suggestions match actual changes
   - Consider adjusting `min_score` threshold

3. **Ledger sealing fails**
   - Verify `LEDGER_BASE_URL` and `LEDGER_ADMIN_TOKEN`
   - Check network connectivity
   - Review ledger API logs

### Debug Mode

Enable debug logging by setting environment variables:
```bash
export DEBUG=1
export VERBOSE=1
```

## Security Considerations

- **Token Security**: Store `LEDGER_ADMIN_TOKEN` as GitHub secret
- **Access Control**: Limit ledger admin token permissions
- **Audit Trail**: All verifications are logged and sealed
- **Privacy**: Suggestions may contain sensitive code patterns

## Future Enhancements

- **Machine Learning**: Improve overlap score calculation
- **Pattern Recognition**: Detect common AI-generated patterns
- **Integration**: Support for other AI coding assistants
- **Analytics**: Dashboard for verification metrics
- **Policy Evolution**: Dynamic policy updates based on performance

## Support

For issues or questions:
- Create an issue in the civic-protocol-core repository
- Check the troubleshooting section above
- Review GitHub Actions logs for detailed error information