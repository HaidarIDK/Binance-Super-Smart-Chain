#!/bin/bash
# BSSC Blockchain Testing Script

echo "=========================================="
echo "BSSC Blockchain Test Suite"
echo "=========================================="
echo ""

# Test 1: Check if validator is running
echo "[1] Checking Validator Status..."
ps aux | grep solana-test-validator | grep -v grep
if [ $? -eq 0 ]; then
    echo "✓ Validator is RUNNING"
else
    echo "✗ Validator is NOT running"
    exit 1
fi
echo ""

# Test 2: Get current slot (block height)
echo "[2] Getting Current Slot..."
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getSlot"
}' | jq .
echo ""

# Test 3: Get block height
echo "[3] Getting Block Height..."
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBlockHeight"
}' | jq .
echo ""

# Test 4: Get recent blockhash
echo "[4] Getting Recent Blockhash..."
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getLatestBlockhash"
}' | jq .
echo ""

# Test 5: Get validator version
echo "[5] Getting Validator Version..."
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getVersion"
}' | jq .
echo ""

# Test 6: Get cluster nodes
echo "[6] Getting Cluster Nodes..."
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getClusterNodes"
}' | jq .
echo ""

# Test 7: Check faucet
echo "[7] Testing Faucet (requesting 1 BNB)..."
curl -s http://localhost:9900/airdrop?amount=1000000000 | jq .
echo ""

echo "=========================================="
echo "All Tests Complete!"
echo "=========================================="
