# 🤖 Always-On Lab7 Background Agent

## Overview

The Always-On Lab7 Background Agent is a comprehensive system that automatically monitors, merges, and commits changes from the `lab7-edits` folder structure. It runs continuously in the background and ensures that all changes are processed and committed automatically.

## 🚀 Features

### Core Functionality
- **Auto-Merge**: Automatically processes files from `lab7-edits/v1`, `lab7-edits/v2`, and `lab7-edits/v3`
- **Auto-Commit**: Automatically commits all changes with descriptive commit messages
- **Auto-Push**: Pushes committed changes to the remote repository
- **Health Monitoring**: Monitors agent health and restarts if needed
- **Always-On**: Runs continuously in the background

### Advanced Features
- **Sequential Processing**: Processes v1 → v2 → v3 in order
- **Conflict Resolution**: Handles file conflicts gracefully
- **Comprehensive Logging**: Logs all operations for debugging and audit
- **Error Recovery**: Graceful failure handling and recovery
- **Systemd Integration**: Can run as a system service
- **Health Checks**: Monitors agent status and restarts if needed

## 📁 File Structure

```
scripts/
├── lab7_background_agent.py      # Main background agent
├── auto_commit_changes.py        # Auto-commit handler
├── health_monitor.py             # Health monitoring
├── auto_merge_edits.py           # Merge processing
├── lab7-background-agent.service # Systemd service
└── setup_always_on_agent.sh      # Setup script

logs/
├── background_agent.jsonl        # Agent activity logs
├── commit_history.jsonl          # Commit operation logs
└── health_monitor.jsonl          # Health monitoring logs

lab7-edits/
├── v1/                           # Version 1 edits (processed first)
├── v2/                           # Version 2 edits (processed second)
└── v3/                           # Version 3 edits (processed third)
```

## 🛠️ Installation & Setup

### Quick Setup

```bash
# Run the setup script
./scripts/setup_always_on_agent.sh
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   pip3 install GitPython requests
   ```

2. **Make Scripts Executable**
   ```bash
   chmod +x scripts/*.py
   ```

3. **Create Directories**
   ```bash
   mkdir -p logs lab7-edits/{v1,v2,v3}
   ```

4. **Configure Git** (if not already configured)
   ```bash
   git config user.name "Lab7 Background Agent"
   git config user.email "lab7-agent@github.com"
   ```

## 🚀 Usage

### Start the Agent

```bash
# Start with management script
./start_lab7_agent.sh

# Or start manually
python3 scripts/lab7_background_agent.py
```

### Check Status

```bash
# Check agent status
./status_lab7_agent.sh

# Or check manually
python3 scripts/health_monitor.py --once
```

### Stop the Agent

```bash
# Stop with management script
./stop_lab7_agent.sh

# Or stop manually
pkill -f lab7_background_agent.py
```

### Systemd Service (Linux)

```bash
# Install service
sudo cp scripts/lab7-background-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable lab7-background-agent

# Start service
sudo systemctl start lab7-background-agent

# Check status
sudo systemctl status lab7-background-agent

# View logs
sudo journalctl -u lab7-background-agent -f
```

## 📋 How It Works

### 1. File Monitoring
- Agent monitors `lab7-edits/v1`, `lab7-edits/v2`, `lab7-edits/v3` every 30 seconds
- Detects changes by comparing file modification times and counts

### 2. Sequential Processing
- Processes v1 → v2 → v3 in order
- Each version is processed completely before moving to the next
- Files are merged to appropriate locations in the repository

### 3. Auto-Commit
- All changes are automatically staged
- Descriptive commit messages are generated
- Changes are committed with timestamp and file count

### 4. Auto-Push
- Committed changes are pushed to the remote repository
- Push status is logged for monitoring

### 5. Health Monitoring
- Health monitor runs every 60 seconds
- Checks agent activity, process status, and git status
- Restarts agent if needed (max 5 restarts per hour)

## 🔧 Configuration

### Agent Configuration

The agent can be configured by modifying the following parameters in `scripts/lab7_background_agent.py`:

```python
# Check interval (seconds)
check_interval = 30

# Git configuration
GIT_AUTHOR_NAME = "Lab7 Background Agent"
GIT_AUTHOR_EMAIL = "lab7-agent@github.com"
```

### Health Monitor Configuration

Modify these parameters in `scripts/health_monitor.py`:

```python
# Activity threshold (seconds)
last_activity_threshold = 300

# Restart limits
max_restarts = 5
restart_window = 3600

# Check interval (seconds)
check_interval = 60
```

## 📊 Monitoring & Logs

### Log Files

- **`logs/background_agent.jsonl`**: Agent activity and operations
- **`logs/commit_history.jsonl`**: Git commit operations
- **`logs/health_monitor.jsonl`**: Health monitoring and restarts

### Log Format

All logs are in JSON Lines format:

```json
{
  "timestamp": "2025-10-19T16:32:43.922832Z",
  "agent": "lab7_background",
  "action": "changes_detected",
  "details": {
    "version": "v1",
    "files_changed": 3
  }
}
```

### Health Check

```bash
# Run health check
python3 scripts/health_monitor.py --once

# Check specific components
python3 scripts/auto_commit_changes.py --no-push
python3 scripts/lab7_background_agent.py --once
```

## 🚨 Troubleshooting

### Common Issues

1. **Agent Not Starting**
   - Check Python dependencies: `pip3 install GitPython requests`
   - Verify git repository: `git status`
   - Check permissions: `chmod +x scripts/*.py`

2. **Auto-Commit Failing**
   - Check git configuration: `git config --list`
   - Verify repository status: `git status`
   - Check logs: `tail -f logs/commit_history.jsonl`

3. **Health Monitor Issues**
   - Check process status: `ps aux | grep lab7`
   - Verify log files exist: `ls -la logs/`
   - Check system resources: `top` or `htop`

### Debug Commands

```bash
# Check agent process
ps aux | grep lab7_background_agent

# View recent logs
tail -f logs/background_agent.jsonl

# Test individual components
python3 scripts/lab7_background_agent.py --once
python3 scripts/auto_commit_changes.py --no-push
python3 scripts/health_monitor.py --once

# Check git status
git status --porcelain
git log --oneline -5
```

## 🔒 Security Considerations

- **Git Credentials**: Ensure proper git authentication is configured
- **File Permissions**: Scripts should be executable only by authorized users
- **Log Security**: Logs may contain sensitive information
- **Network Access**: Agent needs network access for git push operations
- **Resource Limits**: Consider setting memory and CPU limits for the service

## 📈 Performance

### Resource Usage
- **Memory**: ~50-100MB typical usage
- **CPU**: Low usage, periodic checks every 30-60 seconds
- **Disk**: Log files grow over time, consider log rotation

### Optimization
- Adjust check intervals based on your needs
- Implement log rotation for long-running instances
- Monitor resource usage and adjust limits as needed

## 🤝 Contributing

To contribute to the always-on agent:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Lab7 system and follows the same license terms.

## 🆘 Support

For support and questions:

1. Check the logs first: `tail -f logs/background_agent.jsonl`
2. Run health check: `python3 scripts/health_monitor.py --once`
3. Check the troubleshooting section above
4. Create an issue with relevant log information

---

**🎯 Ready to process lab7-edits automatically!**

The always-on background agent will continuously monitor and process your lab7-edits, ensuring all changes are automatically merged and committed. Just add files to the v1, v2, or v3 folders and the agent will handle the rest!
