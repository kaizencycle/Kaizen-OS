# Simple PowerShell redaction scan
param(
    [string]$Root = (git rev-parse --show-toplevel 2>$null)
)

$ForbiddenFile = Join-Path $Root ".redaction/forbidden.regex"
$AllowFile = Join-Path $Root ".redaction/allowlist.regex"

if (-not (Test-Path $ForbiddenFile)) {
    Write-Host "No .redaction/forbidden.regex found — skipping scan."
    exit 0
}

# Read forbidden patterns
$ForbiddenLines = Get-Content $ForbiddenFile
$Forbidden = ""
foreach ($line in $ForbiddenLines) {
    if ($line -notmatch '^\s*$' -and $line -notmatch '^\s*#') {
        if ($Forbidden) { 
            $Forbidden = $Forbidden + "|" 
        }
        $Forbidden = $Forbidden + $line
    }
}

# Read allow patterns
$Allow = ""
if (Test-Path $AllowFile) {
    $AllowLines = Get-Content $AllowFile
    foreach ($line in $AllowLines) {
        if ($line -notmatch '^\s*$' -and $line -notmatch '^\s*#') {
            if ($Allow) { 
                $Allow = $Allow + "|" 
            }
            $Allow = $Allow + $line
        }
    }
}

Write-Host "Redaction scan (repo-aware)…"
$Failed = 0

# Get tracked files
$Files = git ls-files | Where-Object { $_ -notmatch '^(vendor/|docs/private/)' }

foreach ($f in $Files) {
    if (-not (Test-Path $f)) { continue }
    
    # Skip binary files
    $mime = file $f 2>$null
    if ($mime -match 'image|binary') { continue }
    
    # Check for forbidden terms
    $content = Get-Content $f -Raw -ErrorAction SilentlyContinue
    if ($content -match $Forbidden) {
        $lines = Get-Content $f -ErrorAction SilentlyContinue
        $forbiddenHits = @()
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match $Forbidden) {
                $forbiddenHits += "$($i+1):$($lines[$i])"
            }
        }
        
        if ($Allow -and $content -match $Allow) {
            $allowHits = @()
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match $Allow) {
                    $allowHits += "$($i+1):$($lines[$i])"
                }
            }
            
            # Filter out allowed matches
            $netHits = $forbiddenHits | Where-Object { $_ -notin $allowHits }
            if ($netHits.Count -gt 0) {
                Write-Host "Forbidden terms found in: $f"
                $netHits | ForEach-Object { Write-Host $_ }
                $Failed = 1
            }
        } else {
            Write-Host "Forbidden terms found in: $f"
            $forbiddenHits | ForEach-Object { Write-Host $_ }
            $Failed = 1
        }
    }
}

if ($Failed -eq 1) {
    Write-Host "Forbidden terms detected. Redact or move to private."
    exit 1
}

Write-Host "No forbidden terms found."