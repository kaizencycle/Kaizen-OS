#!/usr/bin/env python3
"""
Test script to verify both requirements.txt files work
"""
import os
import subprocess
import sys
from pathlib import Path

def test_requirements_file(file_path):
    """Test a requirements.txt file"""
    print(f"\n=== Testing {file_path} ===")
    
    if not Path(file_path).exists():
        print(f"ERROR: {file_path} not found!")
        return False
    
    print(f"SUCCESS: {file_path} exists")
    
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', file_path, '--dry-run'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print(f"SUCCESS: {file_path} parses successfully")
            return True
        else:
            print(f"ERROR: {file_path} failed to parse: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"ERROR: Error testing {file_path}: {e}")
        return False

def main():
    print("Testing all requirements.txt files...")
    
    files_to_test = [
        "requirements.txt",
        "app/requirements.txt",
        "requirements_simple.txt"
    ]
    
    results = []
    for file_path in files_to_test:
        results.append(test_requirements_file(file_path))
    
    print(f"\n=== Summary ===")
    print(f"Root requirements.txt: {'SUCCESS' if results[0] else 'FAILED'}")
    print(f"App requirements.txt: {'SUCCESS' if results[1] else 'FAILED'}")
    print(f"Simple requirements.txt: {'SUCCESS' if results[2] else 'FAILED'}")
    
    success_count = sum(results)
    print(f"\n{success_count}/{len(results)} files working")
    
    return success_count > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

