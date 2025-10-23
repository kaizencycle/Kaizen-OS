# MCP Setup for Reflections Ledger

This directory contains everything you need to use Cursor AI's MCP (Model Context Protocol) to interact with your Reflections API.

## 🚀 Quick Setup

### 1. Configure Environment
```powershell
# Copy the template and edit with your API keys
Copy-Item env.template .env
# Edit .env with your actual API keys
```

### 2. Update MCP Configuration
Edit `.cursor/mcp.json` and replace:
- `https://reflections.onrender.com` with your actual Render URL
- `<your_api_key>` with your actual API key

### 3. Reload Cursor
Close and reopen Cursor to activate the MCP tools.

## 📁 File Structure

```
lab4-proof/
├── .cursor/
│   ├── mcp.json          # Production MCP config
│   └── mcp.dev.json      # Development MCP config
├── reflect.ps1           # Windows: reflect command
├── reflect_and_seal.ps1  # Windows: reflect + seal
├── reflect.sh            # Mac/Linux: reflect command
├── reflect_and_seal.sh   # Mac/Linux: reflect + seal
├── Test-LedgerApi.ps1    # Full API test script
├── test_ledger_api.bat   # Windows batch test
├── setup-mcp.ps1         # MCP setup helper
├── mcp_recipes.md        # Command recipes
└── MCP-SETUP.md          # This file
```

## 🛠 Available Commands

### MCP Commands (in Cursor)
```bash
# Seed the day
mcp run seed --data '{"date":"2025-09-23","time":"09:00:00","intent":"ship"}'

# Private reflection (+10 GIC)
mcp run sweep --data '{"date":"2025-09-23","chamber":"Reflections","note":"my private thought","meta":{"gic_intent":"private","content_hash":"hash123","ui":"mcp"}}'

# Publish reflection (+25 GIC)
mcp run sweep --data '{"date":"2025-09-23","chamber":"Reflections","note":"This is a longer reflection that qualifies for the publish tier...","meta":{"gic_intent":"publish","content_hash":"hash456","ui":"mcp"}}'

# Seal the day
mcp run seal --data '{"date":"2025-09-23","wins":"completed tasks","blocks":"none","tomorrow_intent":"iterate"}'

# Verify a day
mcp run verify --params '{"date":"2025-09-23"}'

# List all days
mcp run index
```

### Helper Scripts

#### Windows (PowerShell)
```powershell
# Simple reflection (auto-hashes content)
.\reflect.ps1 -note "My private reflection"
.\reflect.ps1 -note "My published reflection..." -intent publish

# Reflect and seal in one command
.\reflect_and_seal.ps1 -note "My daily reflection" -intent private -wins "completed tasks"

# Full API test
.\Test-LedgerApi.ps1 -Env dev
.\Test-LedgerApi.ps1 -Env prod
```

#### Mac/Linux (Bash)
```bash
# Make scripts executable (one time)
chmod +x reflect.sh reflect_and_seal.sh

# Simple reflection (auto-hashes content)
./reflect.sh "My private reflection"
./reflect.sh "My published reflection..." publish

# Reflect and seal in one command
./reflect_and_seal.sh "My daily reflection" private "completed tasks"
```

## 🔄 Environment Switching

### Switch to Development (Local API)
```powershell
Copy-Item .cursor\mcp.dev.json .cursor\mcp.json -Force
```

### Switch to Production (Render API)
```powershell
Copy-Item .cursor\mcp.prod.json .cursor\mcp.json -Force
```

## 🧪 Testing

### Test Local API
```powershell
# Make sure your API is running locally
uvicorn app.main:app --reload --port 8000

# Test with MCP
.\Test-LedgerApi.ps1 -Env dev
```

### Test Production API
```powershell
# Test your deployed API
.\Test-LedgerApi.ps1 -Env prod
```

## 🔧 Troubleshooting

### MCP Not Working
1. Check that `.cursor/mcp.json` exists and has correct URL
2. Verify `.env` file has correct API keys
3. Reload Cursor completely
4. Check Cursor's MCP status in settings

### API Connection Issues
1. Verify API is running: `http://127.0.0.1:8000/health`
2. Check API key in `.env` file
3. Verify CORS settings in your API
4. Check firewall/network settings

### Script Execution Issues (Windows)
```powershell
# Allow script execution (one time)
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 📚 Usage Examples

### Daily Workflow
```powershell
# 1. Seed your day
mcp run seed --data '{"date":"2025-09-23","time":"09:00:00","intent":"reflect"}'

# 2. Log some reflections
.\reflect.ps1 -note "Learned about MCP integration" -intent private
.\reflect.ps1 -note "This is a longer reflection about the importance of daily journaling and how it helps with personal growth and development..." -intent publish

# 3. Seal the day
mcp run seal --data '{"date":"2025-09-23","wins":"completed MCP setup","blocks":"none","tomorrow_intent":"iterate"}'

# 4. Verify everything
mcp run verify --params '{"date":"2025-09-23"}'
```

### Quick Reflection + Seal
```powershell
.\reflect_and_seal.ps1 -note "Quick daily reflection" -intent private -wins "set up MCP" -blocks "none" -tomorrow "continue"
```

## 🎯 Tips

- Use `reflect.ps1` for automatic content hashing
- Publish tier requires ≥200 characters for full +25 GIC
- Private tier always gives +10 GIC
- Check your GIC totals with `mcp run verify`
- Use `mcp run index` to see all your days

## 🔐 Security

- Keep your `.env` file out of version control
- Use strong API keys
- Regularly rotate your API keys
- Monitor your API usage

Happy reflecting! ✨
