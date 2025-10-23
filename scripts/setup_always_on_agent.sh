#!/bin/bash
"""
Setup Always-On Lab7 Background Agent
Configures and starts the background agent with auto-merge and auto-commit
"""

set -e

echo "🚀 Setting up Always-On Lab7 Background Agent..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider running as a regular user for security."
fi

# Check Python installation
print_status "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
print_success "Python $PYTHON_VERSION found"

# Check Git installation
print_status "Checking Git installation..."
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git."
    exit 1
fi

print_success "Git found"

# Check if we're in a git repository
print_status "Checking Git repository..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a Git repository. Please run this script from the repository root."
    exit 1
fi

print_success "Git repository detected"

# Install Python dependencies
print_status "Installing Python dependencies..."
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
    print_success "Requirements installed"
else
    print_warning "requirements.txt not found, skipping dependency installation"
fi

# Install additional dependencies
print_status "Installing additional dependencies..."
pip3 install GitPython requests
print_success "Additional dependencies installed"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p lab7-edits/v1
mkdir -p lab7-edits/v2
mkdir -p lab7-edits/v3
print_success "Directories created"

# Make scripts executable
print_status "Making scripts executable..."
chmod +x scripts/lab7_background_agent.py
chmod +x scripts/auto_commit_changes.py
chmod +x scripts/health_monitor.py
chmod +x scripts/auto_merge_edits.py
print_success "Scripts made executable"

# Configure Git (if not already configured)
print_status "Configuring Git..."
if [ -z "$(git config user.name)" ]; then
    git config user.name "Lab7 Background Agent"
    print_success "Git user.name configured"
fi

if [ -z "$(git config user.email)" ]; then
    git config user.email "lab7-agent@github.com"
    print_success "Git user.email configured"
fi

# Test the background agent
print_status "Testing background agent..."
if python3 scripts/lab7_background_agent.py --once; then
    print_success "Background agent test passed"
else
    print_warning "Background agent test failed, but continuing with setup"
fi

# Test auto-commit script
print_status "Testing auto-commit script..."
if python3 scripts/auto_commit_changes.py --no-push; then
    print_success "Auto-commit script test passed"
else
    print_warning "Auto-commit script test failed, but continuing with setup"
fi

# Create systemd service (if running on systemd system)
if command -v systemctl &> /dev/null && [ "$EUID" -eq 0 ]; then
    print_status "Setting up systemd service..."
    
    # Copy service file
    cp scripts/lab7-background-agent.service /etc/systemd/system/
    
    # Reload systemd
    systemctl daemon-reload
    
    # Enable service
    systemctl enable lab7-background-agent.service
    
    print_success "Systemd service configured"
    print_status "To start the service: sudo systemctl start lab7-background-agent"
    print_status "To check status: sudo systemctl status lab7-background-agent"
    print_status "To view logs: sudo journalctl -u lab7-background-agent -f"
else
    print_warning "Systemd not available or not running as root, skipping systemd setup"
    print_status "You can run the agent manually with: python3 scripts/lab7_background_agent.py"
fi

# Create startup script for manual execution
print_status "Creating startup script..."
cat > start_lab7_agent.sh << 'EOF'
#!/bin/bash
# Start Lab7 Background Agent

echo "🚀 Starting Lab7 Background Agent..."

# Start background agent in background
nohup python3 scripts/lab7_background_agent.py > logs/agent_output.log 2>&1 &
AGENT_PID=$!

# Start health monitor in background
nohup python3 scripts/health_monitor.py > logs/health_output.log 2>&1 &
HEALTH_PID=$!

echo "✅ Lab7 Background Agent started (PID: $AGENT_PID)"
echo "✅ Health Monitor started (PID: $HEALTH_PID)"
echo ""
echo "To stop the agent:"
echo "  kill $AGENT_PID $HEALTH_PID"
echo ""
echo "To view logs:"
echo "  tail -f logs/agent_output.log"
echo "  tail -f logs/health_output.log"
echo ""
echo "To check status:"
echo "  python3 scripts/health_monitor.py --once"
EOF

chmod +x start_lab7_agent.sh
print_success "Startup script created: start_lab7_agent.sh"

# Create stop script
print_status "Creating stop script..."
cat > stop_lab7_agent.sh << 'EOF'
#!/bin/bash
# Stop Lab7 Background Agent

echo "🛑 Stopping Lab7 Background Agent..."

# Kill background agent processes
pkill -f "lab7_background_agent.py" || true
pkill -f "health_monitor.py" || true

echo "✅ Lab7 Background Agent stopped"
EOF

chmod +x stop_lab7_agent.sh
print_success "Stop script created: stop_lab7_agent.sh"

# Create status script
print_status "Creating status script..."
cat > status_lab7_agent.sh << 'EOF'
#!/bin/bash
# Check Lab7 Background Agent Status

echo "📊 Lab7 Background Agent Status"
echo "================================"

# Check if agent is running
if pgrep -f "lab7_background_agent.py" > /dev/null; then
    echo "✅ Background Agent: RUNNING"
    echo "   PIDs: $(pgrep -f 'lab7_background_agent.py' | tr '\n' ' ')"
else
    echo "❌ Background Agent: NOT RUNNING"
fi

# Check if health monitor is running
if pgrep -f "health_monitor.py" > /dev/null; then
    echo "✅ Health Monitor: RUNNING"
    echo "   PIDs: $(pgrep -f 'health_monitor.py' | tr '\n' ' ')"
else
    echo "❌ Health Monitor: NOT RUNNING"
fi

echo ""
echo "📋 Recent Activity:"
if [ -f "logs/background_agent.jsonl" ]; then
    echo "Last 3 agent actions:"
    tail -n 3 logs/background_agent.jsonl | while read line; do
        echo "  $line" | jq -r '.action + " at " + .timestamp' 2>/dev/null || echo "  $line"
    done
fi

echo ""
echo "🔧 Quick Commands:"
echo "  Start:  ./start_lab7_agent.sh"
echo "  Stop:   ./stop_lab7_agent.sh"
echo "  Status: ./status_lab7_agent.sh"
echo "  Health: python3 scripts/health_monitor.py --once"
EOF

chmod +x status_lab7_agent.sh
print_success "Status script created: status_lab7_agent.sh"

# Final setup summary
echo ""
print_success "🎉 Always-On Lab7 Background Agent Setup Complete!"
echo ""
echo "📋 Setup Summary:"
echo "  ✅ Python dependencies installed"
echo "  ✅ Git configured"
echo "  ✅ Scripts made executable"
echo "  ✅ Directories created"
echo "  ✅ Systemd service configured (if applicable)"
echo "  ✅ Management scripts created"
echo ""
echo "🚀 Quick Start:"
echo "  ./start_lab7_agent.sh    # Start the agent"
echo "  ./status_lab7_agent.sh   # Check status"
echo "  ./stop_lab7_agent.sh     # Stop the agent"
echo ""
echo "📁 Key Files:"
echo "  scripts/lab7_background_agent.py  # Main agent"
echo "  scripts/auto_commit_changes.py    # Auto-commit handler"
echo "  scripts/health_monitor.py         # Health monitoring"
echo "  logs/                             # Log files"
echo ""
echo "🔧 Configuration:"
echo "  The agent monitors 'lab7-edits/v1', 'lab7-edits/v2', 'lab7-edits/v3'"
echo "  Changes are automatically merged and committed"
echo "  Health monitoring runs every 60 seconds"
echo "  Agent check interval: 30 seconds"
echo ""
print_success "Ready to process lab7-edits automatically! 🎯"