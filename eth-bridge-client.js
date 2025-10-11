// ETH Bridge Client - Interact with PDA bridge program from RPC server
const solanaWeb3 = require('@solana/web3.js');
const borsh = require('borsh');

// Bridge program ID (will be set after deployment)
let BRIDGE_PROGRAM_ID = null;

// PDA seed prefix (must match Rust program)
const PDA_SEED_PREFIX = Buffer.from('eth-bridge');

/**
 * Set the bridge program ID
 */
function setBridgeProgramId(programIdString) {
    BRIDGE_PROGRAM_ID = new solanaWeb3.PublicKey(programIdString);
}

/**
 * Derive PDA from Ethereum address
 * Returns the same address the Rust program would derive
 */
function derivePDA(ethAddress) {
    if (!BRIDGE_PROGRAM_ID) {
        throw new Error('Bridge program ID not set. Call setBridgeProgramId() first');
    }
    
    // Remove 0x prefix if present
    const cleanAddr = ethAddress.toLowerCase().replace('0x', '');
    
    // Convert hex string to bytes
    const ethAddressBytes = Buffer.from(cleanAddr, 'hex');
    
    if (ethAddressBytes.length !== 20) {
        throw new Error('Invalid Ethereum address length');
    }
    
    // Derive PDA
    const [pda, bump] = solanaWeb3.PublicKey.findProgramAddressSync(
        [PDA_SEED_PREFIX, ethAddressBytes],
        BRIDGE_PROGRAM_ID
    );
    
    return { pda, bump, ethAddressBytes };
}

/**
 * Create instruction to initialize PDA for an ETH address
 */
function createInitializePDAInstruction(payerPubkey, ethAddress) {
    const { pda, ethAddressBytes } = derivePDA(ethAddress);
    
    // Instruction discriminator (0 = InitializePDA)
    const instructionData = Buffer.concat([
        Buffer.from([0]), // Instruction index
        ethAddressBytes   // ETH address
    ]);
    
    return new solanaWeb3.TransactionInstruction({
        keys: [
            { pubkey: payerPubkey, isSigner: true, isWritable: true },
            { pubkey: pda, isSigner: false, isWritable: true },
            { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: BRIDGE_PROGRAM_ID,
        data: instructionData,
    });
}

/**
 * Create instruction to transfer SOL via PDA
 */
function createTransferInstruction(sourceEthAddress, destinationPubkey, amount, ethSignature) {
    const { pda, ethAddressBytes } = derivePDA(sourceEthAddress);
    
    // Instruction discriminator (1 = Transfer)
    const instructionData = Buffer.concat([
        Buffer.from([1]), // Instruction index
        ethAddressBytes,  // Source ETH address (20 bytes)
        Buffer.from(amount.toString(16).padStart(16, '0'), 'hex'), // u64 amount (8 bytes)
        ethSignature      // ETH signature (65 bytes)
    ]);
    
    return new solanaWeb3.TransactionInstruction({
        keys: [
            { pubkey: pda, isSigner: false, isWritable: true },
            { pubkey: destinationPubkey, isSigner: false, isWritable: true },
            { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: BRIDGE_PROGRAM_ID,
        data: instructionData,
    });
}

/**
 * Check if PDA is initialized
 */
async function isPDAInitialized(connection, ethAddress) {
    try {
        const { pda } = derivePDA(ethAddress);
        const accountInfo = await connection.getAccountInfo(pda);
        
        if (!accountInfo) {
            return false;
        }
        
        // Check if owned by bridge program
        return accountInfo.owner.equals(BRIDGE_PROGRAM_ID);
    } catch (error) {
        return false;
    }
}

/**
 * Get PDA balance
 */
async function getPDABalance(connection, ethAddress) {
    const { pda } = derivePDA(ethAddress);
    const balance = await connection.getBalance(pda);
    return balance;
}

/**
 * Initialize PDA if needed, then send transfer
 * This is the main function the RPC server will call
 */
async function sendTransactionViaPDA(
    connection,
    authorityKeypair, // Server's keypair to pay for transactions
    fromEthAddress,
    toEthAddress,
    amountLamports,
    ethSignatureHex
) {
    const instructions = [];
    
    // Convert ETH signature from hex to bytes
    const ethSignature = Buffer.from(ethSignatureHex.replace('0x', ''), 'hex');
    if (ethSignature.length !== 65) {
        throw new Error('Invalid ETH signature length');
    }
    
    // Check if source PDA is initialized
    const sourceInitialized = await isPDAInitialized(connection, fromEthAddress);
    if (!sourceInitialized) {
        console.log('[BRIDGE] Initializing source PDA for', fromEthAddress);
        instructions.push(
            createInitializePDAInstruction(authorityKeypair.publicKey, fromEthAddress)
        );
    }
    
    // Derive destination (could be PDA or regular account)
    let destinationPubkey;
    if (toEthAddress.startsWith('0x')) {
        // Destination is also an ETH address - use PDA
        const destInitialized = await isPDAInitialized(connection, toEthAddress);
        if (!destInitialized) {
            console.log('[BRIDGE] Initializing destination PDA for', toEthAddress);
            instructions.push(
                createInitializePDAInstruction(authorityKeypair.publicKey, toEthAddress)
            );
        }
        const { pda } = derivePDA(toEthAddress);
        destinationPubkey = pda;
    } else {
        // Destination is a regular Solana address
        destinationPubkey = new solanaWeb3.PublicKey(toEthAddress);
    }
    
    // Add transfer instruction
    instructions.push(
        createTransferInstruction(fromEthAddress, destinationPubkey, amountLamports, ethSignature)
    );
    
    // Create and send transaction
    const transaction = new solanaWeb3.Transaction().add(...instructions);
    const signature = await solanaWeb3.sendAndConfirmTransaction(
        connection,
        transaction,
        [authorityKeypair],
        {
            commitment: 'confirmed',
        }
    );
    
    console.log('[BRIDGE] Transaction successful:', signature);
    return signature;
}

/**
 * Fund a PDA (for faucet functionality)
 */
async function fundPDA(connection, authorityKeypair, ethAddress, amountLamports) {
    // Check if PDA exists
    const { pda } = derivePDA(ethAddress);
    const accountInfo = await connection.getAccountInfo(pda);
    
    const instructions = [];
    
    if (!accountInfo) {
        // Initialize PDA first
        console.log('[BRIDGE] Initializing PDA for', ethAddress);
        instructions.push(
            createInitializePDAInstruction(authorityKeypair.publicKey, ethAddress)
        );
    }
    
    // Transfer SOL to PDA
    instructions.push(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: authorityKeypair.publicKey,
            toPubkey: pda,
            lamports: amountLamports,
        })
    );
    
    const transaction = new solanaWeb3.Transaction().add(...instructions);
    const signature = await solanaWeb3.sendAndConfirmTransaction(
        connection,
        transaction,
        [authorityKeypair],
        {
            commitment: 'confirmed',
        }
    );
    
    console.log('[BRIDGE] Funded PDA:', signature);
    return signature;
}

module.exports = {
    setBridgeProgramId,
    derivePDA,
    isPDAInitialized,
    getPDABalance,
    sendTransactionViaPDA,
    fundPDA,
    createInitializePDAInstruction,
    createTransferInstruction,
};

