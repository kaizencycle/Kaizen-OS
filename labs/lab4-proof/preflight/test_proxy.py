#!/usr/bin/env python3
"""Test script for the preflight proxy."""

import requests
import json

PROXY_URL = "http://127.0.0.1:8999"

def test_valid_json():
    """Test with valid JSON."""
    print("=== Testing Valid JSON ===")
    data = {
        "date": "2025-09-21",
        "time": "12:45:00",
        "intent": "test valid json",
        "meta": {}
    }
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

def test_malformed_json():
    """Test with malformed JSON (single quotes)."""
    print("\n=== Testing Malformed JSON (Single Quotes) ===")
    malformed = "{'date': '2025-09-21', 'time': '12:45:00', 'intent': 'test malformed', 'meta': {}}"
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", data=malformed, headers={"Content-Type": "application/json"})
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

def test_missing_fields():
    """Test with missing required fields."""
    print("\n=== Testing Missing Fields ===")
    data = {
        "date": "2025-09-21",
        "intent": "test missing time"
        # missing time and meta
    }
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

def test_trailing_comma():
    """Test with trailing comma."""
    print("\n=== Testing Trailing Comma ===")
    malformed = '{"date": "2025-09-21", "time": "12:45:00", "intent": "test trailing comma", "meta": {},}'
    
    try:
        response = requests.post(f"{PROXY_URL}/seed", data=malformed, headers={"Content-Type": "application/json"})
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_valid_json()
    test_malformed_json()
    test_missing_fields()
    test_trailing_comma()
