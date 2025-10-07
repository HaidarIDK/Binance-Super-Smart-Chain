# Deploy BSSC Testnet Locally using WSL
Write-Host "BSSC Local Testnet Deployment (WSL)" -ForegroundColor Green
Write-Host ""

# Check if WSL is installed
$wslCheck = wsl --status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "WSL is not installed. Installing WSL..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run this command in an Administrator PowerShell:" -ForegroundColor Cyan
    Write-Host "wsl --install" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, restart your computer and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "WSL is installed!" -ForegroundColor Green
Write-Host ""

# Get current directory in WSL format
$currentDir = (Get-Location).Path
$wslPath = $currentDir -replace '\\', '/' -replace 'C:', '/mnt/c'

Write-Host "Deploying BSSC testnet locally..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Steps:" -ForegroundColor Cyan
Write-Host "1. Starting WSL Ubuntu" -ForegroundColor White
Write-Host "2. Installing dependencies" -ForegroundColor White
Write-Host "3. Building BSSC validator" -ForegroundColor White
Write-Host "4. Starting testnet" -ForegroundColor White
Write-Host ""

# Create WSL deployment script
$wslScript = @"
#!/bin/bash
set -e

echo "Installing dependencies in WSL..."
sudo apt-get update
sudo apt-get install -y curl build-essential pkg-config libssl-dev libudev-dev

echo "Installing Rust..."
if ! command -v cargo &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
fi

echo "Building BSSC test-validator..."
cd $wslPath
cargo build --release --bin solana-test-validator

echo ""
echo "=========================================="
echo "BSSC Testnet Built Successfully!"
echo "=========================================="
echo ""
echo "To start the testnet, run:"
echo "  ./target/release/solana-test-validator --rpc-port 8899 --faucet-port 9900"
echo ""
"@

$wslScript | Out-File -FilePath "deploy-wsl.sh" -Encoding UTF8

Write-Host "Starting WSL deployment..." -ForegroundColor Green
wsl bash ./deploy-wsl.sh

