# 🔐 GPG Integration Setup Guide

This guide will help you set up **GPG cryptographic signatures** for your DVA Heartbeat system, providing cryptographic authorship verification for your daily ledger bundles.

## 🚀 **Quick Start**

### **1. Install GPG (if not already installed)**

**Option A: Gpg4win (Recommended for Windows)**
- Download from: https://www.gpg4win.org/
- Install with default settings

**Option B: Git for Windows (if you have Git)**
- GPG comes bundled with Git for Windows
- Usually located at: `C:\Program Files\Git\usr\bin\gpg.exe`

### **2. Generate Your GPG Key**

Open PowerShell and run:

```powershell
# Generate a new GPG key (interactive)
gpg --full-generate-key

# OR generate a key tied to your Proton email
gpg --quick-gen-key "Michael Judan <kaizencycle@proton.me>" ed25519 sign 0
```

**Key Generation Options:**
- **Key Type**: RSA and RSA (option 1) or Ed25519
- **Key Size**: 4096 bits (for RSA) or Ed25519 (modern, quantum-resistant)
- **Expiration**: 2 years (recommended)
- **Name**: Michael Judan
- **Email**: kaizencycle@proton.me
- **Passphrase**: Use a strong passphrase (required for security)

### **3. Set Up Environment Variable**

```powershell
# Set the signer email (replace with your actual email)
[Environment]::SetEnvironmentVariable("LEDGER_SIGNER","kaizencycle@proton.me","User")

# Restart PowerShell or sign out/in for the env var to load
```

### **4. Test the GPG Integration**

```powershell
# Test the new heartbeat script with GPG signing
.\heartbeat-gpg.ps1 -Date 2025-09-21
```

You should see:
- ✅ "Signed: checksums.txt -> checksums.txt.sig"
- ✅ "GPG signature verification: OK"

## 📁 **What Gets Created**

### **Enhanced ZIP Contents**
```
2025-09-21.seed.json
2025-09-21.echo.json
2025-09-21.seal.json
2025-09-21.ledger.json
checksums.txt
checksums.txt.sig      # GPG detached signature (ASCII-armored)
```

### **Log Output Example**
```
[2025-09-21 23:59:02] ===== HEARTBEAT START for 2025-09-21 (base=http://127.0.0.1:8000) =====
[2025-09-21 23:59:02] VERIFY OK :: hash=a41a136d... seeds=1 sweeps=4 seals=1
[2025-09-21 23:59:02] EXPORT wrote ...\backups\2025-09-21-ledger.json (5046 bytes)
[2025-09-21 23:59:02] Signed: checksums.txt -> checksums.txt.sig
[2025-09-21 23:59:02] ZIP wrote ...\backups\2025-09-21-ledger.zip (1400 bytes)
[2025-09-21 23:59:02] GPG signature verification: OK
[2025-09-21 23:59:02] ZIP checksum + signature verification: OK
[2025-09-21 23:59:02] ===== HEARTBEAT END for 2025-09-21 :: exit=0 :: 0.42s =====
```

## 🔧 **Advanced Features**

### **1. Publish Your Public Key**

```powershell
# Export your public key for sharing
.\publish-public-key.ps1 -Key "kaizencycle@proton.me"
```

This creates in `backups/`:
- `publickey-<KEYID>.asc` - Your public key
- `publickey-<KEYID>.fingerprint.txt` - Key fingerprint
- `READ_ME_verify_public_key.txt` - Instructions for verifiers

### **2. Sign Individual Files (Python)**

```powershell
# Set environment variable
$env:LEDGER_SIGNER = "kaizencycle@proton.me"

# Sign all files for a specific date
python .\scripts\sign_ledger.py --date 2025-09-21 --all --verify --manifest

# Sign specific files only
python .\scripts\sign_ledger.py --date 2025-09-21 --files seed ledger --verify
```

### **3. Manual Verification**

```powershell
# Extract and verify a ZIP
Expand-Archive -Path "backups\2025-09-21-ledger.zip" -DestinationPath "temp-verify" -Force

# Verify the GPG signature
gpg --verify "temp-verify\checksums.txt.sig" "temp-verify\checksums.txt"

# Verify file hashes
Get-Content "temp-verify\checksums.txt"

# Clean up
Remove-Item "temp-verify" -Recurse -Force
```

## 🛡️ **Security Best Practices**

### **1. Key Management**
- ✅ **Use a strong passphrase** for your private key
- ✅ **Backup your private key** securely (offline storage)
- ✅ **Never share your private key**
- ✅ **Share only your public key** for verification

### **2. Automation Considerations**
- ✅ **Use gpg-agent** for passphrase caching (recommended)
- ✅ **Avoid storing passphrases** in plaintext
- ✅ **Consider subkeys** for automated signing
- ✅ **Rotate keys periodically** (every 2 years)

### **3. Verification Workflow**
- ✅ **Always verify signatures** before trusting data
- ✅ **Check key fingerprints** out-of-band
- ✅ **Verify file hashes** match checksums.txt
- ✅ **Keep public keys** in a trusted location

## 🔄 **Integration with Existing Workflow**

### **Replace Your Current Heartbeat**

1. **Backup your current script:**
   ```powershell
   Copy-Item "heartbeat.ps1" "heartbeat-backup.ps1"
   ```

2. **Replace with GPG version:**
   ```powershell
   Copy-Item "heartbeat-gpg.ps1" "heartbeat.ps1"
   ```

3. **Update Task Scheduler** (if needed):
   - The script path remains the same
   - Only the content changes (adds GPG signing)

### **Environment Variables**

Add these to your system or `.env` file:

```powershell
# Required for GPG signing
[Environment]::SetEnvironmentVariable("LEDGER_SIGNER","kaizencycle@proton.me","User")

# Optional for Slack alerts
[Environment]::SetEnvironmentVariable("SLACK_WEBHOOK_URL","https://hooks.slack.com/services/XXX/YYY/ZZZ","User")
```

## 🚨 **Troubleshooting**

### **Common Issues**

**1. "GPG not found"**
- Install Gpg4win or ensure gpg.exe is in PATH
- Check the Find-Gpg function in heartbeat-gpg.ps1

**2. "LEDGER_SIGNER not set"**
- Set the environment variable: `$env:LEDGER_SIGNER = "your-email@example.com"`
- Or pass it directly: `.\heartbeat-gpg.ps1 -SignerEmail "your-email@example.com"`

**3. "GPG sign failed"**
- Check if your key exists: `gpg --list-keys`
- Verify the email/key ID matches exactly
- Ensure you have the private key (not just public)

**4. "Signature verification FAILED"**
- Check if the signature file exists in the ZIP
- Verify the signature manually: `gpg --verify checksums.txt.sig checksums.txt`
- Ensure the public key is imported: `gpg --import publickey.asc`

### **Debug Commands**

```powershell
# Check if GPG is installed
gpg --version

# List your keys
gpg --list-keys

# Test signing a file
echo "test" > test.txt
gpg --detach-sign --armor test.txt
gpg --verify test.txt.asc test.txt

# Check environment variables
echo $env:LEDGER_SIGNER
```

## 🎯 **Benefits of GPG Integration**

### **Cryptographic Integrity**
- ✅ **Tamper-evident**: Any modification breaks the signature
- ✅ **Authenticity**: Proves the data came from your key
- ✅ **Non-repudiation**: You cannot deny signing the data
- ✅ **Verification**: Anyone can verify with your public key

### **Compliance & Audit**
- ✅ **Audit trail**: Cryptographic proof of data integrity
- ✅ **Regulatory compliance**: Meets data integrity requirements
- ✅ **Legal evidence**: Admissible in court proceedings
- ✅ **Professional standard**: Industry-standard security practice

### **Operational Benefits**
- ✅ **Automated verification**: Built into the heartbeat process
- ✅ **Error detection**: Catches corruption or tampering
- ✅ **Trust establishment**: Others can verify your data
- ✅ **Portable verification**: Works across platforms and tools

## 🚀 **Ready to Use!**

Your DVA Heartbeat system now includes:
- ✅ **GPG cryptographic signatures**
- ✅ **Automated verification**
- ✅ **Public key publishing**
- ✅ **Individual file signing**
- ✅ **Comprehensive logging**
- ✅ **Error handling**

**Start using it today!** 🎉

```powershell
# Test the complete system
.\heartbeat-gpg.ps1 -Date 2025-09-21

# Publish your public key
.\publish-public-key.ps1 -Key "kaizencycle@proton.me"

# Sign individual files
python .\scripts\sign_ledger.py --date 2025-09-21 --all --verify --manifest
```

