# Run BSSC Testnet Locally on Your PC

## Why Run Locally?
- ✅ **FREE** - No monthly server costs
- ✅ **FAST** - Test immediately, no deployment wait
- ✅ **PERFECT FOR DEMOS** - Record videos, show investors
- ✅ **UPGRADE LATER** - Move to server only if your coin moons!

## Requirements
- Windows 10/11
- 8GB RAM minimum
- 10GB free disk space
- Internet connection

## 🚀 Quick Start (5 Minutes)

### Step 1: Start the Testnet

Open PowerShell and run:

```powershell
cd C:\Users\7haid\OneDrive\Desktop\Binance-Super-Smart-Chain
.\run-testnet-locally.ps1
```

This will:
1. Install Solana CLI (if needed)
2. Start a local BSSC test validator
3. Start a faucet for test BNB

**Keep this window open!** The testnet runs here.

### Step 2: Test It (New PowerShell Window)

Open a **new** PowerShell window:

```powershell
cd C:\Users\7haid\OneDrive\Desktop\Binance-Super-Smart-Chain
.\test-local-testnet.ps1
```

You'll see:
```
✓ RPC Status: ONLINE
✓ Current Block: 123
✓ Public RPC: ONLINE
```

## 📊 Your Endpoints

### Local (Running on Your PC):
- **RPC**: `http://localhost:8899`
- **Faucet**: `http://localhost:9900`

### Public (Your Render RPC):
- **RPC**: `https://bssc-rpc.bssc.live`
- **Chain ID**: `56`

## 🎬 For Recording Demos

### Option A: Show Local Testnet

1. Start validator: `.\run-testnet-locally.ps1`
2. Open: `http://localhost:8899` in browser
3. Show transactions happening in real-time

### Option B: Show Public RPC

1. Open: `https://bssc-rpc.bssc.live` in browser
2. Show the web interface
3. Click "Test Faucet", "Test EVM Transaction", etc.

### Option C: Show Both

1. Run local validator in one window
2. Open `https://bssc-rpc.bssc.live` in browser
3. Update RPC server to connect to `http://localhost:8899`
4. Show full integration!

## 🧪 Test with Web3.js

```javascript
const Web3 = require('web3');

// Connect to your local testnet via public RPC
const web3 = new Web3('https://bssc-rpc.bssc.live');

// Get chain ID
const chainId = await web3.eth.getChainId();
console.log('Chain ID:', chainId); // 56

// Request test BNB
const response = await fetch('https://bssc-rpc.bssc.live', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_requestFaucet',
    params: ['0xYourAddress']
  })
});
```

## 🎯 What You Can Demo Right Now

### 1. Working Blockchain
- Show blocks being produced
- Show transaction processing
- Show BNB as native token

### 2. EVM Compatibility
- Send raw transactions
- Get transaction receipts
- Show Ethereum JSON-RPC methods

### 3. Developer Tools
- Connect MetaMask (Chain ID: 56)
- Use Web3.js
- Use ethers.js
- Use Solana CLI

### 4. Faucet System
- Request test BNB
- Show automatic distribution
- Show transaction confirmation

## 💰 When to Move to Server?

Move to a paid server ($20-50/month) when:
- ✅ You have paying users
- ✅ You need 24/7 uptime
- ✅ You want others to run nodes
- ✅ Your coin gets traction

Until then, **running on your PC is perfect!**

## 🔄 Connect Local Validator to Public RPC

Want your local validator connected to your public RPC?

Update `bssc-live-server.js`:

```javascript
// Change this line:
const BSSC_VALIDATOR_URL = process.env.BSSC_VALIDATOR_URL || 'http://localhost:8899';
```

Then commit and push to Render:

```bash
git add bssc-live-server.js
git commit -m "Connect to local validator"
git push origin master
```

Now `https://bssc-rpc.bssc.live` connects to your PC!

## 📹 Recording Your Demo

### What to Show:

1. **Open Terminal** - Show validator running
2. **Open Browser** - Go to `https://bssc-rpc.bssc.live`
3. **Test Methods**:
   - Click "Test Chain ID" → Shows 56 (BNB Chain)
   - Click "Test Faucet" → Shows BNB distribution
   - Click "Test EVM Transaction" → Shows transaction hash
   - Click "Test EVM Receipt" → Shows receipt

4. **Show Code**:
   - Show Web3.js connecting
   - Show transaction being sent
   - Show receipt being retrieved

5. **Show MetaMask**:
   - Add BSSC Testnet
   - Show balance
   - Send transaction

### Talking Points:

- "This is BSSC - Binance Super Smart Chain"
- "BNB as native gas token"
- "Full EVM compatibility"
- "Solana-level performance (65k TPS)"
- "Working testnet with faucet"
- "Developers can connect now"

## 🚀 Ready to Start?

Run this now:

```powershell
.\run-testnet-locally.ps1
```

Then in a new window:

```powershell
.\test-local-testnet.ps1
```

**That's it!** Your BSSC testnet is running on your PC! 🎉

## ⚡ Quick Commands

```powershell
# Start testnet
.\run-testnet-locally.ps1

# Test testnet (new window)
.\test-local-testnet.ps1

# Stop testnet
# Just press Ctrl+C in the validator window

# Clean restart
# Delete the test-ledger folder and restart
```

## 📞 Share with Developers

Tell them:
- **RPC**: `https://bssc-rpc.bssc.live`
- **Chain ID**: `56`
- **Network**: BSSC Testnet
- **Faucet**: Available via `eth_requestFaucet` method

## 🎓 Need Help?

- Check `test-local-testnet.ps1` to verify it's running
- Open `https://bssc-rpc.bssc.live` to see the web interface
- Check `testnet-status-dashboard.html` for monitoring

**Now go record that demo and show your investors!** 🚀💰

