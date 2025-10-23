<# 
.SYNOPSIS
  End-to-end test for your Render-hosted Ledger API (seed → sweep → seal → verify).

.PARAMETER Env
  "prod" or "dev" (optional). Uses the corresponding base URL + key.

.EXAMPLE
  .\Test-LedgerApi.ps1 -Env prod
#>

param(
  [ValidateSet('prod','dev')]
  [string]$Env = 'prod',
  [string]$Date = (Get-Date -Format 'yyyy-MM-dd'),
  [string]$Time = (Get-Date -Format 'HH:mm:ss')
)

# ========= CONFIG =========
$Config = @{
  prod = @{
    API_URL = "https://reflections.onrender.com"
    API_KEY = "<your_api_key>"
  }
  dev  = @{
    API_URL = "http://127.0.0.1:8000"
    API_KEY = "<your_local_api_key>"
  }
}
# =========================

$API_URL = $Config[$Env].API_URL
$API_KEY = $Config[$Env].API_KEY
$Headers = @{ "x-api-key" = $API_KEY; "Content-Type" = "application/json" }

Write-Host "==============================" -ForegroundColor Cyan
Write-Host " Ledger API Test ($Env)" -ForegroundColor Cyan
Write-Host " Base URL: $API_URL" -ForegroundColor Cyan
Write-Host " Date/Time: $Date $Time" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

function Show-Json($obj) {
  $obj | ConvertTo-Json -Depth 8
}

function Get-Health {
  Write-Host "`n[1] Health..." -ForegroundColor Yellow
  try {
    $res = Invoke-RestMethod -Method GET -Uri "$API_URL/health"
    Show-Json $res
  } catch { Write-Error $_ }
}

function Post-Seed {
  Write-Host "`n[2] Seed..." -ForegroundColor Yellow
  $body = @{
    date = $Date
    time = $Time
    intent = "Render smoke test"
    meta = @{ origin = "ps1" }
  } | ConvertTo-Json
  try {
    $res = Invoke-RestMethod -Method POST -Uri "$API_URL/seed" -Headers $Headers -Body $body
    Show-Json $res
  } catch { Write-Error $_ }
}

function Post-Sweep {
  Write-Host "`n[3] Sweep..." -ForegroundColor Yellow
  $body = @{
    date    = $Date
    chamber = "Lab4"
    note    = "first sweep from PowerShell"
    meta    = @{
      gic_intent  = "private"   # switch to "publish" to test +25 tier
      content_hash = "ps1-demo-hash"
      ui = "ps1"
    }
  } | ConvertTo-Json
  try {
    $res = Invoke-RestMethod -Method POST -Uri "$API_URL/sweep" -Headers $Headers -Body $body
    Show-Json $res
  } catch { Write-Error $_ }
}

function Post-Seal {
  Write-Host "`n[4] Seal..." -ForegroundColor Yellow
  $body = @{
    date = $Date
    wins = "API live via PS1"
    blocks = "none"
    tomorrow_intent = "reflections"
    meta = @{ origin = "ps1" }
  } | ConvertTo-Json
  try {
    $res = Invoke-RestMethod -Method POST -Uri "$API_URL/seal" -Headers $Headers -Body $body
    Show-Json $res
  } catch { Write-Error $_ }
}

function Get-Verify {
  Write-Host "`n[5] Verify..." -ForegroundColor Yellow
  try {
    $res = Invoke-RestMethod -Method GET -Uri "$API_URL/verify/$Date" -Headers @{ "x-api-key" = $API_KEY }
    Show-Json $res

    if ($res.counts) {
      $sweeps = $res.counts.sweeps
      $gicSum = $res.gic.sum
      Write-Host "`nSummary: sweeps=$sweeps, GIC today=$gicSum" -ForegroundColor Green
    }
  } catch { Write-Error $_ }
}

# Run the sequence
Get-Health
Post-Seed
Post-Sweep
Post-Seal
Get-Verify

Write-Host "`nDone." -ForegroundColor Cyan
