# MCP Recipes — Reflections Ledger

## 1. Seed the day

```powershell
# Windows (PowerShell)
mcp run seed --data "{""date"":""$(Get-Date -Format yyyy-MM-dd)"",""time"":""$(Get-Date -Format HH:mm:ss)"",""intent"":""ship""}"

# Mac/Linux
mcp run seed --data "{\"date\":\"$(date +%F)\",\"time\":\"$(date +%T)\",\"intent\":\"ship\"}"
```

## 2. Sweep (Private Reflection, +10 GIC)

```powershell
# Windows
mcp run sweep --data "{""date"":""$(Get-Date -Format yyyy-MM-dd)"",""chamber"":""Reflections"",""note"":""private encrypted sweep"",""meta"":{""gic_intent"":""private"",""content_hash"":""hash-private"",""ui"":""mcp""}}"

# Mac/Linux
mcp run sweep --data "{\"date\":\"$(date +%F)\",\"chamber\":\"Reflections\",\"note\":\"private encrypted sweep\",\"meta\":{\"gic_intent\":\"private\",\"content_hash\":\"hash-private\",\"ui\":\"mcp\"}}"
```

## 3. Sweep (Publish Reflection, +25 GIC if ≥200 chars)

```powershell
# Windows
mcp run sweep --data "{""date"":""$(Get-Date -Format yyyy-MM-dd)"",""chamber"":""Reflections"",""note"":""This is a publish-tier reflection written out at length so it exceeds the minimum character threshold for the higher GIC reward..."",""meta"":{""gic_intent"":""publish"",""content_hash"":""hash-publish"",""ui"":""mcp""}}"

# Mac/Linux
mcp run sweep --data "{\"date\":\"$(date +%F)\",\"chamber\":\"Reflections\",\"note\":\"This is a publish-tier reflection written out at length so it exceeds the minimum character threshold for the higher GIC reward...\",\"meta\":{\"gic_intent\":\"publish\",\"content_hash\":\"hash-publish\",\"ui\":\"mcp\"}}"
```

## 4. Seal the day

```powershell
# Windows
mcp run seal --data "{""date"":""$(Get-Date -Format yyyy-MM-dd)"",""wins"":""MCP recipes worked"",""blocks"":""none"",""tomorrow_intent"":""iterate""}"

# Mac/Linux
mcp run seal --data "{\"date\":\"$(date +%F)\",\"wins\":\"MCP recipes worked\",\"blocks\":\"none\",\"tomorrow_intent\":\"iterate\"}"
```

## 5. Verify a day's ledger

```powershell
# Windows
mcp run verify --params "{""date"":""$(Get-Date -Format yyyy-MM-dd)""}"

# Mac/Linux
mcp run verify --params "{\"date\":\"$(date +%F)\"}"
```

## 6. Index all days

```bash
mcp run index
```

## Helper Scripts

### reflect.ps1 (Windows)
```powershell
# Private reflection (+10 GIC)
.\reflect.ps1 -note "This is my private reflection"

# Publish reflection (+25 GIC)
.\reflect.ps1 -note "This is my published reflection with ≥200 chars..." -intent publish
```

### reflect_and_seal.ps1 (Windows)
```powershell
# Reflect and seal in one command
.\reflect_and_seal.ps1 -note "My daily reflection" -intent private -wins "completed tasks" -blocks "none" -tomorrow "iterate"
```

## Environment Switching

### Switch to DEV (local API)
```powershell
Copy-Item .cursor\mcp.dev.json .cursor\mcp.json -Force
```

### Switch to PROD (Render API)
```powershell
Copy-Item .cursor\mcp.prod.json .cursor\mcp.json -Force
```

## Tips

- Replace "ship" in **seed** with "reflect", "research", etc.
- Replace "private encrypted sweep" or "publish reflection" with your actual notes.
- content_hash should ideally be a real SHA-256 of your reflection text (use reflect.ps1 for auto-hashing).
- For publish tier, ensure your note is ≥200 characters to get the full +25 GIC reward.

