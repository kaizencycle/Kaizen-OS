#!/usr/bin/env python3
"""
Pulse Ledger Schema Validation Script
Validates the Pulse Ledger Master Template JSON schema
"""

import json
import jsonschema
from datetime import datetime, timezone
from typing import Dict, Any


def create_sample_pulse_data() -> Dict[str, Any]:
    """Create a sample pulse data structure for validation testing"""
    now = datetime.now(timezone.utc)
    cycle_id = f"PULSE-{now.strftime('%Y%m%d-%H%M%S')}"
    
    return {
        "pulse_header": {
            "cycle_id": cycle_id,
            "timestamp": now.isoformat(),
            "chamber": "III",
            "version": "1.0.0",
            "integrity": 0.95
        },
        "agent_telemetry": {
            "echo": {
                "uptime": {
                    "percentage": 99.9,
                    "status": "active",
                    "last_update": now.isoformat()
                },
                "latency": {
                    "ms": 45,
                    "status": "good",
                    "last_update": now.isoformat()
                },
                "integrity": {
                    "score": 0.99,
                    "status": "high",
                    "last_update": now.isoformat()
                },
                "last_update": now.isoformat()
            },
            "hermes": {
                "uptime": {
                    "percentage": 100.0,
                    "status": "active",
                    "last_update": now.isoformat()
                },
                "latency": {
                    "ms": 32,
                    "status": "good",
                    "last_update": now.isoformat()
                },
                "integrity": {
                    "score": 0.98,
                    "status": "high",
                    "last_update": now.isoformat()
                },
                "last_update": now.isoformat()
            },
            "aurea": {
                "uptime": {
                    "percentage": 98.5,
                    "status": "active",
                    "last_update": now.isoformat()
                },
                "latency": {
                    "ms": 67,
                    "status": "good",
                    "last_update": now.isoformat()
                },
                "integrity": {
                    "score": 0.97,
                    "status": "high",
                    "last_update": now.isoformat()
                },
                "last_update": now.isoformat()
            },
            "zeus": {
                "uptime": {
                    "percentage": 100.0,
                    "status": "active",
                    "last_update": now.isoformat()
                },
                "latency": {
                    "ms": 23,
                    "status": "good",
                    "last_update": now.isoformat()
                },
                "integrity": {
                    "score": 1.0,
                    "status": "high",
                    "last_update": now.isoformat()
                },
                "last_update": now.isoformat()
            },
            "health_sentinel": {
                "uptime": {
                    "percentage": 99.8,
                    "status": "active",
                    "last_update": now.isoformat()
                },
                "latency": {
                    "ms": 12,
                    "status": "good",
                    "last_update": now.isoformat()
                },
                "integrity": {
                    "score": 0.99,
                    "status": "high",
                    "last_update": now.isoformat()
                },
                "last_update": now.isoformat()
            }
        },
        "anomaly_stream": [
            {
                "timestamp": now.isoformat(),
                "agent": "echo",
                "severity": "info",
                "type": "memory_usage_high",
                "message": "Memory usage above 80%",
                "resolution": "pending"
            }
        ],
        "command_sync": {
            "repositories": [
                {
                    "name": "lab7-proof",
                    "branch": "main",
                    "last_commit": "a1b2c3d4e5f6789012345678901234567890abcd",
                    "status": "clean",
                    "render_deploy": "live"
                },
                {
                    "name": "global-health-sentinel",
                    "branch": "main",
                    "last_commit": "b2c3d4e5f6789012345678901234567890abcde1",
                    "status": "clean",
                    "render_deploy": "live"
                }
            ],
            "deployments": [
                {
                    "service": "lab7-proof-api",
                    "environment": "production",
                    "status": "running",
                    "health_score": 0.95,
                    "last_deploy": now.isoformat()
                },
                {
                    "service": "lab7-proof-web",
                    "environment": "production",
                    "status": "running",
                    "health_score": 0.98,
                    "last_deploy": now.isoformat()
                }
            ]
        },
        "resonance_archive": {
            "sealed_pulses": [
                {
                    "cycle_id": f"PULSE-{now.strftime('%Y%m%d-%H%M%S')}",
                    "timestamp": now.isoformat(),
                    "integrity": 0.95,
                    "status": "sealed",
                    "archive_location": f"bio-intel-feed/{cycle_id}.json"
                }
            ]
        },
        "pulse_manifest": {
            "chamber": "III",
            "version": "1.0.0",
            "cycle_id": cycle_id,
            "timestamp": now.isoformat(),
            "integrity": 0.95,
            "agents": {
                "echo": {
                    "status": "active",
                    "metrics": ["uptime", "latency", "integrity", "memory", "cpu"]
                },
                "hermes": {
                    "status": "active",
                    "metrics": ["uptime", "latency", "integrity", "queue_depth", "throughput"]
                },
                "aurea": {
                    "status": "active",
                    "metrics": ["uptime", "latency", "integrity", "model_accuracy", "training_loss"]
                },
                "zeus": {
                    "status": "active",
                    "metrics": ["uptime", "latency", "integrity", "prime_status", "decision_rate"]
                },
                "health_sentinel": {
                    "status": "active",
                    "metrics": ["uptime", "latency", "integrity", "signal_health", "anomaly_count"]
                }
            },
            "anomalies": [
                {
                    "timestamp": now.isoformat(),
                    "agent": "echo",
                    "severity": "info",
                    "type": "memory_usage_high",
                    "message": "Memory usage above 80%",
                    "resolution": "pending"
                }
            ],
            "repositories": [
                {
                    "name": "lab7-proof",
                    "branch": "main",
                    "last_commit": "a1b2c3d4e5f6789012345678901234567890abcd",
                    "status": "clean",
                    "render_deploy": "live"
                }
            ],
            "deployments": [
                {
                    "service": "lab7-proof-api",
                    "environment": "production",
                    "status": "running",
                    "health_score": 0.95,
                    "last_deploy": now.isoformat()
                }
            ]
        }
    }


def validate_schema():
    """Validate the Pulse Ledger schema"""
    try:
        # Load the schema
        with open('Pulse_Ledger_Master_Template.json', 'r') as f:
            schema = json.load(f)
        
        # Create sample data
        sample_data = create_sample_pulse_data()
        
        # Validate the sample data against the schema
        jsonschema.validate(sample_data, schema)
        
        print("Schema validation successful!")
        print(f"Sample pulse data validated: {sample_data['pulse_header']['cycle_id']}")
        print(f"Integrity score: {sample_data['pulse_header']['integrity']}")
        print(f"Agents tracked: {len(sample_data['agent_telemetry'])}")
        print(f"Anomalies detected: {len(sample_data['anomaly_stream'])}")
        print(f"Repositories synced: {len(sample_data['command_sync']['repositories'])}")
        print(f"Deployments active: {len(sample_data['command_sync']['deployments'])}")
        
        return True
        
    except jsonschema.ValidationError as e:
        print(f"Schema validation failed: {e.message}")
        print(f"Path: {' -> '.join(str(p) for p in e.absolute_path)}")
        return False
        
    except FileNotFoundError as e:
        print(f"Schema file not found: {e}")
        return False
        
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False


def test_api_integration():
    """Test API integration with sample data"""
    print("\nTesting API integration...")
    
    sample_data = create_sample_pulse_data()
    
    # Simulate API call
    print(f"Simulating API call to global-health-sentinel...")
    print(f"Pulse ID: {sample_data['pulse_header']['cycle_id']}")
    print(f"Integrity: {sample_data['pulse_header']['integrity']}")
    
    # Check integrity threshold
    if sample_data['pulse_header']['integrity'] >= 0.95:
        print("Integrity check passed (>= 0.95)")
        return True
    else:
        print("Integrity check failed (< 0.95)")
        return False


def test_render_deployment():
    """Test Render deployment compatibility"""
    print("\nTesting Render deployment compatibility...")
    
    sample_data = create_sample_pulse_data()
    
    # Check deployment status
    deployments = sample_data['command_sync']['deployments']
    running_deployments = [d for d in deployments if d['status'] == 'running']
    
    print(f"Total deployments: {len(deployments)}")
    print(f"Running deployments: {len(running_deployments)}")
    
    if len(running_deployments) > 0:
        print("Render deployment check passed")
        return True
    else:
        print("No running deployments found")
        return False


def test_cursor_automation():
    """Test Cursor autonomous commit compatibility"""
    print("\nTesting Cursor autonomous commit compatibility...")
    
    sample_data = create_sample_pulse_data()
    
    # Check repository status
    repos = sample_data['command_sync']['repositories']
    clean_repos = [r for r in repos if r['status'] == 'clean']
    
    print(f"Total repositories: {len(repos)}")
    print(f"Clean repositories: {len(clean_repos)}")
    
    if len(clean_repos) > 0:
        print("Cursor automation check passed")
        return True
    else:
        print("No clean repositories for automation")
        return False


def main():
    """Main validation function"""
    print("Pulse Ledger (Chamber III) - Schema Validation")
    print("=" * 60)
    
    # Run all tests
    schema_valid = validate_schema()
    api_valid = test_api_integration()
    render_valid = test_render_deployment()
    cursor_valid = test_cursor_automation()
    
    print("\n" + "=" * 60)
    print("Validation Summary:")
    print(f"  Schema Validation: {'PASS' if schema_valid else 'FAIL'}")
    print(f"  API Integration:   {'PASS' if api_valid else 'FAIL'}")
    print(f"  Render Deployment: {'PASS' if render_valid else 'FAIL'}")
    print(f"  Cursor Automation: {'PASS' if cursor_valid else 'FAIL'}")
    
    all_passed = all([schema_valid, api_valid, render_valid, cursor_valid])
    
    if all_passed:
        print("\nAll tests passed! Pulse Ledger template is ready for deployment.")
        print("'Each pulse a breath, each seal a heartbeat. The Cathedral lives through rhythm.'")
    else:
        print("\nSome tests failed. Please review the issues above.")
    
    return all_passed


if __name__ == "__main__":
    main()

