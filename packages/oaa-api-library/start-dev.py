#!/usr/bin/env python3
"""
Development startup script for OAA API Library
Starts both FastAPI backend and provides instructions for frontend
"""

import subprocess
import sys
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.11+"""
    if sys.version_info < (3, 11):
        print("ERROR: Python 3.11+ is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"OK: Python version: {sys.version.split()[0]}")
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("OK: Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to install dependencies: {e}")
        return False

def start_fastapi():
    """Start FastAPI development server"""
    print("Starting FastAPI development server...")
    print("Backend will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("Health Check: http://localhost:8000/health")
    print("\n" + "="*50)
    print("Press Ctrl+C to stop the server")
    print("="*50 + "\n")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        print("\nShutting down FastAPI server...")

def print_frontend_instructions():
    """Print instructions for starting the frontend"""
    print("\n" + "="*60)
    print("FRONTEND DEVELOPMENT")
    print("="*60)
    print("To start the Next.js frontend, open a new terminal and run:")
    print("  npm install")
    print("  npm run dev")
    print("\nThe frontend will be available at: http://localhost:3000")
    print("="*60 + "\n")

def main():
    """Main function"""
    print("OAA API Library - Development Server")
    print("="*50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Print frontend instructions
    print_frontend_instructions()
    
    # Start FastAPI
    start_fastapi()

if __name__ == "__main__":
    main()

