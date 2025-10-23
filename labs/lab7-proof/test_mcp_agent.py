#!/usr/bin/env python3
"""
Test script for MCP Health Sentinel Agent
"""

import json
import asyncio
from mcp_health_sentinel import MCPHealthSentinelAgent

async def test_mcp_agent():
    """Test the MCP Health Sentinel Agent"""
    agent = MCPHealthSentinelAgent()
    
    print("🏥 Testing MCP Health Sentinel Agent")
    print("=" * 50)
    
    # Test 1: Get service status
    print("\n1. Testing get_service_status...")
    result = agent.handle_request({"method": "get_service_status"})
    print(f"Status: {result.get('status')}")
    if result.get('status') == 'success':
        summary = result.get('summary', {})
        print(f"Services UP: {len(summary.get('up', []))}/{summary.get('total', 0)}")
        for service, status in result.get('services', {}).items():
            print(f"  {service}: {status['status']} ({status.get('latency_ms', 'N/A')} ms)")
    
    # Test 2: Generate health attestation
    print("\n2. Testing generate_health_attestation...")
    result = agent.handle_request({"method": "generate_health_attestation"})
    print(f"Status: {result.get('status')}")
    if result.get('status') == 'success':
        print(f"Fingerprint: {result.get('fingerprint', 'N/A')[:16]}...")
        print(f"Saved to: {result.get('saved_to', 'N/A')}")
    
    # Test 3: Generate echo pulse
    print("\n3. Testing generate_echo_pulse...")
    result = agent.handle_request({"method": "generate_echo_pulse"})
    print(f"Status: {result.get('status')}")
    if result.get('status') == 'success':
        echo_data = result.get('echo_pulse', {})
        summary = echo_data.get('summary', {})
        print(f"Services UP: {len(summary.get('up', []))}/{len(summary.get('up', [])) + len(summary.get('down', []))}")
        print(f"Fingerprint: {result.get('fingerprint', 'N/A')[:16]}...")
    
    # Test 4: Get latest attestations
    print("\n4. Testing get_latest_attestations...")
    result = agent.handle_request({"method": "get_latest_attestations", "params": {"limit": 3}})
    print(f"Status: {result.get('status')}")
    if result.get('status') == 'success':
        attestations = result.get('attestations', [])
        print(f"Found {len(attestations)} attestations:")
        for att in attestations[:3]:
            print(f"  {att['type']}: {att['timestamp']} ({att['fingerprint'][:16]}...)")
    
    # Test 5: Analyze health trends
    print("\n5. Testing analyze_health_trends...")
    result = agent.handle_request({"method": "analyze_health_trends", "params": {"hours": 1}})
    print(f"Status: {result.get('status')}")
    if result.get('status') == 'success':
        trends = result.get('trends', {})
        overall = result.get('overall_health', {})
        print(f"Overall uptime: {overall.get('avg_uptime', 'N/A')}%")
        print(f"Most reliable: {overall.get('most_reliable', ['N/A', {}])[0]}")
        print(f"Least reliable: {overall.get('least_reliable', ['N/A', {}])[0]}")
    
    print("\n✅ MCP Health Sentinel Agent tests completed!")

def test_cli_interface():
    """Test the CLI interface"""
    print("\n🖥️  Testing CLI Interface...")
    print("Run 'python mcp_health_sentinel.py' to test the interactive CLI")

if __name__ == "__main__":
    asyncio.run(test_mcp_agent())
    test_cli_interface()
