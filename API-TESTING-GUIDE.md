# 🧪 API Testing Guide

Comprehensive testing suite for your **HIVE-PAW Ledger API** with detailed telemetry, logging, and performance monitoring.

## 🚀 **Quick Start**

### **PowerShell Version (Recommended)**
```powershell
# Test all endpoints for today
.\verify_api.ps1

# Test for specific date
.\verify_api.ps1 -Date 2025-09-21

# Test with custom API URL
.\verify_api.ps1 -BaseUrl "http://localhost:8000"
```

### **Batch File Version (Windows)**
```cmd
# Double-click verify_api.bat or run from command line
verify_api.bat
```

## 📊 **What Gets Tested**

### **Core Endpoints**
1. **`POST /seed`** - Create daily seed
2. **`POST /sweep`** - Add sweep record
3. **`POST /seal`** - Seal the day and build ledger
4. **`GET /ledger/{date}`** - Retrieve ledger
5. **`GET /verify/{date}`** - Verify ledger integrity
6. **`GET /export/{date}`** - Export all files
7. **`GET /index`** - List available days

### **Telemetry Collected**
- ✅ **HTTP Status Codes** (200, 400, 500, etc.)
- ✅ **Response Times** (millisecond precision)
- ✅ **Full JSON Responses** (complete payloads)
- ✅ **Error Messages** (detailed error information)
- ✅ **Timestamps** (exact execution times)
- ✅ **Success/Failure Rates** (overall statistics)

## 📁 **Log Files Created**

### **Location**
```
logs/api_check_YYYY-MM-DD.txt
```

### **Log Format**
```
[2025-09-21 22:53:58.927] [HEADER] ===============================
[2025-09-21 22:53:58.941] [HEADER] Testing Civic AI Ledger API
[2025-09-21 22:53:58.945] [HEADER] Date: 2025-09-21  Time: 22:53:58
[2025-09-21 22:53:58.987] [HEADER] Base URL: http://127.0.0.1:8000
[2025-09-21 22:53:58.994] [HEADER] ===============================

[2025-09-21 22:53:59.009] [SECTION] --- SEED TEST ---
[2025-09-21 22:53:59.018] [TEST] Testing SEED
[2025-09-21 22:53:59.103] [RESULT] STATUS=200 Duration=0.064s
[2025-09-21 22:53:59.109] [RESPONSE] {
    "seed_hash": "0fa04b7ab52b3f0ccc594a0a217bd07470a4517607814d56e443b578d46d72b1",
    "file": "2025-09-21.seed.json"
}
```

## 🎯 **Expected Results**

### **Successful Test Output**
```
=== API TEST SUMMARY ===
Total Tests: 7
Successful: 7
Failed: 0
Total Duration: 0.407s
Log File: logs\api_check_2025-09-21.txt
All tests passed! ✅
```

### **HTTP Status Codes**
- **200** - Success
- **400** - Bad Request (validation error)
- **404** - Not Found (missing resource)
- **409** - Conflict (verification mismatch)
- **422** - Unprocessable Entity (invalid data)
- **500** - Internal Server Error

### **Performance Benchmarks**
- **Seed**: ~50-100ms
- **Sweep**: ~5-20ms
- **Seal**: ~10-30ms
- **Ledger**: ~5-15ms
- **Verify**: ~10-25ms
- **Export**: ~5-15ms
- **Index**: ~5-10ms

## 🔧 **Advanced Usage**

### **Custom Test Scenarios**

#### **Test Specific Date**
```powershell
.\verify_api.ps1 -Date 2025-09-20
```

#### **Test Different API Instance**
```powershell
.\verify_api.ps1 -BaseUrl "http://localhost:8001"
```

#### **Test Preflight Proxy**
```powershell
.\verify_api.ps1 -BaseUrl "http://localhost:8999"
```

### **Batch File Customization**

Edit `verify_api.bat` to test different dates:
```batch
REM Change the date in the curl commands
-d "{\"date\": \"2025-09-22\", \"intent\": \"test\"}"
```

### **PowerShell Script Customization**

Add custom test cases to `verify_api.ps1`:
```powershell
# Add after the existing tests
Write-Log "--- CUSTOM TEST ---" "SECTION"
$customBody = @{
    date = $Date
    custom_field = "test_value"
    meta = @{}
}
$Results.Custom = Invoke-ApiTest -Name "CUSTOM" -Method "POST" -Path "/custom" -Body $customBody
```

## 📈 **Monitoring & Alerting**

### **Task Scheduler Integration**

Create a scheduled task to run tests automatically:

1. **Open Task Scheduler**
2. **Create Task** → "API Health Check"
3. **Triggers**: Every 15 minutes
4. **Actions**: 
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\Users\mikej\Desktop\lab4-proof\verify_api.ps1"`
   - Start in: `C:\Users\mikej\Desktop\lab4-proof`

### **Log Analysis**

#### **Check Recent Tests**
```powershell
# View today's test results
Get-Content logs\api_check_$(Get-Date -Format 'yyyy-MM-dd').txt

# View all test logs
Get-ChildItem logs -Filter "api_check_*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

#### **Extract Performance Data**
```powershell
# Get all duration measurements
Select-String -Path "logs\api_check_*.txt" -Pattern "Duration=" | ForEach-Object {
    $_.Line -replace ".*Duration=([0-9.]+)s.*", '$1'
}
```

#### **Check for Errors**
```powershell
# Find failed tests
Select-String -Path "logs\api_check_*.txt" -Pattern "STATUS=ERROR"
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. "Connection Refused"**
- **Cause**: API server not running
- **Solution**: Start uvicorn: `uvicorn app.main:app --reload --port 8000`

#### **2. "404 Not Found"**
- **Cause**: Endpoint doesn't exist
- **Solution**: Check API routes: `curl http://127.0.0.1:8000/routes`

#### **3. "422 Unprocessable Entity"**
- **Cause**: Invalid request data
- **Solution**: Check JSON format and required fields

#### **4. "409 Conflict"**
- **Cause**: Verification mismatch
- **Solution**: Check data integrity, may indicate tampering

#### **5. "500 Internal Server Error"**
- **Cause**: Server-side error
- **Solution**: Check server logs, restart API

### **Debug Commands**

#### **Test Individual Endpoints**
```powershell
# Test just the health endpoint
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method GET

# Test with verbose output
curl -v http://127.0.0.1:8000/health
```

#### **Check API Status**
```powershell
# Check if API is responding
Test-NetConnection -ComputerName 127.0.0.1 -Port 8000

# Check API routes
Invoke-RestMethod -Uri "http://127.0.0.1:8000/routes" -Method GET
```

#### **Validate JSON Data**
```powershell
# Test with minimal data
$testData = @{ date = "2025-09-21"; intent = "test" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/seed" -Method POST -ContentType "application/json" -Body $testData
```

## 📊 **Performance Monitoring**

### **Response Time Analysis**
```powershell
# Extract all response times
$logFile = "logs\api_check_$(Get-Date -Format 'yyyy-MM-dd').txt"
$times = Select-String -Path $logFile -Pattern "Duration=" | ForEach-Object {
    [double]($_.Line -replace ".*Duration=([0-9.]+)s.*", '$1')
}
$times | Measure-Object -Average -Maximum -Minimum
```

### **Success Rate Tracking**
```powershell
# Calculate success rate over time
$logs = Get-ChildItem logs -Filter "api_check_*.txt"
foreach ($log in $logs) {
    $total = (Select-String -Path $log.FullName -Pattern "\[TEST\]").Count
    $success = (Select-String -Path $log.FullName -Pattern "STATUS=200").Count
    $rate = if ($total -gt 0) { [math]::Round(($success / $total) * 100, 2) } else { 0 }
    Write-Host "$($log.Name): $success/$total ($rate%)"
}
```

## 🎯 **Best Practices**

### **Regular Testing**
- ✅ Run tests **before** deploying changes
- ✅ Run tests **after** system updates
- ✅ Run tests **daily** for health monitoring
- ✅ Run tests **immediately** if issues are reported

### **Log Management**
- ✅ **Rotate logs** weekly to prevent disk space issues
- ✅ **Archive old logs** for historical analysis
- ✅ **Monitor log size** to detect anomalies
- ✅ **Set up alerts** for test failures

### **Performance Optimization**
- ✅ **Baseline performance** when system is healthy
- ✅ **Monitor trends** over time
- ✅ **Investigate spikes** in response times
- ✅ **Optimize slow endpoints** based on data

## 🚀 **Ready to Use!**

Your **API Testing Suite** is now ready with:

- ✅ **Comprehensive endpoint coverage**
- ✅ **Detailed telemetry and logging**
- ✅ **Performance monitoring**
- ✅ **Error detection and reporting**
- ✅ **Automated testing capabilities**

**Start testing your API today!** 🎉

```powershell
# Quick test
.\verify_api.ps1

# Check results
Get-Content logs\api_check_$(Get-Date -Format 'yyyy-MM-dd').txt
```
