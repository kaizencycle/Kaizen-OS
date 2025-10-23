# PowerShell auto-commit watcher for Windows
# Requires: Ollama installed; run from repo root in PowerShell

param(
    [string]$Branch = (git rev-parse --abbrev-ref HEAD).Trim(),
    [int]$DelayMs = 300
)

Write-Host "🔁 Auto-commit running on branch: $Branch (Ctrl+C to stop)"
Write-Host "   Watching for changes with ${DelayMs}ms delay..."

$fsw = New-Object IO.FileSystemWatcher "."
$fsw.IncludeSubdirectories = $true
$fsw.EnableRaisingEvents = $true
$fsw.Filter = "*.*"

# Exclude .git directory
$fsw.NotifyFilter = [IO.NotifyFilters]::LastWrite -bor [IO.NotifyFilters]::FileName -bor [IO.NotifyFilters]::DirectoryName

Register-ObjectEvent $fsw Changed -SourceIdentifier FileChanged -Action {
    Start-Sleep -Milliseconds $DelayMs
    
    # Stage changes
    git add -A | Out-Null
    if ($LASTEXITCODE -ne 0) { return }

    # Skip if nothing staged
    git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) { return }

    # Generate message via Ollama
    try {
        $msg = bash -lc "scripts/generate-commit-msg.sh" 2>$null
        if ([string]::IsNullOrWhiteSpace($msg)) { 
            $msg = "chore: update" 
        }
        
        # Commit & push
        git commit -m "$msg" | Out-Null
        if ($LASTEXITCODE -eq 0) {
            git push origin $Branch | Out-Null
            Write-Host "📝 $msg" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "✅ File watcher started. Press Ctrl+C to stop."
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Unregister-Event -SourceIdentifier FileChanged
    $fsw.Dispose()
    Write-Host "🛑 Auto-commit stopped." -ForegroundColor Yellow
}
