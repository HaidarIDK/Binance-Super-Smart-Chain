// Simple HTTPS RPC Server for BSSC
const https = require('https');
const fs = require('fs');

const HTTPS_PORT = 9443;

// Mock responses
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
    eth_blockNumber: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x" + Math.floor(Date.now() / 400).toString(16)
    },
    eth_chainId: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x38"
    }
};

// Load SSL certificates
let serverOptions;
try {
    serverOptions = {
        key: fs.readFileSync('server-key.pem'),
        cert: fs.readFileSync('server-cert.pem')
    };
    console.log('✅ SSL certificates loaded');
} catch (error) {
    console.error('❌ Failed to load SSL certificates:', error.message);
    process.exit(1);
}

// Create HTTPS server
const server = https.createServer(serverOptions, (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
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
            
            console.log(`[${new Date().toISOString()}] HTTPS RPC Request: ${method}`);
            
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
});

// Start server
server.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`🔒 HTTPS RPC Server running on https://localhost:${HTTPS_PORT}`);
    console.log(`📊 Available methods: ${Object.keys(mockResponses).join(', ')}`);
    console.log(`🌐 CORS enabled for web3 applications`);
    console.log(`⚠️  Using self-signed certificate (browser will show security warning)`);
    console.log(`⏹️  Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down HTTPS RPC server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

// Error handling
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});
