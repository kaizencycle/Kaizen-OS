# MCP (Model Context Protocol) Usage Guide

## Overview
This guide explains how to use Cursor's MCP integration with your Lab4-proof API for direct ledger management from within the editor.

## Setup

### 1. Environment Configuration
- **DEV**: Points to `http://127.0.0.1:8000` (local FastAPI)
- **PROD**: Points to `https://YOUR-RENDER-APP.onrender.com` (Render deployment)

### 2. Switching Environments
```powershell
# Switch to DEV (localhost)
.\switch-to-dev.ps1

# Switch to PROD (Render)
.\switch-to-prod.ps1
```

### 3. Restart Cursor
After switching environments, restart Cursor to activate the new MCP configuration.

## Available MCP Tools

### Core Ledger Operations

#### 1. Seed - Start a new day
```bash
mcp run seed --data '{"date":"2025-09-25","time":"09:00","intent":"Study FastAPI and MCP integration","meta":{}}'
```

#### 2. Sweep - Log reflections during the day
```bash
mcp run sweep --data '{"date":"2025-09-25","chamber":"Lab4","note":"MCP integration working perfectly","meta":{}}'
```

#### 3. Seal - Close the day with wins/blocks/intent
```bash
mcp run seal --data '{"date":"2025-09-25","wins":"Successfully integrated MCP with Lab4 API","blocks":"None","tomorrow_intent":"Deploy to Render and test production","meta":{}}'
```

### Verification & Inspection

#### 4. Verify - Check day integrity
```bash
mcp run verify --params '{"date":"2025-09-25"}'
```

#### 5. Index - List all available days
```bash
mcp run index
```

#### 6. Export - Get complete day data
```bash
mcp run export --params '{"date":"2025-09-25"}'
```

#### 7. Ledger - Get ledger info for a date
```bash
mcp run ledger --params '{"date":"2025-09-25"}'
```

#### 8. Health - Check API status
```bash
mcp run health
```

## Example Workflows

### Daily Development Workflow
```bash
# 1. Start the day
mcp run seed --data '{"date":"2025-09-25","time":"09:00","intent":"Implement new features","meta":{}}'

# 2. Log progress throughout the day
mcp run sweep --data '{"date":"2025-09-25","chamber":"Lab4","note":"Fixed authentication bug","meta":{}}'
mcp run sweep --data '{"date":"2025-09-25","chamber":"Lab4","note":"Added MCP integration","meta":{}}'

# 3. End the day
mcp run seal --data '{"date":"2025-09-25","wins":"MCP integration complete","blocks":"Need to test on Render","tomorrow_intent":"Deploy and test production","meta":{}}'

# 4. Verify everything is correct
mcp run verify --params '{"date":"2025-09-25"}'
```

### Debugging Workflow
```bash
# Check API health
mcp run health

# List all available days
mcp run index

# Get specific day's data
mcp run export --params '{"date":"2025-09-25"}'

# Verify day integrity
mcp run verify --params '{"date":"2025-09-25"}'
```

## Node Identity Tracking

All records created through MCP will include the following metadata:
- **node_id**: `cursor`
- **author**: `Cursor AI (Kaizen Node)`
- **network_id**: `Kaizen-DVA`
- **version**: `0.1.0`

This ensures full traceability of which node (Cursor AI) created each record.

## Troubleshooting

### Common Issues

1. **"Tool not found"**: Restart Cursor after switching environments
2. **Connection refused**: Ensure your local API is running (`uvicorn app.main:app --reload`)
3. **401 Unauthorized**: Check your API keys in the .env file
4. **404 Not Found**: Verify the baseUrl in your MCP config

### Debug Commands
```bash
# Check if MCP tools are loaded
mcp list

# Test basic connectivity
mcp run health

# Verify environment
mcp run index
```

## Production Deployment

When deploying to Render:

1. Update `.cursor/mcp.prod.json` with your actual Render URL
2. Set your production API key in `.env`
3. Run `.\switch-to-prod.ps1`
4. Restart Cursor
5. Test with `mcp run health`

## Security Notes

- Keep your `.env` file out of version control
- Use strong, unique API keys for production
- The local dev environment doesn't require authentication
- Production environment requires API key authentication
