#!/bin/bash
# Build and deploy ETH Bridge program

set -e

echo "[INFO] Building ETH Bridge program..."

cd programs/eth-bridge

# Build the program
cargo build-sbf

echo "[INFO] Build complete!"
echo ""
echo "To deploy:"
echo "  solana program deploy target/deploy/eth_bridge.so"
echo ""
echo "After deployment, get the program ID:"
echo "  solana address -k target/deploy/eth_bridge-keypair.json"
echo ""
echo "Then update bssc-live-server.js with:"
echo "  ETH_BRIDGE_PROGRAM_ID=<your-program-id>"

