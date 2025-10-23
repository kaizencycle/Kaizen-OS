# Setup git remote for lab4-proof
# Run this script to configure your GitHub repository connection

param(
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl
)

Write-Host "🔧 Git Remote Setup for lab4-proof" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check current remotes
$currentRemotes = git remote -v
if ($currentRemotes) {
    Write-Host "`n📍 Current remotes:" -ForegroundColor Yellow
    Write-Host $currentRemotes
    
    $overwrite = Read-Host "`nRemote already exists. Overwrite? (y/n)"
    if ($overwrite -ne 'y') {
        Write-Host "❌ Aborted" -ForegroundColor Red
        exit 0
    }
    git remote remove origin
}

# Get repository URL if not provided
if (-not $RepoUrl) {
    Write-Host "`n📝 Enter your GitHub repository URL:" -ForegroundColor Yellow
    Write-Host "Examples:" -ForegroundColor Gray
    Write-Host "  - https://github.com/username/lab4-proof.git" -ForegroundColor Gray
    Write-Host "  - git@github.com:username/lab4-proof.git" -ForegroundColor Gray
    $RepoUrl = Read-Host "`nRepository URL"
}

if (-not $RepoUrl) {
    Write-Host "❌ No repository URL provided" -ForegroundColor Red
    exit 1
}

# Add remote
Write-Host "`n🔗 Adding remote 'origin'..." -ForegroundColor Yellow
git remote add origin $RepoUrl

# Verify
$newRemotes = git remote -v
Write-Host "`n✅ Remote configured successfully!" -ForegroundColor Green
Write-Host $newRemotes

Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: .\auto-commit-push.ps1" -ForegroundColor White
Write-Host "  2. Your changes will be pushed to the repository" -ForegroundColor White
