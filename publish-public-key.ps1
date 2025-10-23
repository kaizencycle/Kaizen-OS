<#  publish-public-key.ps1
    Exports your ASCII-armored GPG public key + fingerprint into .\backups\
    Usage:
      .\publish-public-key.ps1 -Key "ledger@example.com"
      .\publish-public-key.ps1 -Key "ABCD1234EF567890"   # key id
#>

param(
  [Parameter(Mandatory=$true)][string]$Key,             # email or key id
  [string]$OutDir = (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "backups")
)

$ErrorActionPreference = "Stop"

# --- helpers ---
function Find-Gpg {
  $candidates = @(
    "$env:ProgramFiles\GnuPG\bin\gpg.exe",
    "$env:ProgramFiles(x86)\GnuPG\bin\gpg.exe",
    "$env:ProgramFiles\Git\usr\bin\gpg.exe",
    "gpg"
  )
  foreach ($c in $candidates) {
    if (Get-Command $c -ErrorAction SilentlyContinue) { return $c }
  }
  return $null
}

function Write-Info($msg){ Write-Host $msg -ForegroundColor Cyan }
function Write-OK($msg){ Write-Host $msg -ForegroundColor Green }
function Write-Warn($msg){ Write-Host $msg -ForegroundColor Yellow }

# --- prep ---
$gpg = Find-Gpg
if (-not $gpg) { throw "gpg.exe not found. Install Gpg4win or ensure gpg is in PATH." }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# Resolve primary uid + fingerprint
Write-Info "Finding key: $Key"
# list keys, capture exact key id & uid
$keysRaw = & $gpg --list-keys --with-colons $Key
if ($LASTEXITCODE -ne 0 -or -not $keysRaw) { throw "Key '$Key' not found in keyring." }

# Parse the first pub record
$pub = ($keysRaw -split "`n" | Where-Object { $_ -like "pub:*" } | Select-Object -First 1)
if (-not $pub) { throw "No public key record found for '$Key'." }

# fields: https://www.gnupg.org/documentation/manuals/gnupg/Unattended-GPG-key-generation.html#Unattended-GPG-key-generation
# pub:<algo>:<keylen>:<keyid>:<created>:<expires>:<...>:<capabilities>:
$parts = $pub -split ":"
$keyid = $parts[4]  # long keyid
if (-not $keyid) { throw "Could not parse key id for '$Key'." }

# Extract primary UID line to get email/name
$uidLine = ($keysRaw -split "`n" | Where-Object { $_ -like "uid:*" } | Select-Object -First 1)
$uidText = ($uidLine -split ":")[-1]
if (-not $uidText) { $uidText = $Key }

# Export ASCII-armored public key
$pubFile = Join-Path $OutDir "publickey-$keyid.asc"
& $gpg --armor --export $keyid | Out-File -Encoding ascii $pubFile
if (-not (Test-Path $pubFile)) { throw "Failed to export public key." }
Write-OK "Exported public key  →  $pubFile"

# Compute fingerprint and save
$fpr = (& $gpg --fingerprint --with-colons $keyid | Where-Object { $_ -like "fpr:*" } | Select-Object -First 1)
$fprVal = ($fpr -split ":")[9]
if (-not $fprVal) { Write-Warn "Could not parse fingerprint."; $fprVal = "(unknown)"; }
$fprFile = Join-Path $OutDir "publickey-$keyid.fingerprint.txt"
"Key: $uidText`nKeyID: $keyid`nFingerprint: $fprVal" | Out-File -Encoding utf8 $fprFile
Write-OK "Saved fingerprint    →  $fprFile"

# README for verifiers
$readme = @"
DVA Ledger – Public Key Package
===============================

This folder contains the public key used to sign daily ledger bundles.

Files:
- publickey-$keyid.asc
- publickey-$keyid.fingerprint.txt

Verify authenticity (any platform with GPG):

1) Import the public key:
   gpg --import publickey-$keyid.asc

2) Check the fingerprint matches an out-of-band value you trust:
   gpg --fingerprint $keyid

   Expected fingerprint:
   $fprVal

3) Verify a nightly ZIP's checksums signature:
   gpg --verify checksums.txt.sig checksums.txt

If the signature is good and the fingerprint matches, the ledger bundle is
both tamper-evident and tied to the publisher's key identity.

"@
$readmeFile = Join-Path $OutDir "READ_ME_verify_public_key.txt"
$readme | Out-File -Encoding utf8 $readmeFile
Write-OK "Wrote verifier README →  $readmeFile"

Write-Host ""
Write-OK "Done."
Write-Host "Share the two files below (and README) publicly so anyone can verify your signatures:"
Write-Host " - $([System.IO.Path]::GetFileName($pubFile))"
Write-Host " - $([System.IO.Path]::GetFileName($fprFile))"
