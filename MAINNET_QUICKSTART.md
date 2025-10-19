# BSSC Mainnet Quick Start Guide

## Prerequisites

- Ubuntu 22.04 LTS server
- 16+ CPU cores
- 32GB+ RAM
- 1TB NVMe SSD
- 1Gbps network
- Domain names configured (rpc.bssc.live, explorer.bssc.live)

## Quick Deployment (5 Steps)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libudev-dev \
    llvm \
    clang \
    cmake \
    make \
    protobuf-compiler \
    curl \
    git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Step 2: Clone and Build

```bash
# Clone repository
git clone https://github.com/HaidarIDK/Binance-Super-Smart-Chain.git
cd Binance-Super-Smart-Chain

# Build validator
cargo build --release

# Install Node dependencies
npm install
```

### Step 3: Deploy Mainnet

```bash
# Make deployment script executable
chmod +x deploy-mainnet.sh
chmod +x mainnet-monitor.sh

# Run deployment
./deploy-mainnet.sh
```

### Step 4: Start Services

```bash
# Start validator
sudo systemctl start bssc-validator

# Wait 30 seconds for validator to initialize
sleep 30

# Start RPC server
sudo systemctl start bssc-rpc

# Check status
sudo systemctl status bssc-validator
sudo systemctl status bssc-rpc
```

### Step 5: Verify Deployment

```bash
# Run health check
./mainnet-monitor.sh

# Check logs
sudo journalctl -u bssc-validator -n 100 --no-pager
sudo journalctl -u bssc-rpc -n 100 --no-pager
```

## Configuration Files

### Mainnet Config
Located at: `mainnet-config.json`

Key settings:
- Chain ID: 16979
- Native token: BSSC (EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump)
- Gas fees: 0.001 BSSC per transfer
- Fee distribution: 50% burn, 50% validators

### Validator Keypairs
Generated at:
- `~/bssc-mainnet/validator-keypair.json`
- `~/bssc-mainnet/vote-keypair.json`

**Important:** Backup these files securely!

## RPC Endpoints

After deployment, your RPC will be available at:
- HTTP: `http://your-server-ip:8899`
- WebSocket: `ws://your-server-ip:8900`

## SSL/HTTPS Setup (Production)

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot

# Get SSL certificate
sudo certbot certonly --standalone -d rpc.bssc.live

# Install Nginx
sudo apt install -y nginx

# Configure Nginx reverse proxy
sudo tee /etc/nginx/sites-available/bssc-rpc > /dev/null <<EOF
server {
    listen 80;
    server_name rpc.bssc.live;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rpc.bssc.live;

    ssl_certificate /etc/letsencrypt/live/rpc.bssc.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rpc.bssc.live/privkey.pem;

    location / {
        proxy_pass http://localhost:8899;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/bssc-rpc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow RPC
sudo ufw allow 8899/tcp

# Allow Gossip
sudo ufw allow 8001/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## Monitoring Setup

### Automatic Health Checks

```bash
# Add to crontab for monitoring every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /path/to/Binance-Super-Smart-Chain/mainnet-monitor.sh") | crontab -
```

### View Real-time Logs

```bash
# Validator logs
sudo journalctl -u bssc-validator -f

# RPC logs
sudo journalctl -u bssc-rpc -f
```

## Troubleshooting

### Validator not starting

```bash
# Check logs
sudo journalctl -u bssc-validator -n 100

# Common issues:
# - Insufficient disk space
# - Port already in use
# - Missing keypairs

# Reset and restart
sudo systemctl stop bssc-validator
rm -rf ~/bssc-mainnet/ledger/*
sudo systemctl start bssc-validator
```

### RPC not responding

```bash
# Check if validator is running first
sudo systemctl status bssc-validator

# Restart RPC
sudo systemctl restart bssc-rpc

# Check RPC manually
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### High disk usage

```bash
# Check ledger size
du -sh ~/bssc-mainnet/ledger

# Validator includes --limit-ledger-size flag
# Automatically cleans old ledger data
# If needed, manually clean:
sudo systemctl stop bssc-validator
rm -rf ~/bssc-mainnet/ledger/rocksdb
sudo systemctl start bssc-validator
```

## Performance Tuning

### Increase file limits

```bash
# Add to /etc/security/limits.conf
echo "* soft nofile 1000000" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 1000000" | sudo tee -a /etc/security/limits.conf
```

### Optimize network

```bash
# Add to /etc/sysctl.conf
sudo tee -a /etc/sysctl.conf > /dev/null <<EOF
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864
EOF

sudo sysctl -p
```

## Backup and Recovery

### Backup keypairs

```bash
# Backup to secure location
mkdir -p ~/backups
cp ~/bssc-mainnet/validator-keypair.json ~/backups/
cp ~/bssc-mainnet/vote-keypair.json ~/backups/

# Encrypt backups
tar -czf ~/backups/keypairs-$(date +%Y%m%d).tar.gz ~/backups/*.json
gpg -c ~/backups/keypairs-$(date +%Y%m%d).tar.gz
rm ~/backups/keypairs-$(date +%Y%m%d).tar.gz
```

### Restore from backup

```bash
# Decrypt
gpg -d ~/backups/keypairs-YYYYMMDD.tar.gz.gpg > keypairs.tar.gz

# Extract
tar -xzf keypairs.tar.gz -C ~/bssc-mainnet/
```

## Next Steps

1. Configure DNS to point to your server
2. Set up SSL certificates
3. Deploy explorer frontend
4. Configure monitoring and alerts
5. Announce mainnet launch

## Support

- Documentation: `/docs`
- Issues: https://github.com/HaidarIDK/Binance-Super-Smart-Chain/issues
- Discord: (coming soon)

## Security Reminders

- Never share validator keypairs
- Keep backups encrypted and secure
- Regularly update system packages
- Monitor logs for suspicious activity
- Use strong passwords for server access
- Enable 2FA for all accounts

