<#  heartbeat.ps1 — Daily Ledger Heartbeat + Logs + Rotation + Slack + ZIP + Checksums
    - Verifies, exports JSON bundle, zips raw files for the day
    - Logs to .\logs\heartbeat-YYYY-MM-DD.log (rotates after KeepDays)
    - Slack alert on failure (env SLACK_WEBHOOK_URL or param)
    - Creates ZIP with checksums.txt for integrity verification
#>

param(
  [string]$Date = (Get-Date -Format 'yyyy-MM-dd'),
  [string]$BaseUrl = "http://127.0.0.1:8000",    # set to 8999 if proxying
  [int]$KeepDays = 30,
  [string]$SlackWebhookUrl = $env:SLACK_WEBHOOK_URL # optional
)

$ErrorActionPreference = "Stop"

# --- paths ---
$RepoRoot   = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot
$LogsDir    = Join-Path $RepoRoot "logs"
$BackupsDir = Join-Path $RepoRoot "backups"
$DataDir    = Join-Path $RepoRoot "data"
New-Item -ItemType Directory -Force -Path $LogsDir,$BackupsDir | Out-Null
$LogFile    = Join-Path $LogsDir ("heartbeat-{0}.log" -f $Date)

# --- helpers ---
function Log {
  param([string]$msg, [ConsoleColor]$color = [ConsoleColor]::Gray)
  $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $line = "[{0}] {1}" -f $ts, $msg
  Write-Host $line -ForegroundColor $color
  Add-Content -Path $LogFile -Value $line
}

function Call-Json {
  param([string]$Method,[string]$Path)
  $uri = "$BaseUrl$Path"
  Log "HTTP $Method $uri"
  if ($Method -eq 'GET') { return Invoke-RestMethod -Uri $uri -Method GET }
  throw "Call-Json is only used for GETs in heartbeat."
}

function Rotate-Logs {
  param([string]$Dir,[int]$Days)
  try {
    $cutoff = (Get-Date).AddDays(-$Days)
    Get-ChildItem -Path $Dir -Filter "heartbeat-*.log" -File |
      Where-Object { $_.LastWriteTime -lt $cutoff } |
      ForEach-Object {
        Log "Rotating (delete): $($_.FullName)"
        Remove-Item $_.FullName -Force
      }
  } catch { Log "Log rotation error: $($_.Exception.Message)" Yellow }
}

function Notify-Slack {
  param([string]$Text)
  if (-not $SlackWebhookUrl) { return }
  try {
    $payload = @{ text = $Text } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri $SlackWebhookUrl -Method Post -ContentType 'application/json' -Body $payload | Out-Null
    Log "Slack alert sent." DarkCyan
  } catch { Log "Slack alert failed: $($_.Exception.Message)" Yellow }
}

function Find-Gpg {
  $candidates = @(
    "$env:ProgramFiles\GnuPG\bin\gpg.exe",
    "$env:ProgramFiles(x86)\GnuPG\bin\gpg.exe",
    "$env:ProgramFiles\Git\usr\bin\gpg.exe",
    "gpg" # in PATH
  )
  foreach ($c in $candidates) {
    if (Get-Command $c -ErrorAction SilentlyContinue) { return $c }
  }
  return $null
}

function Sign-File {
  param(
    [Parameter(Mandatory)][string]$FilePath,
    [Parameter(Mandatory)][string]$Signer,       # email or key id
    [string]$Passphrase = $null                  # optional (use gpg-agent ideally)
  )
  $gpg = Find-Gpg
  if (-not $gpg) { Log "GPG not found; skipping signature." Yellow; return $null }

  $sigPath = "$FilePath.sig"
  $args = @("--batch","--yes","--detach-sign","--local-user",$Signer,"--armor","-o",$sigPath,$FilePath)

  # If you MUST automate with a passphrase (prefer gpg-agent instead):
  if ($Passphrase) {
    $args = @("--pinentry-mode","loopback","--passphrase",$Passphrase) + $args
  }

  try {
    & $gpg @args | Out-Null
    if (-not (Test-Path $sigPath)) { throw "Signature file not created." }
    Log "Signed: $FilePath -> $sigPath" DarkCyan
    return $sigPath
  } catch {
    Log "GPG sign failed: $($_.Exception.Message)" Yellow
    return $null
  }
}

function Verify-Signature {
  param(
    [Parameter(Mandatory)][string]$FilePath,
    [Parameter(Mandatory)][string]$SigPath
  )
  $gpg = Find-Gpg
  if (-not $gpg) { Log "GPG not found; cannot verify signature." Yellow; return $false }
  try {
    & $gpg --verify $SigPath $FilePath 2>$null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

function Zip-Day {
  param([string]$Date,[string]$OutDir,[string]$DataDir)

  $base = $Date
  $files = @(
    "$base.seed.json",
    "$base.echo.json",
    "$base.seal.json",
    "$base.ledger.json"
  )

  $existing = @()
  foreach ($f in $files) {
    $path = Join-Path $DataDir $f
    if (Test-Path $path) { $existing += $path }
  }

  if ($existing.Count -eq 0) {
    Log "No raw files found to zip for $Date" Yellow
    return $null
  }

  $zipPath = Join-Path $OutDir ("{0}-ledger.zip" -f $Date)
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

  Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
  $stage = Join-Path $OutDir ("stage-{0}" -f ([guid]::NewGuid()))
  New-Item -ItemType Directory -Path $stage | Out-Null

  # 1) Copy files into a staging dir with clean names
  foreach ($src in $existing) {
    Copy-Item $src -Destination (Join-Path $stage (Split-Path $src -Leaf))
  }

  # 2) Compute SHA-256 and write checksums.txt (BSD-style: "<hash>  filename")
  $checksumsPath = Join-Path $stage "checksums.txt"
  $lines = @()
  Get-ChildItem -Path $stage -Filter "*.json" -File | ForEach-Object {
    $h = Get-FileHash -Algorithm SHA256 -Path $_.FullName
    $lines += ("{0}  {1}" -f $h.Hash.ToLower(), $_.Name)
  }
  $lines | Out-File -FilePath $checksumsPath -Encoding ascii -NoNewline:$false

  # 3) Create the zip
  [System.IO.Compression.ZipFile]::CreateFromDirectory($stage, $zipPath)

  # 4) Clean up
  Remove-Item $stage -Recurse -Force

  return $zipPath
}

function Verify-Checksums {
  param([string]$ZipPath)
  if (-not (Test-Path $ZipPath)) { return $false }

  # Extract to a temp dir
  $tmp = Join-Path ([System.IO.Path]::GetDirectoryName($ZipPath)) ("verify-{0}" -f ([guid]::NewGuid()))
  New-Item -ItemType Directory -Path $tmp | Out-Null
  Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
  [System.IO.Compression.ZipFile]::ExtractToDirectory($ZipPath, $tmp)

  $checks = Join-Path $tmp "checksums.txt"
  if (-not (Test-Path $checks)) {
    Log "ZIP missing checksums.txt" Yellow
    Remove-Item $tmp -Recurse -Force
    return $false
  }

  $ok = $true
  Get-Content $checks | ForEach-Object {
    if ($_ -match "^\s*([a-f0-9]{64})\s{2}(.+)$") {
      $expected = $Matches[1].ToLower()
      $fname    = $Matches[2]
      $fpath    = Join-Path $tmp $fname
      if (-not (Test-Path $fpath)) { Log "Missing file in ZIP: $fname" Red; $ok = $false; return }
      $actual = (Get-FileHash -Algorithm SHA256 -Path $fpath).Hash.ToLower()
      if ($actual -ne $expected) {
        Log "Hash mismatch: $fname  expected=$expected  actual=$actual" Red
        $ok = $false
      }
    }
  }

  Remove-Item $tmp -Recurse -Force
  return $ok
}

# --- start ---
$start = Get-Date
Log "===== HEARTBEAT START for $Date (base=$BaseUrl) =====" Cyan

$ExitCode = 0
$zipPath  = $null
try {
  # Step 1: VERIFY
  $verify = Call-Json GET "/verify/$Date"
  if (-not $verify.ok) {
    Log "VERIFY reported mismatch" Red
    Log ("Expected: {0}" -f $verify.expected)
    Log ("Computed: {0}" -f $verify.computed)
    $ExitCode = 2
  } else {
    Log ("VERIFY OK :: hash={0} seeds={1} sweeps={2} seals={3}" -f `
      $verify.expected, $verify.counts.seeds, $verify.counts.sweeps, $verify.counts.seals) Green
  }

  # Step 2: EXPORT JSON bundle (API view)
  $export   = Call-Json GET "/export/$Date"
  $jsonOut  = Join-Path $BackupsDir ("{0}-ledger.json" -f $Date)
  $export | ConvertTo-Json -Depth 10 | Out-File -Encoding utf8 $jsonOut
  $size = (Get-Item $jsonOut).Length
  Log ("EXPORT wrote {0} ({1} bytes)" -f $jsonOut, $size) Green

  # Step 3: ZIP raw files (filesystem view)
  $zipPath = Zip-Day -Date $Date -OutDir $BackupsDir -DataDir $DataDir
  if ($zipPath) {
    $zsize = (Get-Item $zipPath).Length
    Log ("ZIP wrote {0} ({1} bytes)" -f $zipPath, $zsize) Green
    if (Verify-Checksums -ZipPath $zipPath) {
      Log "ZIP checksum verification: OK" Green
    } else {
      Log "ZIP checksum verification: FAILED" Red
      if ($ExitCode -eq 0) { $ExitCode = 3 }
    }
  }

  # Step 4: CHECK AVAILABLE DAYS
  $index = Call-Json GET "/index"
  $availableDays = $index.days
  Log ("Available days: {0}" -f ($availableDays -join ', ')) Green
  
  # Get the latest available day
  $latestDate = ($availableDays | Sort-Object)[-1]
  if ($latestDate) {
    $latest = Call-Json GET "/ledger/$latestDate"
    if ($latestDate -ne $Date) {
      Log ("LATEST date mismatch :: latest={0} expected={1}" -f $latestDate, $Date) Yellow
    } else {
      Log ("LATEST OK :: {0} counts={1}" -f $latestDate, ($latest.counts | ConvertTo-Json -Compress)) Green
    }
  }
}
catch {
  Log ("ERROR: " + $_.Exception.Message) Red
  if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
    Log ("DETAIL: " + $_.ErrorDetails.Message) Red
  }
  $ExitCode = 1
}
finally {
  Rotate-Logs -Dir $LogsDir -Days $KeepDays

  if ($ExitCode -ne 0) {
    $tail = (Get-Content -Path $LogFile -Tail 15) -join "`n"
    $zipNote = if ($zipPath) { "`nZIP: $zipPath" } else { "" }
    $msg = ":rotating_light: *DVA Heartbeat FAILED* for `$Date` (exit=$ExitCode)$zipNote`n``````$tail`n``````"
    Notify-Slack -Text $msg
  }

  $dur = ((Get-Date) - $start).TotalSeconds
  Log ("===== HEARTBEAT END for $Date :: exit=$ExitCode :: ${dur}s =====") Cyan
  exit $ExitCode
}
