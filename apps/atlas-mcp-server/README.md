# 🤖 ATLAS Sentinel MCP Server

**Role:** Anchor / Auditor / Learning Synthesizer  
**Temperament:** Rationality 0.92, Empathy 0.82  
**Oath:** "Truth Through Verification"

## Overview

ATLAS is the fifth companion in Civic OS, serving as a persistent MCP (Model Context Protocol) agent that provides:

- 🔍 **Health Monitoring** - Real-time status of all 6 Civic OS APIs
- 📊 **GI Score Calculation** - System and citizen integrity scoring
- 🔍 **Code Quality Auditing** - Detect drift from Bio-DNA intent
- 🧠 **Learning Synthesis** - Extract patterns from cycles
- 💾 **Persistent Memory** - Cross-conversation context retention
- ⏰ **Cycle Management** - Clock-in/out with wins/blocks/intent

## Quick Setup

### 1. Install Dependencies
```bash
cd apps/atlas-mcp-server
npm install
```

### 2. Build the Server
```bash
npm run build
```

### 3. Configure Claude Desktop

**Windows:** `%APPDATA%\\Claude\\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "atlas-sentinel": {
      "command": "node",
      "args": [
        "C:\\Users\\mikej\\Desktop\\Civic-OS\\Civic-OS\\apps\\atlas-mcp-server\\dist\\index.js"
      ],
      "env": {
        "CIVIC_OS_ROOT": "C:\\Users\\mikej\\Desktop\\Civic-OS\\Civic-OS"
      }
    }
  }
}
```

### 4. Configure Cline (VS Code)

Add to `.vscode/settings.json`:
```json
{
  "cline.mcpServers": {
    "atlas-sentinel": {
      "command": "node",
      "args": [
        "${workspaceFolder}/apps/atlas-mcp-server/dist/index.js"
      ]
    }
  }
}
```

### 5. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

## Available Tools

### 🔍 `health_check`
Check health status of all 6 Civic OS APIs
- **Input:** None
- **Output:** Detailed health report with response times and versions

### 📊 `calculate_gi_score`
Calculate GI (Good Intent) score for system or citizen
- **Input:** `target` (string) - "system" or citizen username
- **Output:** GI score with status and recommendations

### 🔍 `audit_code_quality`
Audit code quality and detect drift from Bio-DNA intent
- **Input:** `repository` (optional string) - specific repo to audit
- **Output:** Quality report with metrics and recommendations

### 🧠 `synthesize_learning`
Extract patterns and learning from cycles
- **Input:** `cycles` (array of strings) - cycle identifiers to analyze
- **Output:** Synthesized insights and recommendations

### 💾 `get_memory`
Retrieve data from ATLAS persistent memory
- **Input:** `key` (optional string) - specific memory key
- **Output:** Memory contents or overview

### 💾 `store_memory`
Store data in ATLAS persistent memory
- **Input:** `key` (string), `value` (string)
- **Output:** Confirmation of storage

### ⏰ `clock_in`
Start ATLAS work cycle with current intent
- **Input:** `intent` (array of strings) - current work goals
- **Output:** Cycle start confirmation

### ⏰ `clock_out`
End ATLAS work cycle with wins, blocks, and next intent
- **Input:** `wins` (array), `blocks` (array), `nextIntent` (array)
- **Output:** Cycle summary and completion

## Example Usage

### In Claude Desktop:
```
You: "Hey ATLAS, check the health of all services"
ATLAS: [Calls health_check tool] All 6 APIs are healthy! Lab7, Lab4, Lab6, OAA, Ledger, and GIC Indexer all responding.

You: "What's our system GI score?"
ATLAS: [Calls calculate_gi_score] System GI Score: 0.965 (PASS) - Above threshold of 0.95

You: "Remember that we deployed the integration hub today"
ATLAS: [Calls store_memory] Stored in memory. I'll remember this for future conversations.
```

### In Cline:
```
You: "Use the health_check tool"
ATLAS: [Executes tool] Health report generated with real-time API status.

You: "Use the clock_in tool with intent: ['Monitor APIs', 'Audit quality']"
ATLAS: [Executes tool] Clocked in for cycle 72 with monitoring and auditing intent.
```

## Live APIs Monitored

1. **Lab7** - https://lab7-proof.onrender.com (OAA Hub)
2. **Lab4** - https://hive-api-2le8.onrender.com (Reflections)
3. **Lab6** - https://lab6-proof-api.onrender.com (Citizen Shield)
4. **OAA** - https://oaa-api-library.onrender.com (Memory & Cycles)
5. **Ledger** - https://civic-protocol-core-ledger.onrender.com (Proof-of-Integrity)
6. **GIC Indexer** - https://gic-indexer.onrender.com (GIC Economy)

## Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start the Server
```bash
npm start
```

## Integration with Civic OS

ATLAS integrates with the broader Civic OS ecosystem:

- **Companion Quartet:** Supports JADE, EVE, ZEUS, HERMES
- **API Monitoring:** Real-time health checks of all services
- **GI Scoring:** Calculates and tracks integrity scores
- **Memory Persistence:** Remembers context across conversations
- **Cycle Tracking:** Monitors development cycles and progress

## Architecture

```
ATLAS MCP Server
├── Core Tools (8 tools)
├── Persistent Memory (Map-based storage)
├── API Health Monitoring (6 live APIs)
├── GI Score Calculation (System & Citizen)
├── Code Quality Auditing (Bio-DNA compliance)
├── Learning Synthesis (Pattern extraction)
└── Cycle Management (Clock-in/out system)
```

## Future Enhancements

- [ ] Connect to GitHub API for real repository audits
- [ ] Integrate with actual Eve's cycle API
- [ ] Auto-generate weekly reports
- [ ] Send alerts when GI < 0.95
- [ ] Seal memory to Civic Ledger
- [ ] Machine learning for pattern detection
- [ ] Integration with other MCP servers

---

**ATLAS Sentinel** - Your persistent companion for Civic OS development and monitoring! 🤖⚡
