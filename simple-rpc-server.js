// Simple BSSC RPC Server
const http = require('http');
const url = require('url');

const PORT = 8899;

// Mock BSSC/Solana RPC responses
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
        result: Math.floor(Date.now() / 400) // Mock slot number
    },
    getBlockHeight: {
        jsonrpc: "2.0",
        id: 1,
        result: Math.floor(Date.now() / 400) // Mock block height
    },
    getLatestBlockhash: {
        jsonrpc: "2.0",
        id: 1,
        result: {
            context: {
                slot: Math.floor(Date.now() / 400)
            },
            value: "11111111111111111111111111111111" // Mock block hash
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
        result: "0x38" // 56 in hex (BSC mainnet chain ID)
    },
    net_version: {
        jsonrpc: "2.0",
        id: 1,
        result: "56"
    }
};

const server = http.createServer((req, res) => {
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
            
            console.log(`[${new Date().toISOString()}] RPC Request: ${method}`);
            
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

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BSSC RPC Server running on http://localhost:${PORT}`);
    console.log(`📊 Available methods: ${Object.keys(mockResponses).join(', ')}`);
    console.log(`🌐 CORS enabled for web3 applications`);
    console.log(`⏹️  Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down RPC server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

// Health check endpoint
server.on('request', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/health' && req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('BSSC RPC Server is healthy\n');
        return;
    }
});

