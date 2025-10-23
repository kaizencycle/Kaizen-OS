# 🏥 MCP Health Sentinel Agent

A Model Context Protocol (MCP) agent that provides comprehensive health monitoring and attestation capabilities for the DVA ecosystem through conversational interface.

## 🌟 Features

- **Real-time Service Monitoring** - Track status of all DVA ecosystem services
- **Verifiable Attestations** - Generate SHA-256 signed health attestations
- **Global Health Pulses** - Monitor epidemic and climate health signals
- **Echo Bridge Integration** - Unified system heartbeat monitoring
- **Trend Analysis** - Analyze health patterns over time
- **MCP Protocol Support** - Compatible with MCP clients and servers

## 🚀 Quick Start

### 1. Test the Agent

```bash
# Test all functionality
python test_mcp_agent.py

# Interactive CLI interface
python mcp_health_sentinel.py
```

### 2. MCP Server Mode

```bash
# Start MCP server
python mcp_health_sentinel_server.py
```

### 3. MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "health-sentinel": {
      "command": "python",
      "args": ["mcp_health_sentinel_server.py"],
      "cwd": ".",
      "env": {
        "PYTHONPATH": "."
      }
    }
  }
}
```

## 🛠️ Available Tools

### 1. `get_service_status`
Get current status of all monitored DVA ecosystem services.

**Input:** None
**Output:** Service status with latency and error information

### 2. `generate_health_attestation`
Generate a verifiable health attestation for current service status.

**Input:** None
**Output:** SHA-256 signed attestation with fingerprint

### 3. `generate_global_health_pulse`
Generate a global health pulse with epidemic and climate signals.

**Input:** None
**Output:** Global health pulse with regional data and risk flags

### 4. `generate_echo_pulse`
Generate an echo pulse (unified system heartbeat).

**Input:** None
**Output:** Unified system status with all service health data

### 5. `get_latest_attestations`
Get the latest attestations from all sources.

**Input:** 
- `limit` (optional): Maximum number of attestations to return (default: 5)

**Output:** List of recent attestations with metadata

### 6. `analyze_health_trends`
Analyze health trends over a specified time period.

**Input:**
- `hours` (optional): Number of hours to analyze (default: 24)

**Output:** Uptime percentages, latency trends, and reliability analysis

## 📊 Available Resources

- `health://status` - Current service status
- `health://attestations` - Latest health attestations
- `health://echo-pulses` - Latest echo pulses
- `health://global-pulses` - Latest global health pulses

## 🔧 CLI Interface

The interactive CLI provides easy access to all functionality:

```
🏥 MCP Health Sentinel Agent
==================================================

Available commands:
1. status - Get current service status
2. attest - Generate health attestation
3. global - Generate global health pulse
4. echo - Generate echo pulse
5. latest - Get latest attestations
6. trends - Analyze health trends
7. all - Run all checks
8. quit - Exit
```

## 📈 Example Output

### Service Status
```json
{
  "status": "success",
  "timestamp": "2025-10-14T01:00:00+00:00",
  "services": {
    "Lab4": {"status": "UP", "latency_ms": 111.98, "error": null},
    "Lab6": {"status": "UP", "latency_ms": 176.25, "error": null},
    "CivicLedger": {"status": "UP", "latency_ms": 96.13, "error": null},
    "GICIndexer": {"status": "DOWN", "latency_ms": null, "error": "timeout"},
    "Lab7": {"status": "UP", "latency_ms": 81.68, "error": null}
  },
  "summary": {
    "up": ["Lab4", "Lab6", "CivicLedger", "Lab7"],
    "down": ["GICIndexer"],
    "total": 5
  }
}
```

### Health Attestation
```json
{
  "status": "success",
  "attestation": {
    "timestamp": "2025-10-14T01:00:00+00:00",
    "services": {...},
    "fingerprint_sha256": "8fc065d2b3cb67f3dbc0c94bd50a0a3193b4c45b80ff1d7154c21661b6abe39e"
  },
  "saved_to": "sentinel_logs/mcp_attestation_20251014T010000.json",
  "fingerprint": "8fc065d2b3cb67f3dbc0c94bd50a0a3193b4c45b80ff1d7154c21661b6abe39e"
}
```

### Trend Analysis
```json
{
  "status": "success",
  "analysis_period_hours": 24,
  "data_points": 288,
  "trends": {
    "Lab4": {
      "uptime_percentage": 95.83,
      "total_checks": 288,
      "up_checks": 276,
      "average_latency_ms": 125.45
    },
    "Lab7": {
      "uptime_percentage": 100.0,
      "total_checks": 288,
      "up_checks": 288,
      "average_latency_ms": 89.32
    }
  },
  "overall_health": {
    "avg_uptime": 97.92,
    "most_reliable": ["Lab7", {"uptime_percentage": 100.0}],
    "least_reliable": ["GICIndexer", {"uptime_percentage": 85.42}]
  }
}
```

## 🔗 Integration

### With MCP Clients
The agent can be integrated with any MCP-compatible client:

```python
# Example MCP client usage
import json
import subprocess

def call_health_sentinel(method, params=None):
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": f"tools/call",
        "params": {
            "name": method,
            "arguments": params or {}
        }
    }
    
    process = subprocess.Popen(
        ["python", "mcp_health_sentinel_server.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    
    stdout, _ = process.communicate(json.dumps(request))
    return json.loads(stdout)

# Usage
result = call_health_sentinel("get_service_status")
print(result)
```

### With Existing Health Sentinel
The MCP agent integrates seamlessly with the existing Health Sentinel system:
- Uses the same service monitoring logic
- Generates compatible attestations
- Shares log directories and data formats
- Maintains the same security and validation standards

## 🛡️ Security

- **Verifiable Attestations** - All attestations include SHA-256 fingerprints
- **Schema Validation** - Global health pulses validated against JSON schema
- **Policy Enforcement** - Citizen Shield pre-checks for data compliance
- **Safe Failure** - Invalid data is logged but not attested

## 📁 File Structure

```
mcp_health_sentinel.py          # Main MCP agent implementation
mcp_health_sentinel_server.py   # MCP server wrapper
mcp_health_sentinel_config.json # MCP client configuration
test_mcp_agent.py              # Test script
MCP_HEALTH_SENTINEL_README.md  # This documentation
```

## 🚀 Deployment

### Local Development
```bash
# Install dependencies
pip install requests

# Test the agent
python test_mcp_agent.py

# Run interactive CLI
python mcp_health_sentinel.py
```

### Production with MCP Client
1. Configure your MCP client with `mcp_health_sentinel_config.json`
2. Start the MCP server: `python mcp_health_sentinel_server.py`
3. Connect your MCP client to the server
4. Use the available tools and resources

## 🔍 Monitoring

The MCP Health Sentinel Agent provides comprehensive monitoring capabilities:

- **Real-time Status** - Current service health with latency metrics
- **Historical Analysis** - Trend analysis over configurable time periods
- **Attestation Tracking** - Verifiable records of all health checks
- **Alert Integration** - Compatible with existing alert systems
- **Resource Access** - MCP resources for programmatic access

## 🤝 Contributing

The MCP Health Sentinel Agent is part of the larger Health Sentinel system. To contribute:

1. Follow the existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Ensure MCP protocol compliance
5. Test with MCP clients

## 📄 License

Part of the Civic Ledger Protocol — Open Attribution License. All derivative works must attribute to *Michael Judan (Kaizen)* and the *Kaizen DVA Ecosystem*.
