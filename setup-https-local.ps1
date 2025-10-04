# Local HTTPS Setup for BSSC RPC Server
Write-Host "🔒 Setting up Local HTTPS for BSSC RPC Server..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Error: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Create HTTPS RPC server
Write-Host "🔧 Creating HTTPS RPC server..." -ForegroundColor Cyan

$httpsServerContent = @'
// HTTPS BSSC RPC Server
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const PORT = 8899;
const HTTPS_PORT = 9443;

// Generate self-signed certificate for testing
function generateSelfSignedCert() {
    const { execSync } = require('child_process');
    
    try {
        // Try to use OpenSSL if available
        execSync('openssl version', { stdio: 'ignore' });
        
        // Generate private key
        execSync('openssl genrsa -out server-key.pem 2048');
        
        // Generate certificate
        execSync('openssl req -new -x509 -key server-key.pem -out server-cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"');
        
        console.log('✅ Self-signed certificate generated');
        return true;
    } catch (error) {
        console.log('⚠️ OpenSSL not found, using Node.js crypto for certificate generation');
        return false;
    }
}

// Mock BSSC/Solana RPC responses (same as before)
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
    eth_blockNumber: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x" + Math.floor(Date.now() / 400).toString(16)
    },
    eth_chainId: {
        jsonrpc: "2.0",
        id: 1,
        result: "0x38"
    },
    net_version: {
        jsonrpc: "2.0",
        id: 1,
        result: "56"
    }
};

function createServer(isHttps = false) {
    const serverOptions = {};
    
    if (isHttps) {
        // Try to load existing certificates
        try {
            serverOptions.key = fs.readFileSync('server-key.pem');
            serverOptions.cert = fs.readFileSync('server-cert.pem');
        } catch (error) {
            console.log('❌ SSL certificates not found');
            console.log('Please run: npm install -g mkcert');
            console.log('Then: mkcert -install && mkcert localhost');
            return null;
        }
    }
    
    const server = isHttps ? https.createServer(serverOptions, handleRequest) : require('http').createServer(handleRequest);
    
    function handleRequest(req, res) {
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
                
                console.log(`[${new Date().toISOString()}] ${isHttps ? 'HTTPS' : 'HTTP'} RPC Request: ${method}`);
                
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
    
    return server;
}

// Start both HTTP and HTTPS servers
const httpServer = createServer(false);
const httpsServer = createServer(true);

if (httpServer) {
    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`🌐 HTTP RPC Server running on http://localhost:${PORT}`);
    });
}

if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`🔒 HTTPS RPC Server running on https://localhost:${HTTPS_PORT}`);
        console.log(`📊 Available methods: ${Object.keys(mockResponses).join(', ')}`);
        console.log(`🌐 CORS enabled for web3 applications`);
        console.log(`⚠️  Using self-signed certificate (browser will show security warning)`);
        console.log(`⏹️  Press Ctrl+C to stop`);
    });
} else {
    console.log('❌ HTTPS server failed to start');
    console.log('');
    console.log('🔧 To fix this:');
    console.log('1. Install mkcert: npm install -g mkcert');
    console.log('2. Install certificate: mkcert -install');
    console.log('3. Generate certificates: mkcert localhost');
    console.log('4. Restart this script');
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down RPC servers...');
    if (httpServer) httpServer.close();
    if (httpsServer) httpsServer.close();
    setTimeout(() => {
        console.log('✅ Servers stopped');
        process.exit(0);
    }, 1000);
});
'@

# Write the HTTPS server file
$httpsServerContent | Out-File -FilePath "https-rpc-server.js" -Encoding UTF8

Write-Host "✅ HTTPS RPC server created: https-rpc-server.js" -ForegroundColor Green
Write-Host ""

# Check if mkcert is available
Write-Host "🔍 Checking for mkcert (for SSL certificates)..." -ForegroundColor Cyan
try {
    & mkcert --version 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ mkcert found" -ForegroundColor Green
        
        # Install certificate authority
        Write-Host "🔧 Installing certificate authority..." -ForegroundColor Cyan
        & mkcert -install
        
        # Generate certificates
        Write-Host "🔧 Generating SSL certificates..." -ForegroundColor Cyan
        & mkcert localhost 127.0.0.1 ::1
        
        Write-Host "✅ SSL certificates generated!" -ForegroundColor Green
        Write-Host "  • localhost+2.pem (certificate)" -ForegroundColor White
        Write-Host "  • localhost+2-key.pem (private key)" -ForegroundColor White
        Write-Host ""
        
        # Rename certificates to match server expectations
        if (Test-Path "localhost+2.pem") {
            Copy-Item "localhost+2.pem" "server-cert.pem" -Force
        }
        if (Test-Path "localhost+2-key.pem") {
            Copy-Item "localhost+2-key.pem" "server-key.pem" -Force
        }
        
    } else {
        throw "mkcert not found"
    }
} catch {
    Write-Host "⚠️ mkcert not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Installing mkcert..." -ForegroundColor Cyan
    Write-Host "Run this command to install mkcert:" -ForegroundColor White
    Write-Host "npm install -g mkcert" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then run this script again to generate certificates." -ForegroundColor White
}

Write-Host ""
Write-Host "🚀 Ready to start HTTPS RPC server!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the server, run:" -ForegroundColor Yellow
Write-Host "node .\https-rpc-server.js" -ForegroundColor White
Write-Host ""
Write-Host "The server will run on:" -ForegroundColor Yellow
Write-Host "  • HTTP:  http://localhost:8899" -ForegroundColor White
Write-Host "  • HTTPS: https://localhost:9443" -ForegroundColor White
