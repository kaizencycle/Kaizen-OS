# 🚀 Daily Cycle Setup Guide

Complete setup for your **HIVE-PAW Daily Cycle** with GPG cryptographic signatures, automated backups, and Slack notifications.

## 📋 **Prerequisites**

### **1. Install GPG (Required for Full Features)**

**Option A: Gpg4win (Recommended)**
- Download from: https://www.gpg4win.org/
- Install with default settings
- GPG will be available as `gpg` command

**Option B: Git for Windows (if you have Git)**
- GPG comes bundled with Git for Windows
- Usually located at: `C:\Program Files\Git\usr\bin\gpg.exe`

**Verify Installation:**
```powershell
gpg --version
```

### **2. Set Up Your GPG Key**

**Generate Key (if not done already):**
```powershell
# Generate key tied to your Proton email
gpg --quick-gen-key "Michael Judan <kaizencycle@proton.me>" ed25519 sign 0
```

**Export Public Key:**
```powershell
# Export your public key for sharing
gpg --armor --export "kaizencycle@proton.me" > kaizencycle_pub.asc
```

**Set Environment Variables:**
```powershell
# Set the signer email
[Environment]::SetEnvironmentVariable("LEDGER_SIGNER","kaizencycle@proton.me","User")

# Set the recipient email
[Environment]::SetEnvironmentVariable("LEDGER_PGP_RECIPIENT","kaizencycle@proton.me","User")

# Restart PowerShell or sign out/in for env vars to load
```

## 🔧 **Scripts Available**

### **1. `daily-cycle.ps1` (Full GPG Version)**
- ✅ Auto-starts uvicorn if needed
- ✅ Skips seed/seal if already done
- ✅ GPG signs and encrypts all files
- ✅ Creates ZIP backups
- ✅ Slack notifications
- ✅ Retry logic for API calls

### **2. `daily-cycle-no-gpg.ps1` (Testing Version)**
- ✅ Same features as above
- ❌ No GPG signing/encryption
- ✅ Use this for testing without GPG

### **3. `heartbeat-gpg.ps1` (Heartbeat with GPG)**
- ✅ Verifies ledger integrity
- ✅ Exports JSON bundles
- ✅ Creates ZIP with GPG signatures
- ✅ Log rotation and Slack alerts

## 🚀 **Quick Start**

### **Step 1: Test Without GPG**
```powershell
# Test the basic functionality
.\daily-cycle-no-gpg.ps1
```

### **Step 2: Install GPG and Test Full Version**
```powershell
# After installing Gpg4win
.\daily-cycle.ps1
```

### **Step 3: Set Up Slack Notifications (Optional)**
```powershell
# Set Slack webhook URL
[Environment]::SetEnvironmentVariable("SLACK_WEBHOOK_URL","https://hooks.slack.com/services/XXX/YYY/ZZZ","User")

# Test with Slack notifications
.\daily-cycle.ps1
```

## 📁 **What Gets Created**

### **Daily Backup Structure**
```
backups/
└── YYYY-MM-DD/
    ├── 2025-09-21.seed.json
    ├── 2025-09-21.seed.json.asc      # GPG signature
    ├── 2025-09-21.seed.json.gpg      # GPG encrypted
    ├── 2025-09-21.echo.json
    ├── 2025-09-21.echo.json.asc
    ├── 2025-09-21.echo.json.gpg
    ├── 2025-09-21.seal.json
    ├── 2025-09-21.seal.json.asc
    ├── 2025-09-21.seal.json.gpg
    ├── 2025-09-21.ledger.json
    ├── 2025-09-21.ledger.json.asc
    └── 2025-09-21.ledger.json.gpg
```

### **Export ZIP Files**
```
backups/
├── export_2025-09-21_090700.zip      # Daily snapshot
├── export_2025-09-21_150000.zip      # Another run
└── ...
```

## ⚙️ **Configuration Options**

### **Command Line Parameters**
```powershell
# Run with specific Slack webhook
.\daily-cycle.ps1 -SlackWebhookUrl "https://hooks.slack.com/services/XXX/YYY/ZZZ"

# Run without GPG
.\daily-cycle-no-gpg.ps1
```

### **Environment Variables**
```powershell
# GPG Configuration
$env:LEDGER_SIGNER = "kaizencycle@proton.me"
$env:LEDGER_PGP_RECIPIENT = "kaizencycle@proton.me"

# Slack Notifications
$env:SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/XXX/YYY/ZZZ"
```

## 🕐 **Task Scheduler Setup**

### **Create the Task:**
1. Open **Task Scheduler**
2. Click **"Create Task"**
3. **General Tab:**
   - Name: `HIVE-PAW Daily Cycle`
   - Description: `Automated daily ledger cycle with GPG backup`
   - Check: "Run whether user is logged on or not"
   - Check: "Run with highest privileges"

4. **Triggers Tab:**
   - Click **"New"**
   - Begin the task: `On a schedule`
   - Settings: `Daily`
   - Start: `9:05 AM` (or your preferred time)
   - Check: "Enabled"

5. **Actions Tab:**
   - Click **"New"**
   - Action: `Start a program`
   - Program/script: `powershell.exe`
   - Add arguments: `-ExecutionPolicy Bypass -File "C:\Users\mikej\Desktop\lab4-proof\daily-cycle.ps1"`
   - Start in: `C:\Users\mikej\Desktop\lab4-proof`

6. **Settings Tab:**
   - Check: "Run task as soon as possible after a scheduled start is missed"
   - Check: "If the task fails, restart every: 1 minute"
   - Maximum restart attempts: `3`

## 🔍 **Verification Commands**

### **Check GPG Key**
```powershell
# List your keys
gpg --list-keys

# Test encryption/decryption
echo '{"test":"data"}' > test.json
gpg --recipient "kaizencycle@proton.me" --encrypt test.json
gpg --decrypt test.json.gpg
```

### **Verify Backups**
```powershell
# Check daily backup folder
ls backups\2025-09-21

# Verify GPG signatures
gpg --verify backups\2025-09-21\2025-09-21.ledger.json.asc backups\2025-09-21\2025-09-21.ledger.json

# Decrypt a file
gpg --decrypt backups\2025-09-21\2025-09-21.ledger.json.gpg
```

### **Check Logs**
```powershell
# View heartbeat logs
Get-Content logs\heartbeat-2025-09-21.log

# View all logs
Get-ChildItem logs -Filter "heartbeat-*.log" | Sort-Object LastWriteTime -Descending
```

## 🚨 **Troubleshooting**

### **Common Issues**

**1. "gpg: command not found"**
- Install Gpg4win or ensure gpg.exe is in PATH
- Check: `gpg --version`

**2. "LEDGER_SIGNER not set"**
- Set environment variable: `$env:LEDGER_SIGNER = "kaizencycle@proton.me"`
- Or use the no-GPG version: `.\daily-cycle-no-gpg.ps1`

**3. "uvicorn failed to become healthy"**
- Check if port 8000 is available
- Manually start the API: `uvicorn app.main:app --reload --port 8000`

**4. "API calls failing"**
- Ensure the API is running on http://127.0.0.1:8000
- Check firewall settings
- Verify the API endpoints are working

**5. "GPG signing failed"**
- Check if your key exists: `gpg --list-keys`
- Verify the email/key ID matches exactly
- Ensure you have the private key (not just public)

### **Debug Commands**

```powershell
# Test API connectivity
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method GET

# Test GPG functionality
gpg --list-keys kaizencycle@proton.me

# Test environment variables
echo $env:LEDGER_SIGNER
echo $env:SLACK_WEBHOOK_URL

# Test file operations
Test-Path "data\2025-09-21.seed.json"
```

## 🎯 **Features Overview**

### **Automation Features**
- ✅ **Auto-start API**: Starts uvicorn if not running
- ✅ **Smart skipping**: Skips seed/seal if already done
- ✅ **Retry logic**: Handles temporary API failures
- ✅ **Auto-cleanup**: Stops uvicorn if script started it

### **Security Features**
- ✅ **GPG signatures**: Cryptographic proof of authorship
- ✅ **GPG encryption**: Secure backup storage
- ✅ **Merkle verification**: Tamper detection
- ✅ **Checksum validation**: File integrity checks

### **Monitoring Features**
- ✅ **Slack notifications**: Success/failure alerts
- ✅ **Detailed logging**: Comprehensive audit trail
- ✅ **Status reporting**: Clear success/failure indicators
- ✅ **Performance metrics**: Execution time tracking

### **Backup Features**
- ✅ **Daily folders**: Organized by date
- ✅ **ZIP exports**: Portable snapshots
- ✅ **Multiple formats**: JSON + GPG + ZIP
- ✅ **Log rotation**: Prevents disk space issues

## 🚀 **Ready to Use!**

Your **HIVE-PAW Daily Cycle** system is now ready with:

- ✅ **Automated daily operations**
- ✅ **GPG cryptographic security**
- ✅ **Comprehensive monitoring**
- ✅ **Robust error handling**
- ✅ **Task Scheduler integration**

**Start using it today!** 🎉

```powershell
# Test the system
.\daily-cycle-no-gpg.ps1

# Install GPG and use full version
.\daily-cycle.ps1

# Set up Task Scheduler for automation
# (Follow the Task Scheduler setup above)
```

