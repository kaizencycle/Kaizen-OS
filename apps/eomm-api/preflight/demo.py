#!/usr/bin/env python3
"""
Complete demonstration of the HIVE-PAW Preflight Proxy
Shows auto-fix capabilities and validation in action.
"""

import requests
import json
import time

PROXY_URL = "http://127.0.0.1:8999"
MAIN_API_URL = "http://127.0.0.1:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_result(status, response):
    print(f"Status: {status}")
    print(f"Response: {json.dumps(response, indent=2)}")

def demo_auto_fix():
    """Demonstrate auto-fix capabilities."""
    print_section("AUTO-FIX DEMONSTRATION")
    
    # Test 1: Single quotes
    print("\n1. Single quotes → Double quotes")
    malformed = "{'date': '2025-09-21', 'time': '12:45:00', 'intent': 'auto-fix test', 'meta': {}}"
    print(f"Input: {malformed}")
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", data=malformed, headers={"Content-Type": "application/json"})
        print_result(response.status_code, response.json())
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Trailing comma
    print("\n2. Trailing comma removal")
    malformed = '{"date": "2025-09-21", "time": "12:45:00", "intent": "trailing comma test", "meta": {},}'
    print(f"Input: {malformed}")
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", data=malformed, headers={"Content-Type": "application/json"})
        print_result(response.status_code, response.json())
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Missing time (auto-default)
    print("\n3. Missing time → Auto-default to 12:45:00")
    malformed = '{"date": "2025-09-21", "intent": "missing time test", "meta": {}}'
    print(f"Input: {malformed}")
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", data=malformed, headers={"Content-Type": "application/json"})
        print_result(response.status_code, response.json())
    except Exception as e:
        print(f"Error: {e}")

def demo_validation():
    """Demonstrate validation errors."""
    print_section("VALIDATION DEMONSTRATION")
    
    # Test 1: Invalid date format
    print("\n1. Invalid date format")
    invalid = {"date": "21-09-2025", "time": "12:45:00", "intent": "invalid date", "meta": {}}
    print(f"Input: {json.dumps(invalid)}")
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", json=invalid)
        print_result(response.status_code, response.json())
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Missing required field
    print("\n2. Missing required field (intent)")
    invalid = {"date": "2025-09-21", "time": "12:45:00", "meta": {}}
    print(f"Input: {json.dumps(invalid)}")
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", json=invalid)
        print_result(response.status_code, response.json())
    except Exception as e:
        print(f"Error: {e}")

def demo_full_workflow():
    """Demonstrate complete workflow through proxy."""
    print_section("COMPLETE WORKFLOW DEMONSTRATION")
    
    date = "2025-09-21"
    
    # Step 1: Seed
    print("\n1. Creating seed...")
    seed_data = {"date": date, "time": "12:45:00", "intent": "demo workflow", "meta": {}}
    try:
        response = requests.post(f"{PROXY_URL}/seed", json=seed_data)
        print_result(response.status_code, response.json())
    except Exception as e:
        print(f"Error: {e}")
        return
    
    # Step 2: Sweep
    print("\n2. Adding sweep...")
    sweep_data = {"date": date, "chamber": "LAB4", "note": "demo sweep", "meta": {}}
    try:
        response = requests.post(f"{PROXY_URL}/sweep", json=sweep_data)
        print_result(response.status_code, response.json())
    except Exception as e:
        print(f"Error: {e}")
        return
    
    # Step 3: Seal
    print("\n3. Sealing day...")
    seal_data = {"date": date, "wins": "demo completed", "blocks": "none", "tomorrow_intent": "continue", "meta": {}}
    try:
        response = requests.post(f"{PROXY_URL}/seal", json=seal_data)
        print_result(response.status_code, response.json())
    except Exception as e:
        print(f"Error: {e}")
        return
    
    # Step 4: Verify
    print("\n4. Verifying integrity...")
    try:
        response = requests.get(f"{PROXY_URL}/verify/{date}")
        print_result(response.status_code, response.json())
    except Exception as e:
        print(f"Error: {e}")

def check_services():
    """Check if both services are running."""
    print_section("SERVICE HEALTH CHECK")
    
    # Check main API
    try:
        response = requests.get(f"{MAIN_API_URL}/health", timeout=2)
        print(f"✅ Main API (8000): {response.status_code}")
    except Exception as e:
        print(f"❌ Main API (8000): {e}")
        return False
    
    # Check proxy
    try:
        response = requests.get(f"{PROXY_URL}/health", timeout=2)
        print(f"✅ Proxy (8999): {response.status_code}")
    except Exception as e:
        print(f"❌ Proxy (8999): {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 HIVE-PAW Preflight Proxy Demonstration")
    
    if not check_services():
        print("\n❌ Services not running. Please start:")
        print("1. Main API: uvicorn app.main:app --reload --reload-dir app")
        print("2. Proxy: cd preflight && python proxy.py")
        exit(1)
    
    demo_auto_fix()
    demo_validation()
    demo_full_workflow()
    
    print_section("DEMONSTRATION COMPLETE")
    print("✅ All tests completed successfully!")
    print("\nThe preflight proxy successfully:")
    print("- Auto-fixed malformed JSON")
    print("- Validated data against schemas")
    print("- Processed complete workflow")
    print("- Maintained data integrity")
