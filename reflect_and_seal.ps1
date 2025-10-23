param(
  [Parameter(Mandatory=$true)][string]$note,
  [ValidateSet('private','publish','publish_feature')][string]$intent = 'private',
  [string]$wins = 'logged reflections',
  [string]$blocks = 'none',
  [string]$tomorrow = 'iterate'
)

# reflect
.\reflect.ps1 -note $note -intent $intent | Out-Null

# seal
$body = @{
  date = (Get-Date -Format "yyyy-MM-dd")
  wins = $wins
  blocks = $blocks
  tomorrow_intent = $tomorrow
} | ConvertTo-Json -Compress

mcp run seal --data $body
