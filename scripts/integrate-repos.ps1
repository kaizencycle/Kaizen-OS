# Civic OS Repository Integration Script (PowerShell)
# This script integrates all kaizencycle repositories into the Civic OS monorepo

Write-Host "🚀 Starting Civic OS Repository Integration..." -ForegroundColor Green

# Function to add repository as subtree
function Add-RepoAsSubtree {
    param(
        [string]$RepoName,
        [string]$RepoUrl,
        [string]$TargetPath,
        [string]$Branch = "main"
    )
    
    Write-Host "📦 Adding $RepoName to $TargetPath..." -ForegroundColor Yellow
    
    try {
        # Add remote (ignore if already exists)
        git remote add $RepoName $RepoUrl 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Remote $RepoName already exists, continuing..." -ForegroundColor Blue
        }
        
        # Fetch repository
        git fetch $RepoName
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to fetch $RepoName"
        }
        
        # Add as subtree
        git subtree add --prefix=$TargetPath $RepoName $Branch --squash
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to add subtree for $RepoName"
        }
        
        Write-Host "✅ Successfully added $RepoName" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error adding $RepoName : $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# Create labs directory if it doesn't exist
if (!(Test-Path "labs")) {
    New-Item -ItemType Directory -Path "labs" | Out-Null
    Write-Host "📁 Created labs directory" -ForegroundColor Blue
}

Write-Host "🔬 Integrating Lab Repositories..." -ForegroundColor Cyan

# Lab Repositories
Add-RepoAsSubtree "lab4-proof" "https://github.com/kaizencycle/lab4-proof.git" "labs/lab4-proof"
Add-RepoAsSubtree "lab6-proof" "https://github.com/kaizencycle/lab6-proof.git" "labs/lab6-proof"
Add-RepoAsSubtree "lab7-proof" "https://github.com/kaizencycle/lab7-proof.git" "labs/lab7-proof"

Write-Host "📚 Integrating Core Packages..." -ForegroundColor Cyan

# Core Packages
Add-RepoAsSubtree "civic-protocol-core" "https://github.com/kaizencycle/Civic-Protocol-Core.git" "packages/civic-protocol-core"
Add-RepoAsSubtree "oaa-api-library" "https://github.com/kaizencycle/OAA-API-Library.git" "packages/oaa-api-library"
Add-RepoAsSubtree "civic-ai-specs" "https://github.com/kaizencycle/civic-ai-specs.git" "packages/civic-ai-specs"

Write-Host "🎉 Repository integration completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of integrated repositories:" -ForegroundColor White
Write-Host "  - labs/lab4-proof (from lab4-proof)" -ForegroundColor Gray
Write-Host "  - labs/lab6-proof (from lab6-proof)" -ForegroundColor Gray
Write-Host "  - labs/lab7-proof (from lab7-proof)" -ForegroundColor Gray
Write-Host "  - packages/civic-protocol-core (from Civic-Protocol-Core)" -ForegroundColor Gray
Write-Host "  - packages/oaa-api-library (from OAA-API-Library)" -ForegroundColor Gray
Write-Host "  - packages/civic-ai-specs (from civic-ai-specs)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Update package.json workspaces" -ForegroundColor Gray
Write-Host "  2. Update turbo.json configuration" -ForegroundColor Gray
Write-Host "  3. Update README.md" -ForegroundColor Gray
Write-Host "  4. Test all integrated components" -ForegroundColor Gray