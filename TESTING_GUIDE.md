# BSSC Testing Guide

## Quick Test Checklist

### Pre-Testing Setup

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
export FEE_COLLECTOR_ADDRESS="your-fee-collector-address"
export BSSC_VALIDATOR_URL="http://localhost:8899"

# 3. Start validator (in one terminal)
./multinode-demo/validator.sh

# 4. Start RPC server (in another terminal)
node bssc-live-server.js
```

---

## Test Cases

### Test 1: BSSC Balance Check - Pass ✅

**Objective:** Verify balance checking works with sufficient BSSC

**Steps:**
1. Send some BSSC tokens to test wallet
2. Send transaction via MetaMask
3. Check logs for balance verification

**Expected Result:**
- Balance check passes
- Transaction executes successfully
- Gas fee deducted
- Success message in logs

**Check Logs For:**
```
[BSSC] Balance check: 1.0 BSSC, Required: 0.001 BSSC
[BSSC] Gas fee instruction created: 0.001 BSSC
[BSSC] Added gas fee instruction to transaction
[INFO] Transaction successful!
```

### Test 2: BSSC Balance Check - Fail ❌

**Objective:** Verify error handling for insufficient BSSC

**Steps:**
1. Use wallet with 0 BSSC balance
2. Attempt to send transaction
3. Observe error message

**Expected Result:**
- Transaction rejected
- Error message displayed
- Pump.fun link provided
- Transaction not executed

**Expected Error:**
```
Error: Insufficient BSSC balance. Need 0.001 BSSC for gas fees. 
Buy BSSC at https://pump.fun/coin/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump
```

### Test 3: SPL Token Library Not Available

**Objective:** Verify backwards compatibility

**Steps:**
1. Temporarily remove @solana/spl-token
2. Attempt transaction
3. Check behavior

**Expected Result:**
- Warning logged
- Transaction still allowed
- Gas fee deduction skipped
- Transaction executes successfully

**Check Logs For:**
```
[WARNING] BSSC token check skipped - SPL token library not available
[WARNING] BSSC gas fee deduction skipped
```

### Test 4: Fee Collector Not Configured

**Objective:** Verify graceful degradation

**Steps:**
1. Don't set FEE_COLLECTOR_ADDRESS
2. Attempt transaction
3. Check behavior

**Expected Result:**
- Gas fee deduction skipped
- Transaction executes
- Warning logged

**Check Logs For:**
```
[WARNING] BSSC gas fee deduction skipped
```

### Test 5: Explorer BSSC Price Display

**Objective:** Verify price feed works

**Steps:**
1. Open explorer.html in browser
2. Check BSSC price card
3. Verify price updates

**Expected Result:**
- Price displays correctly
- Updates automatically
- Shows 24h change if available
- Falls back to default if API fails

### Test 6: Gas Fee Display in Explorer

**Objective:** Verify gas fees shown correctly

**Steps:**
1. Open explorer
2. Check transaction details
3. Verify gas fees shown in BSSC

**Expected Result:**
- Fees shown as "0.001 BSSC" not lamports
- Clear and readable format
- Consistent across all displays

---

## Manual Testing Script

Create `test-bssc-integration.js`:

```javascript
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress, getAccount } = require('@solana/spl-token');

const BSSC_TOKEN_MINT = 'EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump';
const CONNECTION = new Connection('http://localhost:8899', 'confirmed');

async function testBSSCBalance() {
    console.log('Testing BSSC Balance Check...');
    
    // Create test wallet
    const wallet = Keypair.generate();
    console.log('Test wallet:', wallet.publicKey.toString());
    
    // Airdrop SOL for transaction fees
    const sig = await CONNECTION.requestAirdrop(wallet.publicKey, 1 * 1e9);
    await CONNECTION.confirmTransaction(sig);
    console.log('Received airdrop');
    
    // Get token account
    const mintPubkey = new PublicKey(BSSC_TOKEN_MINT);
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, wallet.publicKey);
    
    try {
        const account = await getAccount(CONNECTION, tokenAccount);
        console.log('BSSC Balance:', account.amount.toString());
        
        const required = 0.001 * 1e6; // 0.001 BSSC with 6 decimals
        if (account.amount >= required) {
            console.log('✅ PASS: Sufficient BSSC balance');
        } else {
            console.log('❌ FAIL: Insufficient BSSC balance');
        }
    } catch (error) {
        console.log('⚠️  WARNING: Token account not found');
        console.log('   This is normal for new wallets');
    }
}

testBSSCBalance().catch(console.error);
```

Run test:
```bash
node test-bssc-integration.js
```

---

## Integration Testing

### Full Transaction Flow Test

```bash
# 1. Start validator
./multinode-demo/validator.sh

# 2. Start RPC server
export FEE_COLLECTOR_ADDRESS="test-collector-address"
node bssc-live-server.js

# 3. Test via MetaMask
# - Connect to http://localhost:8545
# - Send test transaction
# - Verify balance check
# - Verify gas fee deduction
# - Verify transaction success

# 4. Check logs
# Look for BSSC-related log messages
```

---

## Performance Testing

### Load Test

```bash
# Send 100 transactions
for i in {1..100}; do
    curl -X POST http://localhost:8545 \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"eth_sendTransaction","params":[...]}'
done
```

**Monitor:**
- Average response time
- Success rate
- BSSC balance checks
- Gas fee deductions
- Error rate

---

## Bug Reporting

When reporting bugs, include:

1. **Test Case:** Which test failed
2. **Environment:** OS, Node version, npm version
3. **Configuration:** Environment variables set
4. **Logs:** Relevant log output
5. **Steps:** What you did to reproduce
6. **Expected:** What should have happened
7. **Actual:** What actually happened

---

## Known Issues

### Issue 1: Token Account Creation

**Problem:** New wallets don't have token accounts
**Status:** Expected behavior
**Workaround:** System automatically handles this
**Fix:** None needed

### Issue 2: Library Vulnerabilities

**Problem:** npm audit shows vulnerabilities
**Status:** Known, low priority
**Impact:** No security impact in current use
**Fix:** Will update dependencies in future

---

## Success Criteria

All tests should:

✅ Check BSSC balance before transaction
✅ Reject if insufficient balance
✅ Deduct gas fee if balance sufficient
✅ Show helpful error messages
✅ Include pump.fun link in errors
✅ Gracefully degrade if libraries missing
✅ Log all BSSC operations
✅ Execute transactions successfully

---

## Next Steps After Testing

Once all tests pass:

1. Deploy to production validator
2. Configure fee collector address
3. Monitor BSSC usage metrics
4. Track gas fee collection
5. Update explorer with real stats

