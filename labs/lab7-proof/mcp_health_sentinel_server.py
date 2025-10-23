#!/usr/bin/env python3
"""
MCP Health Sentinel Server
A Model Context Protocol server that provides health monitoring capabilities
for the DVA ecosystem through MCP protocol.
"""

import json
import asyncio
import sys
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

# Add current directory to path for imports
sys.path.append(os.path.dirname(__file__))

from mcp_health_sentinel import MCPHealthSentinelAgent

class MCPHealthSentinelServer:
    """MCP Server for Health Sentinel operations"""
    
    def __init__(self):
        self.agent = MCPHealthSentinelAgent()
        self.server_info = {
            "name": "health-sentinel",
            "version": "1.0.0",
            "description": "Health monitoring and attestation system for DVA ecosystem"
        }
    
    async def handle_initialize(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP initialize request"""
        return {
            "jsonrpc": "2.0",
            "id": request.get("id"),
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {
                        "listChanged": True
                    },
                    "resources": {
                        "subscribe": True,
                        "listChanged": True
                    }
                },
                "serverInfo": self.server_info
            }
        }
    
    async def handle_list_tools(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP list tools request"""
        tools = [
            {
                "name": "get_service_status",
                "description": "Get current status of all monitored DVA ecosystem services",
                "inputSchema": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "generate_health_attestation",
                "description": "Generate a verifiable health attestation for current service status",
                "inputSchema": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "generate_global_health_pulse",
                "description": "Generate a global health pulse with epidemic and climate signals",
                "inputSchema": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "generate_echo_pulse",
                "description": "Generate an echo pulse (unified system heartbeat)",
                "inputSchema": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "get_latest_attestations",
                "description": "Get the latest attestations from all sources",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "limit": {
                            "type": "integer",
                            "description": "Maximum number of attestations to return",
                            "default": 5
                        }
                    },
                    "required": []
                }
            },
            {
                "name": "analyze_health_trends",
                "description": "Analyze health trends over a specified time period",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "hours": {
                            "type": "integer",
                            "description": "Number of hours to analyze",
                            "default": 24
                        }
                    },
                    "required": []
                }
            }
        ]
        
        return {
            "jsonrpc": "2.0",
            "id": request.get("id"),
            "result": {
                "tools": tools
            }
        }
    
    async def handle_call_tool(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP call tool request"""
        try:
            params = request.get("params", {})
            tool_name = params.get("name", "")
            arguments = params.get("arguments", {})
            
            # Create internal request format
            internal_request = {
                "method": tool_name,
                "params": arguments
            }
            
            # Call the agent
            result = self.agent.handle_request(internal_request)
            
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(result, indent=2)
                        }
                    ],
                    "isError": result.get("status") == "error"
                }
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "error": {
                    "code": -32603,
                    "message": f"Internal error: {str(e)}"
                }
            }
    
    async def handle_list_resources(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP list resources request"""
        resources = [
            {
                "uri": "health://status",
                "name": "Service Status",
                "description": "Current status of all monitored services",
                "mimeType": "application/json"
            },
            {
                "uri": "health://attestations",
                "name": "Health Attestations",
                "description": "Latest health attestations",
                "mimeType": "application/json"
            },
            {
                "uri": "health://echo-pulses",
                "name": "Echo Pulses",
                "description": "Latest echo pulses (unified system heartbeat)",
                "mimeType": "application/json"
            },
            {
                "uri": "health://global-pulses",
                "name": "Global Health Pulses",
                "description": "Latest global health pulses",
                "mimeType": "application/json"
            }
        ]
        
        return {
            "jsonrpc": "2.0",
            "id": request.get("id"),
            "result": {
                "resources": resources
            }
        }
    
    async def handle_read_resource(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP read resource request"""
        try:
            params = request.get("params", {})
            uri = params.get("uri", "")
            
            if uri == "health://status":
                result = self.agent.handle_request({"method": "get_service_status"})
            elif uri == "health://attestations":
                result = self.agent.handle_request({"method": "get_latest_attestations", "params": {"limit": 10}})
            elif uri == "health://echo-pulses":
                result = self.agent.handle_request({"method": "generate_echo_pulse"})
            elif uri == "health://global-pulses":
                result = self.agent.handle_request({"method": "generate_global_health_pulse"})
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "error": {
                        "code": -32602,
                        "message": f"Unknown resource: {uri}"
                    }
                }
            
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "result": {
                    "contents": [
                        {
                            "uri": uri,
                            "mimeType": "application/json",
                            "text": json.dumps(result, indent=2)
                        }
                    ]
                }
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "error": {
                    "code": -32603,
                    "message": f"Internal error: {str(e)}"
                }
            }
    
    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP requests"""
        method = request.get("method", "")
        
        if method == "initialize":
            return await self.handle_initialize(request)
        elif method == "tools/list":
            return await self.handle_list_tools(request)
        elif method == "tools/call":
            return await self.handle_call_tool(request)
        elif method == "resources/list":
            return await self.handle_list_resources(request)
        elif method == "resources/read":
            return await self.handle_read_resource(request)
        else:
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "error": {
                    "code": -32601,
                    "message": f"Method not found: {method}"
                }
            }

async def main():
    """Main MCP server loop"""
    server = MCPHealthSentinelServer()
    
    print("🏥 MCP Health Sentinel Server Starting...", file=sys.stderr)
    print("Available tools: get_service_status, generate_health_attestation, generate_global_health_pulse, generate_echo_pulse, get_latest_attestations, analyze_health_trends", file=sys.stderr)
    
    while True:
        try:
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            if not line:
                break
            
            request = json.loads(line.strip())
            response = await server.handle_request(request)
            print(json.dumps(response))
            sys.stdout.flush()
        except json.JSONDecodeError:
            print(json.dumps({
                "jsonrpc": "2.0",
                "id": None,
                "error": {
                    "code": -32700,
                    "message": "Parse error"
                }
            }))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({
                "jsonrpc": "2.0",
                "id": None,
                "error": {
                    "code": -32603,
                    "message": f"Internal error: {str(e)}"
                }
            }))
            sys.stdout.flush()

if __name__ == "__main__":
    asyncio.run(main())
