# Auto-commit and push script for lab4-proof
# This script automatically commits all changes and pushes to the main repository

param(
    [string]$Message = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "🔄 Starting auto-commit process..." -ForegroundColor Cyan

# Check if there are changes to commit
$status = git status --porcelain
if (-not $status) {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
    exit 0
}

# Add all changes
Write-Host "📝 Adding all changes..." -ForegroundColor Yellow
git add -A

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $Message

# Check if remote exists
$remotes = git remote
if (-not $remotes) {
    Write-Host "⚠️  No remote repository configured!" -ForegroundColor Red
    Write-Host "Please run: git remote add origin <your-repo-url>" -ForegroundColor Yellow
    exit 1
}

# Push to main branch
Write-Host "🚀 Pushing to remote repository..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Successfully pushed to remote!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push. Trying with --set-upstream..." -ForegroundColor Red
    git push --set-upstream origin main
}

Write-Host "✨ Auto-commit complete!" -ForegroundColor Green
