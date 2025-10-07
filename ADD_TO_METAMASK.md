# Add BSSC Testnet to MetaMask

## 🦊 MetaMask Setup (2 Minutes)

### Step 1: Open MetaMask
Click the MetaMask extension in your browser

### Step 2: Add Network
1. Click the network dropdown (top center)
2. Click "Add Network"
3. Click "Add a network manually"

### Step 3: Enter BSSC Details

```
Network Name: BSSC Testnet
RPC URL: https://bssc-rpc.bssc.live
Chain ID: 9000
Currency Symbol: BNB
Block Explorer URL: (leave blank for now)
```

### Step 4: Save
Click "Save" - Done!

## 🧪 Test It

### Get Test BNB

Open browser console (F12) and run:

```javascript
await window.ethereum.request({
  method: 'eth_requestFaucet',
  params: [ethereum.selectedAddress]
});
```

Or use this test page I'll create below!

## ✅ What You Can Do Now

- ✅ See your BNB balance
- ✅ Send transactions
- ✅ Request test BNB from faucet
- ✅ Deploy smart contracts
- ✅ Use any Ethereum dApp

## 📱 For Phantom (Solana Wallet)

Phantom works with Solana RPCs. To use Phantom:

1. Open Phantom wallet
2. Click Settings → Developer Settings
3. Add Custom RPC: `https://bssc-rpc.bssc.live`

**Note**: Your current RPC is Ethereum-compatible, so MetaMask is better for demos!

