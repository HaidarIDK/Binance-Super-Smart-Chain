// BSSC Live Production RPC Server
const https = require('https');
const http = require('http');
const fs = require('fs');

// Import Ethereum-Solana address bridge
const {
    ethAddressToSolanaAddress,
    ethAddressToSolanaKeypair,
    solanaAddressToEthAddress,
    isEthereumAddress,
    isSolanaAddress,
    normalizeAddress
} = require('./eth-solana-bridge.js');

// Solana Web3.js for transaction building
let solanaWeb3;
try {
    solanaWeb3 = require('@solana/web3.js');
} catch (e) {
    console.log('[WARNING] @solana/web3.js not installed - transactions disabled');
    console.log('   Install with: npm install @solana/web3.js');
}

// Ethereum transaction decoder  
let ethereumTx;
let bsscCommon;
try {
    ethereumTx = require('@ethereumjs/tx');
    const { Common, Hardfork } = require('@ethereumjs/common');
    
    // Create custom common for BSSC (chain ID 16979) for v10.x
    const customChain = {
        name: 'bssc',
        chainId: 16979,
        networkId: 16979,
        defaultHardfork: Hardfork.London,
        genesis: {
            gasLimit: 30000000,
            difficulty: 1,
            nonce: '0x0000000000000042',
            extraData: '0x'
        },
        hardforks: [
            { name: Hardfork.Chainstart, block: 0 },
            { name: Hardfork.London, block: 0 }
        ]
    };
    bsscCommon = new Common({ chain: customChain, hardfork: Hardfork.London });
    
    console.log('[INFO] Ethereum transaction decoder ready (Chain ID: 16979)');
} catch (e) {
    console.log('[WARNING] @ethereumjs/tx not installed - raw transactions disabled');
    console.log('   Install with: npm install @ethereumjs/tx @ethereumjs/common');
    console.log('   Error:', e.message);
}

// Import PDA bridge client
const ethBridgeClient = require('./eth-bridge-client.js');

// Set bridge program ID (set this after deploying the program)
const ETH_BRIDGE_PROGRAM_ID = process.env.ETH_BRIDGE_PROGRAM_ID || null;
if (ETH_BRIDGE_PROGRAM_ID) {
    ethBridgeClient.setBridgeProgramId(ETH_BRIDGE_PROGRAM_ID);
    console.log('[INFO] ETH Bridge PDA program enabled:', ETH_BRIDGE_PROGRAM_ID);
} else {
    console.log('[WARNING] ETH Bridge PDA program not configured. Transactions will fail.');
    console.log('   Set ETH_BRIDGE_PROGRAM_ID environment variable after deploying program.');
}

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

// BSSC Validator RPC URL - REQUIRED (no mock fallback)
const BSSC_VALIDATOR_URL = process.env.BSSC_VALIDATOR_URL || 'http://127.0.0.1:8899';

// Validator connection status
let validatorConnected = false;

// ETH address to Solana address mapping (for tracking conversions)
const addressMappings = new Map();

// Transaction signature cache (ETH tx hash -> Solana signature)
const transactionSignatureCache = new Map();

// Persistent storage file
const STORAGE_FILE = 'bssc-data.json';

// Load persistent data (only address mappings and tx cache)
function loadPersistentData() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
            
            // Load address mappings
            if (data.addressMappings) {
                Object.entries(data.addressMappings).forEach(([eth, sol]) => {
                    addressMappings.set(eth.toLowerCase(), sol);
                });
            }
            
            // Load transaction signature cache
            if (data.transactionSignatureCache) {
                Object.entries(data.transactionSignatureCache).forEach(([ethHash, solSig]) => {
                    transactionSignatureCache.set(ethHash, solSig);
                });
            }
            
            console.log(`[INFO] Loaded ${addressMappings.size} address mappings and ${transactionSignatureCache.size} transaction signatures`);
        }
    } catch (error) {
        console.error('[ERROR] Error loading persistent data:', error.message);
    }
}

// Save persistent data (only address mappings and tx cache)
function savePersistentData() {
    try {
        const data = {
            addressMappings: Object.fromEntries(addressMappings),
            transactionSignatureCache: Object.fromEntries(transactionSignatureCache),
            lastSaved: new Date().toISOString()
        };
        
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('[ERROR] Error saving persistent data:', error.message);
    }
}

// Load data on startup
loadPersistentData();

// Auto-save every 30 seconds
setInterval(savePersistentData, 30000);

// Check validator connection on startup
async function checkValidatorConnection() {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getHealth',
            params: []
        });
        
        const options = {
            hostname: '127.0.0.1',
            port: 8899,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 2000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.result === 'ok') {
                        validatorConnected = true;
                        console.log('[INFO] Connected to BSSC Validator at', BSSC_VALIDATOR_URL);
                        resolve(true);
                    } else {
                        validatorConnected = false;
                        resolve(false);
                    }
                } catch (error) {
                    validatorConnected = false;
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            validatorConnected = false;
            console.error('[ERROR] Cannot connect to BSSC Validator at', BSSC_VALIDATOR_URL);
            console.error('   Error:', error.message);
            console.error('   [WARNING] RPC server will not function without validator!');
            resolve(false);
        });
        
        req.on('timeout', () => {
            req.destroy();
            validatorConnected = false;
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}

// Periodically check validator connection
setInterval(checkValidatorConnection, 30000);
checkValidatorConnection();

// Function to call real BSSC validator (NO FALLBACK - Real only!)
async function callBSSCValidator(method, params = []) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: method,
                params: params
        });
        
        const options = {
            hostname: '127.0.0.1',
            port: 8899,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    
                    if (jsonData.error) {
                        reject(new Error(`RPC Error: ${jsonData.error.message || JSON.stringify(jsonData.error)}`));
                    } else {
                        resolve(jsonData);
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });
        
        req.on('error', (error) => {
            validatorConnected = false;
            console.error(`[ERROR] Validator call failed [${method}]:`, error.message);
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

// Helper: Convert Solana signature to ETH tx hash format  
function solanaSignatureToEthHash(signature) {
    // Use first 32 bytes of signature, convert to hex with 0x prefix
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(signature).digest('hex');
    return '0x' + hash;
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
            
            // Start RPC method handlers
            
            // Basic Ethereum methods that don't need validator
            if (method === 'eth_chainId' || method === 'eth_chainid') {
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: "0x4253" // 16979 in hex
                };
                
            } else if (method === 'net_version') {
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: "16979"
                };
                
            } else if (method === 'eth_blockNumber') {
                try {
                    const slotData = await callBSSCValidator('getSlot', []);
                    const slot = slotData.result;
                response = {
                    jsonrpc: "2.0",
                    id: id,
                        result: "0x" + slot.toString(16)
                    };
                } catch (error) {
                response = {
                    jsonrpc: "2.0",
                    id: id,
                        result: "0x1"
                    };
                }
                
            } else if (method === 'eth_gasPrice') {
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: "0x3b9aca00" // 1 Gwei
                };
                
            } else if (method === 'eth_estimateGas') {
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: "0x5208" // 21000 gas
                };
                
            } else if (method === 'eth_syncing') {
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: false
                };
                
            } else if (method === 'eth_call') {
                // Contract call simulation - return empty for now
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: "0x"
                };
                
            } else if (method === 'eth_getCode') {
                // Get contract code - return empty (EOA)
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: "0x"
                };
                
            } else if (method === 'eth_getBlockByNumber') {
                // Get block info
                try {
                    const blockParam = params[0] || 'latest';
                    const slotData = await callBSSCValidator('getSlot', []);
                    const slot = slotData.result;
                    
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                            number: "0x" + slot.toString(16),
                            hash: "0x" + crypto.createHash('sha256').update(slot.toString()).digest('hex'),
                            parentHash: "0x" + "0".repeat(64),
                            timestamp: "0x" + Math.floor(Date.now() / 1000).toString(16),
                            transactions: [],
                            gasLimit: "0x1c9c380",
                            gasUsed: "0x0",
                            baseFeePerGas: "0x3b9aca00"
                        }
                    };
                } catch (error) {
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        result: null
                    };
                }
                
            } else if (method === 'eth_getBlockByHash') {
                // Get block by hash - return generic block
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: {
                        number: "0x1",
                        hash: params[0],
                        parentHash: "0x" + "0".repeat(64),
                        timestamp: "0x" + Math.floor(Date.now() / 1000).toString(16),
                        transactions: [],
                        gasLimit: "0x1c9c380",
                        gasUsed: "0x0",
                        baseFeePerGas: "0x3b9aca00"
                    }
                };
                
            } else if (method === 'eth_getTransactionCount') {
                // Get nonce - always return 0 for now
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: "0x0"
                };
                
            } else if (method === 'eth_getTransactionReceipt') {
                // Get transaction receipt
                const txHash = params[0];
                const solanaSig = transactionSignatureCache.get(txHash);
                
                if (solanaSig) {
                    // Transaction found - return success receipt
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                                    transactionHash: txHash,
                            transactionIndex: "0x0",
                            blockHash: "0x" + "0".repeat(64),
                            blockNumber: "0x1",
                            from: "0x0000000000000000000000000000000000000000",
                            to: "0x0000000000000000000000000000000000000000",
                            cumulativeGasUsed: "0x5208",
                            gasUsed: "0x5208",
                            contractAddress: null,
                            logs: [],
                            logsBloom: "0x" + "0".repeat(512),
                            status: "0x1",
                            effectiveGasPrice: "0x1"
                        }
                    };
                } else {
                    // Transaction not found
                response = {
                    jsonrpc: "2.0",
                    id: id,
                        result: null
                };
                }
                
            } else if (method === 'getAddressMappings') {
                // Return all address mappings for explorer
                const mappingsObj = {};
                addressMappings.forEach((sol, eth) => {
                    mappingsObj[eth] = sol;
                });
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: mappingsObj
                };
                
            } else if (method === 'getTransactionCount') {
                // Return total transaction count
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: transactionSignatureCache.size
                };
                
            } else if (method === 'eth_requestFaucet') {
                // REAL FAUCET using PDA
                const address = params[0];
                
                if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        error: {
                            code: -32602,
                            message: "Invalid Ethereum address format"
                        }
                    };
                } else {
                    try {
                        const FAUCET_AMOUNT_LAMPORTS = 3000000000; // 3 BNB
                        
                        if (ETH_BRIDGE_PROGRAM_ID) {
                            // Use PDA bridge - fund the user's PDA
                            const { pda } = ethBridgeClient.derivePDA(address);
                            addressMappings.set(address.toLowerCase(), pda.toBase58());
                            
                            console.log(`[FAUCET] Using PDA bridge:`);
                            console.log(`   ETH Address: ${address}`);
                            console.log(`   PDA: ${pda.toBase58()}`);
                            
                            // TODO: This requires @solana/web3.js and authority keypair
                            // For now, fall back to direct airdrop
                            const airdropData = await callBSSCValidator('requestAirdrop', [
                                pda.toBase58(),
                                FAUCET_AMOUNT_LAMPORTS
                            ]);
                            
                            const signature = airdropData.result;
                            const ethTxHash = solanaSignatureToEthHash(signature);
                            transactionSignatureCache.set(ethTxHash, signature);
                    
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                            success: true,
                                    signature: ethTxHash,
                                    solanaSig: signature,
                                    amount: "3000000000000000000",
                                    pda: pda.toBase58(),
                                    ethAddress: address,
                                    message: `Sent 3 BNB to PDA ${pda.toBase58()}`
                                }
                            };
                        } else {
                            // No PDA bridge - use tweetnacl keypair derivation
                            const keypair = ethAddressToSolanaKeypair(address);
                            const solanaAddress = keypair.publicKey;
                            addressMappings.set(address.toLowerCase(), solanaAddress);
                            
                            console.log(`[FAUCET] Keypair derivation (no PDA):`);
                            console.log(`   ETH Address: ${address}`);
                            console.log(`   Solana Address: ${solanaAddress}`);
                            
                            const airdropData = await callBSSCValidator('requestAirdrop', [
                                solanaAddress,
                                FAUCET_AMOUNT_LAMPORTS
                            ]);
                            
                            const signature = airdropData.result;
                            const ethTxHash = solanaSignatureToEthHash(signature);
                            transactionSignatureCache.set(ethTxHash, signature);
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: {
                                    success: true,
                                    signature: ethTxHash,
                                    solanaSig: signature,
                                    amount: "3000000000000000000",
                                    solanaAddress: solanaAddress,
                                    ethAddress: address,
                                    message: `Sent 3 BNB to ${solanaAddress}`
                                }
                            };
                        }
                        
                        savePersistentData();
                        
                    } catch (error) {
                        console.error(`[ERROR] Faucet error: ${error.message}`);
                        response = {
                            jsonrpc: "2.0",
                            id: id,
                            error: {
                                code: -32000,
                                message: `Faucet failed: ${error.message}`
                            }
                        };
                    }
                }
                
            } else if (method === 'eth_getBalance') {
                // Get REAL balance from validator (with PDA support)
                const address = params[0];
                
                try {
                    let solanaAddress = address;
                    
                    // Convert Ethereum address to Solana (PDA if bridge enabled)
                    if (isEthereumAddress(address)) {
                        if (ETH_BRIDGE_PROGRAM_ID) {
                            // Use PDA address
                            const { pda } = ethBridgeClient.derivePDA(address);
                            solanaAddress = pda.toBase58();
                            addressMappings.set(address.toLowerCase(), solanaAddress);
                            console.log(`[INFO] eth_getBalance (PDA): ${address} -> ${solanaAddress}`);
                        } else {
                            // Use keypair derivation
                            if (!addressMappings.has(address.toLowerCase())) {
                                const keypair = ethAddressToSolanaKeypair(address);
                                solanaAddress = keypair.publicKey;
                                addressMappings.set(address.toLowerCase(), solanaAddress);
                            } else {
                                solanaAddress = addressMappings.get(address.toLowerCase());
                            }
                            console.log(`[INFO] eth_getBalance: ${address} -> ${solanaAddress}`);
                        }
                    }
                    
                    // Query real balance from validator
                    const balanceData = await callBSSCValidator('getBalance', [solanaAddress]);
                    
                    // Solana returns { context: {...}, value: lamports } or just lamports
                    const lamports = typeof balanceData.result === 'object' ? balanceData.result.value : balanceData.result;
                    
                    // Convert lamports to wei (1 BNB = 10^18 wei = 10^9 lamports)
                    const wei = BigInt(lamports) * BigInt(1000000000);
                    const hexBalance = '0x' + wei.toString(16);
                    const bnbAmount = (lamports / 1000000000).toFixed(4);
                    
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        result: hexBalance
                    };
                    
                    console.log(`[INFO] Balance: ${bnbAmount} BNB for ${address}`);
                    
                } catch (error) {
                    console.error(`[ERROR] eth_getBalance error: ${error.message}`);
                    response = {
                        jsonrpc: "2.0",
                        id: id,
                        error: {
                            code: -32000,
                            message: `Failed to get balance: ${error.message}`
                        }
                    };
                }
                
            } else if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
                // Return empty array - MetaMask will use its own accounts
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: []
                };
                
            } else if (method === 'eth_sendTransaction' || method === 'eth_sendRawTransaction') {
                // Handle MetaMask transaction sending with REAL Solana transactions
                try {
                    if (!solanaWeb3) {
                        throw new Error('@solana/web3.js not installed');
                    }
                    
                    let txParams;
                    
                    if (method === 'eth_sendRawTransaction') {
                        // Decode raw transaction
                        if (!ethereumTx || !bsscCommon) {
                            throw new Error('@ethereumjs/tx not installed. Run: npm install @ethereumjs/tx @ethereumjs/common');
                        }
                        
                        const rawTxHex = params[0];
                        const rawTxBytes = Buffer.from(rawTxHex.replace('0x', ''), 'hex');
                        
                        // Use RLP library to manually decode without signature validation
                        const rlp = require('rlp');
                        const decoded = rlp.decode(rawTxBytes);
                        
                        // EIP-155 transaction: [nonce, gasPrice, gasLimit, to, value, data, v, r, s]
                        const nonce = decoded[0].length > 0 ? '0x' + decoded[0].toString('hex') : '0x0';
                        const gasPrice = decoded[1].length > 0 ? '0x' + decoded[1].toString('hex') : '0x0';
                        const gas = decoded[2].length > 0 ? '0x' + decoded[2].toString('hex') : '0x5208';
                        const to = decoded[3].length > 0 ? '0x' + decoded[3].toString('hex') : null;
                        const value = decoded[4].length > 0 ? '0x' + decoded[4].toString('hex') : '0x0';
                        const data = decoded[5].length > 0 ? '0x' + decoded[5].toString('hex') : '0x';
                        const v = decoded[6];
                        const r = decoded[7];
                        const s = decoded[8];
                        
                        // Recover sender address from signature using ethereumjs-util
                        const ethUtil = require('ethereumjs-util');
                        
                        // Convert RLP decoded values to proper Buffers
                        const vBuf = Buffer.from(v);
                        const rBuf = Buffer.from(r);
                        const sBuf = Buffer.from(s);
                        
                        // For EIP-155, we need to include chainId in the signing hash
                        const vInt = parseInt(vBuf.toString('hex') || '0', 16);
                        const chainId = vInt >= 35 ? Math.floor((vInt - 35) / 2) : 0;
                        
                        // Recreate the signing message hash
                        let msgHashData;
                        if (chainId > 0) {
                            // EIP-155: hash(rlp([nonce, gasprice, startgas, to, value, data, chainid, 0, 0]))
                            const chainIdBuf = Buffer.allocUnsafe(4);
                            chainIdBuf.writeUInt32BE(chainId, 0);
                            // Remove leading zeros
                            let chainIdTrimmed = chainIdBuf;
                            while (chainIdTrimmed.length > 0 && chainIdTrimmed[0] === 0) {
                                chainIdTrimmed = chainIdTrimmed.slice(1);
                            }
                            
                            msgHashData = rlp.encode(decoded.slice(0, 6).concat([
                                chainIdTrimmed,
                                Buffer.from([]),
                                Buffer.from([])
                            ]));
                        } else {
                            // Pre-EIP-155
                            msgHashData = rlp.encode(decoded.slice(0, 6));
                        }
                        
                        const msgHash = ethUtil.keccak256(Buffer.from(msgHashData));
                        const recoveryId = chainId > 0 ? (vInt - (chainId * 2 + 35)) : (vInt - 27);
                        const publicKey = ethUtil.ecrecover(msgHash, recoveryId, rBuf, sBuf);
                        const senderAddress = '0x' + ethUtil.publicToAddress(publicKey).toString('hex');
                        
                        txParams = {
                            from: senderAddress,
                            to: to,
                            value: value,
                            gas: gas,
                            gasPrice: gasPrice,
                            nonce: nonce,
                            data: data
                        };
                        
                        console.log('[TX] Decoded raw transaction');
                    } else {
                        // eth_sendTransaction - params already decoded
                        txParams = params[0];
                    }
                    
                    const fromEthAddr = txParams.from;
                    const toEthAddr = txParams.to;
                    const valueHex = txParams.value || '0x0';
                    
                    // Convert value from wei to lamports
                    const valueBigInt = BigInt(valueHex);
                    const lamports = Number(valueBigInt / BigInt(1000000000));
                    
                    console.log(`[TX] Transfer request:`);
                    console.log(`   From ETH: ${fromEthAddr}`);
                    console.log(`   To ETH: ${toEthAddr}`);
                    console.log(`   Amount: ${lamports} lamports`);
                    
                    // Derive REAL keypairs from ETH addresses
                    const senderKeypair = ethAddressToSolanaKeypair(fromEthAddr);
                    const recipientKeypair = ethAddressToSolanaKeypair(toEthAddr);
                    const recipientAddress = recipientKeypair.publicKey;
                    
                    console.log(`   From Solana: ${senderKeypair.publicKey}`);
                    console.log(`   To Solana: ${recipientAddress}`);
                    
                    // Create Solana connection
                    const connection = new solanaWeb3.Connection(BSSC_VALIDATOR_URL, 'confirmed');
                    
                    // Create Solana keypair object
                    const fromKeypair = solanaWeb3.Keypair.fromSecretKey(senderKeypair.secretKey);
                    const toPublicKey = new solanaWeb3.PublicKey(recipientAddress);
                    
                    // Get fresh blockhash (use 'confirmed' for latest)
                    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
                    
                    // Build REAL Solana transaction with fresh blockhash
                    const transaction = new solanaWeb3.Transaction({
                        recentBlockhash: blockhash,
                        feePayer: fromKeypair.publicKey
                    }).add(
                        solanaWeb3.SystemProgram.transfer({
                            fromPubkey: fromKeypair.publicKey,
                            toPubkey: toPublicKey,
                            lamports: lamports,
                        })
                    );
                    
                    // Sign and send transaction (don't wait for confirmation to avoid expiry)
                    transaction.sign(fromKeypair);
                    const signature = await connection.sendRawTransaction(transaction.serialize(), {
                        skipPreflight: false,
                        maxRetries: 3
                    });
                    
                    // Convert to ETH tx hash
                    const ethTxHash = solanaSignatureToEthHash(signature);
                    transactionSignatureCache.set(ethTxHash, signature);
                savePersistentData();
                
                    console.log(`[INFO] Transaction successful!`);
                    console.log(`   Solana Signature: ${signature}`);
                    console.log(`   ETH Tx Hash: ${ethTxHash}`);
                    
                response = {
                    jsonrpc: "2.0",
                    id: id,
                        result: ethTxHash
                };
                
                } catch (error) {
                    console.error(`[ERROR] Transaction error: ${error.message}`);
                response = {
                    jsonrpc: "2.0",
                    id: id,
                        error: {
                            code: -32000,
                            message: `Transaction failed: ${error.message}`
                        }
                };
                }
                
            } else {
                // For ALL other methods: delegate to real BSSC validator
                try {
                    console.log(`[INFO] Delegating ${method} to BSSC validator...`);
                    const validatorData = await callBSSCValidator(method, params);
                    response = validatorData;
                    response.id = id;
                    console.log(`[INFO] Got response from validator for ${method}`);
                } catch (error) {
                    // If validator doesn't support the method, return proper error
                    console.error(`[ERROR] ${method} failed: ${error.message}`);
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    error: {
                        code: -32601,
                            message: `Method '${method}' not supported. Validator error: ${error.message}`
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
    console.log('[INFO] SSL certificates loaded for', DOMAIN);
} catch (error) {
    console.log('[WARNING] SSL certificates not found, generating new ones...');
    
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
    
    console.log('[INFO] New SSL certificates generated for', DOMAIN);
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
// Check if running behind Nginx (METAMASK_PORT env var set by systemd)
if (process.env.METAMASK_PORT) {
    // Running on server behind Nginx - only start on port 8545
    const serverPort = parseInt(process.env.METAMASK_PORT);
    const server = http.createServer(handleRequest);
    server.listen(serverPort, '127.0.0.1', () => {
        console.log(`[INFO] BSSC RPC Server running on port ${serverPort} (behind Nginx)`);
        console.log(`[INFO] Available methods: Solana RPC + Ethereum compatibility`);
        console.log(`[INFO] CORS enabled via Nginx`);
        console.log(`[INFO] Public URL: https://bssc-rpc.bssc.live`);
    });
} else if (process.env.RENDER) {
    // On Render, only start HTTP server (Render handles SSL termination)
    httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
        console.log(`[INFO] RPC Server running on port ${HTTP_PORT} (Render)`);
        console.log(`[INFO] Available methods: Solana RPC + Ethereum compatibility`);
        console.log(`[INFO] CORS enabled for web3 applications`);
        console.log(`[INFO] Security headers enabled`);
    });
} else {
    // On local/server, start both HTTP and HTTPS
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`[INFO] HTTP Server running on port ${HTTP_PORT} (redirects to HTTPS)`);
});

httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`[INFO] HTTPS RPC Server running on https://${DOMAIN}`);
    console.log(`[INFO] Available methods: Solana RPC + Ethereum compatibility`);
    console.log(`[INFO] CORS enabled for web3 applications`);
    console.log(`[INFO] Security headers enabled`);
    console.log(`[INFO] Documentation: https://${DOMAIN}/`);
    console.log(`[INFO] Press Ctrl+C to stop`);
});

    // MetaMask local testing server (HTTP only, no SSL issues)
    const metamaskServer = http.createServer(handleRequest);
    metamaskServer.listen(METAMASK_PORT, '127.0.0.1', () => {
        console.log(`[INFO] MetaMask Testing Server running on http://127.0.0.1:${METAMASK_PORT}`);
        console.log(`   Use this URL in MetaMask for local testing`);
});
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n[INFO] Shutting down ${DOMAIN} RPC servers...`);
    httpServer.close();
    httpsServer.close();
    setTimeout(() => {
        console.log('[INFO] Servers stopped');
        process.exit(0);
    }, 1000);
});

// Error handling
httpServer.on('error', (error) => {
    console.error('[ERROR] HTTP Server error:', error);
});

httpsServer.on('error', (error) => {
    console.error('[ERROR] HTTPS Server error:', error);
});
