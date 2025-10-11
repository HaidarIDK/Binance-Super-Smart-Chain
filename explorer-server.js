// BSSC Explorer Server
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HTTP_PORT = process.env.PORT || 3001;
const HTTPS_PORT = 8443; // Use 8443 to avoid conflict with RPC server on 443

// Generate self-signed certificate if it doesn't exist
function generateCertificate() {
    try {
        if (!fs.existsSync('server-cert.pem') || !fs.existsSync('server-key.pem')) {
            const forge = require('node-forge');
            const pki = forge.pki;
            
            const keys = pki.rsa.generateKeyPair(2048);
            const cert = pki.createCertificate();
            
            cert.publicKey = keys.publicKey;
            cert.serialNumber = '01';
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
            
            const attrs = [{
                name: 'commonName',
                value: 'explorer.bssc.live'
            }, {
                name: 'countryName',
                value: 'US'
            }, {
                shortName: 'ST',
                value: 'California'
            }, {
                name: 'localityName',
                value: 'San Francisco'
            }, {
                name: 'organizationName',
                value: 'BSSC'
            }, {
                shortName: 'OU',
                value: 'Explorer'
            }];
            
            cert.setSubject(attrs);
            cert.setIssuer(attrs);
            cert.setExtensions([{
                name: 'basicConstraints',
                cA: true
            }, {
                name: 'keyUsage',
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true
            }, {
                name: 'extKeyUsage',
                serverAuth: true,
                clientAuth: true,
                codeSigning: true,
                emailProtection: true,
                timeStamping: true
            }, {
                name: 'nsCertType',
                server: true,
                email: true,
                objsign: true,
                sslCA: true,
                emailCA: true,
                objCA: true
            }, {
                name: 'subjectAltName',
                altNames: [{
                    type: 2,
                    value: 'explorer.bssc.live'
                }, {
                    type: 2,
                    value: 'localhost'
                }, {
                    type: 7,
                    ip: '127.0.0.1'
                }]
            }]);
            
            cert.sign(keys.privateKey, forge.md.sha256.create());
            
            const pem = {
                privateKey: pki.privateKeyToPem(keys.privateKey),
                publicKey: pki.publicKeyToPem(keys.publicKey),
                certificate: pki.certificateToPem(cert)
            };
            
            fs.writeFileSync('server-key.pem', pem.privateKey);
            fs.writeFileSync('server-cert.pem', pem.certificate);
            
            console.log('Generated self-signed SSL certificate');
        }
    } catch (error) {
        console.log('Could not generate SSL certificate:', error.message);
    }
}

// Request handler
function handleRequest(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Fix CSP to allow Solana Web3.js (uses wasm and some eval for performance)
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://bssc-rpc.bssc.live https://api.mainnet-beta.solana.com http://localhost:* ws://localhost:* wss://*; " +
        "font-src 'self' data:; " +
        "worker-src 'self' blob:;"
    );
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve explorer.html
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(__dirname, 'explorer.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading explorer');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

// Generate certificate
generateCertificate();

// Create HTTP server
const httpServer = http.createServer(handleRequest);

httpServer.listen(HTTP_PORT, () => {
    console.log('');
    console.log('BSSC Explorer Server Started!');
    console.log('================================');
    console.log(`HTTP:  http://localhost:${HTTP_PORT}`);
    console.log('');
    console.log('Access the explorer:');
    console.log(`   Local:    http://localhost:${HTTP_PORT}`);
    console.log(`   Network:  http://explorer.bssc.live (after deployment)`);
    console.log('');
    console.log('Tips:');
    console.log('   - Make sure bssc-live-server.js is running for RPC data');
    console.log('   - Deploy to Render/Vercel for public access');
    console.log('   - Point explorer.bssc.live DNS to your server');
    console.log('');
});

// Create HTTPS server if certificates exist
if (fs.existsSync('server-cert.pem') && fs.existsSync('server-key.pem')) {
    const httpsOptions = {
        key: fs.readFileSync('server-key.pem'),
        cert: fs.readFileSync('server-cert.pem')
    };
    
    const httpsServer = https.createServer(httpsOptions, handleRequest);
    
    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`[INFO] HTTPS: https://localhost:${HTTPS_PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EACCES') {
            console.log(`[WARNING] Cannot bind to port ${HTTPS_PORT} (requires admin/sudo)`);
        } else if (err.code === 'EADDRINUSE') {
            console.log(`[WARNING] Port ${HTTPS_PORT} already in use (HTTPS disabled)`);
        } else {
            console.error(`[ERROR] HTTPS error: ${err.message}`);
        }
    });
}

// Handle errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
