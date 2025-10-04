// Node.js RPC Testing Script
const http = require('http');

const RPC_URL = 'http://localhost:8899';
const RPC_HOST = 'localhost';
const RPC_PORT = 8899;

// Function to make RPC request
async function testRPCMethod(method, params = [], description) {
    console.log(`🔍 Testing: ${description}`);
    console.log(`Method: ${method}`);
    
    const payload = JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: method,
        params: params
    });
    
    const options = {
        hostname: RPC_HOST,
        port: RPC_PORT,
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('✅ Success!');
                    console.log('Response:', JSON.stringify(response, null, 2));
                    console.log('');
                    resolve(response);
                } catch (error) {
                    console.log('❌ Parse Error:', error.message);
                    console.log('Raw Response:', data);
                    console.log('');
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Request Error:', error.message);
            console.log('');
            reject(error);
        });
        
        req.write(payload);
        req.end();
    });
}

// Main testing function
async function runTests() {
    console.log('🧪 Testing RPC Endpoint with Node.js...\n');
    
    try {
        // Test core RPC methods
        console.log('📊 Testing Core RPC Methods:');
        await testRPCMethod('getHealth', [], 'Health Check');
        await testRPCMethod('getVersion', [], 'Version Information');
        await testRPCMethod('getSlot', [], 'Current Slot');
        await testRPCMethod('getBlockHeight', [], 'Block Height');
        
        // Test Web3/Ethereum methods
        console.log('🌐 Testing Web3/Ethereum Methods:');
        await testRPCMethod('eth_blockNumber', [], 'Ethereum Block Number');
        await testRPCMethod('eth_chainId', [], 'Chain ID');
        await testRPCMethod('net_version', [], 'Network Version');
        
        // Test account methods
        console.log('📝 Testing Account Methods:');
        await testRPCMethod('getAccountInfo', ['11111111111111111111111111111111'], 'Account Info');
        
        console.log('🎉 Node.js testing complete!');
        
    } catch (error) {
        console.error('❌ Testing failed:', error.message);
    }
}

// Run the tests
runTests();
