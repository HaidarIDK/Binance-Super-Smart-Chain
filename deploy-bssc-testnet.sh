#!/bin/bash
# Deploy BSSC Public Testnet
set -e

echo "Starting BSSC Public Testnet Deployment..."
echo ""

# Configuration
BSSC_DIR="/opt/bssc-testnet"
LEDGER_DIR="$BSSC_DIR/ledger"
KEYPAIR_DIR="$BSSC_DIR/keypairs"
LOG_DIR="$BSSC_DIR/logs"
RPC_PORT=8899
FAUCET_PORT=9900
WS_PORT=8900

echo "Configuration:"
echo "  BSSC Directory: $BSSC_DIR"
echo "  Ledger Directory: $LEDGER_DIR"
echo "  RPC Port: $RPC_PORT"
echo "  Faucet Port: $FAUCET_PORT"
echo "  WebSocket Port: $WS_PORT"
echo ""

# Update system
echo "Updating system packages..."
apt-get update
apt-get install -y curl build-essential pkg-config libssl-dev libudev-dev git

# Install Rust
if ! command -v cargo &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
else
    echo "Rust already installed"
fi

# Create directories
echo "Creating BSSC directories..."
mkdir -p $BSSC_DIR
mkdir -p $LEDGER_DIR
mkdir -p $KEYPAIR_DIR
mkdir -p $LOG_DIR

# Build BSSC test-validator
echo "Building BSSC test-validator..."
cd /tmp/bssc-validator-deploy
cargo build --release --bin solana-test-validator
cargo build --release --bin solana-keygen
cargo build --release --bin solana-faucet

# Copy binaries
echo "Installing BSSC binaries..."
cp target/release/solana-test-validator $BSSC_DIR/bssc-test-validator
cp target/release/solana-keygen $BSSC_DIR/bssc-keygen
cp target/release/solana-faucet $BSSC_DIR/bssc-faucet

# Generate keypairs
echo "Generating keypairs..."
if [ ! -f "$KEYPAIR_DIR/faucet.json" ]; then
    $BSSC_DIR/bssc-keygen new --no-passphrase -o $KEYPAIR_DIR/faucet.json
    echo "Faucet keypair generated"
fi

# Create systemd service for test-validator
echo "Creating BSSC test-validator service..."
cat > /etc/systemd/system/bssc-testnet.service << EOF
[Unit]
Description=BSSC Public Testnet Validator
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$BSSC_DIR
Environment="RUST_LOG=info"
ExecStart=$BSSC_DIR/bssc-test-validator \\
    --ledger $LEDGER_DIR \\
    --rpc-port $RPC_PORT \\
    --rpc-bind-address 0.0.0.0 \\
    --dynamic-port-range 8000-8020 \\
    --gossip-port 8001 \\
    --faucet-port $FAUCET_PORT \\
    --enable-rpc-transaction-history \\
    --enable-extended-tx-metadata-storage \\
    --log $LOG_DIR/validator.log \\
    --clone mainnet \\
    --clone-upgradeable-program BPFLoaderUpgradeab1e11111111111111111111111 \\
    --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s \\
    --reset
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for faucet
echo "Creating BSSC faucet service..."
cat > /etc/systemd/system/bssc-faucet.service << EOF
[Unit]
Description=BSSC Public Testnet Faucet
After=bssc-testnet.service
Requires=bssc-testnet.service

[Service]
Type=simple
User=root
WorkingDirectory=$BSSC_DIR
ExecStart=$BSSC_DIR/bssc-faucet \\
    --keypair $KEYPAIR_DIR/faucet.json \\
    --url http://localhost:$RPC_PORT \\
    --per-request-cap 1000000000 \\
    --per-time-cap 10000000000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start services
echo "Starting BSSC testnet services..."
systemctl daemon-reload
systemctl enable bssc-testnet
systemctl enable bssc-faucet
systemctl start bssc-testnet
sleep 10
systemctl start bssc-faucet

# Create health check script
cat > $BSSC_DIR/health-check.sh << 'EOF'
#!/bin/bash
echo "BSSC Testnet Health Check"
echo "=========================="
echo ""
echo "Validator Status:"
systemctl status bssc-testnet --no-pager | grep "Active:"
echo ""
echo "Faucet Status:"
systemctl status bssc-faucet --no-pager | grep "Active:"
echo ""
echo "RPC Endpoint Test:"
curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' http://localhost:8899
echo ""
echo "Slot Info:"
curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}' http://localhost:8899
echo ""
EOF
chmod +x $BSSC_DIR/health-check.sh

# Create log viewing script
cat > $BSSC_DIR/view-logs.sh << 'EOF'
#!/bin/bash
echo "Choose logs to view:"
echo "1. Validator logs"
echo "2. Faucet logs"
echo "3. Both (real-time)"
read -p "Enter choice (1-3): " choice

case $choice in
    1) journalctl -u bssc-testnet -f ;;
    2) journalctl -u bssc-faucet -f ;;
    3) journalctl -u bssc-testnet -u bssc-faucet -f ;;
    *) echo "Invalid choice" ;;
esac
EOF
chmod +x $BSSC_DIR/view-logs.sh

echo ""
echo "=========================================="
echo "BSSC Public Testnet Deployment Complete!"
echo "=========================================="
echo ""
echo "Testnet Information:"
echo "  RPC Endpoint: http://$(curl -s ifconfig.me):$RPC_PORT"
echo "  Faucet Endpoint: http://$(curl -s ifconfig.me):$FAUCET_PORT"
echo "  WebSocket: ws://$(curl -s ifconfig.me):$WS_PORT"
echo ""
echo "Useful Commands:"
echo "  Health Check: $BSSC_DIR/health-check.sh"
echo "  View Logs: $BSSC_DIR/view-logs.sh"
echo "  Restart Validator: systemctl restart bssc-testnet"
echo "  Restart Faucet: systemctl restart bssc-faucet"
echo ""
echo "Next Steps:"
echo "1. Configure firewall to allow ports $RPC_PORT, $FAUCET_PORT, $WS_PORT"
echo "2. Update bssc-live-server.js BSSC_VALIDATOR_URL to: http://$(curl -s ifconfig.me):$RPC_PORT"
echo "3. Restart Render deployment"
echo ""

