<#  HIVE-PAW daily cycle + PGP backup (autostart + sealed-guard + retries + Slack)
    - Starts uvicorn if needed, waits for /health (retries)
    - Skips seed/seal if API shows seals>=1 for today
    - Signs + encrypts copies into backups\YYYY-MM-DD\
    - Slack digest on success/failure (uses $env:SLACK_WEBHOOK_URL if set)
#>

param(
  [string]$SlackWebhookUrl = $env:SLACK_WEBHOOK_URL
)

$ErrorActionPreference = 'Stop'

# ===== CONFIG =====
$ApiUrl        = "http://127.0.0.1:8000"
$RepoRoot      = "C:\Users\mikej\Desktop\lab4-proof"
$DataDir       = Join-Path $RepoRoot "data"
$BackupsRoot   = Join-Path $RepoRoot "backups"

# Uvicorn binary (adjust if needed)
$UvicornCmd    = "uvicorn"   # or full path: C:\Users\mikej\.venv\Scripts\uvicorn.exe
$UvicornArgs   = "app.main:app --host 127.0.0.1 --port 8000"

# PGP config
$Gpg           = "gpg"  # or full path: C:\Program Files (x86)\GnuPG\bin\gpg.exe
$PgpRecipient  = "kaizencycle@proton.me"
$PgpSigner     = "E1C44837061058D00900F5D1AFC7A22DC7BEE445"  # fingerprint

# Today
$Today         = (Get-Date).ToString("yyyy-MM-dd")
$Stamp         = (Get-Date).ToString("yyyyMMdd_HHmmss")
$DayDir        = Join-Path $BackupsRoot $Today

# ===== HELPERS =====
function Ensure-Dir([string]$p){ if(-not (Test-Path $p)){ New-Item -ItemType Directory -Force -Path $p | Out-Null } }

function Notify-Slack([string]$text) {
  if (-not $SlackWebhookUrl) { return }
  try {
    $payload = @{ text = $text } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri $SlackWebhookUrl -Method Post -ContentType 'application/json' -Body $payload | Out-Null
  } catch { }
}

function Invoke-Json {
  param([string]$Method, [string]$Url, [hashtable]$Body, [int]$Retries = 5, [int]$DelayMs = 600)
  for($i=1;$i -le $Retries;$i++){
    try {
      if ($Body) {
        return Invoke-RestMethod -Method $Method -Uri $Url -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 8)
      } else {
        return Invoke-RestMethod -Method $Method -Uri $Url -Headers @{accept="application/json"}
      }
    } catch {
      if ($i -eq $Retries) { throw }
      Start-Sleep -Milliseconds $DelayMs
    }
  }
}

function Port-Open([int]$port){ return (Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue).TcpTestSucceeded }

# Keep process handle if we start uvicorn
$UvicornProc = $null
function Start-Uvicorn {
  if (Port-Open 8000) { return $false }  # already running
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName  = $UvicornCmd
  $psi.Arguments = $UvicornArgs
  $psi.WorkingDirectory = $RepoRoot
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true
  $UvicornProc = [System.Diagnostics.Process]::Start($psi)

  # Wait for /health
  $ok = $false
  for($i=1;$i -le 40;$i++){
    Start-Sleep -Milliseconds 500
    try {
      $h = Invoke-Json GET "$ApiUrl/health" $null 1
      if ($h.ok){ $ok=$true; break }
    } catch { }
  }
  if (-not $ok){ throw "uvicorn failed to become healthy at $ApiUrl/health" }
  return $true
}

function Stop-Uvicorn-IfStarted {
  if ($UvicornProc -and -not $UvicornProc.HasExited) {
    try {
      $UvicornProc.Kill()
      $UvicornProc.WaitForExit(5000) | Out-Null
    } catch { }
  }
}

function Sign-File([string]$Path){
  if (-not (Test-Path $Path)) { throw "Sign-File: missing $Path" }
  & $Gpg --yes --armor --detach-sign --local-user $PgpSigner --output ($Path + ".asc") $Path
}
function Encrypt-File([string]$Path){
  if (-not (Test-Path $Path)) { throw "Encrypt-File: missing $Path" }
  & $Gpg --yes --trust-model always --recipient $PgpRecipient --output ($Path + ".gpg") --encrypt $Path
}

# ===== RUN =====
$start = Get-Date
Ensure-Dir $BackupsRoot
Ensure-Dir $DayDir
Ensure-Dir $DataDir

$startedHere = $false
$exitCode = 0
$summaryLines = @()

try {
  # 0) Ensure API is up (autostart if needed)
  $startedHere = Start-Uvicorn

  # 1) Guard by API: if seals>=1, skip seed/seal
  $export = Invoke-Json GET "$ApiUrl/export/$Today" $null
  $sealsCount = 0
  if ($export -and $export.files -and $export.files."$Today.seal.json") { $sealsCount = 1 }
  $skipHeavy = ($sealsCount -ge 1)
  $summaryLines += "Guard: seals=$sealsCount → " + ($(if($skipHeavy){'skip seed/seal'} else {'run seed/seal'}))

  if (-not $skipHeavy) {
    # 2) health (retry handled in helper)
    $h = Invoke-Json GET "$ApiUrl/health" $null
    $summaryLines += "Health: ok=$($h.ok)"

    # 3) seed
    $seedBody = @{ date=$Today; time="09:07:00"; intent="iterate"; meta=@{} }
    $seed = Invoke-Json POST "$ApiUrl/seed" $seedBody
    $summaryLines += "Seed: file=$($seed.file)"

    # 4) (optional) sweep(s) — add if needed
    # $sweep = Invoke-Json POST "$ApiUrl/sweep" @{ chamber="LAB4"; note="auto sweep"; meta=@{} }
    # $summaryLines += "Sweep: ok"

    # 5) seal
    $sealBody = @{ date=$Today; wins="seed+sweep working"; blocks="none"; tomorrow_intent="polish"; meta=@{} }
    $seal = Invoke-Json POST "$ApiUrl/seal" $sealBody
    $summaryLines += "Seal: file=$($seal.file)"
  }

  # 6) verify (always)
  $verify = Invoke-Json GET "$ApiUrl/verify/$Today" $null
  $summaryLines += "Verify: ok=$($verify.ok) sweeps=$($verify.counts.sweeps) hash=$($verify.expected)"

  # 7) copy + sign + encrypt
  $TodayFiles = @(
    Join-Path $DataDir "$Today.seed.json",
    Join-Path $DataDir "$Today.echo.json",
    Join-Path $DataDir "$Today.seal.json",
    Join-Path $DataDir "$Today.ledger.json"
  ) | Where-Object { Test-Path $_ }

  foreach ($f in $TodayFiles) {
    $copy = Join-Path $DayDir (Split-Path $f -Leaf)
    Copy-Item $f $copy -Force
    Sign-File    $copy
    Encrypt-File $copy
  }
  $summaryLines += "Artifacts: $($TodayFiles.Count) files copied/signed/encrypted"

  # 8) zip snapshot
  $ZipPath = Join-Path $BackupsRoot ("export_" + $Today + "_" + $Stamp + ".zip")
  if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
  Compress-Archive -Path (Join-Path $DayDir "*") -DestinationPath $ZipPath
  $summaryLines += "Zip: $ZipPath"

} catch {
  $exitCode = 1
  $summaryLines += "ERROR: $($_.Exception.Message)"
} finally {
  # Auto-stop uvicorn only if we started it
  Stop-Uvicorn-IfStarted

  # Slack digest
  $dur = [int]((Get-Date) - $start).TotalSeconds
  $status = ($(if($exitCode -eq 0){":white_check_mark: SUCCESS"} else {":rotating_light: FAILURE"}))
  $body = "$status *Daily Cycle* for `$Today` ($dur s)`n" + ($summaryLines -join "`n")
  Notify-Slack $body

  if ($exitCode -ne 0) { exit $exitCode }
}