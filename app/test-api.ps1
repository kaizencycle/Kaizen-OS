Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\test-api.ps1
# =========================
# HIVE-PAW quick test runner
# =========================
# Runs: /health → /routes → /seed → /sweep x2 → /seal → /ledger/{date} → /verify/{date} → /export/{date}
# Edit BASE if you’re using a different port.
$BASE = "http://127.0.0.1:8000"

# Use today; change if you want to test another day.
$DATE = (Get-Date -Format "yyyy-MM-dd")

function Step($name, $scriptBlock) {
  Write-Host "`n=== $name ===" -ForegroundColor Cyan
  try {
    $res = & $scriptBlock
    if ($null -eq $res) { throw "No response" }
    $json = $res | ConvertTo-Json -Depth 20
    Write-Host $json -ForegroundColor Gray
    return $res
  } catch {
    Write-Host ("[FAIL] " + $_) -ForegroundColor Red
    throw
  }
}

# 1) Health
Step "GET /health" { Invoke-RestMethod -Uri "$BASE/health" -Method GET }

# 2) Routes (nice sanity check)
Step "GET /routes" { Invoke-RestMethod -Uri "$BASE/routes" -Method GET }

# 3) Seed (morning open)
$seedBody = @{
  date   = $DATE
  time   = (Get-Date -Format "HH:mm:ss")
  intent = "scripted-seed"
} | ConvertTo-Json
Step "POST /seed" {
  Invoke-RestMethod -Uri "$BASE/seed" -Method POST -ContentType "application/json" -Body $seedBody
}

# 4) Sweep #1
$sweep1 = @{
  chamber = "Lab4"
  note    = "first sweep via ps1"
} | ConvertTo-Json
Step "POST /sweep (1)" {
  Invoke-RestMethod -Uri "$BASE/sweep" -Method POST -ContentType "application/json" -Body $sweep1
}

# 5) Sweep #2 (optional)
$sweep2 = @{
  chamber = "Lab4"
  note    = "second sweep via ps1"
  meta    = @{ tag = "check" }
} | ConvertTo-Json
Step "POST /sweep (2)" {
  Invoke-RestMethod -Uri "$BASE/sweep" -Method POST -ContentType "application/json" -Body $sweep2
}

# 6) Seal (close out)
$sealBody = @{
  date            = $DATE
  wins            = "seed+sweeps ok"
  blocks          = "none"
  tomorrow_intent = "iterate"
} | ConvertTo-Json
Step "POST /seal" {
  Invoke-RestMethod -Uri "$BASE/seal" -Method POST -ContentType "application/json" -Body $sealBody
}

# 7) Read ledger for the day
$ledger = Step "GET /ledger/{date}" {
  Invoke-RestMethod -Uri "$BASE/ledger/$DATE" -Method GET
}

# 8) Verify integrity (if your API exposes /verify/{date})
try {
  Step "GET /verify/{date}" {
    Invoke-RestMethod -Uri "$BASE/verify/$DATE" -Method GET
  }
} catch {
  Write-Host "[WARN] /verify/{date} not available or failed; continuing." -ForegroundColor Yellow
}

# 9) Export the day bundle (if your API exposes /export/{date})
$exportPath = Join-Path -Path (Get-Location) -ChildPath ("export-" + $DATE + ".zip")
try {
  $bin = Invoke-WebRequest -Uri "$BASE/export/$DATE" -Method GET
  if ($bin.ContentLength -gt 0 -and $bin.RawContentStream) {
    $fs = [System.IO.File]::Open($exportPath, [System.IO.FileMode]::Create)
    $bin.RawContentStream.CopyTo($fs)
    $fs.Close()
    Write-Host ("Saved export → " + $exportPath) -ForegroundColor Green
  } else {
    Write-Host "[WARN] /export/{date} returned no file; skipping save." -ForegroundColor Yellow
  }
} catch {
  Write-Host "[WARN] /export/{date} not available; skipping." -ForegroundColor Yellow
}

Write-Host "`nAll steps complete ✅" -ForegroundColor Green
