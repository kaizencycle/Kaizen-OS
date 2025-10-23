param(
  [Parameter(Mandatory=$true)][string]$note,
  [ValidateSet('private','publish','publish_feature')][string]$intent = 'private'
)

# SHA-256 of note
$hash = [System.BitConverter]::ToString(
  (New-Object System.Security.Cryptography.SHA256Managed).ComputeHash(
    [System.Text.Encoding]::UTF8.GetBytes($note)
  )
).Replace("-", "").ToLower()

# Build JSON
$data = @{
  date = (Get-Date -Format "yyyy-MM-dd")
  chamber = "Reflections"
  note = $note
  meta = @{
    gic_intent = $intent
    content_hash = $hash
    ui = "mcp"
  }
} | ConvertTo-Json -Depth 3 -Compress

# Call MCP
mcp run sweep --data $data
