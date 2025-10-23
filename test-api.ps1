<#  test-api.ps1
    Smoke-test the HIVE-PAW API (with ledger)
    Usage:
      .\test-api.ps1                      # uses today
      .\test-api.ps1 -Date 2025-09-18     # specific day
      .\test-api.ps1 -Sweeps 5            # run more sweeps
      .\test-api.ps1 -Base http://localhost:8000
#>

param(
  [string]$Base   = "http://127.0.0.1:8000",
  [string]$Date   = (Get-Date -Format 'yyyy-MM-dd'),
  [int]   $Sweeps = 2
)

$ErrorActionPreference = "Stop"

function Write-Title($t){ Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Write-OK($t){ Write-Host $t -ForegroundColor Green }
function Write-ERR($t){ Write-Host $t -ForegroundColor Red }

function Call-API {
  param([string]$Method,[string]$Path,[hashtable]$Body)
  $uri = "$Base$Path"
  try {
    if ($Method -eq 'GET') {
      return Invoke-RestMethod -Uri $uri -Method GET
    } else {
      $json = ($Body | ConvertTo-Json -Depth 10)
      return Invoke-RestMethod -Uri $uri -Method $Method -ContentType "application/json" -Body $json
    }
  } catch {
    Write-ERR "API $Method $Path failed"
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
      Write-Host ($_.ErrorDetails.Message) -ForegroundColor DarkRed
    } else {
      Write-Host $_ -ForegroundColor DarkRed
    }
    throw
  }
}

Write-Title "Routes"
$routes = Call-API GET "/routes"
Write-OK ("Routes: {0} endpoints" -f $routes.count)

Write-Title "POST /seed"
$seed = Call-API POST "/seed" @{
  date   = $Date
  time   = "12:45:00"
  intent = "iterate"
  meta   = @{}
}
Write-OK ("Seed OK -> {0}" -f ($seed.file))

Write-Title "POST /sweep  x$Sweeps"
for ($i=1; $i -le $Sweeps; $i++) {
  $s = Call-API POST "/sweep" @{
    date    = $Date
    chamber = "LAB4"
    note    = "sweep $i"
    meta    = @{}
  }
  Write-OK ("Sweep $i -> {0}" -f ($s.file))
}

Write-Title "POST /seal (also builds/writes ledger)"
$seal = Call-API POST "/seal" @{
  date            = $Date
  wins            = "seed+sweep working"
  blocks          = "none"
  tomorrow_intent = "polish"
  meta            = @{}
}
Write-OK ("Seal OK -> seal:{0}  ledger:{1}" -f $seal.seal_file, $seal.ledger_file)

Write-Title "GET /ledger/{date}"
$ledger = Call-API GET "/ledger/$Date"
Write-Host ("day_root: {0}" -f $ledger.day_root)
Write-Host ("counts : seeds={0} sweeps={1} seals={2}" -f $ledger.counts.seeds,$ledger.counts.sweeps,$ledger.counts.seals)

Write-Title "GET /verify/{date}"
$verify = Call-API GET "/verify/$Date"
if ($verify.ok -eq $true) {
  Write-OK ("Verify OK  expected==computed=={0}" -f $verify.expected)
} else {
  Write-ERR "Verify reported mismatch"
  $verify | ConvertTo-Json -Depth 10
}

Write-Title "GET /export/{date} -> save to file"
$export = Call-API GET "/export/$Date"
$outFile = "export_$Date.json"
$export | ConvertTo-Json -Depth 10 | Out-File -FilePath $outFile -Encoding utf8
Write-OK ("Wrote {0}  (size {1} bytes)" -f $outFile, (Get-Item $outFile).Length)

Write-Title "DONE"