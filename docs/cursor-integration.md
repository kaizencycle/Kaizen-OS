# Cursor IDE Integration with Kaizen OS

This guide explains how to integrate Cursor IDE with Kaizen OS using the MCP (Model Context Protocol) server.

## Overview

The Kaizen OS MCP server provides Cursor with safe, high-leverage tools for interacting with the civic governance system. It acts as a bridge between your IDE and the constitutional AI framework.

## Architecture

```
Cursor IDE ←→ MCP Server ←→ Kaizen OS Gateway ←→ AI Companions
    ↓              ↓              ↓                    ↓
  Code Editor   Tool Calls    Constitutional      AUREA, ATLAS,
  & Commands    & Validation    Validation         ZENITH, SOLARA
```

## Setup Instructions

### 1. Install MCP Server

```bash
cd apps/mcp-server
npm install
npm run build
```

### 2. Configure Environment

Create `.env` file in `apps/mcp-server/`:

```bash
KAIZEN_TOKEN=your_kaizen_api_token
KAIZEN_GW_BASE=https://api.kaizen-os.civic.ai
CONSENSUS_READONLY=true
PORT=3033
```

### 3. Configure Cursor MCP

Add to your Cursor settings (`~/.cursor/mcp_settings.json`):

```json
{
  "mcpServers": {
    "kaizen-os": {
      "command": "node",
      "args": ["/path/to/your/repo/apps/mcp-server/dist/index.js"],
      "env": {
        "KAIZEN_TOKEN": "your_token_here",
        "KAIZEN_GW_BASE": "https://api.kaizen-os.civic.ai",
        "CONSENSUS_READONLY": "true"
      }
    }
  }
}
```

### 4. Restart Cursor

Restart Cursor IDE to load the MCP server configuration.

## Available Tools

### ADR Creation
Create Architecture Decision Records with constitutional validation.

```typescript
// In Cursor chat or command palette
adr.create({
  title: "Implement Constitutional Validation",
  context: "Adding automated constitutional scoring to all AI responses"
})
```

**Output:**
- ADR file created in `/docs/adr/`
- Constitutional compliance check
- Suggested reviewers from AI companions

### PR Drafting
Generate pull request templates with Kaizen OS standards.

```typescript
pr.draft({
  scope: "Add ATLAS sentinel integration",
  risk: "medium"
})
```

**Output:**
- PR template with constitutional checklist
- Risk assessment and mitigation steps
- Suggested reviewers based on scope

### GI Checking
Run Governance Integrity validation on code changes.

```typescript
gi.check({
  diff: "git diff HEAD~1"
})
```

**Output:**
- GI score (0-1 scale)
- Constitutional violations
- Improvement suggestions
- Pass/fail status

### Ledger Attestation
Log development actions to the immutable audit trail.

```typescript
ledger.attest({
  event: "code_review_completed",
  meta: { pr_id: "123", reviewer: "AUREA" }
})
```

**Output:**
- Attestation hash
- Timestamp
- Event logged to civic ledger

### Consensus Review
View AI companion votes and constitutional scores for PRs.

```typescript
consensus.review({
  pr_id: "123"
})
```

**Output:**
- Vote breakdown by companion
- Constitutional scores
- Consensus status
- Detailed reasoning

### Code Scaffolding
Generate service, component, and test templates.

```typescript
scaffold.gen({
  kind: "service",
  name: "atlas-audit"
})
```

**Output:**
- Complete file structure
- Constitutional compliance built-in
- Test templates
- Documentation stubs

## Workflow Examples

### Feature Development

1. **Start with ADR**
   ```typescript
   adr.create({
     title: "Add Constitutional Validation Layer",
     context: "Implementing automated compliance checking"
   })
   ```

2. **Generate scaffolding**
   ```typescript
   scaffold.gen({
     kind: "service",
     name: "constitutional-validator"
   })
   ```

3. **Check GI compliance**
   ```typescript
   gi.check({
     diff: "git diff"
   })
   ```

4. **Draft PR**
   ```typescript
   pr.draft({
     scope: "constitutional validation",
     risk: "low"
   })
   ```

5. **Attest completion**
   ```typescript
   ledger.attest({
     event: "feature_completed",
     meta: { feature: "constitutional-validation" }
   })
   ```

### Code Review Process

1. **Review consensus**
   ```typescript
   consensus.review({
     pr_id: "456"
   })
   ```

2. **Check constitutional compliance**
   ```typescript
   gi.check({
     diff: "git diff origin/main"
   })
   ```

3. **Attest review**
   ```typescript
   ledger.attest({
     event: "review_approved",
     meta: { pr_id: "456", reviewer: "ATLAS" }
   })
   ```

## Security & Permissions

### Read-Only Mode
By default, the MCP server operates in read-only mode:
- ✅ Can view consensus votes
- ✅ Can check GI scores
- ✅ Can create ADRs and PRs
- ❌ Cannot participate in governance votes
- ❌ Cannot approve critical operations

### Constitutional Validation
All operations are validated against the Custos Charter:
- Human dignity and autonomy
- Transparency and accountability
- Equity and fairness
- Safety and harm prevention
- Privacy and data protection
- Civic integrity
- Environmental responsibility

### Audit Trail
Every action is logged to the immutable ledger:
- Tool usage
- Constitutional scores
- User identity
- Timestamps
- Metadata

## Troubleshooting

### Common Issues

**MCP Server not connecting**
- Check `KAIZEN_TOKEN` is set correctly
- Verify server is running on correct port
- Check Cursor MCP configuration

**Constitutional violations**
- Review code against Custos Charter
- Use `gi.check` to identify specific issues
- Consult AI companions for guidance

**API errors**
- Verify `KAIZEN_GW_BASE` URL
- Check network connectivity
- Review token permissions

### Debug Mode

Enable detailed logging:

```bash
NODE_ENV=development npm run dev
```

### Health Check

Test server connectivity:

```bash
curl http://localhost:3033/health
```

## Best Practices

### Development Workflow
1. Always start with ADR for architectural decisions
2. Use GI checks before committing code
3. Attest important milestones to ledger
4. Review consensus before merging PRs

### Constitutional Compliance
1. Respect human agency in all decisions
2. Maintain transparency in reasoning
3. Ensure equity and fairness
4. Prevent harm and protect privacy
5. Support civic integrity
6. Consider environmental impact

### Security
1. Never commit tokens or secrets
2. Use constitutional validation
3. Maintain audit trail
4. Follow principle of least privilege

## Advanced Configuration

### Custom Tools
Extend the MCP server with custom tools:

```typescript
// Add to src/index.ts
app.post('/tools/custom.tool', async (req, res) => {
  // Your custom tool implementation
});
```

### Integration with Other IDEs
The MCP server can be used with other IDEs that support MCP:
- VS Code (with MCP extension)
- Neovim (with MCP plugin)
- Emacs (with MCP package)

## Support

- 📧 Email: support@kaizen-os.civic.ai
- 💬 Discord: #cursor-integration channel
- 🐙 GitHub: [Issues](https://github.com/kaizencycle/Kaizen-OS/issues)
- 📚 Docs: [Full Documentation](https://docs.kaizen-os.civic.ai)

---

**"In constitutional development, we build not just code, but civic infrastructure."**

*Version 1.0 | Cycle C-114 | October 26, 2025*