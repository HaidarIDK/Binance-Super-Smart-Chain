# Install OpenSSL on Windows

## Quick Download:

I just opened the OpenSSL download page. Here's what to do:

### Step 1: Download OpenSSL

From the page that just opened (https://slproweb.com/products/Win32OpenSSL.html):

1. Download: **"Win64 OpenSSL v3.x.x"** (the full version, NOT Light)
2. Look for something like: "Win64 OpenSSL v3.2.0" or newer
3. Click the EXE installer link

### Step 2: Install OpenSSL

1. Run the downloaded `.exe` file
2. Click "Next" through the installer
3. **Important**: When asked where to copy OpenSSL DLLs, select:
   - "The Windows system directory" (recommended)
4. Complete installation

### Step 3: Set Environment Variable

After installation, run this in PowerShell (as Administrator):

```powershell
[System.Environment]::SetEnvironmentVariable('OPENSSL_DIR', 'C:\Program Files\OpenSSL-Win64', 'Machine')
```

### Step 4: Restart PowerShell

Close and reopen PowerShell to load the new environment variable.

### Step 5: Build BSSC

```powershell
cd C:\Users\7haid\OneDrive\Desktop\Binance-Super-Smart-Chain
cargo build --release --bin solana-test-validator
```

## ⚡ Quick Alternative (Using the Script):

The script I'm running (`install-openssl-and-build.ps1`) does all this automatically via vcpkg!

Just let it finish - it will:
1. Install vcpkg
2. Install OpenSSL via vcpkg
3. Build the validator

**Total time: ~45-85 minutes**

## 🎯 Or Just Wait:

The automated script is already running in the background. It will handle everything!

Check the terminal for progress.

