# Auto-commit watcher for Windows PowerShell
# Requires: Ollama installed; run from repo root in PowerShell

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "🔁 Auto-commit running on branch: $branch (Ctrl+C to stop)"

$fsw = New-Object IO.FileSystemWatcher "."
$fsw.IncludeSubdirectories = $true
$fsw.EnableRaisingEvents = $true
$fsw.Filter = "*.*"

Register-ObjectEvent $fsw Changed -SourceIdentifier FileChanged -Action {
  Start-Sleep -Milliseconds 300
  git add -A | Out-Null
  if ($LASTEXITCODE -ne 0) { return }

  # Skip if nothing staged
  git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) { return }

  # Generate message via Ollama (using Git Bash or WSL)
  $msg = bash -lc "scripts/generate-commit-msg.sh" 2>$null
  if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "chore: update" }

  git commit -m "$msg" | Out-Null
  git push origin $branch | Out-Null
  Write-Host "📝 $msg"
}

while ($true) { Start-Sleep -Seconds 1 }
