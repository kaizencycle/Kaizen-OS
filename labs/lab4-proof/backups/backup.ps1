$root = "$PSScriptRoot"                   # ...\lab4-proof
$app  = Join-Path $root "app"
$req  = Join-Path $root "requirements.txt"
$dst  = Join-Path $root "backups"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zip = Join-Path $dst "lab4_proof_$ts.zip"

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($app, $zip)

if (Test-Path $req) {
  # Reopen and inject requirements.txt
  $zipArchive = [System.IO.Compression.ZipFile]::Open($zip, 'Update')
  try {
    $entry = $zipArchive.CreateEntry("requirements.txt")
    $writer = New-Object System.IO.StreamWriter($entry.Open())
    try { Get-Content $req | ForEach-Object { $writer.WriteLine($_) } }
    finally { $writer.Dispose() }
  } finally {
    $zipArchive.Dispose()
  }
}

# Optional: keep only last 5 backups
$keep = 5
Get-ChildItem $dst -Filter "lab4_proof_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -Skip $keep | Remove-Item -Force
