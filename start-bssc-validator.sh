#!/bin/bash
# BSSC Validator Startup Script

cd "$(dirname "$0")"

echo "Starting BSSC Validator with EVM Support..."
echo "Chain ID: 16979"
echo "Native Token: BNB"
echo ""

./target/release/solana-test-validator \
    --ledger ./test-ledger \
    --log \
    --rpc-port 8899 \
    --dynamic-port-range 8000-8020 \
    --gossip-port 8001 \
    --faucet-port 9900 \
    --limit-ledger-size 50000000

echo ""
echo "BSSC Validator stopped"
