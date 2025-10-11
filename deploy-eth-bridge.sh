#!/bin/bash
# Deploy ETH Bridge PDA Program

set -e

echo "[INFO] ETH Bridge PDA Deployment Script"
echo "========================================"
echo ""

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "[ERROR] Rust not installed. Installing..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
fi

# Check if Solana is installed
if ! command -v solana &> /dev/null; then
    echo "[ERROR] Solana CLI not installed!"
    echo "Please install Solana first:"
    echo "  sh -c \"\$(curl -sSfL https://release.solana.com/v1.18.4/install)\""
    exit 1
fi

# Set to localhost validator
solana config set --url http://127.0.0.1:8899

echo "[INFO] Building ETH Bridge program..."
cd programs/eth-bridge
cargo build-sbf

if [ ! -f "target/deploy/eth_bridge.so" ]; then
    echo "[ERROR] Build failed - eth_bridge.so not found"
    exit 1
fi

echo "[INFO] Build successful!"
echo ""

# Deploy
echo "[INFO] Deploying program..."
PROGRAM_ID=$(solana program deploy target/deploy/eth_bridge.so --output json | grep -o '"programId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PROGRAM_ID" ]; then
    echo "[ERROR] Deployment failed"
    exit 1
fi

echo ""
echo "========================================"
echo "[SUCCESS] ETH Bridge Program Deployed!"
echo "========================================"
echo ""
echo "Program ID: $PROGRAM_ID"
echo ""
echo "Next steps:"
echo "1. Add to /etc/systemd/system/bssc-rpc.service:"
echo "   Environment=\"ETH_BRIDGE_PROGRAM_ID=$PROGRAM_ID\""
echo ""
echo "2. Reload systemd:"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl restart bssc-rpc"
echo ""
echo "3. Test:"
echo "   curl http://localhost:8545 -X POST \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_requestFaucet\",\"params\":[\"0xYourAddress\"]}'"
echo ""

