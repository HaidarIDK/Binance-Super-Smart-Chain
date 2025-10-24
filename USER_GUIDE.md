# BSSC User Guide

## Getting Started with BSSC Blockchain

### What is BSSC?

Binance Super Smart Chain (BSSC) is a high-performance blockchain built on Solana that uses BSSC tokens for gas fees. Every transaction requires a small amount of BSSC tokens to pay for network fees.

---

## Getting BSSC Tokens

### Option 1: Buy on pump.fun (Recommended)

1. Go to: https://pump.fun/coin/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump
2. Connect your Phantom wallet
3. Buy BSSC tokens (minimum 0.01 SOL recommended)
4. You're ready to use the blockchain!

### Option 2: Testnet Faucet (Testing Only)

For testing and development on testnet:

1. Visit: https://explorer.bssc.live
2. Scroll to "Testnet Faucet" section
3. Enter your Solana wallet address
4. Click "Request BSSC"
5. Receive 3 BSSC for testing

---

## Using BSSC Blockchain

### Connecting MetaMask

1. Open MetaMask
2. Click "Add Network"
3. Enter network details:
   - Network Name: BSSC
   - RPC URL: https://rpc.bssc.live
   - Chain ID: 16979
   - Currency Symbol: BSSC
4. Connect and start using!

### Gas Fees

BSSC gas fees are paid in BSSC tokens:

| Operation | Gas Fee |
|-----------|---------|
| Transfer | 0.001 BSSC |
| Contract Call | 0.01 BSSC |
| Contract Deploy | 10 BSSC |
| NFT Mint | 0.1 BSSC |
| Staking | 1000 BSSC |

**Example:** Sending a transaction costs 0.001 BSSC (about $0.000000065 at current price).

### What Happens If You Don't Have Enough BSSC?

If you try to send a transaction without enough BSSC for gas:

```
Error: Insufficient BSSC balance. Need 0.001 BSSC for gas fees. 
Buy BSSC at https://pump.fun/coin/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump
```

**Solution:** Buy more BSSC tokens and try again.

---

## Checking Your BSSC Balance

### On Explorer
1. Visit: https://explorer.bssc.live
2. Search for your wallet address
3. View your BSSC balance

### In Wallet
- **Phantom:** Shows BSSC tokens automatically
- **MetaMask:** Shows as "BSSC" under your balance

---

## Sending Transactions

### Using MetaMask

1. Ensure you have at least 0.001 BSSC for gas
2. Open MetaMask
3. Click "Send"
4. Enter recipient address
5. Enter amount
6. Confirm transaction
7. Pay 0.001 BSSC gas fee automatically

### Using Phantom Wallet

1. Ensure you have BSSC tokens
2. Open Phantom
3. Send transaction normally
4. Gas fee deducted automatically

---

## Advanced Usage

### Setting Up Development Environment

```bash
# Clone repository
git clone https://github.com/HaidarIDK/Binance-Super-Smart-Chain.git
cd Binance-Super-Smart-Chain

# Install dependencies
npm install

# Start local validator
./multinode-demo/validator.sh

# Start RPC server
node bssc-live-server.js
```

### Environment Variables

For running your own RPC node:

```bash
export FEE_COLLECTOR_ADDRESS="your-fee-collector-address"
export BSSC_VALIDATOR_URL="http://localhost:8899"
export ETH_BRIDGE_PROGRAM_ID="your-bridge-program-id"
```

---

## Troubleshooting

### "Insufficient BSSC balance" Error

**Problem:** Don't have enough BSSC for gas fees.

**Solution:** 
1. Buy BSSC at https://pump.fun/coin/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump
2. Wait for transaction confirmation
3. Try your transaction again

### Transaction Failed

**Possible Causes:**
- Insufficient BSSC for gas fees
- Network congestion
- Invalid recipient address
- Insufficient balance for transfer amount

**Solutions:**
- Check your BSSC balance
- Verify the recipient address
- Try again after a few seconds
- Ensure you have enough for both transfer + gas fee

### Can't Connect to Network

**Problem:** MetaMask can't connect to BSSC.

**Solution:**
1. Verify RPC URL: https://rpc.bssc.live
2. Check Chain ID: 16979
3. Verify network status at https://explorer.bssc.live
4. Try refreshing MetaMask

---

## Fee Distribution

### How It Works

Every transaction fee (0.001 BSSC) is split:

- **50% Burned:** Reduces total supply (deflationary)
- **50% Validators:** Rewards for staking BSSC

This creates:
- Constant buying pressure (need BSSC to transact)
- Supply reduction (burning)
- Staking rewards (incentivizes holding)

### Current Stats

- **Token Supply:** 954,000,000 BSSC
- **Decimals:** 6
- **Current Price:** Check at https://pump.fun/coin/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump
- **Total Burned:** Track on explorer

---

## Resources

### Links
- **Explorer:** https://explorer.bssc.live
- **RPC:** https://rpc.bssc.live
- **Buy BSSC:** https://pump.fun/coin/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump
- **DexScreener:** https://dexscreener.com/solana/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump
- **GitHub:** https://github.com/HaidarIDK/Binance-Super-Smart-Chain

### Support
- **Issues:** https://github.com/HaidarIDK/Binance-Super-Smart-Chain/issues
- **Documentation:** See `/docs` folder

---

## Quick Reference

| Action | BSSC Cost | Notes |
|--------|-----------|-------|
| Send transaction | 0.001 BSSC | Minimum gas fee |
| Deploy contract | 10 BSSC | One-time fee |
| Mint NFT | 0.1 BSSC | Per NFT |
| Stake BSSC | 1000 BSSC | Minimum staking amount |

---

**Remember:** Always keep some BSSC tokens for gas fees. Recommended minimum: 0.01 BSSC for smooth usage.

