const { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');

console.log('========================================');
console.log('BSSC Real Functionality Tests');
console.log('========================================\n');

// Test 1: Connect to validator
async function test1_connection() {
    console.log('[TEST 1] Connecting to BSSC Validator...');
    try {
        const connection = new Connection('http://localhost:8899', 'confirmed');
        const version = await connection.getVersion();
        console.log('✓ Connected! Version:', version['solana-core']);
        
        const slot = await connection.getSlot();
        console.log('✓ Current Slot:', slot);
        
        return connection;
    } catch (error) {
        console.log('✗ Connection failed:', error.message);
        return null;
    }
}

// Test 2: Create a new wallet
async function test2_createWallet() {
    console.log('\n[TEST 2] Creating New Wallet...');
    try {
        const wallet = Keypair.generate();
        console.log('✓ Wallet Created!');
        console.log('  Public Key:', wallet.publicKey.toString());
        console.log('  Secret Key:', Buffer.from(wallet.secretKey).toString('hex').substring(0, 32) + '...');
        return wallet;
    } catch (error) {
        console.log('✗ Wallet creation failed:', error.message);
        return null;
    }
}

// Test 3: Request airdrop from faucet
async function test3_airdrop(connection, wallet) {
    console.log('\n[TEST 3] Requesting Airdrop (1 BNB)...');
    try {
        const airdropSignature = await connection.requestAirdrop(
            wallet.publicKey,
            LAMPORTS_PER_SOL
        );
        console.log('✓ Airdrop requested! Signature:', airdropSignature);
        
        // Wait for confirmation
        await connection.confirmTransaction(airdropSignature);
        console.log('✓ Airdrop confirmed!');
        
        // Check balance
        const balance = await connection.getBalance(wallet.publicKey);
        console.log('✓ New Balance:', balance / LAMPORTS_PER_SOL, 'BNB');
        
        return balance > 0;
    } catch (error) {
        console.log('✗ Airdrop failed:', error.message);
        return false;
    }
}

// Test 4: Send transaction between wallets
async function test4_sendTransaction(connection, fromWallet) {
    console.log('\n[TEST 4] Sending Transaction Between Wallets...');
    try {
        // Create recipient wallet
        const toWallet = Keypair.generate();
        console.log('  Recipient:', toWallet.publicKey.toString());
        
        // Create transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromWallet.publicKey,
                toPubkey: toWallet.publicKey,
                lamports: LAMPORTS_PER_SOL / 10, // 0.1 BNB
            })
        );
        
        // Send transaction
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [fromWallet]
        );
        
        console.log('✓ Transaction sent! Signature:', signature);
        
        // Verify balances
        const fromBalance = await connection.getBalance(fromWallet.publicKey);
        const toBalance = await connection.getBalance(toWallet.publicKey);
        
        console.log('✓ Sender Balance:', fromBalance / LAMPORTS_PER_SOL, 'BNB');
        console.log('✓ Recipient Balance:', toBalance / LAMPORTS_PER_SOL, 'BNB');
        
        return toBalance > 0;
    } catch (error) {
        console.log('✗ Transaction failed:', error.message);
        return false;
    }
}

// Test 5: Check transaction history
async function test5_transactionHistory(connection, wallet) {
    console.log('\n[TEST 5] Checking Transaction History...');
    try {
        const signatures = await connection.getSignaturesForAddress(wallet.publicKey, { limit: 5 });
        console.log('✓ Found', signatures.length, 'transactions');
        
        for (let i = 0; i < signatures.length; i++) {
            const sig = signatures[i];
            console.log(`  ${i + 1}. ${sig.signature.substring(0, 20)}... (Slot: ${sig.slot})`);
        }
        
        return signatures.length > 0;
    } catch (error) {
        console.log('✗ History check failed:', error.message);
        return false;
    }
}

// Test 6: Get transaction details
async function test6_transactionDetails(connection, wallet) {
    console.log('\n[TEST 6] Getting Transaction Details...');
    try {
        const signatures = await connection.getSignaturesForAddress(wallet.publicKey, { limit: 1 });
        
        if (signatures.length === 0) {
            console.log('✗ No transactions found');
            return false;
        }
        
        const tx = await connection.getTransaction(signatures[0].signature);
        
        if (tx) {
            console.log('✓ Transaction Details:');
            console.log('  Slot:', tx.slot);
            console.log('  Block Time:', new Date(tx.blockTime * 1000).toISOString());
            console.log('  Fee:', tx.meta.fee / LAMPORTS_PER_SOL, 'BNB');
            console.log('  Status:', tx.meta.err ? 'Failed' : 'Success');
            return true;
        } else {
            console.log('✗ Could not fetch transaction details');
            return false;
        }
    } catch (error) {
        console.log('✗ Details fetch failed:', error.message);
        return false;
    }
}

// Test 7: Measure block production speed
async function test7_blockSpeed(connection) {
    console.log('\n[TEST 7] Measuring Block Production Speed...');
    try {
        const slot1 = await connection.getSlot();
        const time1 = Date.now();
        
        // Wait for next block
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const slot2 = await connection.getSlot();
        const time2 = Date.now();
        
        const blockTime = (time2 - time1) / (slot2 - slot1);
        const blocksProduced = slot2 - slot1;
        
        console.log('✓ Blocks Produced:', blocksProduced);
        console.log('✓ Average Block Time:', blockTime.toFixed(0), 'ms');
        console.log('✓ Theoretical TPS:', (65000 * (400 / blockTime)).toFixed(0));
        
        return blockTime < 1000; // Should be under 1 second
    } catch (error) {
        console.log('✗ Block speed test failed:', error.message);
        return false;
    }
}

// Test 8: Stress test with multiple transactions
async function test8_stressTest(connection, wallet) {
    console.log('\n[TEST 8] Stress Test (10 transactions)...');
    try {
        const promises = [];
        const startTime = Date.now();
        
        for (let i = 0; i < 10; i++) {
            const toWallet = Keypair.generate();
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: toWallet.publicKey,
                    lamports: LAMPORTS_PER_SOL / 100, // 0.01 BNB each
                })
            );
            
            promises.push(
                sendAndConfirmTransaction(connection, transaction, [wallet])
                    .catch(err => null)
            );
        }
        
        const results = await Promise.all(promises);
        const successful = results.filter(r => r !== null).length;
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log('✓ Successful:', successful, '/ 10');
        console.log('✓ Duration:', duration.toFixed(2), 'seconds');
        console.log('✓ TPS:', (successful / duration).toFixed(2));
        
        return successful >= 5; // At least 50% success
    } catch (error) {
        console.log('✗ Stress test failed:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    let passed = 0;
    let failed = 0;
    
    const connection = await test1_connection();
    if (!connection) {
        console.log('\n❌ Cannot continue without connection');
        return;
    }
    passed++;
    
    const wallet = await test2_createWallet();
    if (!wallet) {
        console.log('\n❌ Cannot continue without wallet');
        return;
    }
    passed++;
    
    if (await test3_airdrop(connection, wallet)) passed++; else failed++;
    if (await test4_sendTransaction(connection, wallet)) passed++; else failed++;
    if (await test5_transactionHistory(connection, wallet)) passed++; else failed++;
    if (await test6_transactionDetails(connection, wallet)) passed++; else failed++;
    if (await test7_blockSpeed(connection)) passed++; else failed++;
    if (await test8_stressTest(connection, wallet)) passed++; else failed++;
    
    console.log('\n========================================');
    console.log('Test Results:');
    console.log('  Passed:', passed);
    console.log('  Failed:', failed);
    console.log('  Total:', passed + failed);
    console.log('========================================');
    
    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Your blockchain is working perfectly!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the output above for details.');
    }
}

// Run tests
runAllTests().catch(console.error);
