# Build and Run BSSC Validator on Windows
Write-Host "Building BSSC Validator..." -ForegroundColor Green
Write-Host ""

# Check if Rust is installed
$rustCheck = Get-Command cargo -ErrorAction SilentlyContinue

if (-not $rustCheck) {
    Write-Host "Rust not found. Installing Rust..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Downloading Rust installer..." -ForegroundColor Cyan
    
    $rustInstaller = "$env:TEMP\rustup-init.exe"
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile $rustInstaller
    
    Write-Host "Running Rust installer..." -ForegroundColor Cyan
    Write-Host "Please follow the installer prompts (just press Enter for defaults)" -ForegroundColor Yellow
    Start-Process -FilePath $rustInstaller -Wait
    
    Write-Host ""
    Write-Host "Rust installed! Please close and reopen PowerShell, then run this script again." -ForegroundColor Green
    exit 0
}

Write-Host "Rust is installed!" -ForegroundColor Green
Write-Host ""

# Check Rust version
$rustVersion = cargo --version
Write-Host "Rust version: $rustVersion" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building BSSC Test Validator" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will take 30-60 minutes on first build..." -ForegroundColor Yellow
Write-Host "Subsequent builds will be much faster (5-10 minutes)" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Continue with build? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Build cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Building solana-test-validator..." -ForegroundColor Cyan
Write-Host "This may use a lot of RAM and CPU. Close other programs if needed." -ForegroundColor Yellow
Write-Host ""

# Build the validator
cargo build --release --bin solana-test-validator

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Not enough RAM (need at least 8GB)" -ForegroundColor White
    Write-Host "2. Missing Visual Studio Build Tools" -ForegroundColor White
    Write-Host "3. Antivirus blocking build" -ForegroundColor White
    Write-Host ""
    Write-Host "For Visual Studio Build Tools:" -ForegroundColor Cyan
    Write-Host "Download from: https://visualstudio.microsoft.com/downloads/" -ForegroundColor White
    Write-Host "Install 'Desktop development with C++'" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create ledger directory
$ledgerDir = "bssc-testnet-ledger"
if (Test-Path $ledgerDir) {
    Write-Host "Cleaning previous ledger data..." -ForegroundColor Gray
    Remove-Item -Recurse -Force $ledgerDir -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $ledgerDir -Force | Out-Null

Write-Host "Starting BSSC Validator..." -ForegroundColor Green
Write-Host ""
Write-Host "RPC Endpoint: http://localhost:8899" -ForegroundColor Cyan
Write-Host "Faucet: http://localhost:9900" -ForegroundColor Cyan
Write-Host "WebSocket: ws://localhost:8900" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the validator" -ForegroundColor Yellow
Write-Host ""

# Run the validator
.\target\release\solana-test-validator.exe `
    --ledger $ledgerDir `
    --rpc-port 8899 `
    --faucet-port 9900 `
    --rpc-bind-address 0.0.0.0 `
    --reset

