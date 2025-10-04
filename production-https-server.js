// Production HTTPS RPC Server for bssc.live
const https = require('https');
const http = require('http');
const fs = require('fs');

const HTTP_PORT = 80;
const HTTPS_PORT = 443;

// Mock responses for BSSC RPC
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
            "bsc-version": "1.0.0"
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
    }
};

// Request handler
function handleRequest(req, res) {
    // Security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
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
        res.end('BSSC RPC Server is healthy\n');
        return;
    }
    
    // API documentation endpoint
    if (req.url === '/' && req.method === 'GET') {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>BSSC RPC Server - bssc.live</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .method { background: #ecf0f1; padding: 10px; margin: 10px 0; border-radius: 5px; font-family: monospace; }
        .status { color: #27ae60; font-weight: bold; }
        .warning { background: #f39c12; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 BSSC RPC Server</h1>
        <p class="status">✅ Server Status: Online</p>
        <p><strong>Domain:</strong> bssc.live</p>
        <p><strong>RPC Endpoint:</strong> https://bssc.live</p>
        <p><strong>Chain ID:</strong> 56 (Binance Smart Chain)</p>
        
        <h2>📊 Available RPC Methods</h2>
        
        <h3>Solana Methods:</h3>
        <div class="method">getHealth - Check server health</div>
        <div class="method">getVersion - Get server version</div>
        <div class="method">getSlot - Get current slot</div>
        <div class="method">getBlockHeight - Get current block height</div>
        <div class="method">getLatestBlockhash - Get latest block hash</div>
        <div class="method">getAccountInfo - Get account information</div>
        
        <h3>Web3/Ethereum Methods:</h3>
        <div class="method">eth_blockNumber - Get block number</div>
        <div class="method">eth_chainId - Get chain ID</div>
        <div class="method">net_version - Get network version</div>
        <div class="method">eth_getBalance - Get account balance</div>
        <div class="method">eth_gasPrice - Get current gas price</div>
        
        <div class="warning">
            ⚠️ This is a development/testing server with mock responses.
            For production use, replace with actual blockchain node.
        </div>
    </div>
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
            
            console.log(`[${new Date().toISOString()}] RPC Request: ${method} from ${req.headers['user-agent'] || 'Unknown'}`);
            
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

// Load SSL certificates for production
let serverOptions = {};
try {
    serverOptions = {
        key: fs.readFileSync('server-key.pem'),
        cert: fs.readFileSync('server-cert.pem')
    };
    console.log('✅ SSL certificates loaded');
} catch (error) {
    console.log('⚠️ Using default certificates (for testing)');
}

// Create HTTP server (redirects to HTTPS)
const httpServer = http.createServer((req, res) => {
    // Redirect HTTP to HTTPS
    const httpsUrl = `https://bssc.live${req.url}`;
    res.writeHead(301, {'Location': httpsUrl});
    res.end();
});

// Create HTTPS server
const httpsServer = https.createServer(serverOptions, handleRequest);

// Start HTTP server (port 80)
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP Server running on port ${HTTP_PORT} (redirects to HTTPS)`);
});

// Start HTTPS server (port 443)
httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`🔒 HTTPS RPC Server running on https://bssc.live:${HTTPS_PORT}`);
    console.log(`📊 Available methods: ${Object.keys(mockResponses).join(', ')}`);
    console.log(`🌐 CORS enabled for web3 applications`);
    console.log(`🔒 Security headers enabled`);
    console.log(`📖 Documentation available at: https://bssc.live/`);
    console.log(`⏹️  Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down BSSC RPC servers...');
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
