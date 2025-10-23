# 🫀 DVA Heartbeat - Complete Setup Guide

A comprehensive **daily ledger heartbeat system** with logging, rotation, Slack alerts, ZIP archiving, and checksum verification.

## 🚀 **What It Does**

The DVA Heartbeat script automatically:
- ✅ **Verifies** ledger integrity using Merkle root validation
- ✅ **Exports** JSON bundle of the day's data
- ✅ **Creates ZIP** with raw files and checksums.txt
- ✅ **Logs** all activities with timestamps
- ✅ **Rotates** old logs (keeps last 30 days by default)
- ✅ **Alerts** Slack on failures (optional)
- ✅ **Returns** proper exit codes for Task Scheduler

## 📁 **File Structure Created**

```
lab4-proof/
├── logs/
│   └── heartbeat-YYYY-MM-DD.log    # Daily log files
├── backups/
│   ├── YYYY-MM-DD-ledger.json      # JSON bundle export
│   └── YYYY-MM-DD-ledger.zip       # ZIP with raw files + checksums
└── heartbeat.ps1                   # Main heartbeat script
```

## 🔧 **Setup Instructions**

### **1. Basic Setup (No Slack)**

The script is ready to use immediately:

```powershell
# Test the heartbeat
.\heartbeat.ps1

# Test for specific date
.\heartbeat.ps1 -Date 2025-09-21

# Test with preflight proxy
.\heartbeat.ps1 -BaseUrl "http://127.0.0.1:8999"
```

### **2. Enable Slack Alerts (Optional)**

#### **Option A: Environment Variable (Recommended)**
```powershell
# Set once (persists across sessions)
[Environment]::SetEnvironmentVariable("SLACK_WEBHOOK_URL","https://hooks.slack.com/services/XXX/YYY/ZZZ","User")

# Restart PowerShell or sign out/in for it to load
```

#### **Option B: Command Line Parameter**
```powershell
.\heartbeat.ps1 -SlackWebhookUrl "https://hooks.slack.com/services/XXX/YYY/ZZZ"
```

#### **How to Get Slack Webhook URL:**
1. Go to your Slack workspace
2. Create a new app or use existing one
3. Enable "Incoming Webhooks"
4. Create a webhook for your desired channel
5. Copy the webhook URL

### **3. Windows Task Scheduler Setup**

#### **Create the Task:**
1. Open **Task Scheduler** (search in Start menu)
2. Click **"Create Task"** (not "Create Basic Task")
3. **General Tab:**
   - Name: `DVA Heartbeat`
   - Description: `Daily ledger verification and backup`
   - Check: "Run whether user is logged on or not"
   - Check: "Run with highest privileges"

4. **Triggers Tab:**
   - Click **"New"**
   - Begin the task: `On a schedule`
   - Settings: `Daily`
   - Start: `11:59 PM` (or your preferred time)
   - Check: "Enabled"

5. **Actions Tab:**
   - Click **"New"**
   - Action: `Start a program`
   - Program/script: `powershell.exe`
   - Add arguments: `-ExecutionPolicy Bypass -File "C:\Users\mikej\Desktop\lab4-proof\heartbeat.ps1"`

6. **Settings Tab:**
   - Check: "Run task as soon as possible after a scheduled start is missed"
   - Check: "If the task fails, restart every: 1 minute"
   - Maximum restart attempts: `3`

7. Click **"OK"** and enter your password when prompted

## 📊 **What Gets Created**

### **Daily Log File** (`logs/heartbeat-YYYY-MM-DD.log`)
```
[2025-09-21 23:59:02] ===== HEARTBEAT START for 2025-09-21 (base=http://127.0.0.1:8000) =====
[2025-09-21 23:59:02] HTTP GET http://127.0.0.1:8000/verify/2025-09-21
[2025-09-21 23:59:02] VERIFY OK :: hash=a41a136d... seeds=1 sweeps=4 seals=1
[2025-09-21 23:59:02] HTTP GET http://127.0.0.1:8000/export/2025-09-21
[2025-09-21 23:59:02] EXPORT wrote ...\backups\2025-09-21-ledger.json (5046 bytes)
[2025-09-21 23:59:02] ZIP wrote ...\backups\2025-09-21-ledger.zip (1400 bytes)
[2025-09-21 23:59:02] ZIP checksum verification: OK
[2025-09-21 23:59:02] HTTP GET http://127.0.0.1:8000/index
[2025-09-21 23:59:02] Available days: 2025-09-18, 2025-09-19, 2025-09-20, 2025-09-21, 2025-09-22, 2025-09-23
[2025-09-21 23:59:02] HTTP GET http://127.0.0.1:8000/ledger/2025-09-23
[2025-09-21 23:59:02] LATEST date mismatch :: latest=2025-09-23 expected=2025-09-21
[2025-09-21 23:59:02] ===== HEARTBEAT END for 2025-09-21 :: exit=0 :: 0.17s =====
```

### **JSON Bundle Export** (`backups/YYYY-MM-DD-ledger.json`)
```json
{
  "date": "2025-09-21",
  "files": {
    "2025-09-21.seed.json": { "type": "seed", "date": "2025-09-21", ... },
    "2025-09-21.echo.json": [ { "type": "sweep", "date": "2025-09-21", ... } ],
    "2025-09-21.seal.json": { "type": "seal", "date": "2025-09-21", ... },
    "2025-09-21.ledger.json": { "date": "2025-09-21", "day_root": "...", ... }
  }
}
```

### **ZIP Archive** (`backups/YYYY-MM-DD-ledger.zip`)
```
2025-09-21.seed.json
2025-09-21.echo.json
2025-09-21.seal.json
2025-09-21.ledger.json
checksums.txt
```

### **Checksums File** (inside ZIP)
```
05dbc445f0d961c31dd2b7b7fdeb8c3148932fc589422a5c72c3f19c3d5a452b  2025-09-21.echo.json
e0e3cebad572878bbf3f2ad5eaad27cd3c132181327bfd07590fa19d0cd09410  2025-09-21.ledger.json
d8457682b9f7ba75eae863fd4da3c028eb0b9529be7413b5fec00aa69cc07fd2  2025-09-21.seal.json
88cb029ebaac970ffe5f798c2f6bcea064d3fbfae1244a6dfac3f957693866a0  2025-09-21.seed.json
```

## 🔍 **Verification Commands**

### **Manual ZIP Verification**
```powershell
# Extract ZIP
Expand-Archive -Path "backups\2025-09-21-ledger.zip" -DestinationPath "temp-verify" -Force

# Verify checksums
Get-ChildItem "temp-verify" -Filter "*.json" | ForEach-Object {
  $h = Get-FileHash -Algorithm SHA256 -Path $_.FullName
  "{0}  {1}" -f $h.Hash.ToLower(), $_.Name
}

# Compare with checksums.txt
Get-Content "temp-verify\checksums.txt"

# Clean up
Remove-Item "temp-verify" -Recurse -Force
```

### **Check Log Files**
```powershell
# View today's log
Get-Content "logs\heartbeat-$(Get-Date -Format 'yyyy-MM-dd').log"

# View all logs
Get-ChildItem "logs" -Filter "heartbeat-*.log" | Sort-Object LastWriteTime -Descending
```

## 🚨 **Error Handling**

### **Exit Codes**
- **0**: Success
- **1**: General error (API down, network issue, etc.)
- **2**: Verification mismatch (tampering detected)
- **3**: Checksum verification failed

### **Slack Alert Example**
```
🚨 *DVA Heartbeat FAILED* for 2025-09-21 (exit=2)
ZIP: C:\Users\mikej\Desktop\lab4-proof\backups\2025-09-21-ledger.zip

[2025-09-21 23:59:02] VERIFY reported mismatch
[2025-09-21 23:59:02] Expected: abc123...
[2025-09-21 23:59:02] Computed: def456...
```

## ⚙️ **Configuration Options**

### **Command Line Parameters**
```powershell
.\heartbeat.ps1 -Date "2025-09-21" -BaseUrl "http://127.0.0.1:8999" -KeepDays 30 -SlackWebhookUrl "https://hooks.slack.com/..."
```

- **`-Date`**: Date to process (default: today)
- **`-BaseUrl`**: API base URL (default: http://127.0.0.1:8000)
- **`-KeepDays`**: Log retention days (default: 30)
- **`-SlackWebhookUrl`**: Slack webhook URL (optional)

### **Environment Variables**
- **`SLACK_WEBHOOK_URL`**: Slack webhook URL for alerts

## 🔄 **Daily Workflow**

### **Morning (Manual)**
1. Create seed: `POST /seed` with daily intent
2. Add sweeps throughout the day: `POST /sweep`

### **Evening (Manual)**
3. Seal the day: `POST /seal` with wins/blocks/tomorrow intent

### **Night (Automatic)**
4. **11:59 PM**: Task Scheduler runs heartbeat
5. **Verification**: Checks Merkle root integrity
6. **Export**: Creates JSON bundle
7. **Archive**: Creates ZIP with checksums
8. **Alert**: Notifies Slack if anything fails

## 🎯 **Benefits**

### **For Data Integrity**
- ✅ **Merkle root verification** catches tampering
- ✅ **Checksum verification** ensures file integrity
- ✅ **Dual backup** (JSON + ZIP) for redundancy
- ✅ **Log rotation** prevents disk space issues

### **For Operations**
- ✅ **Automated daily checks** without manual intervention
- ✅ **Slack alerts** for immediate failure notification
- ✅ **Task Scheduler integration** for Windows automation
- ✅ **Proper exit codes** for monitoring systems

### **For Compliance**
- ✅ **Audit trail** with detailed logs
- ✅ **Immutable archives** with checksums
- ✅ **Restore capability** from any backup
- ✅ **Verification tools** for integrity checking

## 🚀 **Ready to Use!**

Your DVA Heartbeat system is now fully operational with:
- ✅ **Automated daily verification**
- ✅ **Comprehensive logging**
- ✅ **ZIP archiving with checksums**
- ✅ **Slack alert integration**
- ✅ **Windows Task Scheduler setup**
- ✅ **Manual verification tools**

**Start using it today!** 🎉
