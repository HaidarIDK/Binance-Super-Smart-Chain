# Update Your BSSC Live Server

## Step 1: Connect via SSH

```bash
# Connect to your server (use your actual IP)
ssh root@109.147.47.132

# Or if you have a different user:
ssh yourusername@109.147.47.132
```

## Step 2: Navigate to Your Project

```bash
# Go to your BSSC directory
cd ~/Binance-Super-Smart-Chain

# Or if it's in a different location:
cd /path/to/your/Binance-Super-Smart-Chain
```

## Step 3: Backup Current Files (IMPORTANT!)

```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup current files
cp bssc-live-server.js backups/$(date +%Y%m%d)/
cp explorer-server.js backups/$(date +%Y%m%d)/
cp eth-solana-bridge.js backups/$(date +%Y%m%d)/
cp bssc-data.json backups/$(date +%Y%m%d)/ 2>/dev/null || echo "No data file yet"

echo "✅ Backup complete!"
```

## Step 4: Update Files from Local Machine

### Option A: Using SCP (from your local Windows machine)

```powershell
# Open PowerShell on Windows
cd C:\Users\7haid\OneDrive\Desktop\Binance-Super-Smart-Chain

# Upload updated files to server
scp bssc-live-server.js root@109.147.47.132:~/Binance-Super-Smart-Chain/
scp explorer-server.js root@109.147.47.132:~/Binance-Super-Smart-Chain/
scp REAL_ONLY_COMPLETE.md root@109.147.47.132:~/Binance-Super-Smart-Chain/
```

### Option B: Using Git (if you have a repository)

```bash
# On server
cd ~/Binance-Super-Smart-Chain

# Pull latest changes
git pull origin master

# Or if you need to stash local changes first:
git stash
git pull origin master
```

### Option C: Manual Copy-Paste

If SSH/SCP is complicated:

1. **Open file on server:**
```bash
nano bssc-live-server.js
```

2. **Delete all content** (Ctrl+K repeatedly)

3. **Copy from your local file** (open in VS Code)

4. **Paste in nano** (Right-click in terminal)

5. **Save**: `Ctrl+O`, `Enter`, `Ctrl+X`

6. **Repeat for other files**

## Step 5: Check What Services Are Running

```bash
# Check if services are running
ps aux | grep node

# Check systemd services (if using systemd)
sudo systemctl status bssc-rpc
sudo systemctl status bssc-explorer

# Check for PM2 processes (if using PM2)
pm2 list
```

## Step 6: Stop Old Services

### If using systemd:
```bash
sudo systemctl stop bssc-rpc
sudo systemctl stop bssc-explorer
```

### If using PM2:
```bash
pm2 stop all
# or specific processes:
pm2 stop bssc-live-server
pm2 stop explorer-server
```

### If running directly:
```bash
# Find process IDs
ps aux | grep node

# Kill them (replace PID with actual process ID)
kill <PID>
# or force kill:
kill -9 <PID>
```

## Step 7: Start BSSC Validator (REQUIRED NOW!)

```bash
# Check if validator is running
ps aux | grep solana-test-validator

# If not running, start it:
solana-test-validator \
    --rpc-port 8899 \
    --faucet-port 9900 \
    --ledger ~/test-ledger \
    --no-bpf-jit &

# Verify it's working:
curl http://localhost:8899 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Should return: {"jsonrpc":"2.0","result":"ok","id":1}
```

## Step 8: Start Updated Services

### Method 1: Using systemd (recommended for production)

**Create/update service file:**
```bash
sudo nano /etc/systemd/system/bssc-rpc.service
```

**Paste this:**
```ini
[Unit]
Description=BSSC RPC Server (Real Only)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/Binance-Super-Smart-Chain
Environment="BSSC_VALIDATOR_URL=http://127.0.0.1:8899"
Environment="METAMASK_PORT=8545"
ExecStart=/usr/bin/node bssc-live-server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Start services:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable bssc-rpc
sudo systemctl start bssc-rpc
sudo systemctl status bssc-rpc

# Check logs
sudo journalctl -u bssc-rpc -f
```

### Method 2: Using PM2 (easier)

```bash
# Install PM2 if not already installed
npm install -g pm2

# Start services with PM2
pm2 start bssc-live-server.js --name "bssc-rpc" \
    --env BSSC_VALIDATOR_URL=http://127.0.0.1:8899

pm2 start explorer-server.js --name "bssc-explorer"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# View logs
pm2 logs bssc-rpc
```

### Method 3: Direct (for testing)

```bash
# Start in background
nohup node bssc-live-server.js > rpc.log 2>&1 &
nohup node explorer-server.js > explorer.log 2>&1 &

# Check logs
tail -f rpc.log
tail -f explorer.log
```

## Step 9: Verify Everything Works

### Test 1: Check Validator Connection
```bash
curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

**Expected:** `{"jsonrpc":"2.0","result":"ok","id":1}`

### Test 2: Test Faucet
```bash
curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_requestFaucet","params":["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"]}'
```

**Expected:** Success with real Solana signature

### Test 3: Check Balance
```bash
curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_getBalance","params":["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","latest"]}'
```

**Expected:** Hex balance value

### Test 4: Check Explorer
```bash
curl http://localhost:3001
```

**Expected:** HTML page loads

## Step 10: Update Nginx (if using)

```bash
sudo nano /etc/nginx/sites-available/bssc
```

**Make sure it points to correct port:**
```nginx
server {
    listen 443 ssl;
    server_name bssc-rpc.bssc.live;
    
    location / {
        proxy_pass http://127.0.0.1:8545;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Reload nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Troubleshooting

### Issue: "Cannot connect to validator"

```bash
# Check if validator is running
ps aux | grep solana

# Check if port 8899 is listening
netstat -tuln | grep 8899

# Check validator logs
tail -f ~/test-ledger/validator.log

# Restart validator
pkill solana-test-validator
solana-test-validator --rpc-port 8899 &
```

### Issue: "Port already in use"

```bash
# Find what's using port 8545
lsof -i :8545

# Kill it
kill -9 <PID>

# Or use different port
export METAMASK_PORT=8546
node bssc-live-server.js
```

### Issue: "Module not found"

```bash
# Reinstall dependencies
npm install

# Check for specific missing modules
npm install bs58 node-forge
```

### Issue: Services won't start

```bash
# Check Node.js is installed
node --version

# Check file permissions
ls -la bssc-live-server.js

# Make executable if needed
chmod +x bssc-live-server.js

# Check syntax errors
node -c bssc-live-server.js
```

## Monitoring

### View Live Logs

**systemd:**
```bash
sudo journalctl -u bssc-rpc -f
```

**PM2:**
```bash
pm2 logs bssc-rpc
```

**Direct:**
```bash
tail -f rpc.log
```

### Check Server Status

```bash
# System resources
htop

# Disk space
df -h

# Memory
free -h

# Open connections
netstat -an | grep 8545
```

## Quick Commands Reference

```bash
# Restart everything
pm2 restart all

# Stop everything
pm2 stop all

# View processes
pm2 list

# View detailed logs
pm2 logs --lines 100

# Monitor in real-time
pm2 monit

# Check if working
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

## Important Notes

⚠️ **CRITICAL CHANGES:**
1. Your server now REQUIRES a running BSSC validator
2. No more mock data - everything is real blockchain
3. Faucet won't work without validator
4. Balance queries go directly to validator

✅ **Benefits:**
- 100% real blockchain data
- No fake transactions
- Production-ready architecture
- MetaMask shows real balances

🚀 **Your server is now enterprise-grade!**

