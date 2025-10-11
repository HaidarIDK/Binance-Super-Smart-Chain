#!/bin/bash
# Quick script to update BSSC server

echo "🚀 BSSC Server Update Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="${SERVER_IP:-109.147.47.132}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PATH="${SERVER_PATH:-~/Binance-Super-Smart-Chain}"

echo -e "${YELLOW}Server: $SERVER_USER@$SERVER_IP${NC}"
echo -e "${YELLOW}Path: $SERVER_PATH${NC}"
echo ""

# Step 1: Backup on server
echo "📦 Step 1: Creating backup on server..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && mkdir -p backups/\$(date +%Y%m%d) && cp bssc-live-server.js explorer-server.js backups/\$(date +%Y%m%d)/"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi
echo ""

# Step 2: Upload files
echo "📤 Step 2: Uploading updated files..."
scp bssc-live-server.js $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp explorer-server.js $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp eth-solana-bridge.js $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp REAL_ONLY_COMPLETE.md $SERVER_USER@$SERVER_IP:$SERVER_PATH/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded${NC}"
else
    echo -e "${RED}❌ Upload failed${NC}"
    exit 1
fi
echo ""

# Step 3: Check validator
echo "🔍 Step 3: Checking if BSSC validator is running..."
ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost:8899 -X POST -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getHealth\"}' | grep -q '\"result\":\"ok\"'"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Validator is running${NC}"
else
    echo -e "${YELLOW}⚠️  Validator not detected${NC}"
    echo "Starting validator..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && nohup solana-test-validator --rpc-port 8899 --faucet-port 9900 > validator.log 2>&1 &"
    sleep 5
    echo -e "${GREEN}✅ Validator started${NC}"
fi
echo ""

# Step 4: Restart services
echo "🔄 Step 4: Restarting services..."

# Try PM2 first
ssh $SERVER_USER@$SERVER_IP "which pm2" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Using PM2..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 restart bssc-rpc || pm2 start bssc-live-server.js --name bssc-rpc"
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 restart bssc-explorer || pm2 start explorer-server.js --name bssc-explorer"
    ssh $SERVER_USER@$SERVER_IP "pm2 save"
else
    # Try systemd
    ssh $SERVER_USER@$SERVER_IP "sudo systemctl restart bssc-rpc" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "Using systemd..."
        ssh $SERVER_USER@$SERVER_IP "sudo systemctl restart bssc-explorer"
    else
        echo "Starting services directly..."
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pkill -f bssc-live-server"
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pkill -f explorer-server"
        sleep 2
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && nohup node bssc-live-server.js > rpc.log 2>&1 &"
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && nohup node explorer-server.js > explorer.log 2>&1 &"
    fi
fi

echo -e "${GREEN}✅ Services restarted${NC}"
echo ""

# Step 5: Test
echo "🧪 Step 5: Testing services..."

# Test RPC
echo -n "Testing RPC server... "
HEALTH=$(ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost:8545 -X POST -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getHealth\"}'")
if echo $HEALTH | grep -q "\"result\":\"ok\""; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
    echo "Response: $HEALTH"
fi

# Test Explorer
echo -n "Testing Explorer... "
EXPLORER=$(ssh $SERVER_USER@$SERVER_IP "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001")
if [ "$EXPLORER" = "200" ]; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Failed (HTTP $EXPLORER)${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Update Complete!${NC}"
echo ""
echo "Access your services:"
echo "  🌐 RPC: https://bssc-rpc.bssc.live"
echo "  🔍 Explorer: https://explorer.bssc.live"
echo ""
echo "View logs:"
echo "  ssh $SERVER_USER@$SERVER_IP"
echo "  pm2 logs bssc-rpc"
echo ""



