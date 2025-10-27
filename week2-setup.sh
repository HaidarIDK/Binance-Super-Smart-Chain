#!/bin/bash

# BSSC Week 2 Complete Setup Script

set -e

echo "======================================"
echo "BSSC Week 2 Production Setup"
echo "======================================"
echo ""

# Step 1: Deploy mainnet validator
echo "Step 1: Deploying mainnet validator..."
./deploy-mainnet.sh

# Step 2: Setup fee collector
echo ""
echo "Step 2: Setting up fee collector..."
./setup-fee-collector.sh

# Step 3: Setup SSL and Nginx
echo ""
echo "Step 3: Setting up SSL and Nginx..."
./setup-ssl.sh

# Step 4: Start services
echo ""
echo "Step 4: Starting services..."
sudo systemctl start bssc-validator
sleep 10
sudo systemctl start bssc-rpc

# Step 5: Verify deployment
echo ""
echo "Step 5: Verifying deployment..."
sleep 5
./mainnet-monitor.sh

echo ""
echo "======================================"
echo "Week 2 Setup Complete!"
echo "======================================"
echo ""
echo "Your BSSC mainnet is now running!"
echo ""
echo "RPC Endpoint: https://rpc.bssc.live"
echo "Explorer: https://explorer.bssc.live"
echo ""
echo "To check status: ./mainnet-monitor.sh"
echo "To view logs: sudo journalctl -u bssc-validator -f"
echo ""

