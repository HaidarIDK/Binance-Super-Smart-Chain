# Week 1 Remaining Tasks

## Status: 50% Complete

---

## Completed So Far

### Task 1: Update RPC Server for BSSC Token - DONE
- [x] Added BSSC token mint address constant
- [x] Implemented token balance checking before transactions
- [x] Implemented gas fee collection mechanism
- [x] Added burn mechanism placeholder (50%)
- [x] Added validator rewards placeholder (50%)

### Task 2: Token Economics Configuration - DONE
- [x] Created `mainnet-config.json` file
- [x] Configured gas fee amounts per operation type
- [x] Set fee distribution (burn vs validators)
- [x] Added minimum staking requirements

---

## Still To Do This Week

### Task 3: Update Explorer - NOT STARTED
**File:** `explorer.html`

**Tasks:**
- [ ] Add BSSC token price feed from DexScreener API
- [ ] Display daily token usage stats
- [ ] Add total burned counter
- [ ] Add "Buy BSSC" button linking to pump.fun
- [ ] Show current BSSC balance for connected wallets
- [ ] Display gas fees in BSSC (not SOL)

**Estimated Time:** 2-3 hours

### Task 4: Testing and Bug Fixes - NOT STARTED
**Tasks:**
- [ ] Install `@solana/spl-token` package: `npm install`
- [ ] Set up fee collector address
- [ ] Test balance checking with real BSSC tokens
- [ ] Test transaction with sufficient BSSC balance
- [ ] Test transaction with insufficient BSSC balance
- [ ] Verify gas fee deduction works correctly
- [ ] Test error messages and pump.fun links
- [ ] Fix any bugs discovered

**Estimated Time:** 2-3 hours

### Task 5: Documentation Updates - PARTIAL
**Tasks:**
- [x] Create WEEK1_PROGRESS.md
- [ ] Update README.md with BSSC token info
- [ ] Create user guide for getting BSSC tokens
- [ ] Document environment variables needed
- [ ] Add testing instructions

**Estimated Time:** 1 hour

---

## Detailed Implementation Needed

### 1. Explorer Updates (`explorer.html`)

#### Add BSSC Price Display
```javascript
// Add after line ~592 (after hero stats)
<div class="stat-card">
    <div class="stat-label">BSSC Token Price</div>
    <div class="stat-value" id="bsscPrice">$0.000065</div>
    <div class="stat-change">Live</div>
</div>
```

#### Add Token Stats Section
```javascript
// Add new function to fetch BSSC price
async function fetchBSSCPrice() {
    try {
        const response = await fetch(
            'https://api.dexscreener.com/latest/dex/tokens/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump'
        );
        const data = await response.json();
        return data.pairs[0]?.priceUsd || '0.000065';
    } catch (error) {
        console.error('Error fetching BSSC price:', error);
        return '0.000065';
    }
}

// Call on page load
loadData().then(() => {
    fetchBSSCPrice().then(price => {
        document.getElementById('bsscPrice').textContent = '$' + price;
    });
});
```

#### Add Buy BSSC Button
```html
<!-- Add near faucet section -->
<div class="table-container" style="margin-bottom: 2rem;">
    <div class="table-header">
        <h2 class="table-title">Buy BSSC Token</h2>
        <span class="badge success">Live on pump.fun</span>
    </div>
    <div style="padding: 2rem; text-align: center;">
        <p style="color: var(--gray); margin-bottom: 1.5rem;">
            Buy BSSC tokens on pump.fun to use the blockchain. 
            Gas fees are paid in BSSC: 0.001 BSSC per transaction.
        </p>
        <a href="https://pump.fun/coin/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump" 
           target="_blank"
           style="display: inline-block; padding: 1rem 2rem; background: var(--primary); color: var(--dark); border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.3s;">
            Buy BSSC on pump.fun
        </a>
    </div>
</div>
```

#### Show Gas Fees in BSSC
Update transaction display to show "0.001 BSSC" instead of lamports

### 2. Testing Checklist

```bash
# Step 1: Install dependencies
npm install

# Step 2: Set environment variables
export FEE_COLLECTOR_ADDRESS="your-fee-collector-address-here"
export BSSC_VALIDATOR_URL="http://localhost:8899"

# Step 3: Start validator (in separate terminal)
./multinode-demo/validator.sh

# Step 4: Start RPC server
node bssc-live-server.js

# Step 5: Test scenarios:

# Test 1: User with BSSC balance
# - Connect MetaMask
# - Try to send transaction
# - Should succeed and deduct 0.001 BSSC

# Test 2: User without BSSC balance
# - Connect MetaMask with no BSSC
# - Try to send transaction
# - Should show error with pump.fun link

# Test 3: Check logs
# - Balance check should appear in logs
# - Gas fee deduction should be logged
# - Transaction should execute successfully
```

### 3. Documentation Needed

#### Update README.md
Add section about BSSC token:
```markdown
## BSSC Native Token

BSSC uses BSSC tokens for gas fees. Every transaction requires 0.001 BSSC.

- Buy BSSC: https://pump.fun/coin/EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump
- Gas fees: 0.001 BSSC per transfer
- Fee distribution: 50% burned, 50% validators
```

#### Create USER_GUIDE.md
Guide for end users on:
- How to buy BSSC tokens
- How to check BSSC balance
- What happens when you don't have enough BSSC
- How gas fees work

---

## Priority Order

1. **HIGH:** Explorer updates (visibility for users)
2. **HIGH:** Testing and bug fixes (functional requirements)
3. **MEDIUM:** Documentation (help users understand)
4. **LOW:** Additional features (nice to have)

---

## Time Estimate

- Explorer updates: 2-3 hours
- Testing: 2-3 hours
- Documentation: 1 hour
- Bug fixes: 1-2 hours

**Total remaining:** 6-9 hours

---

## Summary

**Completed:** 2 of 3 main tasks (66%)  
**Remaining:** Explorer updates + Testing  
**Estimated completion:** End of week if working 2-3 hours/day

