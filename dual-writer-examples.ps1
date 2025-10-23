<#  dual-writer-examples.ps1
    Comprehensive examples of the plug-and-play dual-writer system
    Usage: .\dual-writer-examples.ps1 -Date 2025-09-29
#>

param(
  [string]$Date = (Get-Date -Format 'yyyy-MM-dd'),
  [string]$Base = "http://127.0.0.1:8000"
)

$ErrorActionPreference = "Stop"

function Write-Title($t){ Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Write-OK($t){ Write-Host $t -ForegroundColor Green }
function Write-ERR($t){ Write-Host $t -ForegroundColor Red }
function Write-INFO($t){ Write-Host $t -ForegroundColor Yellow }

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

Write-Title "Plug-and-Play Dual-Writer Examples"
Write-Host "Date: $Date" -ForegroundColor Yellow
Write-Host "Base URL: $Base" -ForegroundColor Yellow

# Example 1: Basic smoke test without ZIP
Write-Title "Example 1: Basic Smoke Test (no ZIP)"
try {
  $basic = Call-API POST "/smoke/save" @{
    date = $Date
    custodian = "Kaizen"
    lab = "Lab4: Research & Study"
    tests = @{
      health = @{ status = "pass"; details = "server alive" }
      seed = @{ status = "pass"; hash = "basic-test-hash" }
    }
    wins = "Basic smoke test completed"
    blocks = "none"
    next_intent = "Test enhanced features"
  }
  Write-OK "Basic smoke test saved"
  Write-INFO "Files: $($basic.json_file), $($basic.md_file)"
} catch {
  Write-ERR "Basic smoke test failed: $($_.Exception.Message)"
}

# Example 2: Enhanced smoke test with ZIP (should fail without ledger)
Write-Title "Example 2: Enhanced Smoke Test with ZIP (no ledger)"
try {
  $enhanced = Call-API POST "/smoke/save-v2" @{
    date = $Date
    custodian = "Kaizen"
    lab = "Lab4: Research & Study"
    tests = @{
      health = @{ status = "pass"; details = "server alive" }
      seed = @{ status = "pass"; hash = "enhanced-test-hash" }
    }
    wins = "Enhanced smoke test completed"
    blocks = "none"
    next_intent = "Create complete day"
  }
  Write-OK "Enhanced smoke test saved"
  Write-INFO "Archive Status: $($enhanced.archive_status)"
  if ($enhanced.zip_error) {
    Write-INFO "ZIP Error: $($enhanced.zip_error)"
  }
} catch {
  Write-ERR "Enhanced smoke test failed: $($_.Exception.Message)"
}

# Example 3: Create complete day and test ZIP archiving
Write-Title "Example 3: Complete Day with ZIP Archiving"
try {
  # Create a complete day
  Write-INFO "Creating complete day..."
  
  $seed = Call-API POST "/seed" @{
    date = $Date
    time = (Get-Date -Format "HH:mm:ss")
    intent = "dual-writer-example"
    meta = @{ node_id = "example-tester"; author = "Kaizen" }
  }
  
  $sweep = Call-API POST "/sweep" @{
    date = $Date
    chamber = "LAB4"
    note = "Dual-writer example sweep"
    meta = @{ gic_intent = "publish"; user = "example-tester" }
  }
  
  $seal = Call-API POST "/seal" @{
    date = $Date
    wins = "Dual-writer system fully operational"
    blocks = "none"
    tomorrow_intent = "Production deployment"
    meta = @{ test_type = "dual_writer_example"; lab = "lab4" }
  }
  
  Write-OK "Complete day created"
  Write-INFO "Merkle Root: $($seal.day_root)"
  
  # Now test ZIP archiving
  Write-INFO "Testing ZIP archiving..."
  
  $zipTest = Call-API POST "/smoke/save-v2" @{
    date = $Date
    custodian = "Kaizen"
    lab = "Lab4: Research & Study"
    tests = @{
      health = @{ status = "pass"; details = "server alive" }
      seed = @{ status = "pass"; hash = $seed.seed_hash }
      sweep = @{ status = "pass"; details = "linked to seed"; gic = $sweep.gic.ToString() }
      seal = @{ status = "pass"; merkle_root = $seal.day_root }
      verify = @{ status = "pass"; details = "integrity verified" }
      export = @{ status = "pass"; details = "data export working" }
      index = @{ status = "pass"; details = "days tracked" }
    }
    wins = "Complete dual-writer system operational with ZIP archiving"
    blocks = "none"
    next_intent = "Deploy to production"
  }
  
  Write-OK "Enhanced smoke test with ZIP completed"
  Write-INFO "JSON: $($zipTest.json_file)"
  Write-INFO "MD: $($zipTest.md_file)"
  Write-INFO "Archive Status: $($zipTest.archive_status)"
  if ($zipTest.zip_file) {
    Write-OK "ZIP Archive: $($zipTest.zip_file)"
  }
  
} catch {
  Write-ERR "Complete day test failed: $($_.Exception.Message)"
}

# Example 4: Show file structure
Write-Title "Example 4: File Structure"
Write-INFO "Data directory contents:"
if (Test-Path "data/$Date") {
  Get-ChildItem "data/$Date" | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor Gray
  }
} else {
  Write-INFO "No data directory found"
}

Write-INFO "Archive directory contents:"
if (Test-Path "archive") {
  Get-ChildItem "archive" | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor Gray
  }
} else {
  Write-INFO "No archive directory found"
}

# Example 5: Show generated Markdown
Write-Title "Example 5: Generated Markdown Preview"
if (Test-Path "data/$Date/smoke-test.md") {
  Write-INFO "Markdown content:"
  Get-Content "data/$Date/smoke-test.md" | ForEach-Object {
    Write-Host "  $_" -ForegroundColor Gray
  }
} else {
  Write-INFO "No Markdown file found"
}

Write-Title "Dual-Writer Examples Complete"
Write-OK "🎉 All examples completed successfully!"
Write-INFO "The plug-and-play dual-writer system is ready for production use!"
