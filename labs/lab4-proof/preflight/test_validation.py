#!/usr/bin/env python3
"""Test validation errors in the preflight proxy."""

import requests
import json

PROXY_URL = "http://127.0.0.1:8000"

def test_invalid_date():
    """Test with invalid date format."""
    print("=== Testing Invalid Date Format ===")
    data = {
        "date": "21-09-2025",  # Wrong format
        "time": "12:45:00",
        "intent": "test invalid date",
        "meta": {}
    }
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def test_invalid_time():
    """Test with invalid time format."""
    print("\n=== Testing Invalid Time Format ===")
    data = {
        "date": "2025-09-21",
        "time": "12:45",  # Missing seconds
        "intent": "test invalid time",
        "meta": {}
    }
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def test_missing_required_field():
    """Test with missing required field."""
    print("\n=== Testing Missing Required Field ===")
    data = {
        "date": "2025-09-21",
        "time": "12:45:00"
        # missing intent
    }
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_invalid_date()
    test_invalid_time()
    test_missing_required_field()

