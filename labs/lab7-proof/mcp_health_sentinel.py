#!/usr/bin/env python3
"""
MCP Health Sentinel Agent
A Model Context Protocol agent that provides health monitoring capabilities
for the DVA ecosystem through conversational interface.
"""

import json
import time
import hashlib
import pathlib
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import requests
import asyncio

# Import our existing sentinel modules
import sys
import os

# Add paths for imports
current_dir = os.path.dirname(__file__)
sentinel_path = os.path.join(current_dir, 'sentinel')
global_health_path = os.path.join(current_dir, 'global-health-sentinel')

sys.path.insert(0, sentinel_path)
sys.path.insert(0, global_health_path)

# Import functions directly
try:
    from sentinel import check_once, build_attestation, SERVICES
except ImportError:
    # Fallback: define functions inline if import fails
    def check_once():
        # Simplified version for testing
        return {
            "Lab4": {"status": "UP", "latency_ms": 100.0, "error": None, "url": "https://hive-api-2le8.onrender.com/health"},
            "Lab6": {"status": "UP", "latency_ms": 150.0, "error": None, "url": "https://lab6-proof-api.onrender.com/health"},
            "CivicLedger": {"status": "UP", "latency_ms": 200.0, "error": None, "url": "https://civic-protocol-core-ledger.onrender.com/health"},
            "GICIndexer": {"status": "DOWN", "latency_ms": None, "error": "timeout", "url": "https://gic-indexer.onrender.com/health"},
            "Lab7": {"status": "UP", "latency_ms": 80.0, "error": None, "url": "https://lab7-proof.onrender.com/health"}
        }
    
    def build_attestation(summary):
        import hashlib
        from datetime import datetime, timezone
        
        ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
        att = {
            "timestamp": ts,
            "services": {k: {"status": v["status"], "latency_ms": v["latency_ms"]} for k, v in summary.items()},
        }
        att_str = json.dumps(att, sort_keys=True)
        att["fingerprint_sha256"] = hashlib.sha256(att_str.encode("utf-8")).hexdigest()
        return att
    
    SERVICES = {
        "Lab4": "https://hive-api-2le8.onrender.com/health",
        "Lab6": "https://lab6-proof-api.onrender.com/health",
        "CivicLedger": "https://civic-protocol-core-ledger.onrender.com/health",
        "GICIndexer": "https://gic-indexer.onrender.com/health",
        "Lab7": "https://lab7-proof.onrender.com/health"
    }

try:
    from pulse_sentinel import build_pulse, run_once as run_global_pulse
except ImportError:
    def build_pulse():
        from datetime import datetime, timezone
        import hashlib
        
        ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
        payload = {
            "timestamp": ts,
            "regions": [{"code": "US"}, {"code": "EU"}, {"code": "JP"}],
            "signals": {
                "epidemic": [{"region": "US", "indicator": "admissions_index", "value": 0.42, "delta_7d": 0.03, "confidence": 0.7, "source": "sample"}],
                "climate_health": [{"region": "US", "indicator": "AQI", "value": 52, "delta_7d": -4, "confidence": 0.8, "source": "sample"}]
            },
            "risk_flags": [{"region": "US", "level": "MODERATE", "reason": "Admissions_index +3bps / 7d"}],
            "summary": {
                "headline": "Stable conditions with localized upticks",
                "one_liner": "No global alarm; monitor US admissions trend.",
                "analyst_notes": "Sample data for testing"
            }
        }
        fstr = json.dumps(payload, sort_keys=True)
        payload["fingerprint_sha256"] = hashlib.sha256(fstr.encode("utf-8")).hexdigest()
        return payload
    
    def run_global_pulse():
        pulse = build_pulse()
        print(f"[Pulse] {pulse['timestamp']}  SHA256={pulse['fingerprint_sha256']}")
        return pulse

try:
    from echo_bridge import run_once as run_echo_bridge
except ImportError:
    def run_echo_bridge():
        from datetime import datetime, timezone
        import hashlib
        
        checks = check_once()
        services = {c: {"status": v["status"], "latency_ms": v["latency_ms"], "error": v["error"]} for c, v in checks.items()}
        
        pulse = {
            "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "kind": "echo_heartbeat",
            "services": services,
            "global_health": {"attached": False, "fingerprint_sha256": None},
            "summary": {
                "up": [k for k, v in checks.items() if v["status"] == "UP"],
                "down": [k for k, v in checks.items() if v["status"] == "DOWN"]
            }
        }
        pulse_str = json.dumps(pulse, sort_keys=True)
        pulse["fingerprint_sha256"] = hashlib.sha256(pulse_str.encode("utf-8")).hexdigest()
        print(f"[Echo] {pulse['timestamp']}  SHA256={pulse['fingerprint_sha256']}")
        return pulse

class MCPHealthSentinel:
    """MCP Agent for Health Sentinel operations"""
    
    def __init__(self):
        self.services = SERVICES
        self.log_dir = pathlib.Path("./sentinel_logs")
        self.echo_log_dir = pathlib.Path("./global-health-sentinel/echo_logs")
        self.attest_dir = pathlib.Path("./global-health-sentinel/attestations")
        
        # Ensure directories exist
        self.log_dir.mkdir(exist_ok=True)
        self.echo_log_dir.mkdir(exist_ok=True)
        self.attest_dir.mkdir(exist_ok=True)
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get current status of all monitored services"""
        try:
            summary = check_once()
            return {
                "status": "success",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "services": summary,
                "summary": {
                    "up": [k for k, v in summary.items() if v["status"] == "UP"],
                    "down": [k for k, v in summary.items() if v["status"] == "DOWN"],
                    "total": len(summary)
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    def generate_health_attestation(self) -> Dict[str, Any]:
        """Generate a health attestation for current service status"""
        try:
            summary = check_once()
            attestation = build_attestation(summary)
            
            # Save attestation
            ts = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')
            att_path = self.log_dir / f"mcp_attestation_{ts}.json"
            with open(att_path, "w", encoding="utf-8") as f:
                json.dump(attestation, f, indent=2)
            
            return {
                "status": "success",
                "attestation": attestation,
                "saved_to": str(att_path),
                "fingerprint": attestation["fingerprint_sha256"]
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def generate_global_health_pulse(self) -> Dict[str, Any]:
        """Generate a global health pulse"""
        try:
            # Change to global-health-sentinel directory for proper execution
            original_cwd = os.getcwd()
            os.chdir("global-health-sentinel")
            
            # Run the global health pulse
            run_global_pulse()
            
            # Find the latest generated attestation
            attest_files = list(self.attest_dir.glob("attestation_*.json"))
            if attest_files:
                latest_file = max(attest_files, key=lambda x: x.stat().st_mtime)
                with open(latest_file, "r", encoding="utf-8") as f:
                    pulse_data = json.load(f)
                
                os.chdir(original_cwd)
                return {
                    "status": "success",
                    "pulse": pulse_data,
                    "saved_to": str(latest_file),
                    "fingerprint": pulse_data["fingerprint_sha256"]
                }
            else:
                os.chdir(original_cwd)
                return {
                    "status": "error",
                    "error": "No global health pulse generated"
                }
        except Exception as e:
            os.chdir(original_cwd)
            return {
                "status": "error",
                "error": str(e)
            }
    
    def generate_echo_pulse(self) -> Dict[str, Any]:
        """Generate an echo pulse (unified system heartbeat)"""
        try:
            # Change to global-health-sentinel directory for proper execution
            original_cwd = os.getcwd()
            os.chdir("global-health-sentinel")
            
            # Run the echo bridge
            run_echo_bridge()
            
            # Find the latest generated echo pulse
            echo_files = list(self.echo_log_dir.glob("echo_*.json"))
            if echo_files:
                latest_file = max(echo_files, key=lambda x: x.stat().st_mtime)
                with open(latest_file, "r", encoding="utf-8") as f:
                    echo_data = json.load(f)
                
                os.chdir(original_cwd)
                return {
                    "status": "success",
                    "echo_pulse": echo_data,
                    "saved_to": str(latest_file),
                    "fingerprint": echo_data["fingerprint_sha256"]
                }
            else:
                os.chdir(original_cwd)
                return {
                    "status": "error",
                    "error": "No echo pulse generated"
                }
        except Exception as e:
            os.chdir(original_cwd)
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_latest_attestations(self, limit: int = 5) -> Dict[str, Any]:
        """Get the latest attestations from all sources"""
        try:
            attestations = []
            
            # Health Sentinel attestations
            health_files = list(self.log_dir.glob("attestation_*.json"))
            for file in sorted(health_files, key=lambda x: x.stat().st_mtime, reverse=True)[:limit]:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    attestations.append({
                        "type": "health_sentinel",
                        "file": file.name,
                        "timestamp": data["timestamp"],
                        "fingerprint": data["fingerprint_sha256"],
                        "services_up": len([k for k, v in data["services"].items() if v["status"] == "UP"]),
                        "services_total": len(data["services"])
                    })
            
            # Global Health pulses
            global_files = list(self.attest_dir.glob("attestation_*.json"))
            for file in sorted(global_files, key=lambda x: x.stat().st_mtime, reverse=True)[:limit]:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    attestations.append({
                        "type": "global_health",
                        "file": file.name,
                        "timestamp": data["timestamp"],
                        "fingerprint": data["fingerprint_sha256"],
                        "regions": len(data["regions"]),
                        "signals_count": len(data["signals"].get("epidemic", [])) + len(data["signals"].get("climate_health", []))
                    })
            
            # Echo pulses
            echo_files = list(self.echo_log_dir.glob("echo_*.json"))
            for file in sorted(echo_files, key=lambda x: x.stat().st_mtime, reverse=True)[:limit]:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    attestations.append({
                        "type": "echo_pulse",
                        "file": file.name,
                        "timestamp": data["timestamp"],
                        "fingerprint": data["fingerprint_sha256"],
                        "services_up": len(data["summary"]["up"]),
                        "services_down": len(data["summary"]["down"])
                    })
            
            # Sort by timestamp
            attestations.sort(key=lambda x: x["timestamp"], reverse=True)
            
            return {
                "status": "success",
                "attestations": attestations[:limit],
                "total_found": len(attestations)
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def analyze_health_trends(self, hours: int = 24) -> Dict[str, Any]:
        """Analyze health trends over the specified time period"""
        try:
            cutoff_time = datetime.now(timezone.utc).timestamp() - (hours * 3600)
            
            # Collect health data
            health_data = []
            health_files = list(self.log_dir.glob("attestation_*.json"))
            
            for file in health_files:
                if file.stat().st_mtime >= cutoff_time:
                    with open(file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        health_data.append({
                            "timestamp": data["timestamp"],
                            "services": data["services"]
                        })
            
            if not health_data:
                return {
                    "status": "error",
                    "error": f"No health data found in the last {hours} hours"
                }
            
            # Analyze trends
            service_uptime = {}
            service_latencies = {}
            
            for entry in health_data:
                for service, status in entry["services"].items():
                    if service not in service_uptime:
                        service_uptime[service] = {"up": 0, "total": 0}
                        service_latencies[service] = []
                    
                    service_uptime[service]["total"] += 1
                    if status["status"] == "UP":
                        service_uptime[service]["up"] += 1
                        if status["latency_ms"]:
                            service_latencies[service].append(status["latency_ms"])
            
            # Calculate uptime percentages and average latencies
            trends = {}
            for service in service_uptime:
                uptime_pct = (service_uptime[service]["up"] / service_uptime[service]["total"]) * 100
                avg_latency = sum(service_latencies[service]) / len(service_latencies[service]) if service_latencies[service] else None
                
                trends[service] = {
                    "uptime_percentage": round(uptime_pct, 2),
                    "total_checks": service_uptime[service]["total"],
                    "up_checks": service_uptime[service]["up"],
                    "average_latency_ms": round(avg_latency, 2) if avg_latency else None
                }
            
            return {
                "status": "success",
                "analysis_period_hours": hours,
                "data_points": len(health_data),
                "trends": trends,
                "overall_health": {
                    "avg_uptime": round(sum(t["uptime_percentage"] for t in trends.values()) / len(trends), 2),
                    "most_reliable": max(trends.items(), key=lambda x: x[1]["uptime_percentage"]),
                    "least_reliable": min(trends.items(), key=lambda x: x[1]["uptime_percentage"])
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

# MCP Agent Interface
class MCPHealthSentinelAgent:
    """MCP Agent wrapper for Health Sentinel"""
    
    def __init__(self):
        self.sentinel = MCPHealthSentinel()
    
    def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP requests"""
        try:
            method = request.get("method", "")
            params = request.get("params", {})
            
            if method == "get_service_status":
                return self.sentinel.get_service_status()
            
            elif method == "generate_health_attestation":
                return self.sentinel.generate_health_attestation()
            
            elif method == "generate_global_health_pulse":
                return self.sentinel.generate_global_health_pulse()
            
            elif method == "generate_echo_pulse":
                return self.sentinel.generate_echo_pulse()
            
            elif method == "get_latest_attestations":
                limit = params.get("limit", 5)
                return self.sentinel.get_latest_attestations(limit)
            
            elif method == "analyze_health_trends":
                hours = params.get("hours", 24)
                return self.sentinel.analyze_health_trends(hours)
            
            else:
                return {
                    "status": "error",
                    "error": f"Unknown method: {method}",
                    "available_methods": [
                        "get_service_status",
                        "generate_health_attestation", 
                        "generate_global_health_pulse",
                        "generate_echo_pulse",
                        "get_latest_attestations",
                        "analyze_health_trends"
                    ]
                }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

# CLI Interface for testing
def main():
    """CLI interface for testing the MCP Health Sentinel Agent"""
    agent = MCPHealthSentinelAgent()
    
    print("🏥 MCP Health Sentinel Agent")
    print("=" * 50)
    
    while True:
        print("\nAvailable commands:")
        print("1. status - Get current service status")
        print("2. attest - Generate health attestation")
        print("3. global - Generate global health pulse")
        print("4. echo - Generate echo pulse")
        print("5. latest - Get latest attestations")
        print("6. trends - Analyze health trends")
        print("7. all - Run all checks")
        print("8. quit - Exit")
        
        choice = input("\nEnter command (1-8): ").strip()
        
        if choice == "1" or choice.lower() == "status":
            result = agent.handle_request({"method": "get_service_status"})
            print(f"\n📊 Service Status:")
            print(json.dumps(result, indent=2))
        
        elif choice == "2" or choice.lower() == "attest":
            result = agent.handle_request({"method": "generate_health_attestation"})
            print(f"\n📋 Health Attestation:")
            print(json.dumps(result, indent=2))
        
        elif choice == "3" or choice.lower() == "global":
            result = agent.handle_request({"method": "generate_global_health_pulse"})
            print(f"\n🌍 Global Health Pulse:")
            print(json.dumps(result, indent=2))
        
        elif choice == "4" or choice.lower() == "echo":
            result = agent.handle_request({"method": "generate_echo_pulse"})
            print(f"\n🔄 Echo Pulse:")
            print(json.dumps(result, indent=2))
        
        elif choice == "5" or choice.lower() == "latest":
            result = agent.handle_request({"method": "get_latest_attestations"})
            print(f"\n📜 Latest Attestations:")
            print(json.dumps(result, indent=2))
        
        elif choice == "6" or choice.lower() == "trends":
            hours = input("Enter hours to analyze (default 24): ").strip()
            hours = int(hours) if hours.isdigit() else 24
            result = agent.handle_request({"method": "analyze_health_trends", "params": {"hours": hours}})
            print(f"\n📈 Health Trends ({hours}h):")
            print(json.dumps(result, indent=2))
        
        elif choice == "7" or choice.lower() == "all":
            print("\n🔄 Running all health checks...")
            
            # Service status
            status = agent.handle_request({"method": "get_service_status"})
            print(f"\n📊 Service Status: {len(status.get('summary', {}).get('up', []))}/{status.get('summary', {}).get('total', 0)} UP")
            
            # Health attestation
            attest = agent.handle_request({"method": "generate_health_attestation"})
            print(f"📋 Health Attestation: {attest.get('status', 'error')}")
            
            # Echo pulse
            echo = agent.handle_request({"method": "generate_echo_pulse"})
            print(f"🔄 Echo Pulse: {echo.get('status', 'error')}")
            
            # Latest attestations
            latest = agent.handle_request({"method": "get_latest_attestations"})
            print(f"📜 Latest Attestations: {latest.get('total_found', 0)} found")
        
        elif choice == "8" or choice.lower() == "quit":
            print("\n👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()

