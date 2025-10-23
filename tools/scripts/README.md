# Auto-Commit System

This directory contains scripts for automated commit message generation and auto-commit functionality.

## Files

- `detect-scope.sh` - Detects Conventional Commit scope from file paths
- `generate-commit-msg.sh` - Generates commit messages using Ollama
- `autocommit.ps1` - Windows PowerShell auto-commit watcher
- `start-autocommit.bat` - Windows batch file to start auto-commit
- `redaction-scan.sh` - Scans for forbidden terms in the codebase

## Setup

1. **Install Ollama** and ensure it's running with a model (e.g., `llama3`)
2. **Configure git hooks**: `git config core.hooksPath .githooks`
3. **Set up scope mapping**: Edit `~/.config/kaizen/scope-map.regex` for your repo structure

## Usage

### Manual Commits
Just run `git commit` - the `prepare-commit-msg` hook will auto-generate a message using Ollama.

### Auto-Commit (Windows)
```cmd
scripts\start-autocommit.bat
```

### Auto-Commit (PowerShell)
```powershell
pwsh scripts/autocommit.ps1
```

### Scope Detection
The system automatically detects scopes based on file paths:
- `civic-protocol-core/ledger/` → `ledger`
- `civic-protocol-core/gic-indexer/` → `gic-indexer`
- `.github/` → `ci`
- `docs/` → `docs`

## Configuration

### Global Scope Map
Edit `~/.config/kaizen/scope-map.regex` to add/modify scope rules:

```
^civic-protocol-core/ledger/ => ledger ; weight=90
^civic-protocol-core/gic-indexer/ => gic-indexer ; weight=90
```

### Per-Repo Override
Create `.commit-scope.map.regex` in your repo root for local overrides.

## Security

The system includes redaction checks to prevent sensitive terms from being committed. See `.redaction/` directory for configuration.
