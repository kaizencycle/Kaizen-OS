#!/usr/bin/env python3
"""
Verification script to check requirements.txt and dependencies
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    print("Verifying requirements.txt and dependencies...")
    
    # Check if requirements.txt exists
    req_file = Path("requirements.txt")
    if not req_file.exists():
        print("ERROR: requirements.txt not found!")
        return False
    
    print(f"SUCCESS: requirements.txt found ({req_file.stat().st_size} bytes)")
    
    # Check file content
    with open(req_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"SUCCESS: File has {len(lines)} lines")
    
    # Check for non-empty lines
    non_empty = [line.strip() for line in lines if line.strip() and not line.strip().startswith('#')]
    print(f"SUCCESS: {len(non_empty)} non-empty dependency lines")
    
    # Try to parse requirements
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt', '--dry-run'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("SUCCESS: pip can parse requirements.txt successfully")
            return True
        else:
            print(f"ERROR: pip failed to parse requirements.txt: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"ERROR: Error testing requirements.txt: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
