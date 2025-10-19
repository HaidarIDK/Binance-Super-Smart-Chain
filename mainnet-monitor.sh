#!/bin/bash

# BSSC Mainnet Monitoring Script

echo "======================================"
echo "BSSC Mainnet Health Monitor"
echo "======================================"
echo ""

# Configuration
RPC_URL="${RPC_URL:-http://localhost:8899}"
ALERT_EMAIL="${ALERT_EMAIL:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
check_service() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        echo -e "${GREEN}✓${NC} $service is running"
        return 0
    else
        echo -e "${RED}✗${NC} $service is not running"
        return 1
    fi
}

check_rpc() {
    local response=$(curl -s -X POST "$RPC_URL" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        echo -e "${GREEN}✓${NC} RPC is responding"
        return 0
    else
        echo -e "${RED}✗${NC} RPC is not responding"
        return 1
    fi
}

get_slot() {
    curl -s -X POST "$RPC_URL" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}' | \
        grep -o '"result":[0-9]*' | \
        grep -o '[0-9]*'
}

get_block_height() {
    curl -s -X POST "$RPC_URL" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getBlockHeight"}' | \
        grep -o '"result":[0-9]*' | \
        grep -o '[0-9]*'
}

# Check Services
echo "Service Status:"
echo "---------------"
check_service "bssc-validator"
VALIDATOR_STATUS=$?
check_service "bssc-rpc"
RPC_SERVICE_STATUS=$?
echo ""

# Check RPC
echo "RPC Health:"
echo "-----------"
check_rpc
RPC_STATUS=$?
echo ""

# Get Blockchain Stats
echo "Blockchain Stats:"
echo "-----------------"
SLOT=$(get_slot)
BLOCK_HEIGHT=$(get_block_height)

if [ ! -z "$SLOT" ]; then
    echo -e "${GREEN}Current Slot:${NC} $SLOT"
else
    echo -e "${RED}Failed to get slot${NC}"
fi

if [ ! -z "$BLOCK_HEIGHT" ]; then
    echo -e "${GREEN}Block Height:${NC} $BLOCK_HEIGHT"
else
    echo -e "${RED}Failed to get block height${NC}"
fi
echo ""

# Check Disk Space
echo "Disk Space:"
echo "-----------"
DISK_USAGE=$(df -h $HOME/bssc-mainnet/ledger 2>/dev/null | awk 'NR==2 {print $5}' | sed 's/%//')
if [ ! -z "$DISK_USAGE" ]; then
    if [ "$DISK_USAGE" -lt 80 ]; then
        echo -e "${GREEN}✓${NC} Disk usage: ${DISK_USAGE}%"
    elif [ "$DISK_USAGE" -lt 90 ]; then
        echo -e "${YELLOW}⚠${NC} Disk usage: ${DISK_USAGE}% (Warning)"
    else
        echo -e "${RED}✗${NC} Disk usage: ${DISK_USAGE}% (Critical)"
    fi
else
    echo -e "${YELLOW}⚠${NC} Could not check disk usage"
fi
echo ""

# Check Memory
echo "Memory Usage:"
echo "-------------"
FREE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$FREE_MEM" -lt 80 ]; then
    echo -e "${GREEN}✓${NC} Memory usage: ${FREE_MEM}%"
elif [ "$FREE_MEM" -lt 90 ]; then
    echo -e "${YELLOW}⚠${NC} Memory usage: ${FREE_MEM}% (Warning)"
else
    echo -e "${RED}✗${NC} Memory usage: ${FREE_MEM}% (Critical)"
fi
echo ""

# Check CPU Load
echo "CPU Load:"
echo "---------"
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
echo "Load average: $LOAD_AVG"
echo ""

# Overall Health
echo "======================================"
if [ $VALIDATOR_STATUS -eq 0 ] && [ $RPC_STATUS -eq 0 ]; then
    echo -e "${GREEN}Overall Status: HEALTHY${NC}"
    exit 0
else
    echo -e "${RED}Overall Status: UNHEALTHY${NC}"
    exit 1
fi

