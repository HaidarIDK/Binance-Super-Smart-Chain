# How to Download and Install OpenSSL on Windows

## Step-by-Step Guide (5 Minutes)

### Step 1: Go to the Download Page

Open this link in your browser:
https://slproweb.com/products/Win32OpenSSL.html

### Step 2: Find the Right Version

Look for the section "Download Win64 OpenSSL"

Download this one:
**"Win64 OpenSSL v3.2.0"** (or latest 3.x version)

**IMPORTANT**: Download the FULL version, NOT the "Light" version!

Look for a link like:
- Win64 OpenSSL v3.2.0 EXE (NOT Light)

### Step 3: Download the File

1. Click the download link
2. File will be named something like: `Win64OpenSSL-3_2_0.exe`
3. Save it to your Downloads folder
4. Wait for download to complete (30MB-50MB file)

### Step 4: Run the Installer

1. Go to your Downloads folder
2. Double-click `Win64OpenSSL-3_2_0.exe`
3. Click "Yes" if Windows asks for permission
4. Click "Next" in the installer
5. Accept the license (click "I accept", then "Next")
6. Install location: Keep default `C:\Program Files\OpenSSL-Win64`
7. **IMPORTANT**: When asked "Copy OpenSSL DLLs to:", select:
   - ✅ "The Windows system directory" (recommended)
8. Click "Next", then "Install"
9. Wait for installation (1-2 minutes)
10. Click "Finish"

### Step 5: Set Environment Variable

**Option A: Automatic (PowerShell as Administrator)**

1. Right-click PowerShell
2. Select "Run as Administrator"
3. Run this command:

```powershell
[System.Environment]::SetEnvironmentVariable('OPENSSL_DIR', 'C:\Program Files\OpenSSL-Win64', 'Machine')
```

**Option B: Manual**

1. Press `Windows + R`
2. Type: `sysdm.cpl` and press Enter
3. Click "Advanced" tab
4. Click "Environment Variables"
5. Under "System variables", click "New"
6. Variable name: `OPENSSL_DIR`
7. Variable value: `C:\Program Files\OpenSSL-Win64`
8. Click "OK" on all windows

### Step 6: Restart PowerShell

1. Close ALL PowerShell windows
2. Open a NEW PowerShell window
3. Test it worked:

```powershell
$env:OPENSSL_DIR
```

Should show: `C:\Program Files\OpenSSL-Win64`

### Step 7: Build BSSC Validator

Now you can build:

```powershell
cd C:\Users\7haid\OneDrive\Desktop\Binance-Super-Smart-Chain
cargo build --release --bin solana-test-validator
```

This will take 30-60 minutes.

## ✅ That's It!

If you follow these steps exactly, OpenSSL will be installed and the build should work!

## ⚠️ Still Not Working?

You might also need **protoc** (Protocol Buffers). If the build fails with "Could not find protoc", let me know and I'll give you instructions for that too.

## 💡 Alternative:

If this is too complex, your current mock RPC setup works perfectly for demos! You don't NEED a real validator to show investors. 🚀

