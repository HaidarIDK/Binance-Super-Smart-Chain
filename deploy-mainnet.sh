#!/bin/bash

# BSSC Mainnet Deployment Script

set -e

echo "======================================"
echo "BSSC Mainnet Deployment"
echo "======================================"
echo ""

# Configuration
MAINNET_DIR="$HOME/bssc-mainnet"
LEDGER_DIR="$MAINNET_DIR/ledger"
LOG_DIR="$MAINNET_DIR/logs"
VALIDATOR_KEYPAIR="$MAINNET_DIR/validator-keypair.json"
VOTE_KEYPAIR="$MAINNET_DIR/vote-keypair.json"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "Error: Do not run as root"
    exit 1
fi

echo "Step 1: Creating directories..."
mkdir -p "$MAINNET_DIR"
mkdir -p "$LEDGER_DIR"
mkdir -p "$LOG_DIR"

echo "Step 2: Checking for validator binary..."
if [ ! -f "./target/release/solana-validator" ]; then
    echo "Error: Validator binary not found. Run: cargo build --release"
    exit 1
fi

echo "Step 3: Generating keypairs (if not exists)..."
if [ ! -f "$VALIDATOR_KEYPAIR" ]; then
    echo "Generating validator keypair..."
    ./target/release/solana-keygen new --no-passphrase -o "$VALIDATOR_KEYPAIR"
fi

if [ ! -f "$VOTE_KEYPAIR" ]; then
    echo "Generating vote account keypair..."
    ./target/release/solana-keygen new --no-passphrase -o "$VOTE_KEYPAIR"
fi

echo "Step 4: Copying configuration..."
cp mainnet-config.json "$MAINNET_DIR/"

echo "Step 5: Setting up systemd service..."
sudo tee /etc/systemd/system/bssc-validator.service > /dev/null <<EOF
[Unit]
Description=BSSC Mainnet Validator
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$MAINNET_DIR
ExecStart=$(pwd)/target/release/solana-validator \\
    --identity $VALIDATOR_KEYPAIR \\
    --vote-account $VOTE_KEYPAIR \\
    --ledger $LEDGER_DIR \\
    --log $LOG_DIR/validator.log \\
    --rpc-port 8899 \\
    --rpc-bind-address 0.0.0.0 \\
    --dynamic-port-range 8000-8020 \\
    --gossip-port 8001 \\
    --limit-ledger-size \\
    --no-poh-speed-test \\
    --full-rpc-api
Restart=always
RestartSec=10
LimitNOFILE=1000000

[Install]
WantedBy=multi-user.target
EOF

echo "Step 6: Setting up RPC service..."
sudo tee /etc/systemd/system/bssc-rpc.service > /dev/null <<EOF
[Unit]
Description=BSSC RPC Server
After=network.target bssc-validator.service
Wants=network-online.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node $(pwd)/bssc-live-server.js
Environment=NODE_ENV=production
Environment=RPC_URL=http://localhost:8899
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "Step 7: Enabling services..."
sudo systemctl daemon-reload
sudo systemctl enable bssc-validator
sudo systemctl enable bssc-rpc

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Validator keypair: $VALIDATOR_KEYPAIR"
echo "Vote account: $VOTE_KEYPAIR"
echo "Ledger directory: $LEDGER_DIR"
echo "Logs directory: $LOG_DIR"
echo ""
echo "To start the validator:"
echo "  sudo systemctl start bssc-validator"
echo ""
echo "To start the RPC server:"
echo "  sudo systemctl start bssc-rpc"
echo ""
echo "To check status:"
echo "  sudo systemctl status bssc-validator"
echo "  sudo systemctl status bssc-rpc"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u bssc-validator -f"
echo "  sudo journalctl -u bssc-rpc -f"
echo ""

