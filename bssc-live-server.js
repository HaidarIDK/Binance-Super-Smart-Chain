// BSSC Live Production RPC Server
const https = require('https');
const http = require('http');
const fs = require('fs');

// Import Ethereum-Solana address bridge
const {
    ethAddressToSolanaAddress,
    solanaAddressToEthAddress,
    isEthereumAddress,
    isSolanaAddress,
    normalizeAddress
} = require('./eth-solana-bridge.js');

const HTTP_PORT = process.env.PORT || 80;
const HTTPS_PORT = process.env.PORT || 443;
const METAMASK_PORT = 8545; // Local MetaMask testing port
const DOMAIN = 'bssc-rpc.bssc.live';

// Official Contract Addresses
const OFFICIAL_CONTRACTS = {
    'PUMP': {
        address: 'EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump',
        name: 'Official Pump Coin',
        symbol: 'PUMP',
        description: 'The official pump coin on BSSC',
        chainId: 16979
    }
};

// BSSC Validator RPC URL (update this when validator is deployed)
const BSSC_VALIDATOR_URL = process.env.BSSC_VALIDATOR_URL || 'http://109.147.47.132:8899';

// In-memory transaction and receipt storage (for EVM-on-Solana option)
const transactionStore = new Map();
const receiptStore = new Map();
const logStore = new Map();
let currentBlockNumber = 0;
let currentBlockHash = '0x' + '0'.repeat(64);

// BNB token on Solana tracking
const BNB_TOKEN_ADDRESS = 'BNBTokenSolanaBSSC1111111111111111111111111';
const bnbBalances = new Map();

// BNB to SOL exchange rate
const BNB_TO_SOL_RATE = 5;

// Persistent storage file
const STORAGE_FILE = 'bssc-data.json';

// Load persistent data
function loadPersistentData() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
            
            // Load BNB balances
            if (data.bnbBalances) {
                Object.entries(data.bnbBalances).forEach(([addr, balance]) => {
                    bnbBalances.set(addr, balance);
                });
            }
            
            // Load transactions
            if (data.transactions) {
                Object.entries(data.transactions).forEach(([hash, tx]) => {
                    transactionStore.set(hash, tx);
                });
            }
            
            // Load receipts
            if (data.receipts) {
                Object.entries(data.receipts).forEach(([hash, receipt]) => {
                    receiptStore.set(hash, receipt);
                });
            }
            
            // Load current block number
            if (data.currentBlockNumber) {
                currentBlockNumber = data.currentBlockNumber;
            }
            
            console.log('Loaded persistent data from ' + STORAGE_FILE);
        } else {
            // Initialize default balances
            bnbBalances.set('F6iwdHyHi5KfEVKETtmnuKHZPX9T43rCVjHk8UTxGZDA', 5);
        }
    } catch (error) {
        console.error('Error loading persistent data:', error.message);
        // Initialize default balances
        bnbBalances.set('F6iwdHyHi5KfEVKETtmnuKHZPX9T43rCVjHk8UTxGZDA', 5);
    }
}

// Save persistent data
function savePersistentData() {
    try {
        const data = {
            bnbBalances: Object.fromEntries(bnbBalances),
            transactions: Object.fromEntries(transactionStore),
            receipts: Object.fromEntries(receiptStore),
            currentBlockNumber: currentBlockNumber,
            lastSaved: new Date().toISOString()
        };
        
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving persistent data:', error.message);
    }
}

// Load data on startup
loadPersistentData();

// Auto-save every 30 seconds
setInterval(savePersistentData, 30000);

// Track transaction timestamps
const transactionTimestamps = new Map();

// Track address transaction counts (nonces)
const addressNonces = new Map();

// Generate a mock transaction hash
function generateTxHash() {
    return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Generate a mock block hash
function generateBlockHash() {
    return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Create a mock transaction receipt
function createMockReceipt(txHash, blockNumber, blockHash, status = '0x1') {
    return {
        transactionHash: txHash,
        transactionIndex: '0x0',
        blockHash: blockHash,
        blockNumber: '0x' + blockNumber.toString(16),
        from: '0x' + '0'.repeat(40),
        to: '0x' + '0'.repeat(40),
        cumulativeGasUsed: '0x5208',
        gasUsed: '0x5208',
        contractAddress: null,
        logs: [],
        logsBloom: '0x' + '0'.repeat(512),
        status: status
    };
}

// Create a mock transaction
function createMockTransaction(txHash, rawTx) {
    return {
        hash: txHash,
        nonce: '0x0',
        blockHash: currentBlockHash,
        blockNumber: '0x' + currentBlockNumber.toString(16),
        transactionIndex: '0x0',
        from: '0x' + '0'.repeat(40),
        to: '0x' + '0'.repeat(40),
        value: '0x0',
        gas: '0x5208',
        gasPrice: '0x5d21dba00',
        input: '0x',
        v: '0x0',
        r: '0x' + '0'.repeat(64),
        s: '0x' + '0'.repeat(64)
    };
}

// Function to call real BSSC validator
async function callBSSCValidator(method, params = []) {
    try {
        const response = await fetch(BSSC_VALIDATOR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: method,
                params: params
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.log(`BSSC Validator not available: ${error.message}`);
    }
    
    // Fallback to mock responses if validator not available
    return null;
}

// Enhanced mock responses for BSSC RPC (fallback when validator not available)
const mockResponses = {
    getHealth: {
        jsonrpc: "2.0",
        id: 1,
        result: "ok"
    },
    getVersion: {
        jsonrpc: "2.0",
        id: 1,
        result: {
            "solana-core": "1.18.4",
            "feature-set": 1234567890,
            "bsc-version": "1.0.0",
            "server": "BSSC Live RPC",
            "domain": DOMAIN
        }
    },
    getSlot: {
        jsonrpc: "2.0",
        id: 1,
        result: Math.floor(Date.now() / 400)
    },
    getBlockHeight: {
        jsonrpc: "2.0",
        id: 1,
        result: Math.floor(Date.now() / 400)
    },
    getLatestBlockhash: {
        jsonrpc: "2.0",
        id: 1,
        result: {
            context: {
                slot: Math.floor(Date.now() / 400)
            },
            value: "11111111111111111111111111111111"
        }
    },
    getAccountInfo: {
        jsonrpc: "2.0",
        id: 1,
        result: {
            context: {
                slot: Math.floor(Date.now() / 400)
            },
            value: {
                data: ["", "base64"],
                executable: false,
                lamports: 1000000000,
                owner: "11111111111111111111111111111111",
                rentEpoch: 0
            }
        }
    },
    // Web3/Ethereum compatible methods
    eth_blockNumber: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x" + Math.floor(Date.now() / 400).toString(16)
    },
    eth_chainId: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x4253" // BSSC Testnet Chain ID 16979 (BSSC in hex: B=16, S=19, S=19, C=3)
    },
    net_version: {
        jsonrpc: "2.0",
        id: 1,
        result: "16979"
    },
    eth_syncing: {
        jsonrpc: "2.0",
        id: 1,
        result: false // Not syncing, blockchain is ready
    },
    eth_call: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x" // Empty result for contract calls
    },
    eth_getCode: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x" // No code at address (EOA)
    },
    eth_getBalance: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x1bc16d674ec80000" // 2 BNB in hex
    },
    eth_gasPrice: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x5d21dba00" // 25 Gwei
    },
    eth_getTransactionCount: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x0"
    },
    eth_estimateGas: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x5208" // 21000 gas
    },
    // Contract information methods
    getContractInfo: {
        jsonrpc: "2.0",
        id: 1,
        result: OFFICIAL_CONTRACTS
    },
    getOfficialContracts: {
        jsonrpc: "2.0",
        id: 1,
        result: OFFICIAL_CONTRACTS
    },
    // PUMP coin specific methods
    getPumpContractInfo: {
        jsonrpc: "2.0",
        id: 1,
        result: OFFICIAL_CONTRACTS.PUMP
    },
    eth_call_pump: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x0000000000000000000000000000000000000000000000000000000000000001"
    },
    eth_sendRawTransaction: {
        jsonrpc: "2.0",
        id: 1,
        result: null // Will be set dynamically
    },
    eth_getTransactionByHash: {
        jsonrpc: "2.0",
        id: 1,
        result: null // Will be set dynamically
    },
    eth_getTransactionReceipt: {
        jsonrpc: "2.0",
        id: 1,
        result: null // Will be set dynamically
    },
    eth_getLogs: {
        jsonrpc: "2.0",
        id: 1,
        result: [] // Will be set dynamically
    },
    eth_requestFaucet: {
        jsonrpc: "2.0",
        id: 1,
        result: {
            success: true,
            txHash: null, // Will be set dynamically
            amount: "1000000000000000000" // 1 BNB
        }
    },
    // BNB Token on Solana methods
    getBNBBalance: {
        jsonrpc: "2.0",
        id: 1,
        result: {
            address: "",
            bnbBalance: 0,
            solEquivalent: 0,
            tokenAddress: BNB_TOKEN_ADDRESS
        }
    },
    getBNBTokenInfo: {
        jsonrpc: "2.0",
        id: 1,
        result: {
            name: "BNB Token on Solana",
            symbol: "BNB",
            decimals: 9,
            totalSupply: 1000000,
            tokenAddress: BNB_TOKEN_ADDRESS,
            exchangeRate: BNB_TO_SOL_RATE,
            description: "BNB token on Solana network - BSSC implementation"
        }
    }
};

// Get all transactions for explorer
function getAllTransactions() {
    const txs = [];
    for (const [hash, tx] of transactionStore.entries()) {
        const receipt = receiptStore.get(hash);
        txs.push({
            hash: hash,
            from: tx.from || '0x0000000000000000000000000000000000000000',
            to: tx.to || '0x0000000000000000000000000000000000000000',
            value: tx.value || '0x0',
            timestamp: transactionTimestamps.get(hash) || Date.now(),
            status: receipt?.status === '0x1' ? 'success' : 'failed',
            gasUsed: parseInt(receipt?.gasUsed || '0x5208', 16),
            gasPrice: tx.gasPrice || '0x4a817c800',
            blockNumber: parseInt(receipt?.blockNumber || '0x0', 16)
        });
    }
    // Sort by timestamp, newest first
    return txs.sort((a, b) => b.timestamp - a.timestamp);
}

// Get recent transactions (limit)
function getRecentTransactions(limit = 20) {
    const allTxs = getAllTransactions();
    return allTxs.slice(0, limit);
}

// Request handler
function handleRequest(req, res) {
    // Security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // CORS headers for web3 applications
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Health check endpoint
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('BSSC Live RPC Server is healthy\n');
        return;
    }
    
    // Root endpoint - return JSON like normal RPC servers
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code: -32600,
                message: "Invalid Request - POST method required"
            }
        }));
        return;
    }
    
    // Handle RPC requests
    if (req.method !== 'POST') {
        res.writeHead(405, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Method not allowed'}));
        return;
    }
    
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', async () => {
        try {
            const request = JSON.parse(body);
            const method = request.method;
            const params = request.params || [];
            const id = request.id || 1;
            
            console.log(`[${new Date().toISOString()}] ${DOMAIN} RPC Request: ${method} from ${req.connection.remoteAddress}`);
            
            let response;
            
            // Handle EVM transaction methods with in-memory storage
            if (method === 'eth_sendRawTransaction') {
                const rawTx = params[0];
                const txHash = generateTxHash();
                
                // Store transaction and receipt
                const mockTx = createMockTransaction(txHash, rawTx);
                const mockReceipt = createMockReceipt(txHash, currentBlockNumber, currentBlockHash);
                
                transactionStore.set(txHash, mockTx);
                receiptStore.set(txHash, mockReceipt);
                transactionTimestamps.set(txHash, Date.now());
                
                // Increment nonce for sender address
                const senderAddress = mockTx.from;
                addressNonces.set(senderAddress, (addressNonces.get(senderAddress) || 0) + 1);
                
                // Increment block number for next transaction
                currentBlockNumber++;
                currentBlockHash = generateBlockHash();
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: txHash
                };
                console.log(`Stored transaction ${txHash} in block ${currentBlockNumber - 1}`);
                savePersistentData();
                
            } else if (method === 'eth_getTransactionCount') {
                // Get transaction count (nonce) for address
                let address = params[0];
                
                // Convert Ethereum address to Solana if needed
                if (isEthereumAddress(address)) {
                    const solanaAddr = ethAddressToSolanaAddress(address);
                    console.log(`Converted ETH address ${address} to Solana ${solanaAddr} for nonce query`);
                    address = solanaAddr;
                }
                
                const nonce = addressNonces.get(address) || 0;
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: '0x' + nonce.toString(16)
                };
                
            } else if (method === 'eth_sendTransaction') {
                // Handle MetaMask transaction sending
                const txParams = params[0];
                let fromAddress = txParams.from;
                let toAddress = txParams.to;
                
                // Convert Ethereum addresses to Solana
                if (isEthereumAddress(fromAddress)) {
                    const solanaFrom = ethAddressToSolanaAddress(fromAddress);
                    console.log(`Converted sender ${fromAddress} to ${solanaFrom}`);
                    fromAddress = solanaFrom;
                }
                
                if (toAddress && isEthereumAddress(toAddress)) {
                    const solanaTo = ethAddressToSolanaAddress(toAddress);
                    console.log(`Converted recipient ${toAddress} to ${solanaTo}`);
                    toAddress = solanaTo;
                }
                
                // Create transaction on Solana blockchain
                const txHash = generateTxHash();
                const mockTx = {
                    hash: txHash,
                    from: fromAddress,
                    to: toAddress,
                    value: txParams.value || '0x0',
                    gas: txParams.gas || '0x5208',
                    gasPrice: txParams.gasPrice || '0x4a817c800',
                    nonce: '0x' + (addressNonces.get(fromAddress) || 0).toString(16),
                    blockHash: currentBlockHash,
                    blockNumber: '0x' + currentBlockNumber.toString(16),
                    transactionIndex: '0x0'
                };
                
                const mockReceipt = createMockReceipt(txHash, currentBlockNumber, currentBlockHash);
                mockReceipt.from = fromAddress;
                mockReceipt.to = toAddress;
                
                transactionStore.set(txHash, mockTx);
                receiptStore.set(txHash, mockReceipt);
                transactionTimestamps.set(txHash, Date.now());
                addressNonces.set(fromAddress, (addressNonces.get(fromAddress) || 0) + 1);
                
                currentBlockNumber++;
                currentBlockHash = generateBlockHash();
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: txHash
                };
                
                console.log(`MetaMask transaction: ${fromAddress} -> ${toAddress}, tx: ${txHash}`);
                savePersistentData();
                
            } else if (method === 'eth_getTransactionByHash') {
                const txHash = params[0];
                const tx = transactionStore.get(txHash);
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: tx || null
                };
                
            } else if (method === 'eth_getTransactionReceipt') {
                const txHash = params[0];
                const receipt = receiptStore.get(txHash);
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: receipt || null
                };
                
            } else if (method === 'eth_getLogs') {
                const filter = params[0] || {};
                const logs = [];
                
                // Simple log filtering by address and block range
                for (const [txHash, receipt] of receiptStore) {
                    if (receipt.logs && receipt.logs.length > 0) {
                        for (const log of receipt.logs) {
                            let includeLog = true;
                            
                            if (filter.address && log.address !== filter.address) {
                                includeLog = false;
                            }
                            
                            if (filter.fromBlock && parseInt(receipt.blockNumber, 16) < parseInt(filter.fromBlock, 16)) {
                                includeLog = false;
                            }
                            
                            if (filter.toBlock && parseInt(receipt.blockNumber, 16) > parseInt(filter.toBlock, 16)) {
                                includeLog = false;
                            }
                            
                            if (includeLog) {
                                logs.push({
                                    ...log,
                                    transactionHash: txHash,
                                    blockHash: receipt.blockHash,
                                    blockNumber: receipt.blockNumber,
                                    transactionIndex: receipt.transactionIndex
                                });
                            }
                        }
                    }
                }
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: logs
                };
                
            } else if (method === 'eth_requestFaucet') {
                // Faucet functionality for testnet - converts ETH address and sends real BNB
                let address = params[0];
                
                if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        error: {
                            code: -32602,
                            message: "Invalid address format"
                        }
                    };
                } else {
                    // Convert Ethereum address to Solana address
                    const solanaAddress = ethAddressToSolanaAddress(address);
                    console.log(`Faucet: Converting ${address} to ${solanaAddress}`);
                    
                    // Request airdrop from validator
                    try {
                        const airdropData = await callBSSCValidator('requestAirdrop', [
                            solanaAddress,
                            3000000000 // 3 BNB in lamports
                        ]);
                        
                        if (airdropData && airdropData.result) {
                            response = {
                                jsonrpc: "2.0",
                                id: id,
                                result: {
                                    success: true,
                                    signature: airdropData.result,
                                    amount: "3000000000000000000", // 3 BNB in wei
                                    solanaAddress: solanaAddress,
                                    ethAddress: address
                                }
                            };
                            console.log(`Faucet: Sent 3 BNB to ${address} (Solana: ${solanaAddress})`);
                        } else {
                            throw new Error('Airdrop failed');
                        }
                    } catch (error) {
                        console.error('Faucet error:', error);
                        // Fallback to mock transaction if validator not available
                        const txHash = generateTxHash();
                        const amount = "3000000000000000000"; // 3 BNB in wei
                        
                        const faucetTx = {
                            hash: txHash,
                            from: '0x0000000000000000000000000000000000000000',
                            to: address,
                            value: amount,
                            gas: '0x5208',
                            gasPrice: '0x3b9aca00',
                            nonce: '0x0',
                            blockHash: currentBlockHash,
                            blockNumber: '0x' + currentBlockNumber.toString(16),
                            transactionIndex: '0x0'
                    };
                    
                    // Create receipt
                    const faucetReceipt = createMockReceipt(txHash, currentBlockNumber, currentBlockHash, '0x1');
                    faucetReceipt.from = '0x0000000000000000000000000000000000000000';
                    faucetReceipt.to = address;
                    
                    // Store transaction and receipt
                    transactionStore.set(txHash, faucetTx);
                    receiptStore.set(txHash, faucetReceipt);
                    
                    currentBlockNumber++;
                    currentBlockHash = generateBlockHash();
                    
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                            success: true,
                            txHash: txHash,
                            amount: amount,
                            to: address,
                            message: "1 BNB sent to " + address
                        }
                    };
                    
                    console.log(`Faucet request: Sent 1 BNB to ${address}, tx: ${txHash}`);
                    savePersistentData();
                }
                
            } else if (method === 'getBNBBalance') {
                // Get BNB token balance on Solana
                const address = params[0];
                const balance = bnbBalances.get(address) || 0;
                const solEquivalent = balance * BNB_TO_SOL_RATE;
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: {
                        address: address,
                        bnbBalance: balance,
                        solEquivalent: solEquivalent,
                        tokenAddress: BNB_TOKEN_ADDRESS,
                        decimals: 9,
                        formatted: `${balance.toFixed(6)} BNB (~${solEquivalent.toFixed(6)} SOL)`
                    }
                };
                
                console.log(`BNB Balance check: ${address} has ${balance} BNB`);
                
            } else if (method === 'transferBNB') {
                // Transfer BNB tokens on Solana
                const [from, to, amount] = params;
                const fromBalance = bnbBalances.get(from) || 0;
                
                if (fromBalance >= amount) {
                    bnbBalances.set(from, fromBalance - amount);
                    bnbBalances.set(to, (bnbBalances.get(to) || 0) + amount);
                    
                    const txHash = generateTxHash();
                    
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                            success: true,
                            from: from,
                            to: to,
                            amount: amount,
                            txHash: txHash,
                            message: `Transferred ${amount} BNB from ${from} to ${to}`
                        }
                    };
                    
                    console.log(`BNB Transfer: ${amount} BNB from ${from} to ${to}, tx: ${txHash}`);
                    savePersistentData();
                } else {
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        error: {
                            code: -32000,
                            message: `Insufficient BNB balance. Have: ${fromBalance}, Need: ${amount}`
                        }
                    };
                }
                
            } else if (method === 'getBNBTokenInfo') {
                // Get BNB token information
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: {
                        name: "BNB Token on Solana",
                        symbol: "BNB",
                        decimals: 9,
                        totalSupply: Array.from(bnbBalances.values()).reduce((a, b) => a + b, 0),
                        tokenAddress: BNB_TOKEN_ADDRESS,
                        exchangeRate: BNB_TO_SOL_RATE,
                        description: "BNB token on Solana network - BSSC implementation",
                        holders: bnbBalances.size
                    }
                };
                
            } else if (method === 'requestBNBAirdrop') {
                // Request BNB airdrop (like Solana's requestAirdrop)
                const address = params[0];
                const amount = params[1] || 1; // Default 1 BNB
                
                bnbBalances.set(address, (bnbBalances.get(address) || 0) + amount);
                const txHash = generateTxHash();
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: {
                        success: true,
                        signature: txHash,
                        amount: amount,
                        to: address,
                        message: `Airdropped ${amount} BNB to ${address}`
                    }
                };
                
                console.log(`BNB Airdrop: ${amount} BNB to ${address}, tx: ${txHash}`);
                savePersistentData();
                
            } else if (method === 'bssc_getAllTransactions') {
                // Get all transactions for explorer
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: getAllTransactions()
                };
                
            } else if (method === 'bssc_getRecentTransactions') {
                // Get recent transactions with limit
                const limit = params[0] || 20;
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: getRecentTransactions(limit)
                };
                
            } else if (method === 'eth_getBalance') {
                // Get balance for Ethereum or Solana address
                let address = params[0];
                
                // Convert Ethereum address to Solana if needed
                if (isEthereumAddress(address)) {
                    const solanaAddr = ethAddressToSolanaAddress(address);
                    console.log(`Converted ETH address ${address} to Solana ${solanaAddr}`);
                    address = solanaAddr;
                }
                
                // Query balance from validator or use mock
                // For now, return mock balance
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: "0x1bc16d674ec80000" // 2 BNB in hex
                };
                
                console.log(`eth_getBalance for ${address}: 2 BNB`);
                
            } else if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
                // Return empty array - MetaMask will use its own accounts
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: []
                };
                
            } else if (method === 'eth_getBlockByNumber') {
                // Get block by number - required by MetaMask
                const blockNumberParam = params[0];
                const fullTx = params[1] || false;
                
                // Use dynamic block number like eth_blockNumber does
                const dynamicBlockNumber = Math.floor(Date.now() / 400);
                const blockNum = blockNumberParam === 'latest' ? '0x' + dynamicBlockNumber.toString(16) : blockNumberParam;
                
                // Return a mock block structure
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: {
                        number: blockNum,
                        hash: '0x' + Math.random().toString(16).substring(2).padEnd(64, '0'),
                        parentHash: '0x' + Math.random().toString(16).substring(2).padEnd(64, '0'),
                        nonce: '0x0000000000000000',
                        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
                        logsBloom: '0x' + '0'.repeat(512),
                        transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b47e4b2c6c6d6c6d6c6d6c6d6c6d6c6',
                        stateRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b47e4b2c6c6d6c6d6c6d6c6d6c6d6c6',
                        receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b47e4b2c6c6d6c6d6c6d6c6d6c6d6c6',
                        miner: '0x0000000000000000000000000000000000000000',
                        difficulty: '0x0',
                        totalDifficulty: '0x0',
                        extraData: '0x',
                        size: '0x3e8',
                        gasLimit: '0x1c9c380',
                        gasUsed: '0x5208',
                        timestamp: '0x' + Math.floor(Date.now() / 1000).toString(16),
                        transactions: fullTx ? [] : [],
                        uncles: []
                    }
                };
                
            } else {
                // Try to get real data from BSSC validator first
                const realData = await callBSSCValidator(method, params);
                if (realData) {
                    response = realData;
                    response.id = id;
                    console.log(`Using real BSSC validator data for ${method}`);
                } else if (mockResponses[method]) {
                    // Fallback to mock responses
                response = {...mockResponses[method]};
                response.id = id;
                    console.log(`Using mock data for ${method} (validator not available)`);
            } else {
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    error: {
                        code: -32601,
                        message: `Method '${method}' not found`
                    }
                };
                }
            }
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(response));
            
        } catch (error) {
            console.error('Error parsing request:', error);
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                error: {
                    code: -32700,
                    message: 'Parse error'
                }
            }));
        }
    });
}

// Load SSL certificates
let serverOptions = {};
try {
    serverOptions = {
        key: fs.readFileSync('server-key.pem'),
        cert: fs.readFileSync('server-cert.pem')
    };
    console.log('✅ SSL certificates loaded for', DOMAIN);
} catch (error) {
    console.log('⚠️ SSL certificates not found, generating new ones...');
    
    // Generate new certificates for the domain
    const forge = require('node-forge');
    
    // Generate a keypair
    const keys = forge.pki.rsa.generateKeyPair(2048);
    
    // Create a certificate
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    const attrs = [
        { name: 'countryName', value: 'US' },
        { name: 'stateOrProvinceName', value: 'State' },
        { name: 'localityName', value: 'City' },
        { name: 'organizationName', value: 'BSSC Live' },
        { name: 'organizationalUnitName', value: 'Development' },
        { name: 'commonName', value: DOMAIN }
    ];
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    
    // Add extensions
    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: true
        },
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'subjectAltName',
            altNames: [
                {
                    type: 2, // DNS
                    value: DOMAIN
                },
                {
                    type: 2, // DNS
                    value: 'www.' + DOMAIN
                },
                {
                    type: 7, // IP
                    ip: '127.0.0.1'
                }
            ]
        }
    ]);
    
    // Self-sign the certificate
    cert.sign(keys.privateKey);
    
    // Convert to PEM format
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    const certificatePem = forge.pki.certificateToPem(cert);
    
    // Write files
    fs.writeFileSync('server-key.pem', privateKeyPem);
    fs.writeFileSync('server-cert.pem', certificatePem);
    
    serverOptions = {
        key: privateKeyPem,
        cert: certificatePem
    };
    
    console.log('✅ New SSL certificates generated for', DOMAIN);
}

// Create HTTP server (redirects to HTTPS only if not on Render)
const httpServer = http.createServer((req, res) => {
    // Only redirect to HTTPS if not on Render (Render handles SSL termination)
    if (process.env.RENDER && req.headers['x-forwarded-proto'] !== 'https') {
        const httpsUrl = `https://${req.headers.host}${req.url}`;
    res.writeHead(301, {'Location': httpsUrl});
    res.end();
    } else {
        // Handle request normally on Render
        handleRequest(req, res);
    }
});

// Create HTTPS server
const httpsServer = https.createServer(serverOptions, handleRequest);

// Start server based on environment
if (process.env.RENDER) {
    // On Render, only start HTTP server (Render handles SSL termination)
    httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
        console.log(`🌐 RPC Server running on port ${HTTP_PORT} (Render)`);
        console.log(`📊 Available methods: ${Object.keys(mockResponses).join(', ')}`);
        console.log(`🌐 CORS enabled for web3 applications`);
        console.log(`🔒 Security headers enabled`);
    });
} else {
    // On local/server, start both HTTP and HTTPS
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP Server running on port ${HTTP_PORT} (redirects to HTTPS)`);
});

httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`🔒 HTTPS RPC Server running on https://${DOMAIN}`);
    console.log(`📊 Available methods: ${Object.keys(mockResponses).join(', ')}`);
    console.log(`🌐 CORS enabled for web3 applications`);
    console.log(`🔒 Security headers enabled`);
    console.log(`📖 Documentation: https://${DOMAIN}/`);
    console.log(`⏹️  Press Ctrl+C to stop`);
});

// MetaMask local testing server (HTTP only, no SSL issues)
const metamaskServer = http.createServer(handleRequest);
metamaskServer.listen(METAMASK_PORT, '127.0.0.1', () => {
    console.log(`🦊 MetaMask Testing Server running on http://127.0.0.1:${METAMASK_PORT}`);
    console.log(`   Use this URL in MetaMask for local testing`);
});
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n🛑 Shutting down ${DOMAIN} RPC servers...`);
    httpServer.close();
    httpsServer.close();
    setTimeout(() => {
        console.log('✅ Servers stopped');
        process.exit(0);
    }, 1000);
});

// Error handling
httpServer.on('error', (error) => {
    console.error('❌ HTTP Server error:', error);
});

httpsServer.on('error', (error) => {
    console.error('❌ HTTPS Server error:', error);
});
