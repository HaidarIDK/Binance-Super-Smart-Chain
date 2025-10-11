#!/bin/bash
# BSSC Cloud Server Deployment Script
# Run this on your Contabo server after the build completes

set -e

echo "==================================="
echo "BSSC Server Deployment"
echo "==================================="

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo "Server IP: $SERVER_IP"

# 1. Create systemd service for BSSC Validator
echo ""
echo "1. Setting up BSSC Validator service..."
cat > /etc/systemd/system/bssc-validator.service << 'EOF'
[Unit]
Description=BSSC Validator Node
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/Binance-Super-Smart-Chain
ExecStart=/root/Binance-Super-Smart-Chain/target/release/solana-test-validator --rpc-port 8899 --log
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 2. Create systemd service for RPC Server
echo "2. Setting up RPC Server service..."
cat > /etc/systemd/system/bssc-rpc.service << 'EOF'
[Unit]
Description=BSSC RPC Server
After=network.target bssc-validator.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/Binance-Super-Smart-Chain
ExecStart=/usr/bin/node bssc-live-server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 3. Install Nginx for Explorer
echo "3. Installing Nginx for Explorer..."
apt install -y nginx

# 4. Create Nginx config for Explorer
echo "4. Setting up Explorer..."
cat > /etc/nginx/sites-available/bssc-explorer << EOF
server {
    listen 80;
    server_name explorer.bssc.live;
    
    root /root/Binance-Super-Smart-Chain;
    index explorer.html;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    # CORS headers for API calls
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type";
}
EOF

ln -sf /etc/nginx/sites-available/bssc-explorer /etc/nginx/sites-enabled/

# 5. Create auto-update script
echo "5. Setting up auto-update from GitHub..."
cat > /root/update-bssc.sh << 'EOF'
#!/bin/bash
cd /root/Binance-Super-Smart-Chain
git fetch origin master
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ $LOCAL != $REMOTE ]; then
    echo "Updates found, pulling changes..."
    git pull origin master
    
    # Restart RPC server to apply changes
    systemctl restart bssc-rpc
    
    echo "BSSC updated and restarted at $(date)"
fi
EOF

chmod +x /root/update-bssc.sh

# 6. Add cron job for auto-update (every 5 minutes)
echo "6. Setting up auto-update cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /root/update-bssc.sh >> /var/log/bssc-update.log 2>&1") | crontab -

# 7. Configure firewall
echo "7. Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8899/tcp  # Validator RPC
ufw --force enable

# 8. Enable and start services
echo "8. Starting all services..."
systemctl daemon-reload
systemctl enable bssc-validator
systemctl enable bssc-rpc
systemctl start bssc-validator
sleep 5
systemctl start bssc-rpc
systemctl restart nginx

# 9. Check status
echo ""
echo "==================================="
echo "Deployment Complete!"
echo "==================================="
echo ""
echo "Service Status:"
systemctl status bssc-validator --no-pager -l | head -10
echo ""
systemctl status bssc-rpc --no-pager -l | head -10
echo ""
echo "==================================="
echo "Your BSSC Blockchain is LIVE!"
echo "==================================="
echo ""
echo "Validator RPC: http://$SERVER_IP:8899"
echo "Public RPC: https://bssc-rpc.bssc.live"
echo "Explorer: http://explorer.bssc.live (after DNS setup)"
echo ""
echo "Auto-update: Enabled (checks GitHub every 5 minutes)"
echo ""
echo "View logs:"
echo "  Validator: journalctl -u bssc-validator -f"
echo "  RPC: journalctl -u bssc-rpc -f"
echo ""

