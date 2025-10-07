# BSSC Public Testnet Guide

## Overview
This guide explains how to deploy and connect to the BSSC public testnet. The testnet allows developers and users to test BNB transactions on Solana infrastructure without spending real tokens.

## Testnet Architecture

```
┌─────────────────────────────────────────────────┐
│           BSSC Public Testnet                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │ Test         │      │  Faucet      │       │
│  │ Validator    │◄────►│  Service     │       │
│  │ (Port 8899)  │      │ (Port 9900)  │       │
│  └──────┬───────┘      └──────────────┘       │
│         │                                       │
│         │                                       │
│  ┌──────▼───────────────────────────┐         │
│  │   RPC Adapter (Render)           │         │
│  │   https://bssc-rpc.bssc.live     │         │
│  │   - Ethereum JSON-RPC            │         │
│  │   - Transaction Storage          │         │
│  │   - Receipt Generation           │         │
│  └──────────────────────────────────┘         │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Deployment

### Step 1: Prepare Deployment Package

Run on your Windows machine:

```powershell
.\deploy-bssc-testnet.ps1
```

### Step 2: Upload to Server

```bash
scp -r bssc-validator-deploy root@109.147.47.132:/tmp/
```

### Step 3: Deploy on Server

SSH to your server:

```bash
ssh root@109.147.47.132
cd /tmp/bssc-validator-deploy
chmod +x deploy-bssc-testnet.sh
sudo ./deploy-bssc-testnet.sh
```

The deployment script will:
- Install Rust and dependencies
- Build BSSC test-validator and faucet
- Create systemd services
- Start the testnet
- Configure health monitoring

### Step 4: Configure Firewall

Allow testnet ports:

```bash
# UFW (Ubuntu)
sudo ufw allow 8899/tcp  # RPC
sudo ufw allow 9900/tcp  # Faucet
sudo ufw allow 8900/tcp  # WebSocket

# Or firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=8899/tcp
sudo firewall-cmd --permanent --add-port=9900/tcp
sudo firewall-cmd --permanent --add-port=8900/tcp
sudo firewall-cmd --reload
```

### Step 5: Update RPC Adapter

Update `bssc-live-server.js` on your local machine:

```javascript
const BSSC_VALIDATOR_URL = process.env.BSSC_VALIDATOR_URL || 'http://109.147.47.132:8899';
```

Commit and push to trigger Render redeploy:

```bash
git add bssc-live-server.js
git commit -m "Connect RPC to live testnet"
git push origin master
```

## Testnet Endpoints

### RPC Endpoint
```
http://109.147.47.132:8899
```

### Faucet Endpoint
```
http://109.147.47.132:9900
```

### Public RPC (Ethereum-compatible)
```
https://bssc-rpc.bssc.live
```

### WebSocket
```
ws://109.147.47.132:8900
```

## For Developers

### Connect to BSSC Testnet

#### Using Web3.js (Ethereum-style)

```javascript
const Web3 = require('web3');
const web3 = new Web3('https://bssc-rpc.bssc.live');

// Get chain ID
const chainId = await web3.eth.getChainId();
console.log('Chain ID:', chainId); // 56

// Send transaction
const tx = await web3.eth.sendTransaction({
  from: '0xYourAddress',
  to: '0xRecipient',
  value: web3.utils.toWei('1', 'ether'),
  gas: 21000
});
```

#### Using Solana CLI

```bash
# Configure CLI to use BSSC testnet
solana config set --url http://109.147.47.132:8899

# Check connection
solana cluster-version

# Get test BNB from faucet
solana airdrop 1

# Check balance
solana balance
```

#### Using @solana/web3.js

```javascript
const { Connection, clusterApiUrl } = require('@solana/web3.js');

const connection = new Connection('http://109.147.47.132:8899', 'confirmed');

// Get slot
const slot = await connection.getSlot();
console.log('Current slot:', slot);
```

### Request Test BNB

#### Method 1: Using Faucet API

```bash
curl -X POST http://109.147.47.132:9900/airdrop \
  -H "Content-Type: application/json" \
  -d '{
    "pubkey": "YOUR_PUBLIC_KEY"
  }'
```

#### Method 2: Using Solana CLI

```bash
solana airdrop 1 YOUR_PUBLIC_KEY --url http://109.147.47.132:8899
```

## Monitoring

### Health Check

SSH to server and run:

```bash
/opt/bssc-testnet/health-check.sh
```

Output:
```
BSSC Testnet Health Check
==========================

Validator Status:
   Active: active (running)

Faucet Status:
   Active: active (running)

RPC Endpoint Test:
{"jsonrpc":"2.0","result":"ok","id":1}

Slot Info:
{"jsonrpc":"2.0","result":12345,"id":1}
```

### View Logs

```bash
/opt/bssc-testnet/view-logs.sh
```

### Service Management

```bash
# Restart validator
sudo systemctl restart bssc-testnet

# Restart faucet
sudo systemctl restart bssc-faucet

# View status
sudo systemctl status bssc-testnet
sudo systemctl status bssc-faucet

# View real-time logs
sudo journalctl -u bssc-testnet -f
sudo journalctl -u bssc-faucet -f
```

## Testing Your Integration

### Test Script

```javascript
// test-bssc-testnet.js
const Web3 = require('web3');

async function testBSSCTestnet() {
  const web3 = new Web3('https://bssc-rpc.bssc.live');
  
  console.log('Testing BSSC Testnet Connection...\n');
  
  // Test 1: Chain ID
  const chainId = await web3.eth.getChainId();
  console.log('✓ Chain ID:', chainId);
  
  // Test 2: Block number
  const blockNumber = await web3.eth.getBlockNumber();
  console.log('✓ Current Block:', blockNumber);
  
  // Test 3: Gas price
  const gasPrice = await web3.eth.getGasPrice();
  console.log('✓ Gas Price:', gasPrice);
  
  // Test 4: Network ID
  const networkId = await web3.eth.net.getId();
  console.log('✓ Network ID:', networkId);
  
  console.log('\n✓ All tests passed!');
}

testBSSCTestnet().catch(console.error);
```

Run test:
```bash
node test-bssc-testnet.js
```

## Performance

### Expected Metrics

- **TPS**: Up to 65,000 transactions per second
- **Finality**: ~400ms
- **Block Time**: ~400ms
- **Transaction Fee**: <$0.001

### Load Testing

```bash
# Install solana-bench-tps
cargo build --release --bin solana-bench-tps

# Run benchmark
./target/release/solana-bench-tps \
  --url http://109.147.47.132:8899 \
  --duration 60 \
  --sustained
```

## Troubleshooting

### RPC Connection Issues

```bash
# Test direct RPC connection
curl -X POST http://109.147.47.132:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### Faucet Not Working

```bash
# Check faucet status
sudo systemctl status bssc-faucet

# Check faucet balance
solana balance --url http://109.147.47.132:8899 \
  $(solana-keygen pubkey /opt/bssc-testnet/keypairs/faucet.json)
```

### Validator Issues

```bash
# Check validator logs
sudo journalctl -u bssc-testnet -n 100

# Restart validator
sudo systemctl restart bssc-testnet

# Reset ledger (WARNING: deletes all data)
sudo systemctl stop bssc-testnet
sudo rm -rf /opt/bssc-testnet/ledger
sudo systemctl start bssc-testnet
```

## Cost Estimate

### Server Requirements (Minimum)
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 100Mbps

### Monthly Costs
- **VPS Hosting**: $20-40/month (Hetzner, DigitalOcean, Vultr)
- **Bandwidth**: Usually included
- **Render (RPC Adapter)**: Free tier or $7/month
- **Domain**: Already owned (bssc.live)
- **Total**: ~$20-50/month

## Scaling to Production

When ready for production:

1. **Add More Validators**: Recruit community validators
2. **Geographic Distribution**: Deploy validators in multiple regions
3. **Load Balancing**: Add HAProxy/Nginx for RPC endpoints
4. **Monitoring**: Set up Grafana + Prometheus
5. **Backups**: Automated ledger snapshots
6. **Security Audit**: Professional security review

## Support

### Documentation
- Website: https://bssc.live
- GitHub: https://github.com/HaidarIDK/Binance-Super-Smart-Chain

### Community
- Discord: [Your Discord Link]
- Twitter: [Your Twitter]
- Telegram: [Your Telegram]

### Issues
Report bugs on GitHub: https://github.com/HaidarIDK/Binance-Super-Smart-Chain/issues

