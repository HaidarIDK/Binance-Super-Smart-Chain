// BSSC Live Production RPC Server
const https = require('https');
const http = require('http');
const fs = require('fs');

const HTTP_PORT = process.env.PORT || 80;
const HTTPS_PORT = process.env.PORT || 443;
const DOMAIN = 'bssc-rpc.bssc.live';

// Official Contract Addresses
const OFFICIAL_CONTRACTS = {
    'PUMP': {
        address: 'EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump',
        name: 'Official Pump Coin',
        symbol: 'PUMP',
        description: 'The official pump coin on BSSC',
        chainId: 56
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
        result: "0x38" // BSC Chain ID 56
    },
    net_version: {
        jsonrpc: "2.0",
        id: 1,
        result: "56"
    },
    eth_getBalance: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x1bc16d674ec80000" // 2 ETH in hex
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
    }
};

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
    
    // API documentation endpoint
    if (req.url === '/' && req.method === 'GET') {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>BSSC RPC Server - ${DOMAIN}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
            min-height: 100vh; 
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        h1 { 
            color: #333; 
            border-bottom: 2px solid #ddd; 
            padding-bottom: 15px; 
            text-align: center; 
            margin-bottom: 30px;
        }
        .status { 
            background: #d4edda; 
            color: #155724; 
            padding: 15px; 
            border-radius: 4px; 
            text-align: center; 
            font-weight: bold; 
            margin: 20px 0; 
            border: 1px solid #c3e6cb;
        }
        .endpoint { 
            background: #f8f9fa; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 4px; 
            border-left: 4px solid #007bff; 
        }
        .method { 
            background: #f8f9fa; 
            padding: 12px; 
            margin: 8px 0; 
            border-radius: 4px; 
            font-family: 'Courier New', monospace; 
            border: 1px solid #e9ecef; 
        }
        .info { 
            background: #d1ecf1; 
            color: #0c5460; 
            padding: 20px; 
            border-radius: 4px; 
            margin: 20px 0; 
            border: 1px solid #bee5eb;
        }
        .contract { 
            background: #f8d7da; 
            color: #721c24; 
            padding: 20px; 
            border-radius: 4px; 
            margin: 20px 0; 
            border: 1px solid #f5c6cb;
        }
        .test-button { 
            background: #007bff; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            margin: 5px; 
            font-size: 14px;
        }
        .test-button:hover { 
            background: #0056b3; 
        }
        .copy-button {
            background: #28a745;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-top: 10px;
        }
        .copy-button:hover {
            background: #1e7e34;
        }
        .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
        }
        .contract-address {
            font-family: monospace;
            background: rgba(0,0,0,0.1);
            padding: 8px;
            border-radius: 4px;
            word-break: break-all;
        }
        @media (max-width: 768px) { 
            .grid { 
                grid-template-columns: 1fr; 
            } 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>BSSC RPC Server</h1>
        <div class="status">Server Status: Online & Ready</div>
        
        <div class="info">
            <h3>RPC Endpoint Information</h3>
            <p><strong>Domain:</strong> ${DOMAIN}</p>
            <p><strong>RPC URL:</strong> https://${DOMAIN}</p>
            <p><strong>Chain ID:</strong> 56 (Binance Smart Chain)</p>
        </div>
        
        <div class="contract">
            <h3>Official PUMP Coin Contract</h3>
            <p><strong>Contract Address:</strong></p>
            <div class="contract-address">EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump</div>
            <p><strong>Token:</strong> Official Pump Coin (PUMP)</p>
            <p><strong>Network:</strong> BSSC (Binance Smart Chain)</p>
            <button class="copy-button" onclick="copyContractAddress()">Copy Address</button>
        </div>
        
        <div class="grid">
            <div>
                <h2>Solana Methods</h2>
                <div class="method">getHealth - Check server health</div>
                <div class="method">getVersion - Get server version</div>
                <div class="method">getSlot - Get current slot</div>
                <div class="method">getBlockHeight - Get block height</div>
                <div class="method">getLatestBlockhash - Get latest block hash</div>
                <div class="method">getAccountInfo - Get account info</div>
            </div>
            
            <div>
                <h2>Web3/Ethereum Methods</h2>
                <div class="method">eth_blockNumber - Get block number</div>
                <div class="method">eth_chainId - Get chain ID (56)</div>
                <div class="method">net_version - Get network version</div>
                <div class="method">eth_getBalance - Get account balance</div>
                <div class="method">eth_gasPrice - Get gas price</div>
                <div class="method">eth_estimateGas - Estimate gas</div>
                <div class="method">eth_sendRawTransaction - Send raw transaction</div>
                <div class="method">eth_getTransactionByHash - Get transaction by hash</div>
                <div class="method">eth_getTransactionReceipt - Get transaction receipt</div>
                <div class="method">eth_getLogs - Get event logs</div>
                <div class="method">eth_requestFaucet - Request test BNB</div>
                
                <h2>Contract Methods</h2>
                <div class="method">getContractInfo - Get all official contracts</div>
                <div class="method">getPumpContractInfo - Get PUMP coin info</div>
                <div class="method">getOfficialContracts - List official contracts</div>
            </div>
        </div>
        
        <div class="endpoint">
            <h3>Test Your RPC Endpoint</h3>
            <button class="test-button" onclick="testRPC('getHealth')">Test Health</button>
            <button class="test-button" onclick="testRPC('getVersion')">Test Version</button>
            <button class="test-button" onclick="testRPC('eth_chainId')">Test Chain ID</button>
            <button class="test-button" onclick="testRPC('getPumpContractInfo')">Get PUMP Contract</button>
            <button class="test-button" onclick="testEVMTransaction()">Test EVM Transaction</button>
            <button class="test-button" onclick="testEVMReceipt()">Test EVM Receipt</button>
            <button class="test-button" onclick="testFaucet()">Test Faucet</button>
            <div id="test-result" style="margin-top: 15px;"></div>
        </div>
        
        <div class="info">
            <strong>Note:</strong> This is a development server with mock responses.<br>
            For production use, replace with actual blockchain node.
        </div>
    </div>
    
    <script>
        async function testRPC(method) {
            const resultDiv = document.getElementById('test-result');
            resultDiv.innerHTML = '<p>Testing...</p>';
            
            try {
                const response = await fetch('https://${DOMAIN}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: method
                    })
                });
                
                const data = await response.json();
                resultDiv.innerHTML = '<pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #e9ecef;">' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<p style="color: #dc3545;">Error: ' + error.message + '</p>';
            }
        }
        
        function copyContractAddress() {
            const contractAddress = 'EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump';
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(contractAddress).then(() => {
                    alert('PUMP Contract Address Copied to Clipboard!\\n\\n' + contractAddress);
                }).catch(err => {
                    fallbackCopyTextToClipboard(contractAddress);
                });
            } else {
                fallbackCopyTextToClipboard(contractAddress);
            }
        }
        
        function fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                alert('PUMP Contract Address Copied!\\n\\n' + text);
            } catch (err) {
                alert('Failed to copy. Please copy manually:\\n\\n' + text);
            }
            
            document.body.removeChild(textArea);
        }
        
        async function testEVMTransaction() {
            const resultDiv = document.getElementById('test-result');
            resultDiv.innerHTML = '<p>Testing EVM Transaction...</p>';
            
            try {
                // Create a mock raw transaction
                const rawTx = '0xf86c808502540be400825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83';
                
                const response = await fetch('https://${DOMAIN}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'eth_sendRawTransaction',
                        params: [rawTx]
                    })
                });
                
                const data = await response.json();
                resultDiv.innerHTML = '<pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #e9ecef;">' + JSON.stringify(data, null, 2) + '</pre>';
                
                // Store the transaction hash for receipt testing
                if (data.result) {
                    window.lastTxHash = data.result;
                }
            } catch (error) {
                resultDiv.innerHTML = '<p style="color: #dc3545;">Error: ' + error.message + '</p>';
            }
        }
        
        async function testEVMReceipt() {
            const resultDiv = document.getElementById('test-result');
            resultDiv.innerHTML = '<p>Testing EVM Receipt...</p>';
            
            if (!window.lastTxHash) {
                resultDiv.innerHTML = '<p style="color: #dc3545;">No transaction hash available. Run Test EVM Transaction first.</p>';
                return;
            }
            
            try {
                const response = await fetch('https://${DOMAIN}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'eth_getTransactionReceipt',
                        params: [window.lastTxHash]
                    })
                });
                
                const data = await response.json();
                resultDiv.innerHTML = '<pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #e9ecef;">' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<p style="color: #dc3545;">Error: ' + error.message + '</p>';
            }
        }
        
        async function testFaucet() {
            const resultDiv = document.getElementById('test-result');
            resultDiv.innerHTML = '<p>Testing Faucet...</p>';
            
            // Use a test address
            const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
            
            try {
                const response = await fetch('https://${DOMAIN}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'eth_requestFaucet',
                        params: [testAddress]
                    })
                });
                
                const data = await response.json();
                resultDiv.innerHTML = '<pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #e9ecef;">' + JSON.stringify(data, null, 2) + '</pre>';
                
                // Store the transaction hash for receipt testing
                if (data.result && data.result.txHash) {
                    window.lastTxHash = data.result.txHash;
                }
            } catch (error) {
                resultDiv.innerHTML = '<p style="color: #dc3545;">Error: ' + error.message + '</p>';
            }
        }
    </script>
</body>
</html>`;
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
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
                
                // Increment block number for next transaction
                currentBlockNumber++;
                currentBlockHash = generateBlockHash();
                
                response = {
                    jsonrpc: "2.0",
                    id: id,
                    result: txHash
                };
                console.log(`Stored transaction ${txHash} in block ${currentBlockNumber - 1}`);
                
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
                // Faucet functionality for testnet
                const address = params[0];
                
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
                    // Generate a faucet transaction
                    const txHash = generateTxHash();
                    const amount = "1000000000000000000"; // 1 BNB in wei
                    
                    // Create mock transaction for faucet
                    const faucetTx = {
                        hash: txHash,
                        from: '0x0000000000000000000000000000000000000000', // Faucet address
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
                }
                
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
