#!/bin/bash
echo "Testing BSSC Blockchain..."
echo ""

echo "1. Current Slot:"
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}'
echo ""
echo ""

echo "2. Block Height:"
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getBlockHeight"}'
echo ""
echo ""

echo "3. Version:"
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}'
echo ""
echo ""

echo "4. Latest Blockhash:"
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getLatestBlockhash"}'
echo ""
echo ""

echo "5. Faucet Test (1 BNB):"
curl -s "http://localhost:9900/airdrop?amount=1000000000"
echo ""
echo ""

echo "Done!"
