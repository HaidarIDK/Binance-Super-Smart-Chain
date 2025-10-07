# Deploy BSSC Public Testnet (Automated version)
Write-Host "BSSC Public Testnet Deployment Preparation" -ForegroundColor Green
Write-Host ""

# Configuration
$SERVER_IP = "109.147.47.132"
$SERVER_USER = "root"
$BSSC_DIR = "/opt/bssc-testnet"

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Server IP: $SERVER_IP" -ForegroundColor White
Write-Host "  Server User: $SERVER_USER" -ForegroundColor White
Write-Host "  BSSC Directory: $BSSC_DIR" -ForegroundColor White
Write-Host ""

Write-Host "This script will deploy a public BSSC testnet with:" -ForegroundColor Yellow
Write-Host "1. Test validator (for public testing)" -ForegroundColor White
Write-Host "2. Faucet endpoint (for distributing test BNB)" -ForegroundColor White
Write-Host "3. RPC endpoint (for developer access)" -ForegroundColor White
Write-Host "4. Health monitoring" -ForegroundColor White
Write-Host ""

Write-Host "Creating deployment package..." -ForegroundColor Green

# Create deployment directory
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

# Copy source directories needed for test-validator
$dirsToCopy = @(
    "validator",
    "test-validator",
    "core",
    "runtime",
    "sdk",
    "programs",
    "accounts-db",
    "ledger",
    "rpc",
    "rpc-client",
    "rpc-client-api",
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
    "entry",
    "genesis",
    "install",
    "keygen",
    "faucet",
    "logger",
    "measure",
    "metrics",
    "perf",
    "program-runtime",
    "svm",
    "version",
    "vote",
    "frozen-abi",
    "clap-utils",
    "clap-v3-utils"
)

Write-Host ""
Write-Host "Copying source directories (this may take a few minutes)..." -ForegroundColor Yellow
foreach ($dir in $dirsToCopy) {
    if (Test-Path $dir) {
        Copy-Item -Recurse $dir $deployDir
        Write-Host "  Copied directory $dir" -ForegroundColor Gray
    }
}

# Copy deployment script
Copy-Item "deploy-bssc-testnet.sh" $deployDir
Write-Host "  Copied deploy-bssc-testnet.sh" -ForegroundColor Gray

Write-Host ""
Write-Host "Deployment package created!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Upload to server:" -ForegroundColor White
Write-Host "   scp -r ${deployDir} ${SERVER_USER}@${SERVER_IP}:/tmp/" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. SSH to server:" -ForegroundColor White
Write-Host "   ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Run deployment:" -ForegroundColor White
Write-Host "   cd /tmp/${deployDir}" -ForegroundColor Cyan
Write-Host "   chmod +x deploy-bssc-testnet.sh" -ForegroundColor Cyan
Write-Host "   sudo ./deploy-bssc-testnet.sh" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Configure firewall:" -ForegroundColor White
Write-Host "   sudo ufw allow 8899/tcp" -ForegroundColor Cyan
Write-Host "   sudo ufw allow 9900/tcp" -ForegroundColor Cyan
Write-Host "   sudo ufw allow 8900/tcp" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "After deployment completes, you will have:" -ForegroundColor Yellow
Write-Host "  RPC: http://${SERVER_IP}:8899" -ForegroundColor White
Write-Host "  Faucet: http://${SERVER_IP}:9900" -ForegroundColor White
Write-Host "  Public RPC: https://bssc-rpc.bssc.live" -ForegroundColor White
Write-Host ""

