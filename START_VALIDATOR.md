# Build and Run BSSC Validator on Your PC

## 🚀 Quick Start

### Step 1: Build the Validator (One Time - 30-60 min)

```powershell
.\build-and-run-validator.ps1
```

This will:
1. Check if Rust is installed (install if needed)
2. Build the BSSC validator from source
3. Start the validator
4. Start the faucet

### Step 2: Update RPC Server

Once the validator is running, stop your current RPC server (Ctrl+C) and update it to connect to the real validator.

The RPC is already configured to connect to `http://localhost:8899`, so it will automatically use your validator!

### Step 3: Restart RPC Server

```powershell
node bssc-live-server.js
```

Now your RPC connects to a REAL validator instead of mock data!

## ✅ What You'll Have:

1. **Real BSSC Validator** - Actual blockchain running
2. **Real Faucet** - Distributes real test tokens
3. **RPC Server** - Connects to real validator
4. **MetaMask** - Works with real chain

## 🎯 For Demos:

You can now show:
- Real blocks being produced
- Real transactions on-chain
- Real consensus mechanism
- Real Solana performance (65k TPS)
- But with BNB as gas!

## 📊 System Requirements:

- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 20GB free space
- **CPU**: 4 cores
- **Build Time**: 30-60 minutes (first time only)
- **Run Time**: Instant after build

## 🔧 If Build Fails:

### Missing Visual Studio Build Tools?

Download and install:
https://visualstudio.microsoft.com/downloads/

Install "Desktop development with C++"

### Not Enough RAM?

Close other programs during build.

### Antivirus Blocking?

Temporarily disable antivirus during build.

## 🎉 After Build Completes:

Your validator will start automatically!

You'll see:
```
Ledger location: bssc-testnet-ledger
Identity: [pubkey]
Genesis Hash: [hash]
RPC URL: http://localhost:8899
Faucet: http://localhost:9900
```

## 🧪 Test It:

### In another PowerShell window:

```powershell
# Test RPC
Invoke-RestMethod -Uri "http://localhost:8899" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Should return: {"jsonrpc":"2.0","result":"ok","id":1}
```

### In MetaMask:

Your BSSC Local network will now connect to the REAL validator!
- Real blocks
- Real transactions  
- Real consensus
- Full Solana performance!

## 💰 Cost: FREE

Running on your PC costs nothing!

When ready for production, move to a server for 24/7 uptime.

## 🚀 Ready to Build?

Run: `.\build-and-run-validator.ps1`

Then grab a coffee - the build takes a while! ☕

