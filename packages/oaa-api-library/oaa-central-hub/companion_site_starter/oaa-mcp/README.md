# OAA MCP Server

Model Context Protocol server for OAA memory and context management.

## Setup

1. Install dependencies:
```bash
cd oaa-mcp
npm install
```

2. The MCP server is configured in `.cursor/mcp.json` and will be automatically loaded by Cursor.

## Available Tools

- `oaa.getContext` - Get canonical OAA context
- `oaa.memory.add` - Add a memory note
- `oaa.memory.search` - Search memory notes
- `oaa.memory.list` - List all memory notes
- `oaa.memory.clear` - Clear all memory notes

## Usage in Cursor

Once configured, you can use these tools in Cursor chats:

```
@oaa.getContext - Get the current OAA context
@oaa.memory.add "New memory note" - Add a memory note
@oaa.memory.search "search term" - Search memory notes
```

## Environment Variables

The MCP server uses these environment variables (configured in `.cursor/mcp.json`):
- `LEDGER_BASE_URL` - Civic Ledger base URL
- `LEDGER_ADMIN_TOKEN` - Admin token for ledger operations
