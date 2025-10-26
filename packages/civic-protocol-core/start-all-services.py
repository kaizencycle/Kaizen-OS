#!/usr/bin/env python3
"""
Civic Protocol Core - Start All Services

This script starts all the Civic Protocol services:
- Civic Dev Node (port 5411)
- Shield (port 7000)
- GIC-Indexer (port 8000)

Run this to start the complete development environment.
"""

import subprocess
import time
import signal
import sys
import os
from threading import Thread

class ServiceManager:
    def __init__(self):
        self.processes = []
        self.running = True
        
    def start_service(self, name, command, port, cwd=None):
        """Start a service in a separate process"""
        print(f"Starting {name} on port {port}...")
        
        try:
            if cwd:
                process = subprocess.Popen(
                    command,
                    cwd=cwd,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
            else:
                process = subprocess.Popen(
                    command,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
            
            self.processes.append({
                'name': name,
                'process': process,
                'port': port,
                'command': command
            })
            
            print(f"✓ {name} started (PID: {process.pid})")
            return True
            
        except Exception as e:
            print(f"✗ Failed to start {name}: {e}")
            return False
    
    def start_all_services(self):
        """Start all Civic Protocol services"""
        print("=" * 60)
        print("Civic Protocol Core - Starting All Services")
        print("=" * 60)
        
        # Start Civic Dev Node
        success = self.start_service(
            "Civic Dev Node",
            "python sdk/python/devnode.py",
            5411
        )
        if not success:
            return False
        
        # Start Shield
        success = self.start_service(
            "Shield",
            "python app/main.py",
            7000,
            "lab6-proof"
        )
        if not success:
            return False
        
        # Start GIC-Indexer
        success = self.start_service(
            "GIC-Indexer",
            "python app/main.py",
            8000,
            "gic-indexer"
        )
        if not success:
            return False
        
        return True
    
    def monitor_services(self):
        """Monitor running services"""
        print("\n" + "=" * 60)
        print("Services Running - Press Ctrl+C to stop all")
        print("=" * 60)
        
        while self.running:
            time.sleep(5)
            
            # Check if any process has died
            for service in self.processes[:]:
                if service['process'].poll() is not None:
                    print(f"⚠ {service['name']} has stopped unexpectedly")
                    self.processes.remove(service)
            
            if not self.processes:
                print("All services have stopped")
                break
    
    def stop_all_services(self):
        """Stop all running services"""
        print("\nStopping all services...")
        self.running = False
        
        for service in self.processes:
            try:
                print(f"Stopping {service['name']}...")
                service['process'].terminate()
                service['process'].wait(timeout=5)
                print(f"✓ {service['name']} stopped")
            except subprocess.TimeoutExpired:
                print(f"Force killing {service['name']}...")
                service['process'].kill()
            except Exception as e:
                print(f"Error stopping {service['name']}: {e}")
        
        print("All services stopped")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print(f"\nReceived signal {signum}")
        self.stop_all_services()
        sys.exit(0)

def check_dependencies():
    """Check if required dependencies are installed"""
    print("Checking dependencies...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'httpx',
        'pydantic',
        'sqlitedict',
        'python-dateutil',
        'pyyaml'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"✗ Missing packages: {', '.join(missing_packages)}")
        print("Install with: pip install -r requirements.txt")
        return False
    
    print("✓ All dependencies available")
    return True

def main():
    """Main function"""
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create service manager
    manager = ServiceManager()
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, manager.signal_handler)
    signal.signal(signal.SIGTERM, manager.signal_handler)
    
    # Start all services
    if not manager.start_all_services():
        print("Failed to start all services")
        sys.exit(1)
    
    # Wait a moment for services to start
    print("\nWaiting for services to initialize...")
    time.sleep(3)
    
    # Show service URLs
    print("\n" + "=" * 60)
    print("Service URLs:")
    print("=" * 60)
    print("Civic Dev Node: http://localhost:5411")
    print("Shield:         http://localhost:7000")
    print("GIC-Indexer:    http://localhost:8000")
    print("\nAPI Documentation:")
    print("Civic Dev Node: http://localhost:5411/docs")
    print("Shield:         http://localhost:7000/docs")
    print("GIC-Indexer:    http://localhost:8000/docs")
    print("\nTest the integration:")
    print("python examples/full-integration-example.py")
    
    # Monitor services
    try:
        manager.monitor_services()
    except KeyboardInterrupt:
        manager.stop_all_services()

if __name__ == "__main__":
    main()

