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

// Enhanced mock responses for BSSC RPC
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
    <title>BSSC Live RPC Server - ${DOMAIN}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 15px; text-align: center; }
        .status { background: #27ae60; color: white; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; margin: 20px 0; }
        .endpoint { background: #ecf0f1; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3498db; }
        .method { background: #f8f9fa; padding: 12px; margin: 8px 0; border-radius: 6px; font-family: 'Courier New', monospace; border: 1px solid #e9ecef; }
        .warning { background: #f39c12; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .success { background: #27ae60; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .test-button { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .test-button:hover { background: #2980b9; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 BSSC Live RPC Server</h1>
        <div class="status">✅ Server Status: Online & Ready</div>
        
        <div class="success">
            <h3>🌐 Your RPC Endpoint is Live!</h3>
            <p><strong>Domain:</strong> ${DOMAIN}</p>
            <p><strong>RPC URL:</strong> https://${DOMAIN}</p>
            <p><strong>Chain ID:</strong> 56 (Binance Smart Chain)</p>
        </div>
        
        <div class="warning" style="background: #e74c3c; color: white;">
            <h3>🚀 Official PUMP Coin Contract</h3>
            <p><strong>Contract Address:</strong> <span style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 5px; border-radius: 3px;">EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump</span></p>
            <p><strong>Token:</strong> Official Pump Coin (PUMP)</p>
            <p><strong>Network:</strong> BSSC (Binance Smart Chain)</p>
            <button class="test-button" onclick="copyContractAddress()" style="margin-top: 10px;">📋 Copy Address</button>
        </div>
        
        <div class="grid">
            <div>
                <h2>📊 Solana Methods</h2>
                <div class="method">getHealth - Check server health</div>
                <div class="method">getVersion - Get server version</div>
                <div class="method">getSlot - Get current slot</div>
                <div class="method">getBlockHeight - Get block height</div>
                <div class="method">getLatestBlockhash - Get latest block hash</div>
                <div class="method">getAccountInfo - Get account info</div>
            </div>
            
            <div>
                <h2>🌐 Web3/Ethereum Methods</h2>
                <div class="method">eth_blockNumber - Get block number</div>
                <div class="method">eth_chainId - Get chain ID (56)</div>
                <div class="method">net_version - Get network version</div>
                <div class="method">eth_getBalance - Get account balance</div>
                <div class="method">eth_gasPrice - Get gas price</div>
                <div class="method">eth_estimateGas - Estimate gas</div>
                
                <h2>🚀 Contract Methods</h2>
                <div class="method">getContractInfo - Get all official contracts</div>
                <div class="method">getPumpContractInfo - Get PUMP coin info</div>
                <div class="method">getOfficialContracts - List official contracts</div>
            </div>
        </div>
        
        <div class="endpoint">
            <h3>🧪 Test Your RPC Endpoint</h3>
            <button class="test-button" onclick="testRPC('getHealth')">Test Health</button>
            <button class="test-button" onclick="testRPC('getVersion')">Test Version</button>
            <button class="test-button" onclick="testRPC('eth_chainId')">Test Chain ID</button>
            <button class="test-button" onclick="testRPC('getPumpContractInfo')" style="background: #e74c3c;">🚀 Get PUMP Contract</button>
            <div id="test-result" style="margin-top: 15px;"></div>
        </div>
        
        <div class="warning">
            ⚠️ This is a development server with mock responses.<br>
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
                resultDiv.innerHTML = '<pre style="background: #f8f9fa; padding: 10px; border-radius: 5px;">' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
            }
        }
        
        function copyContractAddress() {
            const contractAddress = 'EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump';
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(contractAddress).then(() => {
                    alert('✅ PUMP Contract Address Copied to Clipboard!\\n\\n' + contractAddress);
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
                alert('✅ PUMP Contract Address Copied!\\n\\n' + text);
            } catch (err) {
                alert('❌ Failed to copy. Please copy manually:\\n\\n' + text);
            }
            
            document.body.removeChild(textArea);
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
    
    req.on('end', () => {
        try {
            const request = JSON.parse(body);
            const method = request.method;
            const id = request.id || 1;
            
            console.log(`[${new Date().toISOString()}] ${DOMAIN} RPC Request: ${method} from ${req.connection.remoteAddress}`);
            
            let response;
            if (mockResponses[method]) {
                response = {...mockResponses[method]};
                response.id = id;
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
