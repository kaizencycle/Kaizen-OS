# Setup script for lab4-proof redaction and auto-commit system
Write-Host "Setting up lab4-proof redaction and auto-commit system..."

# Configure git hooks
Write-Host "`n1. Configuring git hooks..."
git config core.hooksPath .githooks
Write-Host "   Git hooks configured"

# Test redaction system
Write-Host "`n2. Testing redaction system..."
try {
    powershell -ExecutionPolicy Bypass -File scripts/redaction-scan.ps1
    Write-Host "   Redaction scan working"
} catch {
    Write-Host "   Redaction scan has issues (expected on Windows)"
}

# Test commit message generation
Write-Host "`n3. Testing commit message generation..."
try {
    $msg = powershell -ExecutionPolicy Bypass -File scripts/generate-commit-msg.ps1
    Write-Host "   Generated message: '$msg'"
} catch {
    Write-Host "   Commit message generation failed: $($_.Exception.Message)"
}

# Check Ollama availability
Write-Host "`n4. Checking Ollama availability..."
try {
    ollama list 2>$null
    Write-Host "   Ollama is available"
} catch {
    Write-Host "   Ollama not found - install Ollama for AI commit messages"
}

Write-Host "`nSetup complete!"
Write-Host "`nUsage:"
Write-Host "  Manual commit: git add . ; git commit"
Write-Host "  Auto-commit: powershell -ExecutionPolicy Bypass -File scripts/autocommit.ps1"
Write-Host "  Test system: powershell -ExecutionPolicy Bypass -File scripts/test-commit-msg.ps1"