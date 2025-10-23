# Copilot Verification Workflow

A comprehensive system for verifying AI-generated code suggestions against actual code changes, with optional Civic Ledger integration for proof sealing.

## Overview

This system provides:
- **Overlap scoring** between AI suggestions and actual code changes
- **Configurable thresholds** for pass/fail decisions
- **Civic Ledger integration** for immutable proof storage
- **GitHub Actions workflows** for automated verification
- **Husky pre-commit hooks** for suggestion capture

## Architecture

### Core Protocol Repository
Contains the reusable workflow and verification logic:
- `.github/workflows/reusable-copilot-verify.yml` - Reusable GitHub Actions workflow
- `scripts/verifyCopilotDiff.mjs` - Core verification script
- `policies/copilot-verify.json` - Default policy configuration

### Application Repositories
Each app repo uses the core workflow:
- `.github/workflows/copilot-verify.yml` - Workflow that calls the core
- `scripts/verifyCopilotDiff.mjs` - Copy of verification script
- `scripts/captureCopilotSuggestions.mjs` - Pre-commit suggestion capture
- `.copilot/suggestions.json` - Captured suggestions file

## Quick Setup

### 1. Core Repository Setup

The core repository should already have the reusable workflow. If not, copy the files from this implementation.

### 2. Application Repository Setup

Run the setup script:

```bash
node scripts/setup-copilot-verification.mjs
```

This will:
- Install Husky as a dev dependency
- Create necessary directories
- Set up pre-commit hooks
- Make scripts executable

### 3. Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Install Husky
npm install --save-dev husky@9
npm pkg set scripts.prepare="husky install"
npm run prepare

# Create pre-commit hook
npx husky add .husky/pre-commit "node scripts/captureCopilotSuggestions.mjs && git add .copilot/suggestions.json"

# Make scripts executable
chmod +x scripts/captureCopilotSuggestions.mjs
chmod +x scripts/verifyCopilotDiff.mjs
```

### 4. Update Workflow References

Edit `.github/workflows/copilot-verify.yml` and replace `your-org/ledger-core` with your actual Core repository path.

### 5. Configure GitHub Secrets/Variables

Set up the following in your repository settings:

**Variables:**
- `LEDGER_BASE_URL` - Your Civic Ledger API base URL (e.g., `https://ledger.example.com`)

**Secrets:**
- `LEDGER_ADMIN_TOKEN` - Bearer token for ledger operations

## How It Works

### 1. Pre-commit Hook
When you commit code, the Husky pre-commit hook:
- Captures AI suggestions from `.cursor/copilot.json` (if available)
- Falls back to using staged diff as a pseudo-suggestion
- Saves suggestions to `.copilot/suggestions.json`

### 2. GitHub Actions Workflow
On pull requests or pushes to main:
- Checks out the code
- Loads suggestions from `.copilot/suggestions.json`
- Compares suggestions against actual git diff
- Computes overlap score using word-based matching
- Optionally seals proof to Civic Ledger
- Uploads proof as workflow artifact

### 3. Verification Logic
The verification script:
- Normalizes text by removing punctuation and standardizing whitespace
- Compares suggestion words against diff words
- Calculates overlap percentage per suggestion
- Averages scores across all suggestions
- Generates detailed match information

## Configuration

### Workflow Parameters

In `.github/workflows/copilot-verify.yml`:

```yaml
with:
  min_score: "0.35"     # Minimum overlap score (0.0-1.0)
  fail_on_low: "false"  # Whether to fail workflow if below threshold
```

### Policy File

Optional `policies/copilot-verify.json`:

```json
{
  "min_score": 0.35,
  "fail_on_low": false,
  "enforce_on": ["main", "release/*"]
}
```

## Output

### Proof File
The workflow generates `.copilot/proof.json` containing:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "baseRef": "HEAD~1",
  "headRef": "HEAD",
  "diffHash": "sha256-hash-of-diff",
  "suggestionsCount": 5,
  "overlap": {
    "score": 0.75,
    "matches": [...],
    "details": "Compared 5 suggestions against diff"
  },
  "decision": "conforms",
  "threshold": 0.35,
  "repository": "owner/repo",
  "commit": "abc123",
  "workflow": "copilot-verify",
  "runId": "123456",
  "ledgerId": "optional-ledger-id"
}
```

### Workflow Artifacts
- `copilot-proof` - Contains the proof.json file for download

## Troubleshooting

### Common Issues

1. **No suggestions captured**
   - Ensure `.cursor/copilot.json` exists and has valid format
   - Check that pre-commit hook is running
   - Verify `.copilot/suggestions.json` is being created

2. **Workflow fails to find suggestions**
   - Ensure `.copilot/suggestions.json` exists
   - Check file permissions
   - Verify the file is committed to the repository

3. **Low overlap scores**
   - Review the match details in the proof file
   - Consider adjusting the `min_score` threshold
   - Check if suggestions are being captured correctly

4. **Ledger sealing fails**
   - Verify `LEDGER_BASE_URL` and `LEDGER_ADMIN_TOKEN` are set
   - Check network connectivity
   - Review ledger API logs

### Debug Mode

Set environment variables for more verbose output:

```bash
DEBUG=1 node scripts/verifyCopilotDiff.mjs
```

## Customization

### Adding New Suggestion Sources

Edit `scripts/captureCopilotSuggestions.mjs` to add support for other AI tools:

```javascript
// Add support for GitHub Copilot
if (fs.existsSync(".github/copilot-suggestions.json")) {
  const data = JSON.parse(fs.readFileSync(".github/copilot-suggestions.json", "utf8"));
  suggestions = data.suggestions || [];
}
```

### Custom Scoring Algorithm

Modify the `computeOverlap` function in `scripts/verifyCopilotDiff.mjs` to implement different scoring methods:

- Semantic similarity using embeddings
- AST-based code structure comparison
- Line-by-line diff analysis
- Custom business logic

### Integration with Other Tools

The proof file can be consumed by:
- PR comment bots
- Security scanners
- Compliance tools
- Custom dashboards

## Security Considerations

- **Token Security**: Store `LEDGER_ADMIN_TOKEN` as a GitHub secret
- **Proof Integrity**: Proofs are cryptographically hashed
- **Access Control**: Limit ledger access to authorized users
- **Audit Trail**: All verifications are logged with timestamps

## Contributing

To contribute to this system:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the verification workflow
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.