# OAA Dev Sidebar & AI Memory Features

This implementation adds a consistent dev navigation sidebar and AI memory system to the OAA-API-Library.

## 🎯 Features Implemented

### 1. Dev Sidebar Navigation
- **DevNav.tsx** - Consistent navigation component for all dev pages
- **DevLayout.tsx** - Wrapper layout with sidebar and header
- **DevBanner.tsx** - Development mode banner
- Updated all dev pages (`/dev/context`, `/dev/ledger`, `/dev/queue`, `/dev/reports`) to use the new layout

### 2. AI Memory System
- **OAA_PREFACE.md** - Always-in-context core information
- **OAA_MEMORY.json** - Durable memory storage
- **MemoryManager.tsx** - UI component for memory management
- **/api/oaa/memory** - REST API for memory operations

### 3. Cursor AI Integration
- **.cursor/rules.json** - Always-include context files
- **MCP Server** - Model Context Protocol server for tool-based memory access
- **.cursor/mcp.json** - MCP configuration

## 🚀 Quick Start

### 1. Dev Sidebar
The dev sidebar is now active on all `/dev/*` pages:
- Context - OAA system context and memory management
- Ledger - Civic Ledger proof verification
- Queue - BullMQ queue administration
- Reports - System reports and analytics

### 2. AI Memory Setup

#### Option A: Simple Setup (Recommended)
1. The memory system is already configured and working
2. Use the MemoryManager component on the Context page
3. Memory is stored in `OAA_MEMORY.json`

#### Option B: Full MCP Setup (Advanced)
1. Install MCP dependencies:
```bash
./scripts/setup-mcp.sh
```

2. Configure secrets in Cursor:
   - `LEDGER_BASE_URL`
   - `LEDGER_ADMIN_TOKEN`

3. Restart Cursor to load MCP tools

4. Use in Cursor chats:
   - `@oaa.getContext` - Get OAA context
   - `@oaa.memory.add "note"` - Add memory note
   - `@oaa.memory.search "term"` - Search memory

## 📁 File Structure

```
components/
├── DevNav.tsx          # Navigation sidebar
├── DevLayout.tsx       # Layout wrapper
├── DevBanner.tsx       # Dev mode banner
└── MemoryManager.tsx   # Memory management UI

pages/dev/
├── context.tsx         # Updated with DevLayout
├── ledger.tsx          # Updated with DevLayout
├── queue.tsx           # Updated with DevLayout
└── reports.tsx         # New reports page

pages/api/
├── oaa/
│   ├── context.ts      # Existing context API
│   └── memory.ts       # New memory API
└── dev/
    └── reports.ts      # New reports API

docs/
└── OAA_PREFACE.md      # Always-in-context info

.cursor/
├── rules.json          # Always-include context files
└── mcp.json           # MCP configuration

oaa-mcp/               # MCP server
├── package.json
├── src/index.mjs
└── README.md

OAA_MEMORY.json        # Durable memory storage
```

## 🔧 Configuration

### Cursor Rules (.cursor/rules.json)
```json
{
  "contextRules": [
    {
      "name": "oaa-core-context",
      "globs": ["docs/OAA_PREFACE.md", "pages/api/oaa/context.ts", "OAA_MEMORY.json"],
      "reason": "Hydrate OAA identity, civics, and durable memory in every chat.",
      "alwaysInclude": true
    }
  ]
}
```

### MCP Configuration (.cursor/mcp.json)
```json
{
  "providers": [
    {
      "name": "oaa-mcp",
      "command": "node",
      "args": ["oaa-mcp/src/index.mjs"],
      "env": {
        "LEDGER_BASE_URL": "${secrets.LEDGER_BASE_URL}",
        "LEDGER_ADMIN_TOKEN": "${secrets.LEDGER_ADMIN_TOKEN}"
      }
    }
  ]
}
```

## 🎨 UI Components

### DevLayout
- Consistent grid layout with 180px sidebar
- Sentinel badge in header
- Responsive design

### MemoryManager
- Search memory notes
- Add new notes
- Clear all notes
- Real-time updates

## 🔐 Security

- Memory API uses HMAC signatures for write operations
- Admin token required for destructive operations
- Rate limiting recommended for production

## 🚀 Next Steps

1. **Test the dev sidebar** - Navigate between dev pages
2. **Try memory management** - Add/search notes on Context page
3. **Configure MCP** (optional) - Set up Cursor tools
4. **Customize styling** - Adjust colors/layout as needed

## 📝 Notes

- Memory notes are stored in `OAA_MEMORY.json`
- Context is refreshed every 30 minutes via background agent
- All dev pages now share consistent navigation
- MCP tools provide programmatic access to memory

The system is now ready for AI-assisted development with persistent memory and consistent dev tooling!
