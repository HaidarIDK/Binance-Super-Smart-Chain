#!/bin/bash

# Setup BSSC Fee Collector

set -e

FEE_COLLECTOR_DIR="$HOME/bssc-mainnet/fee-collector"
FEE_COLLECTOR_KEYPAIR="$FEE_COLLECTOR_DIR/fee-collector-keypair.json"

echo "Setting up BSSC Fee Collector..."

# Create directory
mkdir -p "$FEE_COLLECTOR_DIR"

# Generate fee collector keypair if it doesn't exist
if [ ! -f "$FEE_COLLECTOR_KEYPAIR" ]; then
    echo "Generating fee collector keypair..."
    ./target/release/solana-keygen new --no-passphrase -o "$FEE_COLLECTOR_KEYPAIR"
fi

# Get the public key
FEE_COLLECTOR_ADDRESS=$(./target/release/solana-keygen pubkey "$FEE_COLLECTOR_KEYPAIR")

echo ""
echo "Fee Collector Address: $FEE_COLLECTOR_ADDRESS"
echo ""

# Update RPC service environment
echo "Updating bssc-rpc service with fee collector address..."
sudo sed -i "/Environment=RPC_URL/a Environment=FEE_COLLECTOR_ADDRESS=$FEE_COLLECTOR_ADDRESS" /etc/systemd/system/bssc-rpc.service

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart bssc-rpc

echo ""
echo "Fee collector setup complete!"
echo "Address: $FEE_COLLECTOR_ADDRESS"
echo "Keypair: $FEE_COLLECTOR_KEYPAIR"
echo ""
echo "IMPORTANT: Backup this keypair securely!"

