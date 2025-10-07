# BSSC Public Testnet Deployment Guide

## Overview
This guide will help you deploy a fully functional public testnet for BSSC (Binance Super Smart Chain) that users and developers can connect to and test with.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  BSSC Public Testnet                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Server (109.147.47.132)                                 │
│  ┌────────────────────────────────────────────┐         │
│  │  Test Validator (Port 8899)                │         │
│  │  - Solana test-validator                    │         │
│  │  - Genesis with BNB token                   │         │
│  │  - Transaction history enabled              │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
│  ┌────────────────────────────────────────────┐         │
│  │  Faucet Service (Port 9900)                │         │
│  │  - Distributes test BNB                     │         │
│  │  - Rate limiting                            │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  RPC Adapter (Render - https://bssc-rpc.bssc.live)      │
│  ┌────────────────────────────────────────────┐         │
│  │  - Ethereum JSON-RPC compatibility         │         │
│  │  - EVM transaction storage                 │         │
│  │  - Receipt generation                       │         │
│  │  - Faucet API                              │         │
│  │  - Connects to validator                   │         │
│  └────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Developers   │
                    │   & Users      │
                    └───────────────┘
```

## Step 1: Prepare Your Server

### Requirements
- Linux server (Ubuntu 20.04+ recommended)
- 8GB RAM minimum (16GB recommended)
- 100GB SSD storage
- Public IP address (we're using 109.147.47.132)
- Open ports: 8899 (RPC), 9900 (Faucet), 8900 (WebSocket)

### Recommended Providers
- **Hetzner**: €20-40/month (best value)
- **DigitalOcean**: $40-80/month
- **Vultr**: $30-60/month
- **AWS/GCP**: $50-100/month

## Step 2: Build Deployment Package

On your Windows machine, run:

```powershell
.\deploy-bssc-testnet.ps1
```

This will:
1. Create `bssc-validator-deploy` directory
2. Copy all necessary source files
3. Include deployment script
4. Show upload instructions

## Step 3: Upload to Server

```bash
# Upload the deployment package
scp -r bssc-validator-deploy root@109.147.47.132:/tmp/

# SSH to your server
ssh root@109.147.47.132
```

## Step 4: Deploy on Server

```bash
# Navigate to deployment directory
cd /tmp/bssc-validator-deploy

# Make script executable
chmod +x deploy-bssc-testnet.sh

# Run deployment
sudo ./deploy-bssc-testnet.sh
```

The script will:
1. Install Rust and dependencies
2. Build BSSC test-validator and faucet
3. Create systemd services
4. Generate keypairs
5. Start the testnet
6. Configure automatic restarts

This will take 30-60 minutes depending on server specs.

## Step 5: Configure Firewall

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 8899/tcp comment 'BSSC RPC'
sudo ufw allow 9900/tcp comment 'BSSC Faucet'
sudo ufw allow 8900/tcp comment 'BSSC WebSocket'

# Or firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=8899/tcp
sudo firewall-cmd --permanent --add-port=9900/tcp
sudo firewall-cmd --permanent --add-port=8900/tcp
sudo firewall-cmd --reload
```

## Step 6: Verify Deployment

```bash
# Check services status
sudo systemctl status bssc-testnet
sudo systemctl status bssc-faucet

# Run health check
/opt/bssc-testnet/health-check.sh

# View logs
/opt/bssc-testnet/view-logs.sh
```

### Test RPC Endpoint

```bash
curl -X POST http://109.147.47.132:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

Expected response:
```json
{"jsonrpc":"2.0","result":"ok","id":1}
```

## Step 7: Update RPC Adapter

On your local machine, update `bssc-live-server.js`:

```javascript
const BSSC_VALIDATOR_URL = process.env.BSSC_VALIDATOR_URL || 'http://109.147.47.132:8899';
```

Commit and push to trigger Render deployment:

```bash
git add bssc-live-server.js
git commit -m "Connect RPC to live testnet validator"
git push origin master
```

Render will automatically redeploy your RPC adapter to connect to the live validator.

## Step 8: Test End-to-End

### Test via RPC Adapter

```bash
# Get chain ID
curl -X POST https://bssc-rpc.bssc.live \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'

# Request test BNB
curl -X POST https://bssc-rpc.bssc.live \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"eth_requestFaucet",
    "params":["0xYourAddress"]
  }'
```

### Test with Web3.js

```javascript
const Web3 = require('web3');
const web3 = new Web3('https://bssc-rpc.bssc.live');

// Get chain ID
const chainId = await web3.eth.getChainId();
console.log('Chain ID:', chainId); // 56

// Get block number
const blockNumber = await web3.eth.getBlockNumber();
console.log('Block:', blockNumber);
```

## Step 9: Share with Developers

### Public Endpoints

Provide these to your users:

- **RPC Endpoint**: `https://bssc-rpc.bssc.live`
- **Direct RPC**: `http://109.147.47.132:8899`
- **Faucet**: `http://109.147.47.132:9900`
- **Chain ID**: `56`
- **Network**: BSSC Testnet

### Documentation

Share these resources:
- Developer Guide: `testnet-connect-guide.html`
- Full Guide: `BSSC_TESTNET_GUIDE.md`
- Status Dashboard: `testnet-status-dashboard.html`

### Website Integration

Upload `testnet-connect-guide.html` and `testnet-status-dashboard.html` to your website so developers can easily access connection info.

## Monitoring & Maintenance

### View Logs

```bash
# Real-time validator logs
sudo journalctl -u bssc-testnet -f

# Real-time faucet logs
sudo journalctl -u bssc-faucet -f

# Both logs
sudo journalctl -u bssc-testnet -u bssc-faucet -f
```

### Restart Services

```bash
# Restart validator
sudo systemctl restart bssc-testnet

# Restart faucet
sudo systemctl restart bssc-faucet

# Restart both
sudo systemctl restart bssc-testnet bssc-faucet
```

### Reset Ledger (Fresh Start)

```bash
# Stop services
sudo systemctl stop bssc-testnet bssc-faucet

# Clear ledger
sudo rm -rf /opt/bssc-testnet/ledger

# Restart
sudo systemctl start bssc-testnet
sleep 10
sudo systemctl start bssc-faucet
```

### Monitor Disk Space

```bash
# Check disk usage
df -h /opt/bssc-testnet

# Check ledger size
du -sh /opt/bssc-testnet/ledger
```

The ledger can grow large over time. Plan for 1-2GB per day of heavy use.

## Troubleshooting

### Validator Won't Start

```bash
# Check logs
sudo journalctl -u bssc-testnet -n 100

# Common issues:
# 1. Port already in use
sudo lsof -i :8899

# 2. Corrupted ledger
sudo rm -rf /opt/bssc-testnet/ledger
sudo systemctl restart bssc-testnet
```

### Faucet Not Responding

```bash
# Check if validator is running first
sudo systemctl status bssc-testnet

# Check faucet balance
solana balance --url http://localhost:8899 \
  $(solana-keygen pubkey /opt/bssc-testnet/keypairs/faucet.json)

# Restart faucet
sudo systemctl restart bssc-faucet
```

### RPC Connection Timeouts

```bash
# Check if validator is accepting connections
netstat -an | grep 8899

# Test direct connection
curl http://localhost:8899 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Check firewall
sudo ufw status
```

## Cost Breakdown

### Initial Setup
- Server: $0 (one-time setup)
- Domain: $0 (already own bssc.live)
- SSL: $0 (Cloudflare free)
- Total: $0

### Monthly Costs
- VPS (8GB RAM, 100GB SSD): $20-40/month
- Render (RPC adapter): $0-7/month (free tier or starter)
- Bandwidth: Included
- **Total: ~$20-50/month**

### Scaling Costs
If you need to scale:
- More validators: +$20-40 each
- Load balancer: +$10-20/month
- Monitoring (Grafana Cloud): +$0-50/month
- **Total scaled: ~$50-150/month**

## Security Considerations

### Firewall Rules

Only open necessary ports:
```bash
# Allow SSH (if not already)
sudo ufw allow 22/tcp

# Allow BSSC ports
sudo ufw allow 8899/tcp
sudo ufw allow 9900/tcp
sudo ufw allow 8900/tcp

# Enable firewall
sudo ufw enable
```

### Rate Limiting (Optional)

For production, add rate limiting to prevent abuse:

```bash
# Install nginx for rate limiting
sudo apt install nginx

# Configure as reverse proxy with rate limits
# See nginx-bssc-rpc.conf for example
```

### Faucet Rate Limits

The faucet is configured with:
- Per-request cap: 1 BNB
- Per-time cap: 10 BNB per time window

Adjust in `/etc/systemd/system/bssc-faucet.service` if needed.

## Next Steps

1. **Deploy website updates**: Upload `testnet-connect-guide.html` to your website
2. **Announce testnet**: Share on social media, Discord, Telegram
3. **Monitor usage**: Watch logs and metrics
4. **Gather feedback**: Collect developer feedback
5. **Scale if needed**: Add more validators or increase server resources

## Support

- **Documentation**: `BSSC_TESTNET_GUIDE.md`
- **Developer Guide**: `testnet-connect-guide.html`
- **Status Dashboard**: `testnet-status-dashboard.html`
- **GitHub**: https://github.com/HaidarIDK/Binance-Super-Smart-Chain

## Success Criteria

Your testnet is ready when:
- ✓ Validator is running and producing blocks
- ✓ Faucet is distributing test BNB
- ✓ RPC adapter connects to validator
- ✓ `https://bssc-rpc.bssc.live` returns valid responses
- ✓ Developers can connect via Web3.js
- ✓ MetaMask can connect to the network

Congratulations! You now have a public BSSC testnet!

