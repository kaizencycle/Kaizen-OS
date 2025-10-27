# Kaizen OS MCP Server

MCP (Model Context Protocol) server for Cursor IDE integration with Kaizen OS.

## Overview

This server provides Cursor with safe, high-leverage tools for interacting with the Kaizen OS civic governance system. It acts as a bridge between your IDE and the constitutional AI framework.

## Features

- **ADR Creation** - Generate Architecture Decision Records
- **PR Drafting** - Create pull requests with templates and checklists
- **GI Checking** - Run Governance Integrity validation on code changes
- **Ledger Attestation** - Log development actions to the audit trail
- **Consensus Review** - View AI model votes and constitutional scores
- **Code Scaffolding** - Generate service, component, and test templates

## Installation

```bash
cd apps/mcp-server
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
# Required
KAIZEN_TOKEN=your_kaizen_api_token

# Optional
KAIZEN_GW_BASE=https://api.kaizen-os.civic.ai
CONSENSUS_READONLY=true
PORT=3033
```

### Cursor MCP Settings

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "kaizen-os": {
      "command": "node",
      "args": ["apps/mcp-server/dist/index.js"],
      "env": {
        "KAIZEN_TOKEN": "your_token_here",
        "KAIZEN_GW_BASE": "https://api.kaizen-os.civic.ai",
        "CONSENSUS_READONLY": "true"
      }
    }
  }
}
```

## Usage

### ADR Creation
```typescript
// In Cursor, use the MCP tool
adr.create({
  title: "Implement Constitutional Validation",
  context: "Adding automated constitutional scoring to all AI responses"
})
```

### PR Drafting
```typescript
pr.draft({
  scope: "Add ATLAS sentinel integration",
  risk: "medium"
})
```

### GI Checking
```typescript
gi.check({
  diff: "git diff HEAD~1"
})
```

### Ledger Attestation
```typescript
ledger.attest({
  event: "code_review_completed",
  meta: { pr_id: "123", reviewer: "AUREA" }
})
```

### Consensus Review
```typescript
consensus.review({
  pr_id: "123"
})
```

### Code Scaffolding
```typescript
scaffold.gen({
  kind: "service",
  name: "atlas-audit"
})
```

## Security

- **Read-only by default** - Consensus participation disabled in IDE
- **Constitutional validation** - All operations checked against Custos Charter
- **Token scoping** - Limited to development operations only
- **Audit trail** - All actions logged to immutable ledger

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

- `POST /tools/adr.create` - Create ADR
- `POST /tools/pr.draft` - Draft PR
- `POST /tools/gi.check` - Run GI checks
- `POST /tools/ledger.attest` - Attest to ledger
- `POST /tools/consensus.review` - Review consensus
- `POST /tools/scaffold.gen` - Generate scaffolding
- `GET /health` - Health check

## Troubleshooting

### Common Issues

1. **Token not found**
   - Ensure `KAIZEN_TOKEN` environment variable is set
   - Check token has appropriate scopes

2. **API connection failed**
   - Verify `KAIZEN_GW_BASE` URL is correct
   - Check network connectivity

3. **Constitutional violations**
   - Review your code changes against Custos Charter
   - Use `gi.check` to identify specific issues

### Debug Mode

Set `NODE_ENV=development` for detailed logging.

## Contributing

This MCP server follows Kaizen OS constitutional principles:
- Transparent and auditable
- Respects human agency
- Promotes civic integrity
- Optimizes for long-term sustainability

## License

MIT License - See LICENSE file for details.