# Auto-Commit System

This directory contains scripts for automated commit message generation and file watching.

## Files

- `redaction-scan.sh` - Scans for forbidden terms (DVA, Echo, etc.)
- `redaction-scan.ps1` - PowerShell version of redaction scan
- `detect-scope.sh` - Detects Conventional Commit scope from file paths
- `generate-commit-msg.sh` - Generates commit messages using Ollama
- `autocommit.ps1` - Windows PowerShell file watcher for auto-commit
- `test-commit-msg.ps1` - Test script to verify system functionality

## Setup

1. **Install Ollama** and ensure it's running with a model like `llama3`
2. **Configure git hooks**: `git config core.hooksPath .githooks`
3. **Test the system**: `powershell -ExecutionPolicy Bypass -File scripts/test-commit-msg.ps1`

## Usage

### Manual Commits
```bash
git add .
git commit  # Message will be auto-generated
```

### Auto-Commit Mode
```powershell
# Start auto-commit watcher
powershell -ExecutionPolicy Bypass -File scripts/autocommit.ps1
```

### Redaction Check
```powershell
# Check for forbidden terms
powershell -ExecutionPolicy Bypass -File scripts/redaction-scan.ps1
```

## Configuration

- **Scope mapping**: Edit `~/.config/kaizen/scope-map.regex` for global scope rules
- **Forbidden terms**: Edit `.redaction/forbidden.regex` to add/remove blocked terms
- **Allowed terms**: Edit `.redaction/allowlist.regex` for exceptions

## Troubleshooting

- Ensure Ollama is running: `ollama list`
- Check git hooks: `git config core.hooksPath`
- Test individual components with the test script

