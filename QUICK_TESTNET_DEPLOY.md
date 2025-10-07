# Quick Testnet Deployment Guide

## You're Here: Ready to Deploy! ✅

Your deployment package is ready in the `bssc-validator-deploy` directory.

## Quick Commands

### 1️⃣ Upload to Server

Open a **new terminal/PowerShell** window and run:

```bash
cd C:\Users\7haid\OneDrive\Desktop\Binance-Super-Smart-Chain
scp -r bssc-validator-deploy root@109.147.47.132:/tmp/
```

**Note**: You'll need to enter your server password. This will take a few minutes as it uploads ~500MB of source code.

### 2️⃣ SSH to Server


```bash
ssh root@109.147.47.132
```

### 3️⃣ Run Deployment Script

Once connected to your server, run:

```bash
cd /tmp/bssc-validator-deploy
chmod +x deploy-bssc-testnet.sh
sudo ./deploy-bssc-testnet.sh
```

**This will take 30-60 minutes** to:
- Install Rust and build tools
- Build BSSC test-validator
- Build BSSC faucet
- Create systemd services
- Start the testnet

### 4️⃣ Configure Firewall

After the deployment completes successfully, run:

```bash
sudo ufw allow 8899/tcp
sudo ufw allow 9900/tcp
sudo ufw allow 8900/tcp
```

### 5️⃣ Verify It's Running

```bash
# Check services
sudo systemctl status bssc-testnet
sudo systemctl status bssc-faucet

# Run health check
/opt/bssc-testnet/health-check.sh
```

Expected output:
```
BSSC Testnet Health Check
==========================

Validator Status:
   Active: active (running)

Faucet Status:
   Active: active (running)

RPC Endpoint Test:
{"jsonrpc":"2.0","result":"ok","id":1}
```

## ✅ Success! Your testnet is live!

Your endpoints are now available:
- **RPC**: `http://109.147.47.132:8899`
- **Faucet**: `http://109.147.47.132:9900`
- **Public RPC**: `https://bssc-rpc.bssc.live` (automatically connects to your validator)

## 🧪 Test It

### Test RPC directly:
```bash
curl -X POST http://109.147.47.132:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### Test via public endpoint:
```bash
curl -X POST https://bssc-rpc.bssc.live \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'
```

### Request test BNB:
```bash
curl -X POST https://bssc-rpc.bssc.live \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"eth_requestFaucet",
    "params":["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"]
  }'
```

## 📊 View Logs (On Server)

```bash
# View validator logs
sudo journalctl -u bssc-testnet -f

# View faucet logs
sudo journalctl -u bssc-faucet -f

# View all logs
/opt/bssc-testnet/view-logs.sh
```

## 🔄 Restart Services

```bash
# Restart validator
sudo systemctl restart bssc-testnet

# Restart faucet
sudo systemctl restart bssc-faucet
```

## 🛠️ Troubleshooting

### Build fails?
The most common issue is running out of RAM. Make sure your server has at least 8GB.

### Validator won't start?
```bash
# Check logs for errors
sudo journalctl -u bssc-testnet -n 100

# Try resetting the ledger
sudo systemctl stop bssc-testnet
sudo rm -rf /opt/bssc-testnet/ledger
sudo systemctl start bssc-testnet
```

### Can't connect to RPC?
```bash
# Check if it's listening
netstat -an | grep 8899

# Check firewall
sudo ufw status
```

## 📚 Full Documentation

- `DEPLOY_PUBLIC_TESTNET.md` - Complete deployment guide
- `BSSC_TESTNET_GUIDE.md` - Full testnet documentation
- `testnet-connect-guide.html` - Developer connection guide
- `testnet-status-dashboard.html` - Live status dashboard

## 💰 Cost

Your testnet costs approximately **$20-50/month**:
- VPS (8GB RAM): $20-40/month
- Render RPC: $0-7/month
- Total: ~$20-50/month

## 🎉 Share with Developers

Once live, share these endpoints:
- **RPC**: `https://bssc-rpc.bssc.live`
- **Chain ID**: `56`
- **Network**: BSSC Testnet
- **Faucet**: Available via `eth_requestFaucet` method

Upload `testnet-connect-guide.html` to your website so developers can easily connect!

