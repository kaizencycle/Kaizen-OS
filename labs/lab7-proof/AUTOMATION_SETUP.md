# 🤖 Lab7 Edits Autonomous Merge Setup

## Overview
This setup creates a fully autonomous loop for merging `lab7-edits` folders using MCP-CLI-GitHub-Render integration.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub        │    │   Render         │    │   MCP Server    │
│   Actions       │◄──►│   Cron Jobs      │◄──►│   Integration   │
│   (Triggers)    │    │   (Execution)    │    │   (Orchestration)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    lab7-edits Processing                       │
│  v1/ → v2/ → v3/ → Merge → Deploy → Monitor → Repeat          │
└─────────────────────────────────────────────────────────────────┘
```

## Setup Steps

### 1. GitHub Secrets
Add these secrets to your GitHub repository:

```bash
# In GitHub Settings > Secrets and variables > Actions
GITHUB_TOKEN=your_github_token
RENDER_API_TOKEN=your_render_api_token
```

### 2. Render Configuration
Deploy using the provided `render-auto-merge.yaml`:

```bash
# Deploy to Render
render deploy --config render-auto-merge.yaml
```

### 3. MCP Server Setup
Install MCP dependencies:

```bash
pip install mcp
```

### 4. Test the System
```bash
# Test auto-merge locally
python scripts/auto_merge_edits.py

# Test MCP integration
python scripts/mcp_github_render_integration.py
```

## How It Works

### Autonomous Loop Flow:

1. **Detection**: GitHub Actions monitors `lab7-edits/` for changes
2. **Processing**: Auto-merge script processes v1 → v2 → v3 sequentially
3. **Integration**: MCP server orchestrates the merge operations
4. **Deployment**: Changes are automatically deployed to Render
5. **Monitoring**: System logs all operations for debugging

### Key Features:

- ✅ **Sequential Processing**: v1 → v2 → v3 order maintained
- ✅ **Conflict Resolution**: Automatic handling of file conflicts
- ✅ **Logging**: Complete audit trail of all operations
- ✅ **Error Handling**: Graceful failure recovery
- ✅ **Badge Updates**: Automatic README badge generation
- ✅ **API Generation**: Dynamic API endpoint creation

## Usage

### Manual Trigger
```bash
# Trigger merge manually
python scripts/auto_merge_edits.py

# Check status via MCP
python scripts/mcp_github_render_integration.py
```

### GitHub Actions
The workflow runs automatically on:
- Push to `lab7-edits/` paths
- Every 5 minutes (cron schedule)
- Manual workflow dispatch

### Render Cron
Render cron job runs every 5 minutes to ensure continuous processing.

## Monitoring

### Logs Location:
- `logs/merge_history.jsonl` - Merge operation history
- `logs/mcp_operations.jsonl` - MCP operation logs
- GitHub Actions logs - Workflow execution logs

### Health Checks:
```bash
# Check system health
curl https://your-render-app.onrender.com/health

# Check MCP status
python scripts/mcp_github_render_integration.py
```

## Troubleshooting

### Common Issues:

1. **Merge Conflicts**: Check `logs/merge_history.jsonl` for details
2. **Permission Errors**: Verify GitHub token permissions
3. **Render Deploy Failures**: Check Render API token and logs
4. **MCP Connection Issues**: Verify MCP server is running

### Debug Commands:
```bash
# Check available edits
ls -la lab7-edits/*/

# View merge logs
tail -f logs/merge_history.jsonl

# Test individual components
python scripts/auto_merge_edits.py --dry-run
```

## Customization

### Modify Schedule:
Edit `.github/workflows/auto-merge-edits.yml`:
```yaml
schedule:
  - cron: '*/10 * * * *'  # Every 10 minutes instead of 5
```

### Add New Pack Types:
Extend `scripts/auto_merge_edits.py`:
```python
def merge_custom_pack(self, pack_dir, version):
    # Add custom pack processing logic
    pass
```

### Custom MCP Operations:
Add new operations to `scripts/mcp_github_render_integration.py`:
```python
async def custom_operation(self):
    # Add custom MCP operation
    pass
```

## Security Notes

- GitHub tokens should have minimal required permissions
- Render API tokens should be scoped to specific services
- All operations are logged for audit purposes
- No sensitive data should be stored in `lab7-edits/` folders

---

🎉 **You're all set!** The autonomous merge loop will now process your `lab7-edits` folders automatically!

