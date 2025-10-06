# Deploy BSSC Validator to Linux Server
Write-Host "Deploying BSSC Validator to Linux Server..." -ForegroundColor Green
Write-Host ""

# Configuration
$SERVER_IP = "109.147.47.132"
$SERVER_USER = "root"
$BSSC_DIR = "/opt/bssc"

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Server IP: $SERVER_IP" -ForegroundColor White
Write-Host "  Server User: $SERVER_USER" -ForegroundColor White
Write-Host "  BSSC Directory: $BSSC_DIR" -ForegroundColor White
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Upload your BSSC code to the server" -ForegroundColor White
Write-Host "2. Install Rust and dependencies" -ForegroundColor White
Write-Host "3. Build BSSC validator" -ForegroundColor White
Write-Host "4. Configure and start BSSC node" -ForegroundColor White
Write-Host "5. Update RPC server to connect to real validator" -ForegroundColor White
Write-Host ""

Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "- SSH access to your server" -ForegroundColor White
Write-Host "- Server with at least 4GB RAM" -ForegroundColor White
Write-Host "- Ubuntu/Debian Linux" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with deployment? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Starting BSSC Validator deployment..." -ForegroundColor Green

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
$deployDir = "bssc-validator-deploy"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy essential files
$filesToCopy = @(
    "Cargo.toml",
    "Cargo.lock",
    "rust-toolchain.toml",
    "rustfmt.toml",
    "nextest.toml"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file $deployDir
        Write-Host "  Copied $file" -ForegroundColor Gray
    }
}

# Copy source directories
$dirsToCopy = @(
    "validator",
    "core",
    "runtime",
    "sdk",
    "programs",
    "accounts-db",
    "ledger",
    "rpc",
    "gossip",
    "poh",
    "turbine",
    "streamer",
    "client",
    "thin-client",
    "tpu-client",
    "udp-client",
    "quic-client",
    "connection-cache",
    "net-utils",
    "net-shaper",
    "dos",
    "entry",
    "genesis",
    "genesis-utils",
    "install",
    "keygen",
    "ledger-tool",
    "local-cluster",
    "log-analyzer",
    "logger",
    "measure",
    "memory-management",
    "merkle-tree",
    "metrics",
    "notifier",
    "perf",
    "program-runtime",
    "program-test",
    "pubsub-client",
    "rayon-threadlimit",
    "rbpf-cli",
    "remote-wallet",
    "rpc-client",
    "rpc-client-api",
    "rpc-client-nonce-utils",
    "rpc-test",
    "runtime-transaction",
    "send-transaction-service",
    "stake-accounts",
    "storage-bigtable",
    "storage-proto",
    "svm",
    "test-validator",
    "tokens",
    "transaction-dos",
    "transaction-status",
    "unified-scheduler-logic",
    "unified-scheduler-pool",
    "upload-perf",
    "version",
    "vote",
    "watchtower",
    "wen-restart",
    "zk-keygen",
    "zk-token-sdk",
    "frozen-abi",
    "bloom",
    "bucket_map",
    "clap-utils",
    "clap-v3-utils",
    "cli",
    "cli-config",
    "cli-output",
    "client-test",
    "cost-model",
    "download-utils",
    "faucet",
    "geyser-plugin-interface",
    "geyser-plugin-manager"
)

foreach ($dir in $dirsToCopy) {
    if (Test-Path $dir) {
        Copy-Item -Recurse $dir $deployDir
        Write-Host "  Copied directory $dir" -ForegroundColor Gray
    }
}

# Create deployment script
$deployScript = @"
#!/bin/bash
set -e

echo "Installing BSSC Validator on Linux Server..."

# Update system
apt-get update
apt-get install -y curl build-essential pkg-config libssl-dev libudev-dev

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env

# Install Solana dependencies
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"

# Build BSSC validator
echo "Building BSSC validator..."
cargo build --release

# Create BSSC directory
mkdir -p $BSSC_DIR
cp target/release/bssc-validator $BSSC_DIR/
cp target/release/bssc-keygen $BSSC_DIR/
cp target/release/bssc-test-validator $BSSC_DIR/

# Create systemd service
cat > /etc/systemd/system/bssc-validator.service << EOF
[Unit]
Description=BSSC Validator
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$BSSC_DIR
ExecStart=$BSSC_DIR/bssc-validator --ledger $BSSC_DIR/ledger --rpc-bind-address 0.0.0.0:8899
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Start BSSC validator
systemctl daemon-reload
systemctl enable bssc-validator
systemctl start bssc-validator

echo "BSSC Validator installed and started!"
echo "RPC endpoint: http://$SERVER_IP:8899"
"@

$deployScript | Out-File -FilePath "$deployDir/install-bssc.sh" -Encoding UTF8

Write-Host ""
Write-Host "Deployment package created: $deployDir" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload $deployDir to your server" -ForegroundColor White
Write-Host "2. Run: chmod +x install-bssc.sh && ./install-bssc.sh" -ForegroundColor White
Write-Host "3. BSSC validator will be running on port 8899" -ForegroundColor White
Write-Host ""

Write-Host "Upload command:" -ForegroundColor Cyan
Write-Host "scp -r ${deployDir} ${SERVER_USER}@${SERVER_IP}:/tmp/" -ForegroundColor White
Write-Host ""
Write-Host "SSH command:" -ForegroundColor Cyan
Write-Host "ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor White
Write-Host "cd /tmp/${deployDir} && chmod +x install-bssc.sh && ./install-bssc.sh" -ForegroundColor White
